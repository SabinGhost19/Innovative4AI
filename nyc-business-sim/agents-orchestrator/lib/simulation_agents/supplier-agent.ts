/**
 * Supplier Agent
 * 
 * Analyzes supplier availability, costs, and pricing volatility.
 * Calculates monthly inventory and supply costs based on business type.
 * 
 * ENHANCED with Mathematical Models:
 * - Dynamic utility costs (seasonal + borough adjusted)
 * - Volume-based COGS discounts (economies of scale)
 * - Energy consumption by business type
 * - Supplier relationship pricing multipliers
 * 
 * Model: gpt-4o-mini (fast decisions) + Pure Math
 * Output: SupplierAnalysisSchema (structured)
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { DetailedCensusData } from '../../core/types';
import { SupplierAnalysisSchema } from '../../core/schemas';
import { LLM_CONFIG, calculateMonthlyRent } from '../../core/constants';
import {
  calculateDynamicUtilities,
  calculateVolumeCOGS,
  getBaseCOGSRate,
  estimateEnergyConsumption,
  calculateRelationshipDiscount,
  calculateTotalCOGS,
} from './supplier-math';

/**
 * Analyze supplier dynamics and estimate costs
 */
export async function analyzeSupplierDynamics(
  businessType: string,
  location: { address: string; neighborhood: string; county: string; sqft?: number },
  censusData: DetailedCensusData,
  currentRevenue: number,
  currentMonth: number,
  currentYear: number,
  monthsInBusiness: number = 1
): Promise<z.infer<typeof SupplierAnalysisSchema>> {
  
  const monthlyRent = calculateMonthlyRent(businessType, location.county);
  const sqft = location.sqft || estimateSqFt(businessType); // Use provided or estimate
  const borough = mapCountyToBorough(location.county);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MATHEMATICAL CALCULATIONS (NO LLM)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Dynamic utilities (seasonal + borough adjusted)
  const utilities = calculateDynamicUtilities(sqft, currentMonth, borough, businessType);
  
  // Energy consumption and cost
  const energyKwh = estimateEnergyConsumption(sqft, businessType, currentMonth);
  
  // Base COGS rate by business type
  const baseCOGSPercent = getBaseCOGSRate(businessType);
  
  // Apply volume discount (economies of scale)
  const effectiveCOGSPercent = calculateVolumeCOGS(baseCOGSPercent, currentRevenue);
  
  // Calculate final COGS rate with relationship discount
  const finalCOGSRate = calculateTotalCOGS(businessType, currentRevenue, monthsInBusiness);
  
  // Calculate actual COGS in dollars
  const totalCOGS = currentRevenue * finalCOGSRate;
  
  // Calculate relationship discount for display
  const relationshipDiscount = calculateRelationshipDiscount(monthsInBusiness);
  
  // Total supplier costs
  const totalSupplierCosts = totalCOGS + utilities;
  const costPercent = (totalSupplierCosts / currentRevenue) * 100;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MATHEMATICAL SUMMARY FOR LLM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const mathSummary = `
MATHEMATICAL CALCULATIONS COMPLETED:
- Square Footage: ${sqft} sqft
- Monthly Utilities: $${utilities.toFixed(2)} (seasonal adjusted for ${getSeasonName(currentMonth)})
- Energy Consumption: ${energyKwh} kWh
- Base COGS Rate: ${baseCOGSPercent.toFixed(1)}%
- Volume Discount Applied: ${((baseCOGSPercent - effectiveCOGSPercent)).toFixed(2)}%
- Effective COGS: ${effectiveCOGSPercent.toFixed(1)}%
- Relationship Discount: ${((1 - relationshipDiscount) * 100).toFixed(1)}% (${monthsInBusiness} months in business)
- Total COGS: $${totalCOGS.toFixed(2)}
- Total Supplier Costs: $${totalSupplierCosts.toFixed(2)} (${costPercent.toFixed(1)}% of revenue)
`;
  
  const systemPrompt = `You are a supply chain expert for NYC small businesses.
Your role is to USE THE MATHEMATICAL CALCULATIONS PROVIDED and add supplier relationship insights.

CRITICAL: The costs are ALREADY CALCULATED using:
- Dynamic utility formulas (seasonal + borough)
- Volume-based COGS discounts (economies of scale)
- Supplier relationship multipliers
- Energy consumption models

Your job is to:
1. Rate supplier availability (1-5)
2. Rate price volatility (low/medium/high)
3. Rate supplier reliability (1-100)
4. Provide 3 cost optimization tips

DO NOT recalculate costs - use the provided numbers.`;

  const userPrompt = `Analyze supplier dynamics for this business:

🏢 BUSINESS:
- Type: ${businessType}
- Location: ${location.neighborhood}, ${location.county}
- Current Monthly Revenue: $${currentRevenue.toLocaleString()}
- Months in Business: ${monthsInBusiness}

${mathSummary}

📊 AREA CONTEXT (Census Data):
- Median Income: $${censusData.demographics_detailed.B19013_001E?.value || 'N/A'}
- Work from Home Rate: ${(censusData.derived_statistics.work_from_home_rate * 100).toFixed(1)}%
- Renter Rate: ${(censusData.derived_statistics.renter_rate * 100).toFixed(1)}%

📅 TEMPORAL:
- Month: ${currentMonth}/12 (${getSeasonName(currentMonth)})
- Year: ${currentYear}

PROVIDE SUPPLIER INTELLIGENCE:

1. **Supplier Availability**: abundant/adequate/limited/scarce
2. **Price Volatility**: low/medium/high
3. **Supplier Reliability** (0-100): Typical delivery/quality reliability
4. **Cost Optimization Tips**: 3 specific, actionable tips

IMPORTANT: Costs are pre-calculated. Focus on qualitative insights.`;

  // Partial schema for LLM - only qualitative fields
  const PartialSupplierSchema = z.object({
    supplier_availability: z.enum(['abundant', 'adequate', 'limited', 'scarce']),
    price_volatility: z.enum(['low', 'medium', 'high']),
    supplier_reliability: z.number().min(0).max(100),
    cost_optimization_tips: z.array(z.string()).max(3),
  });

  const result = await generateObject({
    model: openai(LLM_CONFIG.FAST_MODEL),
    schema: PartialSupplierSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: LLM_CONFIG.DETERMINISTIC,
  });

  // Determine seasonal adjustments
  const isSeasonalMonth = currentMonth === 12 || currentMonth === 1 || currentMonth === 2 || 
                          currentMonth === 6 || currentMonth === 7 || currentMonth === 8;
  const seasonalPercentage = isSeasonalMonth ? 
    (currentMonth >= 6 && currentMonth <= 8 ? 25 : 20) : 0;
  
  // Combine LLM outputs with EXACT mathematical calculations
  return {
    supplier_availability: result.object.supplier_availability,
    estimated_monthly_costs: {
      inventory: totalCOGS,
      supplies: totalCOGS * 0.02, // 2% supplier fees
      utilities: utilities,
      total: totalSupplierCosts,
    },
    price_volatility: result.object.price_volatility,
    supplier_reliability: result.object.supplier_reliability,
    cost_optimization_tips: result.object.cost_optimization_tips,
    seasonal_adjustments: {
      expected: isSeasonalMonth,
      percentage: seasonalPercentage,
      reasoning: isSeasonalMonth ? 
        (currentMonth >= 6 && currentMonth <= 8 ? 
          'Summer peak cooling costs increase utilities 20-30%' : 
          'Winter heating costs increase utilities 15-25%') :
        'No significant seasonal cost variations expected this month',
    },
  };
}

