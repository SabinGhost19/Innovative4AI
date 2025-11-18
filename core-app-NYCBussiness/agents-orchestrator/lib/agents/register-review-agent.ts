import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, CoreMessage } from 'ai';
import { z } from 'zod';

/**
 * REGISTER REVIEW AGENT
 * 
 * Analizează rapid o locație selectată de utilizator și oferă o recomandare
 * dacă este potrivită pentru deschiderea unui business.
 * 
 * Datele analizate:
 * - Business Survival Rates (de la NY BDS)
 * - Census Demographics (ACS detailed data)
 * - Income distribution
 * - Education levels
 * - Location-specific risks
 */

// Schema pentru recomandarea agentului
const ReviewRecommendationSchema = z.object({
  recommendation: z.enum(['EXCELLENT', 'GOOD', 'MODERATE', 'RISKY', 'NOT_RECOMMENDED']).describe(
    'Nivelul de recomandare pentru deschiderea unui business în această locație'
  ),
  confidence: z.number().min(0).max(100).describe(
    'Nivelul de încredere în recomandare (0-100%)'
  ),
  summary: z.string().describe(
    'Rezumat scurt al recomandării (1-2 propoziții)'
  ),
  strengths: z.array(z.string()).describe(
    'Lista de puncte forte ale locației (3-5 elemente)'
  ),
  weaknesses: z.array(z.string()).describe(
    'Lista de puncte slabe ale locației (2-4 elemente)'
  ),
  survival_analysis: z.object({
    rate: z.number().describe('Rata de supraviețuire la 5 ani (%)'),
    industry: z.string().describe('Industria analizată'),
    risk_level: z.string().describe('Nivelul de risc (LOW/MEDIUM/HIGH)'),
    interpretation: z.string().describe('Interpretarea ratei de supraviețuire')
  }).describe('Analiza ratei de supraviețuire pentru industrie'),
  demographic_insights: z.object({
    income_match: z.string().describe('Cât de bine se potrivește venitul mediu cu business-ul'),
    education_level: z.string().describe('Nivelul de educație al zonei'),
    population_density: z.string().describe('Densitatea populației'),
    key_metric: z.string().describe('Cea mai importantă metrică demografică')
  }).describe('Insights demografice despre zonă'),
  actionable_advice: z.array(z.string()).describe(
    'Sfaturi acționabile pentru utilizator (3-4 recomandări concrete)'
  ),
  competitor_warning: z.string().optional().describe(
    'Avertisment despre competiție dacă este cazul'
  )
});

type ReviewRecommendation = z.infer<typeof ReviewRecommendationSchema>;

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  neighborhood?: string;
}

interface SurvivalData {
  county_name: string;
  industry: string;
  naics_code: string;
  survival_rate_5_year: number;
  firms_2017_start_pool: number;
  interpretation: string;
  risk_level?: string;
}

interface CensusData {
  area_name: string;
  demographics_detailed: Record<string, { value: any; label: string }>;
  derived_statistics: {
    poverty_rate: number;
    high_income_households_rate: number;
    bachelor_plus_rate: number;
    renter_rate: number;
    work_from_home_rate: number;
    high_income_count: number;
    bachelor_plus_count: number;
  };
  fips_codes: {
    state: string;
    county: string;
    tract: string;
    block: string;
    full_tract_id: string;
  };
}

/**
 * Agent principal care face analiza și recomandarea
 */
