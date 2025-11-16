import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import {
  calculateTrendImpactScore,
  classifySentiment,
  determineConfidence,
  generateActionableInsight,
  classifyMomentum,
} from './trends-math';

/**
 * Schema pentru trend insights generate de agent
 */
export const TrendInsightSchema = z.object({
  trend_name: z.string().describe('Numele trendului identificat'),
  impact_score: z.number().min(-100).max(100).describe('Scor de impact pentru business (-100 la +100)'),
  relevance: z.boolean().describe('Dacă trendul este relevant pentru tipul de business'),
  description: z.string().describe('Descriere scurtă a trendului și impactului'),
  actionable_insight: z.string().describe('Insight acționabil pentru business bazat pe trend'),
  confidence: z.enum(['low', 'medium', 'high']).describe('Nivelul de încredere în acest trend')
});

export type TrendInsight = z.infer<typeof TrendInsightSchema>;

/**
 * Schema pentru răspunsul complet al agentului de trends
 */
export const TrendsAnalysisSchema = z.object({
  main_trend: TrendInsightSchema.describe('Trendul principal identificat'),
  secondary_trends: z.array(TrendInsightSchema).max(2).describe('Maxim 2 trenuri secundare'),
  overall_sentiment: z.enum(['positive', 'neutral', 'negative']).describe('Sentimentul general al trendurilor'),
  market_momentum: z.enum(['accelerating', 'stable', 'decelerating']).describe('Momentum-ul pieței')
});

export type TrendsAnalysis = z.infer<typeof TrendsAnalysisSchema>;

/**
 * Interfață pentru datele Google Trends primite de la backend
 */
interface GoogleTrendsData {
  success: boolean;
  business_type: string;
  location: string;
  timeframe: string;
  keywords_analyzed: string[];
  trends: {
    interest_trend: string;
    average_interest: number;
    peak_interest: number;
    related_rising_queries: Array<{ query: string; value: number | string }>;
    related_top_queries: Array<{ query: string; value: number | string }>;
    trending_searches: string[];
    keywords_performance: Record<string, {
      average_interest: number;
      peak_interest: number;
      trend: string;
    }>;
  };
  timestamp: string;
}

/**
 * Agent care analizează Google Trends și generează insights pentru business.
 * 
 * MATHEMATICAL APPROACH:
 * - Impact scores: Calculated using trend formulas (NOT LLM)
 * - Sentiment: Aggregated from mathematical impact scores
 * - Confidence: Data quality metrics
 * - LLM: Narrative descriptions only (trend names, detailed insights)
 */
