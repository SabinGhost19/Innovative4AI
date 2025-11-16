import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

/**
 * Schema pentru market context generat de agent
 * Procesează Census data și identifică caracteristicile pieței locale
 */
export const MarketContextSchema = z.object({
  market_size_estimate: z.number().min(0).describe('Număr estimat de clienți potențiali pe lună'),
  dominant_segments: z.array(z.string()).max(3).describe('2-3 segmente dominante de clienți (ex: "young_professionals", "high_income", "families")'),
  demand_score: z.number().min(0).max(100).describe('Scor de demand pentru acest tip de business (0-100)'),
  price_sensitivity_score: z.number().min(0).max(100).describe('Cât de sensibili sunt clienții la preț (0=foarte sensibili, 100=nesensibili)'),
  quality_preference_score: z.number().min(0).max(100).describe('Preferința pentru calitate vs preț (0=preț, 100=calitate)'),
  foot_traffic_multiplier: z.number().min(0.5).max(2.0).describe('Multiplicator pentru trafic pedonal bazat pe densitate și work-from-home (1.0=normal, <1=mai puțin, >1=mai mult)')
});

export type MarketContext = z.infer<typeof MarketContextSchema>;

/**
 * Interfața pentru datele Census de input
 */
interface CensusDataInput {
  total_population: number;
  median_household_income: number;
  median_rent: number;
  poverty_rate: number;
  education_bachelor_rate: number;
  work_from_home_rate: number;
}

/**
 * Agent care analizează datele Census și generează context de piață pentru business.
 * Rulează în PHASE 1 (Sequential) - primul agent care procesează datele.
 * 
 * @param censusData - Date demografice procesate din Census API
 * @param businessType - Tipul de business (ex: "coffee_shop", "restaurant", "gym")
 * @param location - Locația business-ului
 * @returns MarketContext cu estimări și scoruri pentru piața locală
 */
