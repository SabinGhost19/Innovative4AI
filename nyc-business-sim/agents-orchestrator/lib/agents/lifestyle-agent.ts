import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { LifestyleAnalysisSchema, type CensusData, type DetailedCensusData } from '../schemas';

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

  const prompt = `You are a housing and lifestyle behavior analyst for retail location planning.

LOCATION: ${location.neighborhood}, NYC
Census Tract: ${fips.tract} | Block: ${fips.block}

HOUSING SITUATION (Affects spending behavior):
- Total Housing Units: ${(demo.B25003_001E as number)?.toLocaleString() || 'N/A'}
- Renter-Occupied: ${demo.B25003_003E} (${stats.renter_rate.toFixed(1)}%)
- Owner-Occupied: ${demo.B25003_002E}
- Median Rent: $${(demo.B25031_001E as number)?.toLocaleString() || 'N/A'}/month
- Rent as % of Income: ${getValue('B25071_001E') || 'N/A'}%
- Median Home Value: $${(demo.B25077_001E as number)?.toLocaleString() || 'N/A'}

WORK & COMMUTE PATTERNS (Foot traffic insights):
- Total Workers 16+: ${getValue('B08301_001E')?.toLocaleString() || 'N/A'}
- Work From Home: ${getValue('B08301_021E')} (${stats.work_from_home_rate.toFixed(1)}%)
- Use Public Transportation: ${getValue('B08301_010E')}

CRITICAL INSIGHTS:
- ${stats.renter_rate.toFixed(1)}% are renters → ${renterInsight}
- ${stats.work_from_home_rate.toFixed(1)}% WFH → ${wfhInsight}

YOUR TASK:
Based on these lifestyle patterns, recommend 3-5 businesses that fit:

1. **Renter vs Owner behavior** (${stats.renter_rate.toFixed(1)}% renters):
   - HIGH RENTERS: Convenience stores, quick-service, grab-and-go, delivery-friendly
   - HIGH OWNERS: Family-oriented, community spaces, premium quality

2. **Work-from-home population** (${stats.work_from_home_rate.toFixed(1)}% WFH):
   - HIGH WFH (30%+): Coffee shops, coworking, all-day dining, afternoon snacks
   - LOW WFH: Evening & weekend focused businesses

3. **Commute patterns**: 
   - High public transport → Near subway/bus, quick grab-and-go
   - Low public transport → Parking-friendly, evening destinations

For each recommendation, cite the SPECIFIC percentages and explain the lifestyle match.
This is Block ${fips.block}, be specific!`;

  const result = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema: LifestyleAnalysisSchema,
    prompt,
    temperature: 0.7,
  });

  return result.object;
}
