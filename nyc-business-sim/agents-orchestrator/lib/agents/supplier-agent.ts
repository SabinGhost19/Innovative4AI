import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, CoreMessage } from 'ai';
import { 
  SupplierAnalysisSchema,
  type CensusData, 
  type DetailedCensusData,
  type SupplierAnalysis 
} from '../schemas';

/**
 * 🏭 SUPPLIER AGENT - Hybrid Deterministic + AI
 * 
 * LOGICĂ:
 * - 70% Deterministic: Calcule matematice bazate pe Census data
 * - 30% AI: Context awareness, variație realistă, sezonalitate
 * 
 * INPUT:
 * - Income per capita → Determină supplier tier (budget/mid/premium)
 * - Median rent → Influențează operating costs
 * - Home values → Market premium indicator
 * - Demographics → Quality expectations
 * 
 * OUTPUT:
 * - Supplier tier recommendation
 * - Cost estimates per category (F&B, Retail, Services)
 * - Quality score expectations
 * - Reliability assessment
 * - Seasonal variations
 */

export async function runSupplierAgent(
  location: { address: string; neighborhood: string; lat: number; lng: number },
  census_data: CensusData,
  detailed_data: DetailedCensusData,
  business_type?: string
) {
  const demo = census_data.demographics;
  const detail_demo = detailed_data.demographics_detailed;
  const stats = detailed_data.derived_statistics;
  const fips = detailed_data.fips_codes;

  // ============================================
  // STEP 1: DETERMINISTIC CALCULATIONS (70%)
  // ============================================

  const getValue = (key: string): number | null => {
    const item = detail_demo[key];
    if (!item) return null;
    const val = item.value;
    if (val === null || val === 'N/A') return null;
    return typeof val === 'number' ? val : parseFloat(val as string);
  };

  // Extract key economic indicators
  const incomePerCapita = getValue('B19301_001E') || 35000; // Default NYC average
  const medianRent = getValue('B25031_001E') || 2000;
  const medianHomeValue = getValue('B25077_001E') || 500000;
  const totalPopulation = getValue('B01003_001E') || 1000;
  const bachelorRate = stats.bachelor_plus_rate || 0.3;
  const povertyRate = stats.poverty_rate || 0.15;

  // ============================================
  // DETERMINISTIC TIER CALCULATION
  // ============================================
  
  let supplierTier: 'budget' | 'mid-range' | 'premium';
  let tierScore = 0;

  // Income scoring (40% weight)
  if (incomePerCapita > 60000) tierScore += 40;
  else if (incomePerCapita > 45000) tierScore += 25;
  else tierScore += 10;

  // Real estate scoring (30% weight)
  if (medianHomeValue > 800000) tierScore += 30;
  else if (medianHomeValue > 500000) tierScore += 20;
  else tierScore += 10;

  // Education scoring (20% weight)
  if (bachelorRate > 0.5) tierScore += 20;
  else if (bachelorRate > 0.3) tierScore += 12;
  else tierScore += 5;

  // Poverty inverse scoring (10% weight)
  if (povertyRate < 0.1) tierScore += 10;
  else if (povertyRate < 0.2) tierScore += 6;
  else tierScore += 2;

  // Determine tier from score
  if (tierScore >= 75) supplierTier = 'premium';
  else if (tierScore >= 45) supplierTier = 'mid-range';
  else supplierTier = 'budget';

  // ============================================
  // DETERMINISTIC COST CALCULATIONS
  // ============================================

  // Base costs multipliers per tier
  const tierMultipliers = {
    'budget': { base: 1.0, quality: 60 },
    'mid-range': { base: 1.5, quality: 75 },
    'premium': { base: 2.2, quality: 90 }
  };

  const multiplier = tierMultipliers[supplierTier];

  // NYC base costs (monthly per unit/service)
  const baseCosts = {
    food_and_beverage: {
      budget: 3.50,
      'mid-range': 5.50,
      premium: 8.50
    },
    retail_goods: {
      budget: 25,
      'mid-range': 45,
      premium: 75
    },
    services: {
      budget: 15,
      'mid-range': 30,
      premium: 55
    }
  };

  // Real estate cost factor (rent influences supplier costs)
  const rentFactor = Math.max(0.8, Math.min(1.3, medianRent / 2500));

  // ============================================
  // STEP 2: AI CONTEXT ENHANCEMENT (30%)
  // ============================================

  const systemMessage: CoreMessage = {
    role: 'system',
    content: `You are a NYC supply chain and vendor analysis expert.

Your task is to REFINE the deterministic supplier analysis with:
1. Seasonal cost variations (winter heating, summer produce, holiday premium)
2. Competition impact on supplier pricing
3. Reliability concerns (delivery in NYC, vendor quality issues)
4. Local market dynamics (Chinatown vs Financial District vs Brooklyn)

You will receive pre-calculated costs and tiers. Add CONTEXTUAL INSIGHTS only.
Do NOT override the deterministic calculations - ENHANCE them with realistic variations.`
  };

  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentSeason = currentMonth >= 11 || currentMonth <= 2 ? 'winter' : 
                       currentMonth >= 6 && currentMonth <= 8 ? 'summer' : 'moderate';

  const userPrompt = `LOCATION ANALYZED:
- Address: ${location.address}
- Neighborhood: ${location.neighborhood}
- Census Tract: ${fips.tract}, Block: ${fips.block}

ECONOMIC PROFILE (DETERMINISTIC):
- Income per Capita: $${incomePerCapita.toLocaleString()}
- Median Rent: $${medianRent.toLocaleString()}/month
- Median Home Value: $${medianHomeValue.toLocaleString()}
- Population: ${totalPopulation.toLocaleString()}
- Bachelor+ Rate: ${(bachelorRate * 100).toFixed(1)}%
- Poverty Rate: ${(povertyRate * 100).toFixed(1)}%

PRE-CALCULATED SUPPLIER ANALYSIS:
- Recommended Tier: ${supplierTier.toUpperCase()}
- Tier Score: ${tierScore}/100
- Base Quality Score: ${multiplier.quality}
- Rent Factor: ${rentFactor.toFixed(2)}x

COST ESTIMATES (per unit, adjusted for NYC):
Food & Beverage:
  - Budget: $${(baseCosts.food_and_beverage.budget * rentFactor).toFixed(2)}
  - Mid-Range: $${(baseCosts.food_and_beverage['mid-range'] * rentFactor).toFixed(2)}
  - Premium: $${(baseCosts.food_and_beverage.premium * rentFactor).toFixed(2)}

Retail Goods (wholesale):
  - Budget: $${(baseCosts.retail_goods.budget * rentFactor).toFixed(2)}
  - Mid-Range: $${(baseCosts.retail_goods['mid-range'] * rentFactor).toFixed(2)}
  - Premium: $${(baseCosts.retail_goods.premium * rentFactor).toFixed(2)}

Services (per hour):
  - Budget: $${(baseCosts.services.budget * rentFactor).toFixed(2)}
  - Mid-Range: $${(baseCosts.services['mid-range'] * rentFactor).toFixed(2)}
  - Premium: $${(baseCosts.services.premium * rentFactor).toFixed(2)}

CURRENT CONTEXT:
- Season: ${currentSeason}
- Month: ${currentMonth}
- Business Type Context: ${business_type || 'General retail/service'}

YOUR TASK:
1. Apply seasonal cost modifiers (5-20% variation realistic for NYC)
2. Assess reliability concerns (delivery issues, vendor consistency)
3. Identify local supplier advantages/disadvantages
4. Provide 2-3 specific supplier recommendations for this tier + location
5. Note any competition-driven pricing pressures

Keep reasoning DATA-DRIVEN citing the Census metrics above.`;

  // ============================================
  // STEP 3: AI GENERATION WITH RETRY LOGIC
  // ============================================

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Supplier Agent attempt ${attempt}/${maxRetries}...`);

      const result = await generateObject({
        model: anthropic('claude-3-5-haiku-20241022'),
        messages: [systemMessage, { role: 'user', content: userPrompt }],
        schema: SupplierAnalysisSchema,
        temperature: 0.4, // Low temp for consistency
      });

      // Validate result
      const validatedObject = SupplierAnalysisSchema.parse(result.object);

      // ============================================
      // STEP 4: MERGE DETERMINISTIC + AI
      // ============================================
      
      // Override/ensure deterministic values are preserved
      const finalResult: SupplierAnalysis = {
        ...validatedObject,
        recommended_tier: supplierTier, // Force deterministic tier
        tier_confidence_score: tierScore,
        base_quality_score: multiplier.quality,
        // Validate AI didn't go crazy with costs
        cost_estimates: {
          food_and_beverage: {
            budget: Math.max(3, Math.min(15, validatedObject.cost_estimates.food_and_beverage.budget)),
            'mid-range': Math.max(5, Math.min(20, validatedObject.cost_estimates.food_and_beverage['mid-range'])),
            premium: Math.max(8, Math.min(30, validatedObject.cost_estimates.food_and_beverage.premium)),
          },
          retail_goods: {
            budget: Math.max(20, Math.min(50, validatedObject.cost_estimates.retail_goods.budget)),
            'mid-range': Math.max(40, Math.min(80, validatedObject.cost_estimates.retail_goods['mid-range'])),
            premium: Math.max(70, Math.min(150, validatedObject.cost_estimates.retail_goods.premium)),
          },
          services: {
            budget: Math.max(12, Math.min(30, validatedObject.cost_estimates.services.budget)),
            'mid-range': Math.max(25, Math.min(50, validatedObject.cost_estimates.services['mid-range'])),
            premium: Math.max(50, Math.min(100, validatedObject.cost_estimates.services.premium)),
          },
        },
      };

      console.log('✅ Supplier Agent SUCCESS');
      console.log(`   Tier: ${finalResult.recommended_tier} (Score: ${tierScore})`);
      console.log(`   Quality: ${finalResult.base_quality_score}/100`);
      console.log(`   Seasonal Modifier: ${finalResult.seasonal_cost_modifier}x`);

      return finalResult;

    } catch (error: any) {
      lastError = error;
      console.error(`❌ Supplier Agent attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        const waitTime = attempt * 1000;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('❌ All supplier agent attempts failed');
        throw new Error(`Supplier Agent failed after ${maxRetries} attempts: ${error.message}`);
      }
    }
  }

  throw lastError || new Error('Supplier Agent failed with unknown error');
}
