/**
 * RAG Service - Qdrant Vector Database Integration
 * 
 * Handles historical context storage and retrieval for the simulation.
 * Uses OpenAI embeddings + Qdrant for semantic search.
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import { RAG_CONFIG } from '../../core/constants';

// ============================================
// TYPES
// ============================================

export interface SimulationStateSummary {
  month: number;
  year: number;
  revenue: number;
  profit: number;
  customers_served: number;
  employee_count: number;
  market_demand_score: number;
  competition_intensity: number;
  major_events: string[];
  trends_followed: string[];
  decisions: {
    pricing_strategy: string;
    marketing_spend: number;
    hiring_decisions: string;
  };
}

export interface RecommendationOutcome {
  recommendation_text: string;
  category: string; // 'pricing', 'hiring', 'marketing', etc.
  implemented: boolean;
  outcome_impact: number; // -100 to +100
  outcome_description: string;
}

export interface HistoricalContext {
  recent_months: any[];
  similar_situations: any[];
  past_recommendations: any[];
}

// ============================================
// QDRANT CLIENT
// ============================================

const qdrant = new QdrantClient({
  host: process.env.QDRANT_HOST || 'localhost',
  port: parseInt(process.env.QDRANT_PORT || '6333')
});

const COLLECTIONS = RAG_CONFIG.COLLECTIONS;
const EMBEDDING_MODEL = RAG_CONFIG.EMBEDDING_MODEL;

// ============================================
// COLLECTION INITIALIZATION
// ============================================

/**
 * Initialize Qdrant collections (run once on startup)
 */
export async function initializeQdrantCollections(): Promise<void> {
  try {
    console.log('🔧 Initializing Qdrant collections...');
    
    // Check if collections exist
    const collections = await qdrant.getCollections();
    const existingNames = collections.collections.map(c => c.name);
    
    // Create simulation_states collection
    if (!existingNames.includes(COLLECTIONS.SIMULATION_STATES)) {
      await qdrant.createCollection(COLLECTIONS.SIMULATION_STATES, {
        vectors: {
          size: RAG_CONFIG.EMBEDDING_DIMENSIONS,
          distance: 'Cosine'
        }
      });
      console.log(`✅ Created collection: ${COLLECTIONS.SIMULATION_STATES}`);
    }
    
    // Create recommendations_history collection
    if (!existingNames.includes(COLLECTIONS.RECOMMENDATIONS)) {
      await qdrant.createCollection(COLLECTIONS.RECOMMENDATIONS, {
        vectors: {
          size: RAG_CONFIG.EMBEDDING_DIMENSIONS,
          distance: 'Cosine'
        }
      });
      console.log(`✅ Created collection: ${COLLECTIONS.RECOMMENDATIONS}`);
    }
    
    console.log('✅ Qdrant collections ready!');
  } catch (error) {
    console.error('❌ Failed to initialize Qdrant:', error);
    throw error;
  }
}

// ============================================
// STORAGE FUNCTIONS
// ============================================

/**
 * Store simulation state after month completion
 */
export async function storeSimulationState(
  userId: string,
  businessId: string,
  month: number,
  year: number,
  stateSummary: SimulationStateSummary
): Promise<void> {
  try {
    // Create text summary for embedding
    const summaryText = createStateSummaryText(stateSummary);
    
    // Generate embedding
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: summaryText,
    });
    
    // Store in Qdrant
    const pointId = `${userId}_${businessId}_month${month}_${year}`;
    
    await qdrant.upsert(COLLECTIONS.SIMULATION_STATES, {
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: {
            user_id: userId,
            business_id: businessId,
            month: month,
            year: year,
            timestamp: new Date().toISOString(),
            
            // Financial metrics
            revenue: stateSummary.revenue,
            profit: stateSummary.profit,
            profit_margin: (stateSummary.profit / stateSummary.revenue) * 100,
            
            // Operations
            customers_served: stateSummary.customers_served,
            employee_count: stateSummary.employee_count,
            
            // Market conditions
            market_demand_score: stateSummary.market_demand_score,
            competition_intensity: stateSummary.competition_intensity,
            
            // Context
            major_events: stateSummary.major_events,
            trends_followed: stateSummary.trends_followed,
            
            // Decisions
            pricing_strategy: stateSummary.decisions.pricing_strategy,
            marketing_spend: stateSummary.decisions.marketing_spend,
            hiring_decisions: stateSummary.decisions.hiring_decisions,
            
            // Full summary text
            summary_text: summaryText,
          }
        }
      ]
    });
    
    console.log(`✅ Stored simulation state: ${pointId}`);
  } catch (error) {
    console.error('❌ Failed to store simulation state:', error);
    throw error;
  }
}

