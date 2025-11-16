/**
 * Competition Agent
 * 
 * Analyzes competitive landscape, market saturation, and competitor actions.
 * Simulates realistic competitor behavior (price changes, closures, new entrants).
 * 
 * Model: gpt-4o-mini (fast decisions)
 * Output: CompetitionAnalysisSchema (structured)
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { DetailedCensusData } from '../../core/types';
import { CompetitionAnalysisSchema } from '../../core/schemas';
import { LLM_CONFIG } from '../../core/constants';

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
  
  // Estimate competitor count based on population and saturation
  const estimatedCompetitors = estimateCompetitorCount(businessType, Number(population), marketContext.industry_saturation);
  
  const systemPrompt = `You are a competitive intelligence analyst for NYC businesses.
Your role is to analyze competitive dynamics and predict competitor behavior.

IMPORTANT:
- NYC is highly competitive - most markets are saturated
- Competitor actions should be realistic (not all negative)
- New entrants depend on economic climate and barriers to entry
- Closures happen but not excessively (use survival data context)
- Pricing pressure correlates with saturation`;

  const userPrompt = `Analyze competition for this business:

🏢 BUSINESS:
- Type: ${businessType}
- Location: ${location.neighborhood}, ${location.county}
- Coordinates: ${location.lat}, ${location.lng}

📊 MARKET CONTEXT:
- Industry Saturation: ${marketContext.industry_saturation}%
- Economic Climate: ${marketContext.economic_climate}
- Estimated Competitors in Area: ~${estimatedCompetitors}

📍 AREA DEMOGRAPHICS:
- Population: ${typeof population === 'number' ? population.toLocaleString() : population}
- Median Income: $${typeof medianIncome === 'number' ? medianIncome.toLocaleString() : medianIncome}
- High Income Rate: ${(censusData.derived_statistics.high_income_households_rate * 100).toFixed(1)}%

📅 TEMPORAL:
- Month: ${currentMonth}/12 (${getSeasonName(currentMonth)})
- Year: ${currentYear}

SIMULATE THIS MONTH'S COMPETITIVE DYNAMICS:

1. **Competitor Count Changes**:
   - How many competitors likely closed this month? (0-3 realistic)
   - How many new entrants? (0-2 realistic, depends on climate)
   - Starting point: ${estimatedCompetitors} competitors

2. **Market Space**: Based on saturation (${marketContext.industry_saturation}%), is market:
   - opening (saturation <50%, growing)
   - saturated (50-80%, stable)
   - contracting (>80%, declining)

3. **Pricing Pressure**: How intense is price competition?

4. **Competitor Actions**: Generate 1-3 SPECIFIC competitor actions this month:
   - Could be: price cuts, promotions, closures, expansions, quality changes
   - Name competitors generically: "Competitor A (coffee shop)", "Competitor B (bakery)"
   - Specify impact on YOUR business: positive/neutral/negative

5. **Your Advantages**: What 2-3 advantages could YOU have?
   - Based on location, demographics, or market gaps

6. **Threats**: What 2-3 competitive threats exist?

Be realistic - not every month has dramatic changes. Sometimes it's stable.`;

  const result = await generateObject({
    model: openai(LLM_CONFIG.FAST_MODEL),
    schema: CompetitionAnalysisSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: LLM_CONFIG.BALANCED, // Slightly more creative for variety
  });

  return result.object;
}

/**
 * Helper: Estimate competitor count based on business type and population
 */
function estimateCompetitorCount(businessType: string, population: number, saturation: number): number {
  const type = businessType.toLowerCase();
  
  // Base rate: competitors per 10,000 people
  let baseRate = 1; // Default
  
  if (type.includes('coffee') || type.includes('cafe')) {
    baseRate = 2.5; // Coffee shops are dense in NYC
  } else if (type.includes('restaurant')) {
    baseRate = 3.0; // Even more restaurants
  } else if (type.includes('retail') || type.includes('shop')) {
    baseRate = 2.0;
  } else if (type.includes('gym') || type.includes('fitness')) {
    baseRate = 0.5; // Less dense
  } else if (type.includes('salon') || type.includes('barber')) {
    baseRate = 1.5;
  }
  
  // Calculate base count
  const baseCount = (population / 10000) * baseRate;
  
  // Adjust by saturation
  const saturationMultiplier = saturation / 50; // 50% saturation = 1x, 100% = 2x
  
  return Math.round(baseCount * saturationMultiplier);
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
