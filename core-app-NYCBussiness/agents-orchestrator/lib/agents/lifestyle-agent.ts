import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, CoreMessage } from 'ai';
import { 
  LifestyleAnalysisSchema, 
  type CensusData, 
  type DetailedCensusData,
  type LifestyleAnalysis
} from '../schemas';

export async function runLifestyleAgent(
  location: { address: string; neighborhood: string; lat: number; lng: number },
  census_data: CensusData,
  detailed_data: DetailedCensusData
) {
  const demo = census_data.demographics;
  const detail_demo = detailed_data.demographics_detailed;
  const stats = detailed_data.derived_statistics;
  const fips = detailed_data.fips_codes;

  const getValue = (key: string): number | null => {
    const item = detail_demo[key];
    if (!item) return null;
    const val = item.value;
    if (val === null || val === 'N/A') return null;
    return typeof val === 'number' ? val : parseFloat(val as string);
  };

  const renterInsight = stats.renter_rate > 60 
    ? 'High mobility, transient population - prefer convenience and flexibility' 
    : 'Stable owner community - invest in long-term relationships';
    
  const wfhInsight = stats.work_from_home_rate > 30
    ? 'Significant daytime foot traffic from remote workers'
    : 'Primarily residential during daytime, evening/weekend traffic';

  // System message
  const systemMessage: CoreMessage = {
    role: 'system',
    content: `You are a housing and lifestyle behavior analyst for retail location planning.
Your task is to analyze renter/owner patterns and work-from-home behaviors to identify business opportunities.
You MUST return 3-5 recommendations based on lifestyle patterns and foot traffic.`
  };

  // User prompt
  const userPrompt = `LOCATION: ${location.neighborhood}, NYC
Census Tract: ${fips.tract} | Block: ${fips.block}

HOUSING SITUATION:
- Total Housing Units: ${(demo.B25003_001E as number)?.toLocaleString() || 'N/A'}
- Renter-Occupied: ${demo.B25003_003E} (${stats.renter_rate.toFixed(1)}%)
- Owner-Occupied: ${demo.B25003_002E}
- Median Rent: $${(demo.B25031_001E as number)?.toLocaleString() || 'N/A'}/month
- Rent as % of Income: ${getValue('B25071_001E') || 'N/A'}%
- Median Home Value: $${(demo.B25077_001E as number)?.toLocaleString() || 'N/A'}

WORK & COMMUTE PATTERNS:
- Total Workers 16+: ${getValue('B08301_001E')?.toLocaleString() || 'N/A'}
- Work From Home: ${getValue('B08301_021E')} (${stats.work_from_home_rate.toFixed(1)}%)
- Use Public Transportation: ${getValue('B08301_010E')}

INSIGHTS:
- ${stats.renter_rate.toFixed(1)}% renters → ${renterInsight}
- ${stats.work_from_home_rate.toFixed(1)}% WFH → ${wfhInsight}

TASK: Recommend 3-5 businesses that fit:

1. Renter vs Owner behavior (${stats.renter_rate.toFixed(1)}% renters):
   - HIGH RENTERS: Convenience, quick-service, grab-and-go, delivery-friendly
   - HIGH OWNERS: Family-oriented, community spaces, premium quality

2. Work-from-home (${stats.work_from_home_rate.toFixed(1)}% WFH):
   - HIGH WFH (30%+): Coffee shops, coworking, all-day dining
   - LOW WFH: Evening & weekend focused

3. Commute patterns: 
   - High public transport → Near transit, quick service
   - Low public transport → Parking-friendly

For each recommendation, cite SPECIFIC percentages and explain lifestyle match.
Be specific to Block ${fips.block}.`;

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Lifestyle Agent attempt ${attempt}/${maxRetries}...`);
      
      const result = await generateObject({
        model: anthropic('claude-haiku-4-5-20251001'),
        schema: LifestyleAnalysisSchema,
        messages: [
          systemMessage,
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        maxRetries: 2,
      });

      // Validate the result structure
      const validatedObject = LifestyleAnalysisSchema.parse(result.object);
      
      if (!validatedObject.recommendations || validatedObject.recommendations.length < 3) {
        throw new Error(`Expected at least 3 recommendations, got ${validatedObject.recommendations?.length || 0}`);
      }

      console.log('✅ Lifestyle Agent validation passed');
      console.log(`📊 Usage: ${result.usage?.totalTokens || 'N/A'} tokens`);
      
      return validatedObject;

    } catch (error: any) {
      lastError = error;
      console.error(`❌ Lifestyle Agent attempt ${attempt} failed:`, error.message);
      
      if (error.name === 'ZodError') {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
      
      if (attempt === maxRetries) {
        console.error('❌ All lifestyle agent attempts failed');
        throw new Error(`Lifestyle Agent failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error('Lifestyle Agent failed with unknown error');
}
