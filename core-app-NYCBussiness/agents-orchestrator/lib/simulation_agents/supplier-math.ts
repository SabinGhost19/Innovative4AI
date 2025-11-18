/**
 * Supplier Agent Mathematical Models
 * 
 * Pure mathematical functions for supplier costs, utilities, COGS, and volume discounts.
 * NO LLM CALLS - deterministic calculations only.
 * 
 * Key Models:
 * - Dynamic Utilities: Seasonal NYC utility rates ($2-4/sqft/year)
 * - Volume-based COGS: Economies of scale (1% discount per $10k revenue)
 * - Energy Consumption: Business type specific models
 * - Seasonal Adjustments: Winter heating, summer cooling
 * 
 * Sources:
 * - NYC ConEd average rates 2022-2024
 * - Industry benchmarks for COGS by business type
 * - NREL commercial building energy consumption data
 */

/**
 * NYC Borough type
 */
type Borough = 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island';

/**
 * Business type categories for energy modeling
 */
type BusinessType = string; // coffee_shop, restaurant, retail_store, etc.

/**
 * Calculate dynamic monthly utilities cost
 * 
 * Based on:
 * - Square footage
 * - Season (winter heating, summer cooling)
 * - Borough (Manhattan higher rates)
 * - Business type (food service higher than retail)
 * 
 * NYC Commercial Electricity: $0.15-0.25/kWh (2024)
 * NYC Commercial Gas: $1.20-1.80/therm (2024)
 * Annual range: $2-4/sqft/year → $0.17-0.33/sqft/month
 * 
 * @param sqft - Square footage of business
 * @param month - Month of year (1-12)
 * @param borough - NYC borough
 * @param businessType - Type of business
 * @returns Monthly utility cost in dollars
 */
export function calculateDynamicUtilities(
  sqft: number,
  month: number,
  borough: Borough,
  businessType: BusinessType
): number {
  // Base rate: $0.25/sqft/month (mid-range)
  let baseRate = 0.25;
  
  // Borough adjustment
  if (borough === 'Manhattan') {
    baseRate *= 1.15; // 15% higher in Manhattan
  } else if (borough === 'Staten Island') {
    baseRate *= 0.90; // 10% lower in Staten Island
  }
  
  // Business type multiplier (energy intensity)
  const typeMultiplier = getEnergyIntensityMultiplier(businessType);
  baseRate *= typeMultiplier;
  
  // Seasonal adjustment (sinusoidal wave peaking in Jan/Jul)
  // Winter heating (Dec-Feb): +30%
  // Summer cooling (Jun-Aug): +25%
  // Spring/Fall (Mar-May, Sep-Nov): baseline
  const seasonalFactor = getSeasonalEnergyFactor(month);
  
  const monthlyUtilities = sqft * baseRate * seasonalFactor;
  
  return Math.round(monthlyUtilities * 100) / 100; // Round to cents
}

/**
 * Get energy intensity multiplier by business type
 * 
 * Based on NREL commercial building benchmarks:
 * - Restaurants: High (cooking, refrigeration) = 1.5x
 * - Coffee shops: Medium-High (espresso machines, refrigeration) = 1.3x
 * - Bars: Medium-High (refrigeration, lighting) = 1.3x
 * - Retail: Baseline (lighting, HVAC) = 1.0x
 * - Gyms: High (equipment, showers) = 1.4x
 * - Salons: Medium (equipment, water heating) = 1.2x
 * - Professional services: Low (computers only) = 0.8x
 * 
 * @param businessType - Type of business
 * @returns Energy intensity multiplier
 */
function getEnergyIntensityMultiplier(businessType: string): number {
  const type = businessType.toLowerCase();
  
  if (type.includes('restaurant') || type.includes('food')) return 1.5;
  if (type.includes('coffee') || type.includes('cafe')) return 1.3;
  if (type.includes('bar') || type.includes('nightclub')) return 1.3;
  if (type.includes('gym') || type.includes('fitness')) return 1.4;
  if (type.includes('salon') || type.includes('spa') || type.includes('barber')) return 1.2;
  if (type.includes('office') || type.includes('consulting') || type.includes('professional')) return 0.8;
  
  return 1.0; // Default for retail
}

