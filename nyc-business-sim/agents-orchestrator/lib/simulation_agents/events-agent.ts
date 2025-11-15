import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { DetailedCensusData } from '../schemas';

/**
 * Schema pentru evenimente generate de agent
 */
export const EventSchema = z.object({
  nume_eveniment: z.string().describe('Numele evenimentului economic/social generat'),
  impact_clienti_lunar: z.number().describe('Creștere/scădere procentuală a numărului de clienți pe lună (ex: 15 pentru +15%, -10 pentru -10%)'),
  relevanta_pentru_business: z.boolean().describe('Dacă evenimentul este relevant pentru tipul de business specificat'),
  descriere_scurta: z.string().describe('Descriere scurtă a impactului evenimentului')
});

export type BusinessEvent = z.infer<typeof EventSchema>;

/**
 * Agent care generează evenimente economice aleatorii bazate pe datele Census
 * și stadiul curent al simulării.
 */
export async function generateBusinessEvent(
  businessType: string,
  location: { address: string; neighborhood: string; lat: number; lng: number },
  censusData: DetailedCensusData,
  currentMonth: number,
  currentYear: number
): Promise<BusinessEvent> {
  
  const detail_demo = censusData.demographics_detailed;
  
  // Helper pentru a extrage valori din datele Census
  const getValue = (key: string): number | null => {
    const item = detail_demo[key];
    if (!item) return null;
    const val = item.value;
    if (val === null || val === 'N/A') return null;
    return typeof val === 'number' ? val : parseFloat(val as string);
  };

  // Extrag date relevante pentru generarea evenimentelor
  const totalPopulation = getValue('B01001_001E') || 0;
  const medianAge = getValue('B01002_001E') || 0;
  const medianIncome = getValue('B19013_001E') || 0;
  const totalWorkforce = getValue('C24050_001E') || 0;
  const financeWorkers = getValue('C24050_007E') || 0;
  const artsEntertainmentWorkers = getValue('C24050_018E') || 0;
  const professionalServicesWorkers = getValue('C24050_029E') || 0;
  const bachelorsDegree = getValue('B15003_022E') || 0;
  const mastersDegree = getValue('B15003_023E') || 0;
  const phdDegree = getValue('B15003_025E') || 0;
  const totalEducation = getValue('B15003_001E') || 1;
  const belowPoverty = getValue('B17001_002E') || 0;

  // Calculez metrici derivate
  const educationRate = ((bachelorsDegree + mastersDegree + phdDegree) / totalEducation) * 100;
  const povertyRate = (belowPoverty / totalPopulation) * 100;
  const financeRate = (financeWorkers / totalWorkforce) * 100;
  const artsRate = (artsEntertainmentWorkers / totalWorkforce) * 100;
  const professionalRate = (professionalServicesWorkers / totalWorkforce) * 100;

  // Generez sezonul curent
  const season = getSeasonFromMonth(currentMonth);

  const systemPrompt = `Ești un agent de simulare economică pentru un business simulator NYC. 
Rolul tău este să generezi evenimente economice/sociale realiste care afectează business-urile locale.

IMPORTANTE:
- Evenimentele trebuie să fie REALISTE și bazate pe date demografice
- Impactul trebuie să fie PROPORȚIONAL și REZONABIL (nu mai mult de ±30% lunar)
- Ține cont de SEZON și de CICLURILE ECONOMICE
- Evenimentele pot fi pozitive sau negative
- Un eveniment poate să nu fie relevant pentru toate tipurile de business`;

  const userPrompt = `Generează UN eveniment economic/social pentru următoarea situație:

📍 LOCAȚIE:
- Adresă: ${location.address}
- Cartier: ${location.neighborhood}
- Coordonate: ${location.lat}, ${location.lng}

🏢 BUSINESS:
- Tip: ${businessType}

📊 DATE DEMOGRAFICE:
- Populație totală: ${totalPopulation.toLocaleString()}
- Vârstă mediană: ${medianAge} ani
- Venit mediu: $${medianIncome.toLocaleString()}
- Rata educație superioară: ${educationRate.toFixed(1)}%
- Rata sărăcie: ${povertyRate.toFixed(1)}%

💼 FORȚĂ DE MUNCĂ (din total ${totalWorkforce.toLocaleString()}):
- Finanțe/Asigurări/Real Estate: ${financeRate.toFixed(1)}% (${financeWorkers.toLocaleString()})
- Artă/Divertisment/HoReCa: ${artsRate.toFixed(1)}% (${artsEntertainmentWorkers.toLocaleString()})
- Servicii Profesionale/Științifice: ${professionalRate.toFixed(1)}% (${professionalServicesWorkers.toLocaleString()})

📅 CONTEXT TEMPORAL:
- Luna curentă: ${currentMonth}/12
- An: ${currentYear}
- Sezon: ${season}

GENEREAZĂ un eveniment care:
1. Este relevant pentru datele demografice prezentate
2. Ține cont de sezon și context temporal
3. Poate fi pozitiv sau negativ
4. Are impact rezonabil (±5% până la ±30% lunar)
5. Este plauzibil pentru zona NYC

EXEMPLE DE EVENIMENTE:
- Festival local artizanal (dacă zona are % ridicat în artă/divertisment)
- Recesiune în sectorul financiar (dacă zona e dependentă de finanțe)
- Program guvernamental de stimulente (sezon specific)
- Deschidere competiție majoră în zonă (generic negativ)
- Trend de consum sezonier (vară/iarnă)
- Schimbare demografică (tineri profesioniști se mută în zonă)

Returnează DOAR evenimentul, fără explicații suplimentare.`;

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: EventSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.9, // Mai multă creativitate pentru evenimente diverse
  });

  return result.object;
}

/**
 * Helper pentru a determina sezonul din luna curentă
 */
function getSeasonFromMonth(month: number): string {
  if (month >= 3 && month <= 5) return 'Primăvară';
  if (month >= 6 && month <= 8) return 'Vară';
  if (month >= 9 && month <= 11) return 'Toamnă';
  return 'Iarnă';
}
