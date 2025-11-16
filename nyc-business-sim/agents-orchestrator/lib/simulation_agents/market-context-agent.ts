/**
 * Market Context Agent
 * 
 * Analyzes overall market conditions, industry saturation, and survival benchmarks.
 * Uses Census data + Business Survival data to establish baseline context.
 * 
 * MATHEMATICAL APPROACH:
 * - Industry saturation: Calculated using Reilly's Law + competitor density
 * - Market risk: Formula-based (survival rate + saturation + economic factors)
 * - Economic climate: Income ratios + poverty + employment metrics
 * - LLM: Qualitative insights only (trends, strategy narrative)
 * 
 * Model: gpt-4o-mini (fast, deterministic)
 * Output: MarketContextSchema (structured)
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { DetailedCensusData, SurvivalData } from '../../core/types';
import { MarketContextSchema } from '../../core/schemas';
import { LLM_CONFIG } from '../../core/constants';
import { estimateCompetitorCount } from './competition-math';
import { 
  calculateIndustrySaturation,
  calculateMarketCapacity,
  calculateMarketRisk,
  classifyMarketRisk,
  calculateEconomicClimate,
  calculateMarketSharePotential,
  calculateMarketGrowthRate,
  recommendStrategy
} from './market-math';

/**
 * Generate market context analysis
 * 
 * CALCULATION SEQUENCE:
 * 1. Calculate mathematical metrics (saturation, risk, climate, capacity)
 * 2. LLM generates qualitative insights (trends, strategy narrative)
 * 3. Combine: Math provides hard numbers, LLM provides context
 */