/**
 * Store recommendation and its outcome
 */
export async function storeRecommendation(
  userId: string,
  businessId: string,
  month: number,
  year: number,
  recommendation: RecommendationOutcome
): Promise<void> {
  try {
    // Create text for embedding
    const recText = `${recommendation.category}: ${recommendation.recommendation_text}. Outcome: ${recommendation.outcome_description}`;
    
    // Generate embedding
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: recText,
    });
    
    // Store in Qdrant
    const pointId = `${userId}_${businessId}_month${month}_${year}_${recommendation.category}`;
    
    await qdrant.upsert(COLLECTIONS.RECOMMENDATIONS, {
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: {
            user_id: userId,
            business_id: businessId,
            month: month,
            year: year,
            timestamp: new Date().toISOString(),
            
            // Recommendation details
            category: recommendation.category,
            recommendation_text: recommendation.recommendation_text,
            implemented: recommendation.implemented,
            outcome_impact: recommendation.outcome_impact,
            outcome_description: recommendation.outcome_description,
          }
        }
      ]
    });
    
    console.log(`✅ Stored recommendation: ${pointId}`);
  } catch (error) {
    console.error('❌ Failed to store recommendation:', error);
  }
}

// ============================================
// RETRIEVAL FUNCTIONS
// ============================================

/**
 * Retrieve historical context for Report Agent
 */
export async function retrieveHistoricalContext(
  userId: string,
  businessId: string,
  currentMonth: number,
  currentYear: number,
  limit: number = 3
): Promise<HistoricalContext> {
  try {
    // 1. Get last N months (direct filter by month/year)
    const recentMonths = await qdrant.scroll(COLLECTIONS.SIMULATION_STATES, {
      filter: {
        must: [
          { key: 'user_id', match: { value: userId } },
          { key: 'business_id', match: { value: businessId } },
        ]
      },
      limit: limit,
      with_payload: true,
      with_vector: false,
    });
    
    // 2. Get similar situations (semantic search)
    // Create a query based on current state
    const currentStateQuery = `Month ${currentMonth}, analyzing business performance and market conditions`;
    
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: currentStateQuery,
    });
    
    const similarSituations = await qdrant.search(COLLECTIONS.SIMULATION_STATES, {
      vector: embedding,
      filter: {
        must: [
          { key: 'user_id', match: { value: userId } },
          { key: 'business_id', match: { value: businessId } },
        ]
      },
      limit: 3,
      with_payload: true,
    });
    
    // 3. Get past recommendations
    const pastRecommendations = await qdrant.scroll(COLLECTIONS.RECOMMENDATIONS, {
      filter: {
        must: [
          { key: 'user_id', match: { value: userId } },
          { key: 'business_id', match: { value: businessId } },
        ]
      },
      limit: 5,
      with_payload: true,
      with_vector: false,
    });
    
    return {
      recent_months: recentMonths.points.map(p => p.payload),
      similar_situations: similarSituations.map(s => ({
        ...s.payload,
        similarity_score: s.score,
      })),
      past_recommendations: pastRecommendations.points.map(p => p.payload),
    };
    
  } catch (error) {
    console.error('❌ Failed to retrieve historical context:', error);
    // Return empty context on error
    return {
      recent_months: [],
      similar_situations: [],
      past_recommendations: [],
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create summary text for embedding
 */
function createStateSummaryText(summary: SimulationStateSummary): string {
  const profitMargin = ((summary.profit / summary.revenue) * 100).toFixed(1);
  
  return `
Month ${summary.month} Summary:
Financial: Revenue $${summary.revenue.toLocaleString()}, Profit $${summary.profit.toLocaleString()}, Margin ${profitMargin}%
Operations: ${summary.customers_served.toLocaleString()} customers served, ${summary.employee_count} employees
Market: Demand score ${summary.market_demand_score}, Competition intensity ${summary.competition_intensity}
Events: ${summary.major_events.join(', ') || 'None'}
Trends: ${summary.trends_followed.join(', ') || 'None'}
Strategy: ${summary.decisions.pricing_strategy} pricing, $${summary.decisions.marketing_spend.toLocaleString()} marketing spend, ${summary.decisions.hiring_decisions}
  `.trim();
}

/**
 * Health check - verify Qdrant connection
 */
export async function checkQdrantHealth(): Promise<boolean> {
  try {
    await qdrant.getCollections();
    return true;
  } catch (error) {
    console.error('❌ Qdrant health check failed:', error);
    return false;
  }
}
