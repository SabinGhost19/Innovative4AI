import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { DetailedCensusData } from '../schemas';
import { 
  selectEventMonteCarlo, 
  type EventTemplate,
  EVENT_TEMPLATES 
} from './event-templates';

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
 * 
 * ENHANCED with Monte Carlo Event Selection:
 * - Pre-defined event templates with realistic probabilities
 * - Seasonal multipliers (winter storms, summer tourism)
 * - Demographic filters (income, education, population)
 * - Business type relevance weighting
 */
export async function generateBusinessEvent(
  businessType: string,
  location: { address: string; neighborhood: string; lat: number; lng: number; county: string },
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
  const medianIncome = getValue('B19013_001E') || 0;
  const bachelorsDegree = getValue('B15003_022E') || 0;
  const mastersDegree = getValue('B15003_023E') || 0;
  const phdDegree = getValue('B15003_025E') || 0;
  const totalEducation = getValue('B15003_001E') || 1;

  // Calculez metrici derivate
  const educationRate = ((bachelorsDegree + mastersDegree + phdDegree) / totalEducation) * 100;
  
  // Map county to borough
  const borough = mapCountyToBorough(location.county);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MONTE CARLO EVENT SELECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const selectedEvent = selectEventMonteCarlo(
    currentMonth,
    businessType,
    {
      medianIncome,
      educationRate,
      population: totalPopulation,
    },
    borough
  );
  
  // If Monte Carlo selects no event (low probability month), return neutral event
  if (!selectedEvent) {
    return {
      nume_eveniment: 'No Major Events',
      impact_clienti_lunar: 0,
      relevanta_pentru_business: true,
      descriere_scurta: 'Month proceeds normally without significant external events',
    };
  }
  
  // Convert event template to BusinessEvent format
  const customerImpactPercent = ((selectedEvent.customerTrafficMultiplier - 1) * 100);
  
  return {
    nume_eveniment: selectedEvent.name,
    impact_clienti_lunar: Math.round(customerImpactPercent),
    relevanta_pentru_business: true,
    descriere_scurta: selectedEvent.description,
  };
}

/**
 * Helper: Map county to borough
 */
function mapCountyToBorough(county: string): 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island' {
  const countyLower = county.toLowerCase();
  
  if (countyLower.includes('new york') || countyLower.includes('manhattan')) return 'Manhattan';
  if (countyLower.includes('kings') || countyLower.includes('brooklyn')) return 'Brooklyn';
  if (countyLower.includes('queens')) return 'Queens';
  if (countyLower.includes('bronx')) return 'Bronx';
  if (countyLower.includes('richmond') || countyLower.includes('staten')) return 'Staten Island';
  
  return 'Brooklyn'; // Default
}
