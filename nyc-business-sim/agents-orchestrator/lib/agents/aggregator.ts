import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import {
  FinalRecommendationsSchema,
  type DemographicsAnalysis,
  type LifestyleAnalysis,
  type IndustryAnalysis,
  type CensusData,
  type DetailedCensusData,
} from '../schemas';

export async function runAggregatorAgent(
  location: { address: string; neighborhood: string; lat: number; lng: number },
  census_data: CensusData,
  detailed_data: DetailedCensusData,
  demographicsAnalysis: DemographicsAnalysis,
  lifestyleAnalysis: LifestyleAnalysis,
  industryAnalysis: IndustryAnalysis
) {
  const demo = census_data.demographics;
  const stats = detailed_data.derived_statistics;
  const fips = detailed_data.fips_codes;

  const prompt = `You are a senior business strategy consultant specializing in NYC retail site selection.

LOCATION SUMMARY:
- ${location.neighborhood}, NYC
- Tract: ${fips.tract}, Block: ${fips.block}
- Address: ${location.address}
- Population: ${(demo.B01003_001E as number)?.toLocaleString() || 'N/A'}
- Median Income: $${(demo.B19013_001E as number)?.toLocaleString() || 'N/A'}
- High Income Rate (≥$75k): ${stats.high_income_households_rate.toFixed(1)}%
- Education (Bachelor+): ${stats.bachelor_plus_rate.toFixed(1)}%
- Renters: ${stats.renter_rate.toFixed(1)}%
- Work From Home: ${stats.work_from_home_rate.toFixed(1)}%
- Poverty Rate: ${stats.poverty_rate.toFixed(1)}%

You've received 3 independent expert analyses:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMOGRAPHICS ANALYST (Income & Education Expert):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(demographicsAnalysis, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIFESTYLE ANALYST (Housing & Behavior Expert):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(lifestyleAnalysis, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INDUSTRY ANALYST (Workforce & Competition Expert):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(industryAnalysis, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR CRITICAL TASK - FINAL STRATEGIC DECISION:

Synthesize these 3 expert analyses into your TOP 3 BUSINESS RECOMMENDATIONS for THIS SPECIFIC LOCATION.

DECISION CRITERIA (in order of importance):
1. **CONSENSUS**: Businesses mentioned by multiple agents = higher confidence
2. **DATA-BACKED**: Strong Census numbers support it (cite specific %)
3. **LOCATION-SPECIFIC**: Why HERE (Block ${fips.block}), not generic NYC advice
4. **MARKET GAP**: Fills an underserved need vs saturated market
5. **RISK-ADJUSTED**: Balance high-confidence vs high-potential

MANDATORY REQUIREMENTS for each of TOP 3:

1. **Cite 3+ SPECIFIC Census data points**:
   - Example: "${stats.high_income_households_rate.toFixed(1)}% high-income households"
   - Example: "${stats.work_from_home_rate.toFixed(1)}% WFH → daytime foot traffic"
   - Example: "${stats.bachelor_plus_rate.toFixed(1)}% college-educated → values quality"

2. **Explain WHY this exact location** (not just "NYC is good for coffee shops")
   - What makes Block ${fips.block} in Tract ${fips.tract} special?
   - How do the numbers align perfectly?

3. **Show consensus**:
   - "All 3 agents recommended" = confidence 90-100
   - "2 agents recommended" = confidence 70-85
   - "Unique insight from 1 agent with strong data" = confidence 60-75

4. **Investment realism**:
   - Based on income levels, suggest realistic startup costs
   - Consider local competition and market entry barriers

WILD CARD (4th recommendation):
- Higher risk, higher reward
- Maybe only 1 agent mentioned it, but Census data hints it could work
- Explain why the risk might be worth taking

FORMAT YOUR THINKING:
- Location strengths: What are the TOP 3 unique advantages of THIS block?
- Location challenges: What are the 2 main risks/obstacles?
- Then rank your Top 3 + Wild Card

Remember: The user is investing REAL money. Be data-driven, specific, and honest about risks.
This is ${location.neighborhood}, Block ${fips.block} - make it HYPER-LOCAL.

IMPORTANT: Return valid JSON matching the schema exactly. top_recommendations must be an array of 3 objects, NOT a string.`;

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: FinalRecommendationsSchema,
    prompt,
    temperature: 0.8, // Higher temperature for creative synthesis
  });

  return result.object;
}
