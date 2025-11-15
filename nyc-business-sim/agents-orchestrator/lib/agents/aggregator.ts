import { openai } from '@ai-sdk/openai';
import { generateObject, CoreMessage } from 'ai';
import {
  FinalRecommendationsSchema,
  type DemographicsAnalysis,
  type LifestyleAnalysis,
  type IndustryAnalysis,
  type CensusData,
  type DetailedCensusData,
  type FinalRecommendations,
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

  // System message for the aggregator
  const systemMessage: CoreMessage = {
    role: 'system',
    content: `You are a senior business strategy consultant specializing in NYC retail site selection.
Your task is to synthesize multiple expert analyses into actionable business recommendations.
You MUST return exactly 3 ranked recommendations with complete data.
Be data-driven, specific, and honest about risks.`
  };

  // User prompt with all context
  const userPrompt = `LOCATION SUMMARY:
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

EXPERT ANALYSES:

DEMOGRAPHICS ANALYST (Income & Education Expert):
${JSON.stringify(demographicsAnalysis, null, 2)}

LIFESTYLE ANALYST (Housing & Behavior Expert):
${JSON.stringify(lifestyleAnalysis, null, 2)}

INDUSTRY ANALYST (Workforce & Competition Expert):
${JSON.stringify(industryAnalysis, null, 2)}

TASK: Synthesize these 3 expert analyses into your TOP 3 BUSINESS RECOMMENDATIONS.

DECISION CRITERIA:
1. CONSENSUS: Businesses mentioned by multiple agents = higher confidence
2. DATA-BACKED: Strong Census numbers support it (cite specific %)
3. LOCATION-SPECIFIC: Why Block ${fips.block}, not generic NYC advice
4. MARKET GAP: Fills underserved need vs saturated market
5. RISK-ADJUSTED: Balance high-confidence vs high-potential

REQUIREMENTS for each of TOP 3:
1. Cite 3+ SPECIFIC Census data points
2. Explain WHY this exact location
3. Show consensus (how many agents recommended)
4. Investment realism based on income levels

WILD CARD (4th recommendation):
- Higher risk, higher reward
- Explain why the risk might be worth taking

Location strengths: TOP 3 unique advantages of THIS block
Location challenges: 2 main risks/obstacles

This is ${location.neighborhood}, Block ${fips.block} - make it HYPER-LOCAL.`;

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Aggregator attempt ${attempt}/${maxRetries}...`);
      
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: FinalRecommendationsSchema,
        messages: [
          systemMessage,
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        maxRetries: 2, // AI SDK internal retries
        abortSignal: AbortSignal.timeout(30000), // 30s timeout
      });

      // Validate the result structure
      const validatedObject = FinalRecommendationsSchema.parse(result.object);
      
      if (!validatedObject.top_recommendations || validatedObject.top_recommendations.length !== 3) {
        throw new Error(`Expected 3 recommendations, got ${validatedObject.top_recommendations?.length || 0}`);
      }

      console.log('✅ Aggregator validation passed');
      console.log(`📊 Usage: ${result.usage?.totalTokens || 'N/A'} tokens`);
      
      return validatedObject;

    } catch (error: any) {
      lastError = error;
      console.error(`❌ Aggregator attempt ${attempt} failed:`, error.message);
      
      // If it's a validation error, log details
      if (error.name === 'ZodError') {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
      
      // If it's the last attempt, throw
      if (attempt === maxRetries) {
        console.error('❌ All aggregator attempts failed');
        throw new Error(`Aggregator failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff: 1s, 2s, 4s)
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error('Aggregator failed with unknown error');
}