export async function analyzeTrendsForBusiness(
  businessType: string,
  location: { address: string; neighborhood: string },
  trendsData: GoogleTrendsData,
  currentMonth: number,
  currentYear: number
): Promise<TrendsAnalysis> {
  
  if (!trendsData.success) {
    // Fallback dacă trends data nu e disponibilă
    return {
      main_trend: {
        trend_name: "No trend data available",
        impact_score: 0,
        relevance: false,
        description: "Google Trends data could not be fetched",
        actionable_insight: "Continue monitoring market conditions",
        confidence: 'low'
      },
      secondary_trends: [],
      overall_sentiment: 'neutral',
      market_momentum: 'stable'
    };
  }

  const trends = trendsData.trends;
  
  // ====================================================================
  // MATHEMATICAL CALCULATIONS (NO LLM)
  // ====================================================================
  
  // 1. Calculate impact score for main trend
  const mainImpactScore = calculateTrendImpactScore(
    trends.average_interest,
    trends.interest_trend,
    trends.peak_interest
  );
  
  // 2. Calculate impact scores for top keywords
  const keywordImpactScores = Object.entries(trends.keywords_performance).map(([keyword, perf]) => ({
    keyword,
    score: calculateTrendImpactScore(perf.average_interest, perf.trend, perf.peak_interest),
    averageInterest: perf.average_interest,
  }));
  
  // Sort by impact score
  keywordImpactScores.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  
  // 3. Calculate overall sentiment
  const allImpactScores = [mainImpactScore, ...keywordImpactScores.slice(0, 2).map(k => k.score)];
  const overallSentiment = classifySentiment(allImpactScores);
  
  // 4. Determine confidence levels
  const mainConfidence = determineConfidence(
    trendsData.keywords_analyzed.length,
    trends.average_interest
  );
  
  // 5. Generate actionable insights
  const mainActionableInsight = generateActionableInsight(
    trends.interest_trend,
    mainImpactScore,
    businessType
  );
  
  // 6. Classify market momentum
  // Use rising queries as proxy for acceleration
  const risingQueriesCount = trends.related_rising_queries.length;
  const marketMomentum = classifyMomentum(
    mainImpactScore / 10, // Normalize MACD-like value
    trends.average_interest // Use as RSI proxy
  );
  
  // ====================================================================
  // PARTIAL SCHEMA FOR LLM (QUALITATIVE ONLY)
  // ====================================================================
  
  const PartialTrendSchema = z.object({
    trend_name: z.string().describe('Numele trendului identificat'),
    description: z.string().describe('Descriere scurtă a trendului'),
  });
  
  const PartialTrendsAnalysisSchema = z.object({
    main_trend: PartialTrendSchema,
    secondary_trends: z.array(PartialTrendSchema).max(2),
  });
  
  // ====================================================================
  // LLM PROMPT (NARRATIVE ONLY, NOT CALCULATIONS)
  // ====================================================================
  // ====================================================================
  // LLM PROMPT (NARRATIVE ONLY, NOT CALCULATIONS)
  // ====================================================================
  
  // Construiește context pentru LLM
  const systemPrompt = `Ești un expert în analiza tendințelor de piață pentru business-uri locale.

CRITICAL: DO NOT calculate impact scores, sentiment, or confidence.
These are already calculated mathematically.

Your role: Provide trend names and narrative descriptions only.

CALCULATED METRICS (ALREADY DONE):
- Main Impact Score: ${mainImpactScore}/100
- Overall Sentiment: ${overallSentiment}
- Market Momentum: ${marketMomentum}
- Confidence: ${mainConfidence}`;

  const userPrompt = `Provide narrative insights for Google Trends data:

🏢 BUSINESS:
- Tip: ${businessType}
- Locație: ${location.neighborhood}

📊 CALCULATED TREND METRICS:
- Main Trend Impact: ${mainImpactScore}/100 (${mainImpactScore > 0 ? 'positive opportunity' : 'negative risk'})
- Overall Sentiment: ${overallSentiment}
- Market Momentum: ${marketMomentum}

📈 GOOGLE TRENDS DATA:
- Trend general: ${trends.interest_trend}
- Interest mediu: ${trends.average_interest}/100
- Interest maxim: ${trends.peak_interest}/100

🔑 TOP KEYWORDS (by calculated impact):
${keywordImpactScores.slice(0, 3).map((k, i) => 
  `${i+1}. "${k.keyword}" - Impact: ${k.score}/100, Interest: ${k.averageInterest}/100`
).join('\n')}

📈 TOP RISING QUERIES:
${trends.related_rising_queries.slice(0, 3).map((q, i) => 
  `${i+1}. "${q.query}" (${q.value})`
).join('\n') || 'N/A'}

📅 CONTEXT:
- Luna: ${currentMonth}/12 (${getSeasonFromMonth(currentMonth)})
- An: ${currentYear}

PROVIDE:
1. Main Trend Name (based on highest impact keyword/query)
2. Main Trend Description (narrative context)
3. Secondary Trends (2 trends from other top keywords)
4. Secondary Trend Descriptions

Be specific. Reference the rising queries and trending searches.`;

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: PartialTrendsAnalysisSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
  });
  
  // ====================================================================
  // COMBINE MATH + LLM
  // ====================================================================
  
  return {
    main_trend: {
      trend_name: result.object.main_trend.trend_name,
      impact_score: mainImpactScore,
      relevance: Math.abs(mainImpactScore) > 10, // Relevant if |score| > 10
      description: result.object.main_trend.description,
      actionable_insight: mainActionableInsight,
      confidence: mainConfidence,
    },
    secondary_trends: result.object.secondary_trends.map((trend, index) => {
      const keywordData = keywordImpactScores[index + 1]; // Skip first (main trend)
      const score = keywordData?.score || 0;
      const confidence = determineConfidence(
        trendsData.keywords_analyzed.length,
        keywordData?.averageInterest || 0
      );
      const insight = generateActionableInsight(
        trends.interest_trend,
        score,
        businessType
      );
      
      return {
        trend_name: trend.trend_name,
        impact_score: score,
        relevance: Math.abs(score) > 10,
        description: trend.description,
        actionable_insight: insight,
        confidence: confidence,
      };
    }),
    overall_sentiment: overallSentiment,
    market_momentum: marketMomentum,
  };
}

/**
 * Helper pentru a determina sezonul din luna curentă
 */
function getSeasonFromMonth(month: number): string {
  if (month >= 3 && month <= 5) return 'Primăvară';
  if (month >= 6 && month <= 8) return 'Vară';
  if (month >= 9 && month <= 11) return 'Toamnă';
  return 'Iarnă';
}