export async function runRegisterReviewAgent(
  location: LocationData,
  businessType: string,
  survivalData: SurvivalData | null,
  censusData: CensusData | null
): Promise<ReviewRecommendation> {
  
  // Construim promptul bazat pe datele disponibile
  const systemMessage: CoreMessage = {
    role: 'system',
    content: `You are an expert business location analyst for New York City.
Your role is to evaluate if a specific location is suitable for opening a new business.

You analyze:
1. Historical business survival rates for the industry
2. Demographic and income data from Census Bureau (ACS)
3. Location-specific opportunities and risks
4. Market demand indicators

You MUST provide:
- A clear recommendation (EXCELLENT/GOOD/MODERATE/RISKY/NOT_RECOMMENDED)
- Concrete arguments based on DATA, not assumptions
- Actionable advice for the entrepreneur
- Honest assessment of risks and opportunities

Be direct, data-driven, and helpful. This analysis impacts real business decisions.`
  };

  // Construim datele pentru prompt
  let userPrompt = `LOCATION ANALYSIS REQUEST:
📍 Location: ${location.address || `${location.lat}, ${location.lng}`}
🏘️ Neighborhood: ${location.neighborhood || 'N/A'}
🏢 Planned Business Type: ${businessType}

`;

  // Adăugăm datele de supraviețuire dacă există
  if (survivalData) {
    userPrompt += `═══════════════════════════════════════
📊 BUSINESS SURVIVAL DATA (NY BDS 2017-2022)
═══════════════════════════════════════
County: ${survivalData.county_name}
Industry: ${survivalData.industry}
NAICS Code: ${survivalData.naics_code}

🎯 5-YEAR SURVIVAL RATE: ${survivalData.survival_rate_5_year}%
Risk Level: ${survivalData.risk_level || 'N/A'}
Interpretation: ${survivalData.interpretation}

Starting Pool (2017): ${survivalData.firms_2017_start_pool} businesses
This means: ${survivalData.survival_rate_5_year}% of businesses in this industry survived 5 years in this county.

`;
  } else {
    userPrompt += `⚠️ Business survival data not available for this location/industry.
`;
  }

  // Adăugăm datele demografice dacă există
  if (censusData) {
    const stats = censusData.derived_statistics;
    const demo = censusData.demographics_detailed;
    
    const totalPop = demo['B01003_001E']?.value || 'N/A';
    const medianAge = demo['B01002_001E']?.value || 'N/A';
    const medianIncome = demo['B19013_001E']?.value || 'N/A';
    const perCapitaIncome = demo['B19301_001E']?.value || 'N/A';
    
    userPrompt += `═══════════════════════════════════════
👥 DEMOGRAPHIC DATA (Census ACS)
═══════════════════════════════════════
Area: ${censusData.area_name}
Census Tract: ${censusData.fips_codes.full_tract_id}

POPULATION:
- Total Residents: ${typeof totalPop === 'number' ? totalPop.toLocaleString() : totalPop}
- Median Age: ${medianAge} years

INCOME LEVELS:
- Median Household Income: $${typeof medianIncome === 'number' ? medianIncome.toLocaleString() : medianIncome}/year
- Per Capita Income: $${typeof perCapitaIncome === 'number' ? perCapitaIncome.toLocaleString() : perCapitaIncome}/year
- High Income Households ($75k+): ${stats.high_income_households_rate}% (${stats.high_income_count} households)
- Poverty Rate: ${stats.poverty_rate}%

EDUCATION:
- Bachelor's Degree or Higher: ${stats.bachelor_plus_rate}% (${stats.bachelor_plus_count} people)

HOUSING:
- Renter Rate: ${stats.renter_rate}%

WORK PATTERNS:
- Work From Home Rate: ${stats.work_from_home_rate}%

`;
  } else {
    userPrompt += `⚠️ Detailed census data not available for this exact location.
`;
  }

  userPrompt += `═══════════════════════════════════════
🎯 YOUR TASK
═══════════════════════════════════════

Based on the data above, provide a comprehensive analysis:

1. **Recommendation Level**: Is this location EXCELLENT, GOOD, MODERATE, RISKY, or NOT_RECOMMENDED?

2. **Strengths**: What are the TOP advantages of this location? (Focus on data-backed points)

3. **Weaknesses**: What are the main concerns or risks?

4. **Survival Analysis**: Interpret the survival rate data. What does it mean for a new business?

5. **Demographic Fit**: How well do the demographics match the business type?
   - Can residents afford this business?
   - Is there demand based on education/income levels?

6. **Actionable Advice**: What concrete steps should the entrepreneur take?
   - Should they proceed? With what precautions?
   - What should they focus on?
   - Any specific strategies for this location?

Be honest and data-driven. If the data shows high risk, say it clearly.
If the location is great, explain why with specific numbers.`;

  try {
    // Apelăm LLM-ul pentru generare
    const result = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'),
      schema: ReviewRecommendationSchema,
      messages: [systemMessage, { role: 'user', content: userPrompt }],
      temperature: 0.3, // Păstrăm temperatura scăzută pentru consistență
    });

    return result.object;
  } catch (error) {
    console.error('❌ Error in Register Review Agent:', error);
    
    // Fallback recommendation în caz de eroare
    return {
      recommendation: 'MODERATE',
      confidence: 50,
      summary: 'Nu am putut efectua o analiză completă din cauza unei erori tehnice. Vă recomandăm să cereți o analiză suplimentară.',
      strengths: ['Locație în New York City', 'Potențial de piață urban'],
      weaknesses: ['Analiza incompletă din cauza erorii tehnice', 'Date insuficiente pentru o recomandare precisă'],
      survival_analysis: {
        rate: survivalData?.survival_rate_5_year || 0,
        industry: survivalData?.industry || 'N/A',
        risk_level: 'UNKNOWN',
        interpretation: 'Date insuficiente'
      },
      demographic_insights: {
        income_match: 'Necunoscut',
        education_level: 'Necunoscut',
        population_density: 'Urbană',
        key_metric: 'Analiză incompletă'
      },
      actionable_advice: [
        'Solicitați o analiză detaliată suplimentară',
        'Consultați un expert local în afaceri',
        'Cercetați mai multe despre zona specifică'
      ]
    };
  }
}

/**
 * Helper function pentru a obține emoji bazat pe recomandare
 */
export function getRecommendationEmoji(recommendation: string): string {
  switch (recommendation) {
    case 'EXCELLENT': return '🌟';
    case 'GOOD': return '✅';
    case 'MODERATE': return '⚠️';
    case 'RISKY': return '⚠️';
    case 'NOT_RECOMMENDED': return '❌';
    default: return '❓';
  }
}

/**
 * Helper function pentru a obține culoare bazat pe recomandare
 */
export function getRecommendationColor(recommendation: string): string {
  switch (recommendation) {
    case 'EXCELLENT': return '#10b981'; // green
    case 'GOOD': return '#3b82f6'; // blue
    case 'MODERATE': return '#f59e0b'; // amber
    case 'RISKY': return '#ef4444'; // red
    case 'NOT_RECOMMENDED': return '#dc2626'; // dark red
    default: return '#6b7280'; // gray
  }
}
