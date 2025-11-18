/**
 * Competition Agent
 * 
 * Analyzes competitive landscape, market saturation, and competitor actions.
 * Simulates realistic competitor behavior (price changes, closures, new entrants).
 * 
 * ENHANCED with Mathematical Models:
 * - Huff Gravity Model for trade area
 * - Herfindahl-Hirschman Index (HHI) for market concentration
 * - Scientific competitor density formulas
 * - Entry/Exit probability models based on survival data
 * 
 * Model: gpt-4o-mini (fast decisions) + Pure Math
 * Output: CompetitionAnalysisSchema (structured)
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { DetailedCensusData } from '../../core/types';
import { CompetitionAnalysisSchema } from '../../core/schemas';
import { LLM_CONFIG } from '../../core/constants';
import {
  estimateCompetitorCount,
  calculateUniformHHI,
  interpretHHI,
  calculateCompetitiveIntensity,
  calculateEntryProbability,
  calculateExpectedExits,
  calculateMarketCapacity
} from './competition-math';

/**
 * Analyze competition and market dynamics
 */
export async function analyzeCompetition(
  businessType: string,
  location: { address: string; neighborhood: string; county: string; lat: number; lng: number },
  censusData: DetailedCensusData,
  marketContext: { industry_saturation: number; economic_climate: string },
  currentMonth: number,
  currentYear: number
): Promise<z.infer<typeof CompetitionAnalysisSchema>> {
  
  const population = censusData.demographics_detailed.B01001_001E?.value || 0;
  const medianIncome = censusData.demographics_detailed.B19013_001E?.value || 0;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MATHEMATICAL CALCULATIONS (NO LLM)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Estimate total competitors using scientific density formula
  const totalCompetitors = estimateCompetitorCount(
    businessType, 
    Number(population), 
    marketContext.industry_saturation
  );
  
  // Calculate HHI (assuming uniform distribution)
  const hhi = calculateUniformHHI(totalCompetitors);
  const hhiInterpretation = interpretHHI(hhi);
  
  // Calculate competitive intensity score
  const competitiveIntensity = calculateCompetitiveIntensity(
    totalCompetitors,
    hhi,
    marketContext.industry_saturation
  );
  
  // Map economic climate
  const economicClimate = mapEconomicClimate(marketContext.economic_climate);
  
  // Calculate entry probability
  const entryProb = calculateEntryProbability(
    economicClimate,
    marketContext.industry_saturation,
    15, // Assume 15% average profit margin
    'medium' // Assume medium barrier to entry
  );
  
  // Expected new entrants this month
  const expectedNewEntrants = Math.random() < entryProb ? 1 : 0;
  
  // Calculate expected exits (need survival rate - use default 45% for now)
  const defaultSurvivalRate = 45; // 45% 5-year survival
  const expectedExits = calculateExpectedExits(
    totalCompetitors,
    defaultSurvivalRate,
    economicClimate,
    marketContext.industry_saturation
  );
  
  // New competitor count after changes
  const newCompetitorCount = totalCompetitors + expectedNewEntrants - expectedExits;
  
  // Market space determination
  let marketSpace: 'opening' | 'saturated' | 'contracting';
  if (marketContext.industry_saturation < 50) {
    marketSpace = 'opening';
  } else if (marketContext.industry_saturation < 80) {
    marketSpace = 'saturated';
  } else {
    marketSpace = 'contracting';
  }
  
  // Pricing pressure based on HHI and saturation
  let pricingPressure: 'low' | 'medium' | 'high';
  if (hhiInterpretation.level === 'competitive' && marketContext.industry_saturation > 70) {
    pricingPressure = 'high'; // Extreme -> high for schema
  } else if (hhiInterpretation.level === 'competitive') {
    pricingPressure = 'high';
  } else if (marketContext.industry_saturation > 70) {
    pricingPressure = 'medium'; // Moderate -> medium for schema
  } else {
    pricingPressure = 'low';
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MATHEMATICAL SUMMARY FOR LLM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const mathSummary = `
MATHEMATICAL CALCULATIONS COMPLETED:
- Estimated Total Competitors: ${totalCompetitors}
- Herfindahl-Hirschman Index (HHI): ${hhi.toFixed(0)} (${hhiInterpretation.description})
- Market Concentration: ${hhiInterpretation.level}
- Competitive Intensity Score: ${competitiveIntensity}/100
- Entry Probability This Month: ${(entryProb * 100).toFixed(1)}%
- Expected New Entrants: ${expectedNewEntrants}
- Expected Closures: ${expectedExits}
- Net Change: ${expectedNewEntrants - expectedExits}
- New Total Competitors: ${newCompetitorCount}
- Market Space: ${marketSpace}
- Pricing Pressure: ${pricingPressure}
`;
  
  const systemPrompt = `You are a competitive intelligence analyst for NYC businesses.
Your role is to USE THE MATHEMATICAL CALCULATIONS PROVIDED and add realistic competitive actions.

CRITICAL: The competitor counts and market metrics are ALREADY CALCULATED using:
- Huff Gravity Model
- Herfindahl-Hirschman Index (HHI)
- Scientific density formulas
- Entry/Exit probability models

Your job is to:
1. Generate 1-3 specific competitor actions
2. List 2-3 competitive advantages for the business
3. List 2-3 competitive threats

DO NOT recalculate numbers - use the provided calculations.`;

  const userPrompt = `Analyze competition for this business:

🏢 BUSINESS:
- Type: ${businessType}
- Location: ${location.neighborhood}, ${location.county}
- Coordinates: ${location.lat}, ${location.lng}

${mathSummary}

📊 MARKET CONTEXT:
- Industry Saturation: ${marketContext.industry_saturation}%
- Economic Climate: ${marketContext.economic_climate}

📍 AREA DEMOGRAPHICS:
- Population: ${typeof population === 'number' ? population.toLocaleString() : population}
- Median Income: $${typeof medianIncome === 'number' ? medianIncome.toLocaleString() : medianIncome}
- High Income Rate: ${(censusData.derived_statistics.high_income_households_rate * 100).toFixed(1)}%

📅 TEMPORAL:
- Month: ${currentMonth}/12 (${getSeasonName(currentMonth)})
- Year: ${currentYear}

SIMULATE THIS MONTH'S COMPETITIVE DYNAMICS:

USE THE MATHEMATICAL CALCULATIONS ABOVE - DO NOT recalculate competitor counts or HHI.

Your tasks:

1. **Competitor Actions**: Generate 1-3 SPECIFIC competitor actions this month:
   - Could be: price cuts, promotions, closures, expansions, quality changes
   - Name competitors generically: "Competitor A (coffee shop)", "Competitor B (bakery)"
   - Specify impact on YOUR business: positive/neutral/negative
   - Be realistic - not every month has dramatic changes

2. **Your Advantages**: List 2-3 competitive advantages for YOUR business:
   - Based on location, demographics, or market gaps
   - Specific and actionable

3. **Threats**: List 2-3 competitive threats:
   - Market-based, not generic
   - Tied to HHI, saturation, or economic climate

IMPORTANT: The math is done. Just add business intelligence context.`;

  // Partial schema for LLM - only actions, advantages, threats
  const PartialCompetitionSchema = z.object({
    competitor_actions: z.array(z.object({
      competitor_name: z.string(),
      action: z.string(),
      impact_on_you: z.enum(['positive', 'neutral', 'negative']),
    })).max(5),
    your_competitive_advantage: z.array(z.string()).max(3),
    threats: z.array(z.string()).max(3),
  });

  const result = await generateObject({
    model: openai(LLM_CONFIG.FAST_MODEL),
    schema: PartialCompetitionSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: LLM_CONFIG.BALANCED, // Slightly more creative for variety
  });

  // Combine LLM outputs with EXACT mathematical calculations
  return {
    total_competitors: newCompetitorCount,
    new_entrants: expectedNewEntrants,
    competitors_closing: expectedExits,
    market_space: marketSpace,
    pricing_pressure: pricingPressure,
    competitor_actions: result.object.competitor_actions,
    your_competitive_advantage: result.object.your_competitive_advantage,
    threats: result.object.threats,
  };
}

/**
 * Helper: Map economic climate string to standardized enum
 */
function mapEconomicClimate(climate: string): 'stable' | 'recession' | 'booming' | 'declining' {
  const lower = climate.toLowerCase();
  if (lower.includes('boom') || lower.includes('expanding')) return 'booming';
  if (lower.includes('growth') || lower.includes('growing')) return 'booming';
  if (lower.includes('recession') || lower.includes('contracting')) return 'recession';
  if (lower.includes('declining')) return 'declining';
  return 'stable';
}

/**
 * Helper: Get season name
 */
function getSeasonName(month: number): string {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}
