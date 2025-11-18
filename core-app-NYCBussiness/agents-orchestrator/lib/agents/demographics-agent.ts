import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, CoreMessage } from 'ai';
import { 
  DemographicsAnalysisSchema, 
  type CensusData, 
  type DetailedCensusData,
  type DemographicsAnalysis 
} from '../schemas';

export async function runDemographicsAgent(
  location: { address: string; neighborhood: string; lat: number; lng: number },
  census_data: CensusData,
  detailed_data: DetailedCensusData
) {
  const demo = census_data.demographics;
  const detail_demo = detailed_data.demographics_detailed;
  const stats = detailed_data.derived_statistics;
  const fips = detailed_data.fips_codes;

  // Helper pentru a extrage valori
  const getValue = (key: string): number | null => {
    const item = detail_demo[key];
    if (!item) return null;
    const val = item.value;
    if (val === null || val === 'N/A') return null;
    return typeof val === 'number' ? val : parseFloat(val as string);
  };

  const totalHouseholds = getValue('B19001_001E') || 1;
  const hh75to99 = getValue('B19001_013E') || 0;
  const hh100to124 = getValue('B19001_014E') || 0;
  const hh125to149 = getValue('B19001_015E') || 0;
  const hh150to199 = getValue('B19001_016E') || 0;
  const hh200plus = getValue('B19001_017E') || 0;

  // System message
  const systemMessage: CoreMessage = {
    role: 'system',
    content: `You are a demographic and income analyst for NYC retail businesses.
Your task is to analyze income distribution and education levels to recommend viable business types.
You MUST return 3-5 recommendations based on purchasing power and demographic characteristics.`
  };

  // User prompt
  const userPrompt = `LOCATION ANALYZED:
- Address: ${location.address}
- Neighborhood: ${location.neighborhood}
- Census Tract: ${fips.state}-${fips.county}-${fips.tract}
- Block: ${fips.block}

POPULATION DEMOGRAPHICS:
- Total Population: ${(demo.B01003_001E as number)?.toLocaleString() || 'N/A'} residents
- Median Age: ${demo.B01002_001E || 'N/A'} years
- Population 25+: ${(demo.B15003_001E as number)?.toLocaleString() || 'N/A'}

INCOME DATA:
- Median Household Income: $${(demo.B19013_001E as number)?.toLocaleString() || 'N/A'}/year
- Per Capita Income: $${(demo.B19301_001E as number)?.toLocaleString() || 'N/A'}/year
- Total Households: ${totalHouseholds.toLocaleString()}

INCOME DISTRIBUTION:
- Households earning $75k-$99k: ${hh75to99} (${((hh75to99 / totalHouseholds) * 100).toFixed(1)}%)
- Households earning $100k-$124k: ${hh100to124} (${((hh100to124 / totalHouseholds) * 100).toFixed(1)}%)
- Households earning $125k-$149k: ${hh125to149} (${((hh125to149 / totalHouseholds) * 100).toFixed(1)}%)
- Households earning $150k-$199k: ${hh150to199} (${((hh150to199 / totalHouseholds) * 100).toFixed(1)}%)
- Households earning $200k+: ${hh200plus} (${((hh200plus / totalHouseholds) * 100).toFixed(1)}%)
- HIGH INCOME RATE: ${stats.high_income_households_rate.toFixed(1)}% earn $75k+

EDUCATION LEVEL:
- Bachelor's Degree or Higher: ${stats.bachelor_plus_rate.toFixed(1)}%
  - Bachelor's: ${getValue('B15003_022E')}
  - Master's: ${getValue('B15003_023E')}
  - Doctorate: ${getValue('B15003_025E')}

POVERTY DATA:
- Population Below Poverty Line: ${demo.B17001_002E} people
- Poverty Rate: ${stats.poverty_rate.toFixed(1)}%

TASK: Recommend 3-5 business types that match:
1. The income distribution (what can people afford?)
2. Education level (what do they value?)
3. The poverty rate (price sensitivity)

For each recommendation:
- Explain WHY this income profile supports it
- Cite specific percentages
- Suggest price range that fits the demographics

Be specific to Block ${fips.block} in Tract ${fips.tract}.`;

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Demographics Agent attempt ${attempt}/${maxRetries}...`);
      
      const result = await generateObject({
        model: anthropic('claude-haiku-4-5-20251001'),
        schema: DemographicsAnalysisSchema,
        messages: [
          systemMessage,
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        maxRetries: 2,
      });

      // Validate the result structure
      const validatedObject = DemographicsAnalysisSchema.parse(result.object);
      
      if (!validatedObject.recommendations || validatedObject.recommendations.length < 3) {
        throw new Error(`Expected at least 3 recommendations, got ${validatedObject.recommendations?.length || 0}`);
      }

      console.log('✅ Demographics Agent validation passed');
      console.log(`📊 Usage: ${result.usage?.totalTokens || 'N/A'} tokens`);
      
      return validatedObject;

    } catch (error: any) {
      lastError = error;
      console.error(`❌ Demographics Agent attempt ${attempt} failed:`, error.message);
      
      if (error.name === 'ZodError') {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
      
      if (attempt === maxRetries) {
        console.error('❌ All demographics agent attempts failed');
        throw new Error(`Demographics Agent failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error('Demographics Agent failed with unknown error');
}