/**
 * Helper: Estimate square footage if not provided
 */
function estimateSqFt(businessType: string): number {
  const type = businessType.toLowerCase();
  
  if (type.includes('restaurant')) return 1200;
  if (type.includes('coffee') || type.includes('cafe')) return 800;
  if (type.includes('retail') || type.includes('shop')) return 1000;
  if (type.includes('bodega')) return 600;
  if (type.includes('bakery')) return 900;
  if (type.includes('bar')) return 1500;
  
  return 1000; // Default
}

/**
 * Helper: Map NYC county to borough
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

/**
 * Helper: Get inventory/COGS percentage for business type
 */
function getInventoryPercentage(businessType: string): number {
  const type = businessType.toLowerCase();
  
  if (type.includes('restaurant') || type.includes('food')) {
    return 0.32; // 32% COGS for restaurants
  } else if (type.includes('coffee') || type.includes('cafe')) {
    return 0.35; // 35% COGS for coffee shops
  } else if (type.includes('retail') || type.includes('shop')) {
    return 0.50; // 50% COGS for retail
  } else if (type.includes('service') || type.includes('salon') || type.includes('gym')) {
    return 0.15; // 15% COGS for services (mostly supplies)
  }
  
  return 0.30; // Default 30%
}

/**
 * Helper: Get season name
 */
function getSeasonName(month: number): string {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}
