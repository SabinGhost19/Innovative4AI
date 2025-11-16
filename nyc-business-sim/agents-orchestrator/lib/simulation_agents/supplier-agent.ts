/**
 * Supplier Agent
 * 
 * Analyzes supplier availability, costs, and pricing volatility.
 * Calculates monthly inventory and supply costs based on business type.
 * 
 * Model: gpt-4o-mini (fast decisions)
 * Output: SupplierAnalysisSchema (structured)
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { DetailedCensusData } from '../../core/types';
import { SupplierAnalysisSchema } from '../../core/schemas';
import { LLM_CONFIG, calculateMonthlyRent } from '../../core/constants';

/**
 * Analyze supplier dynamics and estimate costs
 */
export async function analyzeSupplierDynamics(
  businessType: string,
  location: { address: string; neighborhood: string; county: string },
  censusData: DetailedCensusData,
  currentRevenue: number, // For calculating percentages
  currentMonth: number,
  currentYear: number
): Promise<z.infer<typeof SupplierAnalysisSchema>> {
  
  const monthlyRent = calculateMonthlyRent(businessType, location.county);
  
  // Estimate utilities as 3-5% of rent
  const estimatedUtilities = monthlyRent * 0.04;
  
  // Estimate inventory/supplies as % of revenue based on business type
  const inventoryPercentage = getInventoryPercentage(businessType);
  const estimatedInventory = currentRevenue * inventoryPercentage;
  
  const systemPrompt = `You are a supply chain expert for NYC small businesses.
Your role is to analyze supplier markets and estimate operating costs.

IMPORTANT:
- NYC has different supply dynamics than other markets (higher costs, more options)
- Seasonality affects both prices and availability
- Be realistic about supplier reliability in urban environments
- Cost estimates should reflect current market conditions`;

  const userPrompt = `Analyze supplier dynamics for this business:

🏢 BUSINESS:
- Type: ${businessType}
- Location: ${location.neighborhood}, ${location.county}
- Current Monthly Revenue: $${currentRevenue.toLocaleString()}

💰 ESTIMATED BASELINE COSTS:
- Monthly Rent: $${monthlyRent.toLocaleString()}
- Utilities (estimated): $${estimatedUtilities.toLocaleString()}
- Inventory/Supplies (${(inventoryPercentage * 100).toFixed(0)}% of revenue): $${estimatedInventory.toLocaleString()}

📊 AREA CONTEXT (Census Data):
- Median Income: $${censusData.demographics_detailed.B19013_001E?.value || 'N/A'}
- Work from Home Rate: ${(censusData.derived_statistics.work_from_home_rate * 100).toFixed(1)}%
- Renter Rate: ${(censusData.derived_statistics.renter_rate * 100).toFixed(1)}%

📅 TEMPORAL:
- Month: ${currentMonth}/12 (${getSeasonName(currentMonth)})
- Year: ${currentYear}

ANALYZE:
1. Supplier Availability: How easy is it to source supplies in NYC for this business?
2. Monthly Costs: Refine the estimates above based on your expertise
3. Price Volatility: How stable are supplier prices?
4. Supplier Reliability: Typical NYC supplier reliability score (0-100)
5. Cost Optimization Tips: 3 specific tips for reducing costs
6. Seasonal Adjustments: Should costs change this month? By how much?

Use the baseline estimates as starting points but adjust based on business type and location.`;

  const result = await generateObject({
    model: openai(LLM_CONFIG.FAST_MODEL),
    schema: SupplierAnalysisSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: LLM_CONFIG.DETERMINISTIC,
  });

  return result.object;
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
