/**
 * Market Context Agent
 * 
 * Analyzes overall market conditions, industry saturation, and survival benchmarks.
 * Uses Census data + Business Survival data to establish baseline context.
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

/**
 * Generate market context analysis
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
  const totalPopulation = demo.B01001_001E?.value || 0;
  const medianIncome = demo.B19013_001E?.value || 0;
  const workersTotal = demo.B08301_001E?.value || 0;
  
  // Build system prompt
  const systemPrompt = `You are a market analysis expert specializing in NYC business ecosystems.
Your role is to analyze market conditions and provide strategic context for business planning.

IMPORTANT:
- Base ALL analysis on provided data (Census + Survival rates)
- Be realistic and data-driven
- Consider seasonal factors (month ${currentMonth})
- Economic climate should reflect macro trends AND local demographics
- Industry saturation is % of market already served (0-100)`;

  const userPrompt = `Analyze market context for this business:

🏢 BUSINESS:
- Type: ${businessType}
- Location: ${location.neighborhood}, ${location.county}

📊 DEMOGRAPHICS (Census Data):
- Population: ${typeof totalPopulation === 'number' ? totalPopulation.toLocaleString() : totalPopulation}
- Median Income: $${typeof medianIncome === 'number' ? medianIncome.toLocaleString() : medianIncome}
- Bachelor's Degree+: ${(stats.bachelor_plus_rate * 100).toFixed(1)}%
- Poverty Rate: ${(stats.poverty_rate * 100).toFixed(1)}%
- High Income Households (>$150k): ${(stats.high_income_households_rate * 100).toFixed(1)}%
- Work from Home: ${(stats.work_from_home_rate * 100).toFixed(1)}%
- Renter Rate: ${(stats.renter_rate * 100).toFixed(1)}%
- Total Workers: ${typeof workersTotal === 'number' ? workersTotal.toLocaleString() : workersTotal}

📈 SURVIVAL BENCHMARK:
${survivalData ? `
- Industry: ${survivalData.industry}
- 5-Year Survival Rate: ${survivalData.survival_rate_5_year}%
- Risk Level: ${survivalData.risk_level}
- Interpretation: ${survivalData.interpretation}
- Data pool: ${survivalData.firms_2017_start_pool} firms tracked
` : 'No survival data available for this industry/county'}

📅 TEMPORAL CONTEXT:
- Month: ${currentMonth}/12 (${getSeasonName(currentMonth)})
- Year: ${currentYear}

ANALYZE:
1. Economic Climate: Based on income levels, employment, and current month
2. Industry Saturation: Estimate % of market already served (consider population density, competition)
3. Market Risk: Combine survival data + demographics + seasonality
4. Survival Benchmark: Your estimate vs industry average
5. Recommended Strategy: What approach fits this market best?
6. Market Trends: Top 3 trends affecting this business type in this area

Be specific and quantitative. Reference the data.`;

  const result = await generateObject({
    model: openai(LLM_CONFIG.FAST_MODEL),
    schema: MarketContextSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: LLM_CONFIG.DETERMINISTIC,
  });

  return result.object;
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