/**
 * Calculate seasonal energy factor
 * 
 * NYC Energy Usage Pattern:
 * - Peak Winter (Jan): 1.30 (heating)
 * - Peak Summer (Jul): 1.25 (cooling)
 * - Shoulder Seasons: 1.0 (mild weather)
 * 
 * Uses sinusoidal approximation:
 * Winter wave: cos(2π(month-1)/12) peaks at Jan
 * Summer wave: cos(2π(month-7)/12) peaks at Jul
 * 
 * @param month - Month of year (1-12)
 * @returns Seasonal factor (0.95-1.30)
 */
function getSeasonalEnergyFactor(month: number): number {
  // Winter heating component (peaks in January)
  const winterWave = 0.15 * Math.cos((2 * Math.PI * (month - 1)) / 12);
  
  // Summer cooling component (peaks in July)
  const summerWave = 0.125 * Math.cos((2 * Math.PI * (month - 7)) / 12);
  
  // Base factor + seasonal adjustments
  const factor = 1.0 + Math.max(winterWave, summerWave);
  
  return Math.max(0.95, Math.min(1.30, factor)); // Clamp to realistic range
}

/**
 * Calculate volume-based COGS with economies of scale
 * 
 * Larger businesses negotiate better supplier rates.
 * Industry standard: ~1% discount per $10k monthly revenue
 * Caps at 15% total discount (around $150k/month revenue)
 * 
 * Formula: COGS = baseRate × (1 - discount)
 * Where discount = min(0.15, revenue/10000 × 0.01)
 * 
 * Example:
 * - $5k revenue: 0.5% discount → 39.5% COGS if base is 40%
 * - $50k revenue: 5% discount → 38% COGS
 * - $150k+ revenue: 15% discount (cap) → 34% COGS
 * 
 * @param baseRate - Base COGS rate (e.g., 0.40 for 40%)
 * @param monthlyRevenue - Monthly revenue in dollars
 * @returns Adjusted COGS rate
 */
export function calculateVolumeCOGS(
  baseRate: number,
  monthlyRevenue: number
): number {
  // Calculate discount percentage (1% per $10k revenue)
  const discountRate = Math.min(0.15, (monthlyRevenue / 10000) * 0.01);
  
  // Apply discount to base rate
  const adjustedRate = baseRate * (1 - discountRate);
  
  return Math.round(adjustedRate * 10000) / 10000; // Round to 4 decimal places
}

/**
 * Get base COGS rate by business type
 * 
 * Industry standard COGS percentages:
 * - Restaurants: 28-35% (food cost)
 * - Coffee shops: 20-25% (beverages have high margins)
 * - Bars/Nightclubs: 18-24% (alcohol high margin)
 * - Retail clothing: 40-50% (merchandise)
 * - Retail grocery: 65-75% (low margin, high volume)
 * - Gyms: 10-15% (mostly labor/rent)
 * - Salons: 15-25% (supplies)
 * - Professional services: 5-15% (mostly labor)
 * 
 * Source: Industry benchmarks 2024
 * 
 * @param businessType - Type of business
 * @returns Base COGS rate (0.0-1.0)
 */
