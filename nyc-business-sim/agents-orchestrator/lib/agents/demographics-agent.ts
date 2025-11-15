import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { DemographicsAnalysisSchema, type CensusData, type DetailedCensusData } from '../schemas';

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

  const prompt = `You are a demographic and income analyst for NYC retail businesses.

LOCATION ANALYZED:
- Address: ${location.address}
- Neighborhood: ${location.neighborhood}
- Coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
- Census Tract: ${fips.state}-${fips.county}-${fips.tract}
- Block: ${fips.block}

POPULATION DEMOGRAPHICS:
- Total Population: ${(demo.B01003_001E as number)?.toLocaleString() || 'N/A'} residents
- Median Age: ${demo.B01002_001E || 'N/A'} years
- Population 25+: ${(demo.B15003_001E as number)?.toLocaleString() || 'N/A'}

INCOME DATA (CRITICAL FOR PURCHASING POWER):
- Median Household Income: $${(demo.B19013_001E as number)?.toLocaleString() || 'N/A'}/year
- Per Capita Income: $${(demo.B19301_001E as number)?.toLocaleString() || 'N/A'}/year
- Total Households: ${totalHouseholds.toLocaleString()}

INCOME DISTRIBUTION (Who can afford what?):
- Households earning $75k-$99k: ${hh75to99} (${((hh75to99 / totalHouseholds) * 100).toFixed(1)}%)
- Households earning $100k-$124k: ${hh100to124} (${((hh100to124 / totalHouseholds) * 100).toFixed(1)}%)
- Households earning $125k-$149k: ${hh125to149} (${((hh125to149 / totalHouseholds) * 100).toFixed(1)}%)
- Households earning $150k-$199k: ${hh150to199} (${((hh150to199 / totalHouseholds) * 100).toFixed(1)}%)
- Households earning $200k+: ${hh200plus} (${((hh200plus / totalHouseholds) * 100).toFixed(1)}%)
- **HIGH INCOME RATE: ${stats.high_income_households_rate.toFixed(1)}% earn $75k+**

EDUCATION LEVEL (Indicator of preferences):
- Bachelor's Degree or Higher: ${stats.bachelor_plus_rate.toFixed(1)}%
  - Bachelor's: ${getValue('B15003_022E')}
  - Master's: ${getValue('B15003_023E')}
  - Doctorate: ${getValue('B15003_025E')}

POVERTY DATA:
- Population Below Poverty Line: ${demo.B17001_002E} people
- Poverty Rate: ${stats.poverty_rate.toFixed(1)}%

YOUR TASK:
Based on these SPECIFIC numbers, recommend 3-5 business types that match:
1. The income distribution (what can people afford?)
2. Education level (what do they value?)
3. The poverty rate (price sensitivity)

For each recommendation:
- Explain WHY this income profile supports it
- Cite specific percentages (e.g., "With ${stats.high_income_households_rate.toFixed(1)}% earning $75k+, premium services are viable")
- Suggest price range that fits the demographics

Be data-driven and specific to THIS location (Block ${fips.block} in Tract ${fips.tract}).`;

  const result = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema: DemographicsAnalysisSchema,
    prompt,
    temperature: 0.7,
  });

  return result.object;
}
