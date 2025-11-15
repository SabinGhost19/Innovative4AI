import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { IndustryAnalysisSchema, type CensusData, type DetailedCensusData } from '../schemas';

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

  const prompt = `You are a workforce and industry composition analyst for business site selection.

LOCATION: ${location.neighborhood}, NYC
Block-Level Analysis: ${fips.full_block_id}

WORKFORCE COMPOSITION:
- Total Civilian Workforce: ${totalWorkforce.toLocaleString()}
- Finance, Insurance, Real Estate: ${finance} workers
- Arts, Entertainment, Hospitality: ${arts} workers
- Professional, Scientific, Management: ${professional} workers

INDUSTRY PERCENTAGES:
- Finance/Real Estate: ${financePercent.toFixed(1)}%
- Arts/Hospitality: ${artsPercent.toFixed(1)}%
- Professional Services: ${professionalPercent.toFixed(1)}%

COMPLEMENTARY BUSINESS OPPORTUNITIES:
${complementaryOpportunities.length > 0 ? complementaryOpportunities.join('\n') : 'Balanced industry mix - diverse opportunities'}

YOUR TASK:
Recommend 3-5 businesses that COMPLEMENT the existing workforce:

1. **What do these workers need during work hours?**
   - Finance workers (${financePercent.toFixed(1)}%): Formal lunch, business services, upscale
   - Creative workers (${artsPercent.toFixed(1)}%): Casual spaces, inspiration, unique offerings
   - Professional workers (${professionalPercent.toFixed(1)}%): Efficient service, quality, convenience

2. **What's MISSING based on industry mix?**
   - Identify gaps in service (saturated vs underserved)
   - Avoid opening another restaurant if hospitality is already ${artsPercent.toFixed(1)}%
   
3. **What services support their professional needs?**
   - B2B opportunities
   - Work-life balance services
   - Professional development

COMPETITION ANALYSIS:
- If Arts/Hospitality > 10%: Restaurant/cafe market is SATURATED (high competition)
- If Finance > 15%: Premium services opportunity (low competition for quality)
- Look for underserved niches

Cite specific industry percentages in your reasoning. This is Block ${fips.block}.`;

  const result = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema: IndustryAnalysisSchema,
    prompt,
    temperature: 0.7,
  });

  return result.object;
}