export async function analyzeMarketContext(
  businessType: string,
  location: { address: string; neighborhood: string; county: string },
  censusData: DetailedCensusData,
  survivalData: SurvivalData | null,
  currentMonth: number,
  currentYear: number
): Promise<z.infer<typeof MarketContextSchema>> {
  
  const demo = censusData.demographics_detailed;
  const stats = censusData.derived_statistics;
  
  // Extract key demographics
  const totalPopulation = typeof demo.B01001_001E?.value === 'number' 
    ? demo.B01001_001E.value 
    : 0;
  const medianIncome = typeof demo.B19013_001E?.value === 'number'
    ? demo.B19013_001E.value
    : 0;
  const workersTotal = demo.B08301_001E?.value || 0;
  const povertyRate = stats.poverty_rate;
  const workFromHomeRate = stats.work_from_home_rate;
  
  // ====================================================================
  // MATHEMATICAL CALCULATIONS (NO LLM)
  // ====================================================================
  
  // 1. Estimate competitors using competition-math
  const estimatedCompetitors = estimateCompetitorCount(
    businessType,
    totalPopulation,
    medianIncome
  );
  
  // 2. Industry saturation (Reilly's Law + density)
  const industrySaturation = calculateIndustrySaturation(
    businessType,
    totalPopulation,
    medianIncome,
    estimatedCompetitors
  );
  
  // 3. Market capacity (potential monthly customers)
  const marketCapacity = calculateMarketCapacity(
    totalPopulation,
    medianIncome,
    businessType
  );
  
  // 4. Economic climate classification
  const economicClimate = calculateEconomicClimate(
    medianIncome,
    povertyRate,
    workFromHomeRate
  );
  
  // 5. Market risk score
  const survivalRate5Year = survivalData?.survival_rate_5_year || 50; // Default 50%
  const marketRiskScore = calculateMarketRisk(
    survivalRate5Year,
    industrySaturation,
    medianIncome,
    povertyRate
  );
  let marketRiskLevel = classifyMarketRisk(marketRiskScore);
  
  // Schema only supports low/medium/high, map very_high -> high
  if (marketRiskLevel === 'very_high') {
    marketRiskLevel = 'high' as const;
  }
  
  // 6. Market share potential
  const marketSharePotential = calculateMarketSharePotential(
    estimatedCompetitors,
    industrySaturation,
    1.0 // Assume average quality for new business
  );
  
  // 7. Market growth rate
  const marketGrowthRate = calculateMarketGrowthRate(
    totalPopulation,
    medianIncome,
    industrySaturation
  );
  
  // 8. Recommended strategy
  const recommendedStrategy = recommendStrategy(
    industrySaturation,
    marketRiskScore,
    medianIncome
  );
  
  // ====================================================================
  // PARTIAL SCHEMA FOR LLM (QUALITATIVE ONLY)
  // ====================================================================
  
  const PartialMarketContextSchema = z.object({
    market_trends: z.array(z.string()).max(3).describe('Top 3 specific market trends affecting this business'),
    strategic_considerations: z.array(z.string()).describe('Key strategic factors to consider'),
    risk_factors: z.array(z.string()).max(3).describe('Specific risk factors for this market'),
  });
  
  // ====================================================================
  // LLM PROMPT (CONTEXT ONLY, NOT CALCULATIONS)
  // ====================================================================
  
  const systemPrompt = `You are a market analysis expert specializing in NYC business ecosystems.

CRITICAL: DO NOT calculate numbers. Numbers are already calculated mathematically.
Your role: Provide qualitative insights, trends, and strategic narrative.

Focus on:
- Market trends (demographic shifts, consumer behavior, technology)
- Strategic considerations (positioning, timing, competitive advantages)`;

  const userPrompt = `Provide qualitative market insights for this business:

🏢 BUSINESS:
- Type: ${businessType}
- Location: ${location.neighborhood}, ${location.county}

📊 CALCULATED METRICS (ALREADY DONE):
- Industry Saturation: ${industrySaturation}%
- Market Risk: ${marketRiskLevel} (${marketRiskScore}/100)
- Economic Climate: ${economicClimate}
- Estimated Competitors: ${estimatedCompetitors}
- Market Capacity: ${marketCapacity.toLocaleString()} potential monthly customers
- Market Share Potential: ${(marketSharePotential * 100).toFixed(1)}%
- Market Growth Rate: ${marketGrowthRate}% annually
- Recommended Strategy: ${recommendedStrategy}

📈 DEMOGRAPHICS:
- Population: ${totalPopulation.toLocaleString()}
- Median Income: $${medianIncome.toLocaleString()}
- Bachelor's Degree+: ${(stats.bachelor_plus_rate * 100).toFixed(1)}%
- Poverty Rate: ${(povertyRate * 100).toFixed(1)}%
- High Income (>$150k): ${(stats.high_income_households_rate * 100).toFixed(1)}%
- Work from Home: ${(workFromHomeRate * 100).toFixed(1)}%

📅 TEMPORAL:
- Month: ${currentMonth}/12 (${getSeasonName(currentMonth)})
- Year: ${currentYear}

${survivalData ? `� SURVIVAL BENCHMARK:
- Industry: ${survivalData.industry}
- 5-Year Survival: ${survivalData.survival_rate_5_year}%
- Risk: ${survivalData.risk_level}` : ''}

PROVIDE:
1. Market Trends (3 specific trends - demographic, technology, consumer behavior)
2. Risk Factors (3 specific risks for this business type in this market)
3. Strategic Considerations (NOT needed - already calculated recommended_strategy)

Be specific. Reference the calculated metrics.`;

  const result = await generateObject({
    model: openai(LLM_CONFIG.FAST_MODEL),
    schema: PartialMarketContextSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: LLM_CONFIG.DETERMINISTIC,
  });

  // ====================================================================
  // COMBINE MATH + LLM
  // ====================================================================
  
  // Calculate estimated survival rate for YOUR business (baseline + adjustments)
  const yourEstimatedSurvival = survivalRate5Year * (
    1 - (marketRiskScore / 200) // Risk penalty (max -50%)
  );
  
  return {
    economic_climate: economicClimate,
    industry_saturation: industrySaturation,
    market_risk_level: marketRiskLevel,
    survival_benchmark: {
      industry_5yr_survival: survivalRate5Year,
      your_estimated_survival: Math.round(yourEstimatedSurvival * 10) / 10,
      risk_factors: result.object.risk_factors,
    },
    recommended_strategy: recommendedStrategy,
    market_trends: result.object.market_trends,
  };
}

/**
 * Helper: Get season name from month
 */
function getSeasonName(month: number): string {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}