export async function analyzeMarketContext(
  censusData: CensusDataInput,
  businessType: string,
  location: { address: string; neighborhood: string; lat: number; lng: number }
): Promise<MarketContext> {
  
  // Validare input pentru siguranță
  if (censusData.total_population <= 0) {
    throw new Error('Invalid census data: total_population must be positive');
  }

  const systemPrompt = `Ești un expert în analiză de piață care procesează date Census pentru a evalua potențialul unei locații pentru un business local.

REGULI:
- Identifică 2-3 segmente dominante de clienți bazate pe date demografice
- Estimează dimensiunea pieței (clienți potențiali/lună) considerând populația și business type
- Calculează scoruri pentru demand, price sensitivity, quality preference (0-100)
- foot_traffic_multiplier: 0.5-2.0 (bazat pe work_from_home_rate, densitate, comportament urban)

SEGMENTE POSIBILE:
- "young_professionals" - tineri cu venituri bune, educație
- "high_income" - venituri peste medie
- "families" - zone rezidențiale cu populație stabilă
- "students" - zone universitare
- "seniors" - populație în vârstă
- "price_sensitive" - zone cu venituri mai mici
- "remote_workers" - work from home rate ridicat
- "commuters" - work from home rate scăzut, trafic în zonă

SCORURI:
- demand_score: Cât de mare este cererea pentru acest tip de business (populare=100, niche=30)
- price_sensitivity_score: 0=foarte sensibili la preț, 100=nesensibili (bazat pe venit mediu)
- quality_preference_score: 0=preferă preț, 100=preferă calitate (bazat pe educație și venit)
- foot_traffic_multiplier: >1.0 dacă zona are trafic mare, <1.0 dacă e mai retrasă

OUTPUT: DOAR date numerice și array-uri, fără text narrativ.`.trim();

  const userPrompt = `Analizează potențialul de piață pentru următoarea situație:

🏢 BUSINESS:
- Tip: ${businessType}

📍 LOCAȚIE:
- Adresă: ${location.address}
- Cartier: ${location.neighborhood}
- Coordonate: ${location.lat}, ${location.lng}

📊 DATE CENSUS (Zona Census Tract):
- Populație totală: ${censusData.total_population.toLocaleString()}
- Venit mediu pe gospodărie: $${censusData.median_household_income.toLocaleString()}/an
- Chirie medie: $${censusData.median_rent.toLocaleString()}/lună
- Rata sărăcie: ${censusData.poverty_rate.toFixed(1)}%
- Rata educație superioară (Bachelor+): ${censusData.education_bachelor_rate.toFixed(1)}%
- Rata muncă de acasă: ${censusData.work_from_home_rate.toFixed(1)}%

INSTRUCȚIUNI:
1. Estimează câți clienți potențiali ar putea vizita acest business LUNAR
   - Consideră populația locală și relevanta business-ului
   - Un coffee shop într-o zonă de 10,000 locuitori ar putea avea ~500-1500 clienți unici/lună
   - Ajustează bazat pe tipul specific de business

2. Identifică 2-3 segmente dominante de clienți din datele demografice
   - Bazează-te pe venit, educație, work-from-home, etc.

3. Calculează scorurile:
   - demand_score: Cerere pentru acest business (generic=70-80, niche=30-50)
   - price_sensitivity_score: Venit mare + educație = mai puțin sensibili (scor mai mare)
   - quality_preference_score: Educație înaltă + venit mare = preferă calitate (scor mai mare)
   - foot_traffic_multiplier: Work-from-home ridicat = mai mult trafic local (>1.0)

Returnează DOAR estimările numerice și segmentele identificate.`.trim();

  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'), // Model mai rapid și mai ieftin pentru analiză factuală
      schema: MarketContextSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3, // Temperature scăzută pentru consistență și acuratețe
    });

    // Validare suplimentară a rezultatului
    const marketContext = result.object;
    
    if (marketContext.dominant_segments.length === 0) {
      throw new Error('Market context must have at least one dominant segment');
    }

    if (marketContext.market_size_estimate < 0) {
      throw new Error('Market size estimate cannot be negative');
    }

    return marketContext;

  } catch (error) {
    console.error('❌ Error analyzing market context:', error);
    throw error;
  }
}

/**
 * Helper function pentru a procesa Census data raw și extrage input pentru agent
 * Această funcție poate fi folosită pentru a pregăti datele înainte de a apela agentul
 */
export function prepareCensusDataForMarketAnalysis(rawCensusData: any): CensusDataInput {
  const detail_demo = rawCensusData.demographics_detailed || {};
  
  // Helper pentru a extrage valori din datele Census
  const getValue = (key: string): number => {
    const item = detail_demo[key];
    if (!item) return 0;
    const val = item.value;
    if (val === null || val === 'N/A') return 0;
    return typeof val === 'number' ? val : parseFloat(val as string) || 0;
  };

  const totalPopulation = getValue('B01003_001E') || getValue('B01001_001E');
  const medianIncome = getValue('B19013_001E');
  const medianRent = getValue('B25031_001E');
  const belowPoverty = getValue('B17001_002E');
  const totalEducation25Plus = getValue('B15003_001E') || 1; // Evită division by zero
  const bachelorsDegree = getValue('B15003_022E');
  const mastersDegree = getValue('B15003_023E');
  const phdDegree = getValue('B15003_025E');
  const totalWorkers = getValue('B08301_001E') || 1;
  const workFromHome = getValue('B08301_021E');

  // Calculează rate
  const povertyRate = totalPopulation > 0 ? (belowPoverty / totalPopulation) * 100 : 0;
  const educationBachelorRate = ((bachelorsDegree + mastersDegree + phdDegree) / totalEducation25Plus) * 100;
  const workFromHomeRate = (workFromHome / totalWorkers) * 100;

  return {
    total_population: totalPopulation,
    median_household_income: medianIncome,
    median_rent: medianRent,
    poverty_rate: povertyRate,
    education_bachelor_rate: educationBachelorRate,
    work_from_home_rate: workFromHomeRate
  };
}