export function getBaseCOGSRate(businessType: string): number {
  const type = businessType.toLowerCase();
  
  // Food & Beverage
  if (type.includes('restaurant') || type.includes('food')) return 0.32; // 32% midpoint
  if (type.includes('coffee') || type.includes('cafe')) return 0.23; // 23% midpoint
  if (type.includes('bar') || type.includes('nightclub')) return 0.21; // 21% midpoint
  
  // Retail
  if (type.includes('clothing') || type.includes('apparel') || type.includes('fashion')) return 0.45;
  if (type.includes('grocery') || type.includes('convenience')) return 0.70;
  if (type.includes('retail') || type.includes('store')) return 0.40; // Generic retail
  
  // Services
  if (type.includes('gym') || type.includes('fitness')) return 0.13;
  if (type.includes('salon') || type.includes('spa') || type.includes('barber')) return 0.20;
  if (type.includes('consulting') || type.includes('professional') || type.includes('office')) return 0.10;
  
  return 0.35; // Default conservative estimate
}

/**
 * Estimate monthly energy consumption in kWh
 * 
 * Based on EIA commercial building energy consumption:
 * - Average: 14 kWh/sqft/year → 1.17 kWh/sqft/month
 * - Restaurants: 38 kWh/sqft/year → 3.17 kWh/sqft/month
 * - Retail: 11 kWh/sqft/year → 0.92 kWh/sqft/month
 * - Office: 15 kWh/sqft/year → 1.25 kWh/sqft/month
 * 
 * Adjusted by seasonal factor.
 * 
 * @param sqft - Square footage
 * @param businessType - Type of business
 * @param month - Month of year (1-12)
 * @returns Monthly energy consumption in kWh
 */
export function estimateEnergyConsumption(
  sqft: number,
  businessType: string,
  month: number
): number {
  // Get base consumption rate (kWh/sqft/month)
  let baseRate = 1.17; // Average commercial
  
  const type = businessType.toLowerCase();
  if (type.includes('restaurant') || type.includes('food')) {
    baseRate = 3.17;
  } else if (type.includes('coffee') || type.includes('cafe')) {
    baseRate = 2.5;
  } else if (type.includes('retail') || type.includes('store')) {
    baseRate = 0.92;
  } else if (type.includes('office') || type.includes('consulting')) {
    baseRate = 1.25;
  } else if (type.includes('gym') || type.includes('fitness')) {
    baseRate = 2.8;
  }
  
  // Apply seasonal factor
  const seasonalFactor = getSeasonalEnergyFactor(month);
  
  const monthlyKWh = sqft * baseRate * seasonalFactor;
  
  return Math.round(monthlyKWh);
}

/**
 * Calculate supplier relationship discount
 * 
 * Long-term supplier relationships earn trust discounts:
 * - Months 1-3: 0% (new relationship)
 * - Months 4-12: 0.5% (building trust)
 * - Months 13-24: 1.5% (established)
 * - Months 25+: 2.5% (loyal customer)
 * 
 * This is SEPARATE from volume discounts.
 * 
 * @param monthsInBusiness - Number of months business has been operating
 * @returns Relationship discount rate (0.0-0.025)
 */
export function calculateRelationshipDiscount(monthsInBusiness: number): number {
  if (monthsInBusiness < 4) return 0.0;
  if (monthsInBusiness < 13) return 0.005; // 0.5%
  if (monthsInBusiness < 25) return 0.015; // 1.5%
  return 0.025; // 2.5%
}

/**
 * Calculate total COGS with all adjustments
 * 
 * Combines:
 * - Base COGS rate (by business type)
 * - Volume discount (economies of scale)
 * - Relationship discount (supplier loyalty)
 * 
 * @param businessType - Type of business
 * @param monthlyRevenue - Monthly revenue
 * @param monthsInBusiness - Months operating
 * @returns Final COGS rate (0.0-1.0)
 */
export function calculateTotalCOGS(
  businessType: string,
  monthlyRevenue: number,
  monthsInBusiness: number
): number {
  const baseRate = getBaseCOGSRate(businessType);
  const volumeAdjusted = calculateVolumeCOGS(baseRate, monthlyRevenue);
  const relationshipDiscount = calculateRelationshipDiscount(monthsInBusiness);
  
  const finalRate = volumeAdjusted * (1 - relationshipDiscount);
  
  return Math.round(finalRate * 10000) / 10000;
}
