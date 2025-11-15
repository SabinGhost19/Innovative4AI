import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, CoreMessage } from 'ai';
import { 
  IndustryAnalysisSchema, 
  type CensusData, 
  type DetailedCensusData,
  type IndustryAnalysis
} from '../schemas';

export async function runIndustryAgent(
  location: { address: string; neighborhood: string; lat: number; lng: number },
  census_data: CensusData,
  detailed_data: DetailedCensusData
) {
  const demo = census_data.demographics;
  const fips = detailed_data.fips_codes;

  const totalWorkforce = (demo.C24050_001E as number) || 1;
  const finance = (demo.C24050_007E as number) || 0;
  const arts = (demo.C24050_018E as number) || 0;
  const professional = (demo.C24050_029E as number) || 0;

  const financePercent = (finance / totalWorkforce) * 100;
  const artsPercent = (arts / totalWorkforce) * 100;
  const professionalPercent = (professional / totalWorkforce) * 100;

  const complementaryOpportunities = [];
  if (financePercent > 15) {
    complementaryOpportunities.push(`HIGH Finance/Real Estate presence (${financePercent.toFixed(1)}%) → Upscale dining, business services, dry cleaning, premium retail`);
  }
  if (artsPercent > 10) {
    complementaryOpportunities.push(`HIGH Arts/Entertainment (${artsPercent.toFixed(1)}%) → Creative spaces, galleries, specialty retail, unique experiences`);
  }
  if (professionalPercent > 15) {
    complementaryOpportunities.push(`HIGH Professional Services (${professionalPercent.toFixed(1)}%) → Coffee shops, lunch spots, business centers, quick-service`);
  }

  // System message
  const systemMessage: CoreMessage = {
    role: 'system',
    content: `You are a workforce and industry composition analyst for business site selection.
Your task is to analyze workforce patterns to identify complementary business opportunities.
You MUST return 3-5 recommendations based on industry composition and market gaps.`
  };

  // User prompt
  const userPrompt = `LOCATION: ${location.neighborhood}, NYC
Block-Level Analysis: ${fips.full_block_id}

WORKFORCE COMPOSITION:
- Total Civilian Workforce: ${totalWorkforce.toLocaleString()}
- Finance, Insurance, Real Estate: ${finance} workers (${financePercent.toFixed(1)}%)
- Arts, Entertainment, Hospitality: ${arts} workers (${artsPercent.toFixed(1)}%)
- Professional, Scientific, Management: ${professional} workers (${professionalPercent.toFixed(1)}%)

COMPLEMENTARY OPPORTUNITIES:
${complementaryOpportunities.length > 0 ? complementaryOpportunities.join('\n') : 'Balanced industry mix - diverse opportunities'}

TASK: Recommend 3-5 businesses that COMPLEMENT existing workforce:

1. What do these workers need during work hours?
   - Finance workers (${financePercent.toFixed(1)}%): Formal lunch, business services, upscale
   - Creative workers (${artsPercent.toFixed(1)}%): Casual spaces, inspiration, unique
   - Professional workers (${professionalPercent.toFixed(1)}%): Efficient, quality, convenience

2. What's MISSING based on industry mix?
   - Identify gaps (saturated vs underserved)
   - Avoid oversaturated markets

3. What services support professional needs?
   - B2B opportunities
   - Work-life balance services

COMPETITION ANALYSIS:
- Arts/Hospitality > 10%: Restaurant/cafe SATURATED (high competition)
- Finance > 15%: Premium services opportunity (low competition)
- Look for underserved niches

Cite specific industry percentages. Block ${fips.block}.`;

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Industry Agent attempt ${attempt}/${maxRetries}...`);
      
      const result = await generateObject({
        model: anthropic('claude-haiku-4-5-20251001'),
        schema: IndustryAnalysisSchema,
        messages: [
          systemMessage,
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        maxRetries: 2,
      });

      // Validate the result structure
      const validatedObject = IndustryAnalysisSchema.parse(result.object);
      
      if (!validatedObject.recommendations || validatedObject.recommendations.length < 3) {
        throw new Error(`Expected at least 3 recommendations, got ${validatedObject.recommendations?.length || 0}`);
      }

      console.log('✅ Industry Agent validation passed');
      console.log(`📊 Usage: ${result.usage?.totalTokens || 'N/A'} tokens`);
      
      return validatedObject;

    } catch (error: any) {
      lastError = error;
      console.error(`❌ Industry Agent attempt ${attempt} failed:`, error.message);
      
      if (error.name === 'ZodError') {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
      
      if (attempt === maxRetries) {
        console.error('❌ All industry agent attempts failed');
        throw new Error(`Industry Agent failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error('Industry Agent failed with unknown error');
}
