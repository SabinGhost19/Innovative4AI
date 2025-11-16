/**
 * Customer Behavior Agent
 * 
 * Simulates customer acquisition, retention, churn, and spending patterns.
 * This is THE MOST IMPORTANT agent - it directly determines revenue.
 * 
 * ENHANCED with Mathematical Models:
 * - Bass Diffusion Model for acquisition
 * - Dynamic Market Penetration (income elasticity, density, seasonality)
 * - Scientific Churn Rate calculation
 * - Customer Lifetime Value (CLV)
 * 
 * Model: gpt-4o-mini (fast, data-driven decisions) + Pure Math
 * Output: CustomerBehaviorSchema (structured)
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { DetailedCensusData } from '../../core/types';
import { CustomerBehaviorSchema } from '../../core/schemas';
import { LLM_CONFIG } from '../../core/constants';
import {
  calculateDynamicMarketPenetration,
  calculateNewCustomersBassDiffusion,
  calculateChurnRate,
  calculateRetentionRate,
  calculateCustomerLifetimeValue,
  calculateCustomerLifespan,
  calculateSegmentDistribution
} from './customer-math';

/**
 * Simulate customer behavior for the month
 */
export async function simulateCustomerBehavior(
  businessType: string,
  location: { address: string; neighborhood: string; county: string },
  censusData: DetailedCensusData,
  marketContext: {
    economic_climate: string;
    industry_saturation: number;
    market_demand_score: number;
  },
  competitionData: {
    total_competitors: number;
    pricing_pressure: string;
    market_space: string;
  },
  eventsData: {
    impact_clienti_lunar: number;
    relevanta_pentru_business: boolean;
  },
  trendsData: {
    impact_score: number;
    market_momentum: string;
  },
  supplierData: {
    estimated_monthly_costs: { total: number };
  },
  employeeData: {
    total_employees: number;
    productivity_score: number;
    morale: number;
  },
  playerDecisions: {
    pricing_strategy: 'premium' | 'competitive' | 'discount';
    product_price_modifier?: number;  // NEW: Granular price control (0.7 - 1.5)
    marketing_spend: number;
    quality_level: 'basic' | 'standard' | 'premium';
    inventory_strategy?: 'minimal' | 'balanced' | 'abundant';
    working_hours_per_week?: number;
  },
  previousMonthCustomers: number, // Last month's active customers
  currentMonth: number,
  currentYear: number
): Promise<z.infer<typeof CustomerBehaviorSchema>> {
  
  const population = Number(censusData.demographics_detailed.B01001_001E?.value) || 10000;
  const medianIncome = Number(censusData.demographics_detailed.B19013_001E?.value) || 60000;
  const highIncomeRate = censusData.derived_statistics.high_income_households_rate;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MATHEMATICAL CALCULATIONS (NO LLM)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Calculate population density (rough estimate from tract area)
  // Average NYC census tract: ~4,000 people per sq mile
  const estimatedPopulationDensity = population * 10; // Rough multiplier for tract to sq mi
  
  // Competition intensity (0-1)
  const competitionIntensity = Math.min(1, competitionData.total_competitors / 50);
  
  // Dynamic Market Penetration with scientific formula
  const dynamicPenetration = calculateDynamicMarketPenetration(
    businessType,
    population,
    estimatedPopulationDensity,
    medianIncome,
    currentMonth,
    competitionIntensity
  );
  
  const totalPotentialCustomers = Math.round(population * dynamicPenetration);
  
  // Price positioning ratio - Use product_price_modifier if available, otherwise fallback to strategy
  const priceRatio = playerDecisions.product_price_modifier || {
    'premium': 1.25,      // 25% above market
    'competitive': 1.0,   // At market
    'discount': 0.85      // 15% below market
  }[playerDecisions.pricing_strategy];
  
  // Customer satisfaction score (based on quality and pricing)
  const qualityScore = {
    'basic': 60,
    'standard': 75,
    'premium': 90
  }[playerDecisions.quality_level];
  
  // Price satisfaction (inverse of premium)
  // If price is lower than market (< 1.0), satisfaction increases
  // If price is higher than market (> 1.0), satisfaction decreases
  const priceSatisfaction = 100 - Math.max(0, (priceRatio - 1) * 100);
  
  // Calculate transaction values (needed for multiple calculations)
  const avgTransactionValue = getAvgTransactionValue(businessType);
  const visitFrequency = getVisitFrequency(businessType);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SERVICE CAPACITY PENALTY (CRITICAL FOR SCALING!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Calculate customers per employee
  const customersPerEmployee = previousMonthCustomers / Math.max(1, employeeData.total_employees);
  
  // Industry-specific capacity thresholds
  const optimalCustomersPerEmployee: Record<string, number> = {
    'coffee': 80,      // Coffee shops can handle ~80 customers/employee/month
    'cafe': 80,
    'restaurant': 60,  // Restaurants: ~60 customers/employee
    'gym': 100,        // Gyms: ~100 members/employee
    'fitness': 100,
    'salon': 50,       // Salons: ~50 clients/employee
    'barber': 50,
    'retail': 70,      // Retail: ~70 customers/employee
    'shop': 70,
    'boutique': 40,    // Boutiques: ~40 customers/employee
  };
  
  // Find matching threshold
  const businessTypeLower = businessType.toLowerCase();
  let optimalCapacity = 60; // Default
  for (const [key, value] of Object.entries(optimalCustomersPerEmployee)) {
    if (businessTypeLower.includes(key)) {
      optimalCapacity = value;
      break;
    }
  }
  
  // Calculate MAXIMUM PHYSICAL CAPACITY (HARD CAP!)
  const maxPhysicalCapacity = employeeData.total_employees * optimalCapacity * 1.5; // 150% is absolute max
  
  // Calculate capacity ratio
  const capacityRatio = customersPerEmployee / optimalCapacity;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AFFORDABILITY CHECK (Price vs Income)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const actualPrice = avgTransactionValue * priceRatio;
  const monthlySpendPerCustomer = actualPrice * visitFrequency;
  
  // Calculate affordability ratio (what % of monthly income goes to your business)
  const monthlyIncome = medianIncome / 12;
  const affordabilityRatio = monthlySpendPerCustomer / monthlyIncome;
  
  // AFFORDABILITY THRESHOLDS:
  // < 1%: Very affordable (coffee, fast food)
  // 1-3%: Affordable (restaurants, retail)
  // 3-5%: Expensive (premium services)
  // > 5%: Luxury (very limited market)
  
  let affordabilityPenalty = 0;
  let affordabilityMultiplier = 1.0;
  
  if (affordabilityRatio > 0.05) {
    // LUXURY TIER: >5% of income
    affordabilityPenalty = -40; // Severe satisfaction penalty
    affordabilityMultiplier = 0.10; // Only 10% of market can afford
  } else if (affordabilityRatio > 0.03) {
    // PREMIUM TIER: 3-5% of income
    affordabilityPenalty = -20;
    affordabilityMultiplier = 0.30; // Only 30% can afford
  } else if (affordabilityRatio > 0.02) {
    // MODERATE: 2-3% of income
    affordabilityPenalty = -10;
    affordabilityMultiplier = 0.60; // 60% can afford
  } else if (affordabilityRatio > 0.01) {
    // AFFORDABLE: 1-2% of income
    affordabilityPenalty = 0;
    affordabilityMultiplier = 0.85; // 85% can afford
  } else {
    // VERY AFFORDABLE: <1% of income
    affordabilityPenalty = 0;
    affordabilityMultiplier = 1.0; // Everyone can afford
  }
  
  // ADDITIONAL CHECK: High price + Low income area = DISASTER
  if (priceRatio > 1.2 && medianIncome < 50000) {
    // Premium pricing in poor area
    affordabilityPenalty -= 30; // Extra penalty
    affordabilityMultiplier *= 0.5; // Halve the market
  }
  
  // Calculate capacity penalty
  let capacityPenalty = 0;
  let capacityStatus = 'optimal';
  
  if (capacityRatio > 1.5) {
    // SEVERE OVERCROWDING (>150% capacity)
    capacityPenalty = -30; // -30 satisfaction points
    capacityStatus = 'severely_understaffed';
  } else if (capacityRatio > 1.2) {
    // MODERATE OVERCROWDING (120-150% capacity)
    capacityPenalty = -20; // -20 satisfaction points
    capacityStatus = 'understaffed';
  } else if (capacityRatio > 1.0) {
    // SLIGHT OVERCROWDING (100-120% capacity)
    capacityPenalty = -10; // -10 satisfaction points
    capacityStatus = 'near_capacity';
  } else if (capacityRatio < 0.5) {
    // OVERSTAFFED (too many employees for too few customers)
    capacityPenalty = -5; // Slight penalty (inefficiency perceived by customers)
    capacityStatus = 'overstaffed';
  }
  
  // Employee morale also affects service quality
  const moraleBonus = (employeeData.morale - 50) / 10; // -5 to +5 points
  
  // Combined satisfaction (70% quality, 30% price, + capacity penalty + morale)
  const baseSatisfaction = (qualityScore * 0.7 + priceSatisfaction * 0.3);
  const customerSatisfaction = Math.max(0, Math.min(100, baseSatisfaction + capacityPenalty + moraleBonus));
  
  // Calculate CHURN RATE using scientific formula
  const economicClimate = mapEconomicClimate(marketContext.economic_climate);
  const churnRate = calculateChurnRate(
    competitionIntensity,
    priceRatio,
    customerSatisfaction,
    economicClimate
  );
  
  // Calculate RETENTION RATE
  const retentionRate = calculateRetentionRate(churnRate);
  
  // Calculate customers from last month
  const returningCustomers = Math.round(previousMonthCustomers * retentionRate);
  const churnedCustomers = previousMonthCustomers - returningCustomers;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NEW CUSTOMER ACQUISITION (WITH STRICT LIMITS!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Step 1: Calculate addressable market with affordability filter
  const affordableMarket = Math.round(totalPotentialCustomers * affordabilityMultiplier);
  
  // Step 2: Calculate NEW CUSTOMERS using Bass Diffusion Model
  const marketingIntensity = playerDecisions.marketing_spend / 1000; // Normalize
  const innovationCoefficient = 0.03 + (marketingIntensity * 0.02); // Marketing boosts innovation
  
  let newCustomersAcquired = calculateNewCustomersBassDiffusion(
    affordableMarket, // Use AFFORDABLE market, not total
    previousMonthCustomers,
    playerDecisions.marketing_spend,
    innovationCoefficient,
    0.38 // Standard imitation coefficient
  );
  
  // Step 3: Apply event impact
  const eventMultiplier = eventsData.relevanta_pentru_business 
    ? (1 + eventsData.impact_clienti_lunar / 100)
    : 1.0;
  
  newCustomersAcquired = Math.round(newCustomersAcquired * eventMultiplier);
  
  // Step 4: CAPACITY CHECK - Can you physically serve more customers?
  const projectedTotal = returningCustomers + newCustomersAcquired;
  
  if (projectedTotal > maxPhysicalCapacity) {
    // HARD CAP: Cannot serve more customers than physical capacity
    const availableCapacity = maxPhysicalCapacity - returningCustomers;
    newCustomersAcquired = Math.max(0, availableCapacity);
    
    console.log(`⚠️ CAPACITY LIMIT REACHED! Capping new customers at ${newCustomersAcquired} (max capacity: ${maxPhysicalCapacity})`);
  }
  
  // Step 5: QUALITY-BASED REJECTION
  // If you're already overcrowded, new customers will be turned away by bad service
  if (capacityRatio > 1.3) {
    // Severe overcrowding - customers won't even try to come
    const rejectionRate = Math.min(0.8, (capacityRatio - 1.3) * 2); // Up to 80% rejection
    newCustomersAcquired = Math.round(newCustomersAcquired * (1 - rejectionRate));
    
    console.log(`⚠️ SERVICE QUALITY TOO LOW! ${(rejectionRate * 100).toFixed(0)}% of potential customers avoided due to overcrowding`);
  }
  
  const adjustedNewCustomers = newCustomersAcquired;
  
  // TOTAL ACTIVE CUSTOMERS
  const totalActiveCustomers = returningCustomers + adjustedNewCustomers;
  
  // Calculate avg revenue per customer (for CLV)
  const avgMonthlyRevenuePerCustomer = avgTransactionValue * visitFrequency;
  
  // Calculate CUSTOMER LIFETIME VALUE
  const cac = playerDecisions.marketing_spend / Math.max(adjustedNewCustomers, 1);
  const clv = calculateCustomerLifetimeValue(
    avgMonthlyRevenuePerCustomer,
    retentionRate,
    cac
  );
  
  // Calculate customer lifespan
  const avgLifespan = calculateCustomerLifespan(churnRate);
  
  // Customer segmentation
  const segments = calculateSegmentDistribution(medianIncome, businessType);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MATHEMATICAL SUMMARY FOR LLM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const mathSummary = `
MATHEMATICAL CALCULATIONS COMPLETED:
- Market Penetration: ${(dynamicPenetration * 100).toFixed(1)}% (adjusted for income, density, season)
- Total Potential Market: ${totalPotentialCustomers.toLocaleString()} customers
- Affordable Market (After Price Filter): ${Math.round(totalPotentialCustomers * affordabilityMultiplier).toLocaleString()} customers (${(affordabilityMultiplier * 100).toFixed(0)}% can afford)

SERVICE CAPACITY ANALYSIS:
- Total Employees: ${employeeData.total_employees}
- Optimal Customers Per Employee: ${optimalCapacity}
- Actual Customers Per Employee: ${customersPerEmployee.toFixed(1)}
- Capacity Ratio: ${(capacityRatio * 100).toFixed(0)}% ${capacityRatio > 1.5 ? '🔴 SEVERELY OVERCROWDED' : capacityRatio > 1.2 ? '🟡 OVERCROWDED' : '🟢 HEALTHY'}
- Max Physical Capacity: ${maxPhysicalCapacity} customers (150% of optimal)
- Current Total: ${totalActiveCustomers} customers ${totalActiveCustomers > maxPhysicalCapacity ? '⚠️ OVER CAPACITY!' : '✓'}

AFFORDABILITY ANALYSIS:
- Price Per Visit: $${avgTransactionValue.toFixed(2)} (${priceRatio > 1 ? `+${((priceRatio - 1) * 100).toFixed(0)}%` : `-${((1 - priceRatio) * 100).toFixed(0)}%`} vs base)
- Monthly Spend Per Customer: $${(avgTransactionValue * visitFrequency).toFixed(2)}
- Area Median Income: $${medianIncome.toLocaleString()}/year ($${(medianIncome / 12).toFixed(0)}/month)
- Affordability Ratio: ${((avgTransactionValue * visitFrequency) / (medianIncome / 12) * 100).toFixed(2)}% of monthly income
- Affordability Tier: ${affordabilityMultiplier >= 1.0 ? 'Very Affordable' : affordabilityMultiplier >= 0.85 ? 'Affordable' : affordabilityMultiplier >= 0.60 ? 'Moderate' : affordabilityMultiplier >= 0.30 ? 'Premium' : 'Luxury'}
- Market Size Multiplier: ${(affordabilityMultiplier * 100).toFixed(0)}%
${priceRatio > 1.2 && medianIncome < 50000 ? `⚠️ WARNING: Premium pricing in low-income area - extra ${-30} satisfaction penalty applied!` : ''}
- Capacity Ratio: ${capacityRatio.toFixed(2)}x (1.0 = optimal, >1.2 = overcrowded)
- Capacity Status: ${capacityStatus.toUpperCase()}
- Capacity Penalty: ${capacityPenalty} satisfaction points
- Employee Morale Bonus: ${moraleBonus.toFixed(1)} satisfaction points

CUSTOMER ACQUISITION & RETENTION:
- Churn Rate: ${(churnRate * 100).toFixed(1)}% (based on competition + pricing + satisfaction + capacity)
- Retention Rate: ${(retentionRate * 100).toFixed(1)}%
- Customer Satisfaction: ${customerSatisfaction.toFixed(0)}/100 (base: ${baseSatisfaction.toFixed(0)}, capacity: ${capacityPenalty}, morale: ${moraleBonus.toFixed(1)}, affordability: ${affordabilityPenalty})
- Last Month's Customers: ${previousMonthCustomers.toLocaleString()}
- Churned This Month: ${churnedCustomers} (-${((churnedCustomers / Math.max(previousMonthCustomers, 1)) * 100).toFixed(1)}%)
- Returning Customers: ${returningCustomers}
- New Customers Acquired: ${adjustedNewCustomers} ${adjustedNewCustomers < newCustomersAcquired ? `(capped from ${newCustomersAcquired} due to capacity limits)` : ''}
- Total Active Customers: ${totalActiveCustomers} ${totalActiveCustomers > maxPhysicalCapacity ? '⚠️ OVER CAPACITY!' : `(${((totalActiveCustomers / maxPhysicalCapacity) * 100).toFixed(0)}% of max capacity)`}

FINANCIAL METRICS:
- Avg Monthly Revenue/Customer: $${avgMonthlyRevenuePerCustomer.toFixed(2)} (${visitFrequency} visits × $${avgTransactionValue.toFixed(2)})
- Customer Acquisition Cost: $${cac.toFixed(2)}
- Customer Lifetime Value: $${clv.toFixed(2)} (${clv > cac * 3 ? '✓ Healthy' : clv > cac ? '⚠️ Marginal' : '🔴 Unprofitable'})
- Avg Customer Lifespan: ${avgLifespan.toFixed(1)} months

${capacityRatio > 1.5 ? `🔴 CRITICAL: SEVERELY UNDERSTAFFED! Need ${Math.ceil(totalActiveCustomers / optimalCapacity) - employeeData.total_employees} more employees URGENTLY.` : ''}
${capacityRatio > 1.2 && capacityRatio <= 1.5 ? `⚠️  WARNING: UNDERSTAFFED! Consider hiring ${Math.ceil(totalActiveCustomers / optimalCapacity) - employeeData.total_employees} more employees.` : ''}
${capacityRatio < 0.5 ? `💡 INFO: OVERSTAFFED. Could reduce ${Math.floor(employeeData.total_employees - totalActiveCustomers / optimalCapacity)} employees to improve efficiency.` : ''}
${totalActiveCustomers > maxPhysicalCapacity ? `🚨 OVER CAPACITY: You have ${totalActiveCustomers - maxPhysicalCapacity} more customers than you can physically serve!` : ''}
`;
  
  const systemPrompt = `You are a customer behavior simulation engine for NYC businesses.
Your role is to USE THE MATHEMATICAL CALCULATIONS PROVIDED and add realistic details.

CRITICAL: The customer counts are ALREADY CALCULATED using scientific formulas.
Your job is to:
1. Distribute customers across segments (use provided percentages)
2. Assign acquisition channels realistically
3. Provide 3 specific behavioral insights
4. Explain seasonal demand patterns

DO NOT recalculate customer counts - use the provided numbers.`;

  const userPrompt = `Simulate customer behavior for this month:

${mathSummary}

🏢 BUSINESS:
- Type: ${businessType}
- Location: ${location.neighborhood}

📊 DEMOGRAPHICS:
- Median Income: $${medianIncome.toLocaleString()}
- High Income Households: ${(highIncomeRate * 100).toFixed(1)}%
- Bachelor's Degree+: ${(censusData.derived_statistics.bachelor_plus_rate * 100).toFixed(1)}%

💰 PRICING & QUALITY:
- Pricing Strategy: ${playerDecisions.pricing_strategy}
- Product Price Modifier: ${priceRatio}x market (${priceRatio < 1 ? 'Discount' : priceRatio > 1.1 ? 'Premium' : 'Competitive'})
- Quality Level: ${playerDecisions.quality_level}
- Marketing Spend: $${playerDecisions.marketing_spend.toLocaleString()}
${playerDecisions.inventory_strategy ? `- Inventory Strategy: ${playerDecisions.inventory_strategy}` : ''}
${playerDecisions.working_hours_per_week ? `- Operating Hours: ${playerDecisions.working_hours_per_week}h/week` : ''}

🏪 MARKET CONTEXT:
- Economic Climate: ${marketContext.economic_climate}
- Industry Saturation: ${marketContext.industry_saturation}%
- Total Competitors: ${competitionData.total_competitors}
- Pricing Pressure: ${competitionData.pricing_pressure}
- Market Space: ${competitionData.market_space}

📈 TRENDS & EVENTS:
- Trend Impact: ${trendsData.impact_score} (${trendsData.market_momentum})
- Event Impact: ${eventsData.impact_clienti_lunar}% ${eventsData.relevanta_pentru_business ? '(relevant)' : '(not relevant)'}

📅 TEMPORAL:
- Month: ${currentMonth}/12 (${getSeasonName(currentMonth)})
- Year: ${currentYear}

📊 CUSTOMER SEGMENTATION (Use these percentages):
${segments.map(s => `- ${s.segmentName}: ${s.percentage.toFixed(0)}% of customers, ${s.avgSpendMultiplier}x avg spend, ${s.loyaltyScore}% loyalty`).join('\n')}

YOUR TASK:
1. Return EXACT numbers from calculations above
2. Distribute ${totalActiveCustomers} customers across ${segments.length} segments (use percentages above)
3. Create 3-4 acquisition channels that sum to ${adjustedNewCustomers} new customers
4. Provide 3 specific behavioral insights
5. Explain seasonal demand adjustment for ${getSeasonName(currentMonth)}

CRITICAL: Use these EXACT values:
- total_potential_customers: ${totalPotentialCustomers}
- new_customers_acquired: ${adjustedNewCustomers}
- returning_customers: ${returningCustomers}
- churned_customers: ${churnedCustomers}
- total_active_customers: ${totalActiveCustomers}
- loyalty_rate: ${(retentionRate * 100).toFixed(1)}
- churn_rate: ${(churnRate * 100).toFixed(1)}
- avg_customer_lifetime_value: ${clv.toFixed(2)}`;

  const result = await generateObject({
    model: openai(LLM_CONFIG.FAST_MODEL),
    schema: CustomerBehaviorSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: LLM_CONFIG.DETERMINISTIC,
  });

  return result.object;
}

/**
 * Helper: Map economic climate string to typed value
 */
function mapEconomicClimate(climate: string): 'booming' | 'stable' | 'declining' | 'recession' {
  const c = climate.toLowerCase();
  if (c.includes('boom') || c.includes('strong') || c.includes('growing')) return 'booming';
  if (c.includes('declin') || c.includes('slow')) return 'declining';
  if (c.includes('recess') || c.includes('crisis')) return 'recession';
  return 'stable';
}

/**
 * Helper: Get average transaction value by business type
 */
function getAvgTransactionValue(businessType: string): number {
  const type = businessType.toLowerCase();
  
  if (type.includes('coffee') || type.includes('cafe')) return 1.8;
  if (type.includes('restaurant')) return 45;
  if (type.includes('boutique')) return 40;
  if (type.includes('gym') || type.includes('fitness')) return 120;
  if (type.includes('salon') || type.includes('barber')) return 50;
  if (type.includes('retail') || type.includes('shop')) return 35;
  
  return 30;
}

/**
 * Helper: Get visit frequency per month by business type
 */
function getVisitFrequency(businessType: string): number {
  const type = businessType.toLowerCase();
  
  if (type.includes('coffee') || type.includes('cafe')) return 12;
  if (type.includes('restaurant')) return 2;
  if (type.includes('boutique')) return 0.5;
  if (type.includes('gym') || type.includes('fitness')) return 12;
  if (type.includes('salon') || type.includes('barber')) return 1;
  if (type.includes('retail') || type.includes('shop')) return 1.5;
  
  return 2;
}

/**
 * Helper: Get season name from month
 */
function getSeasonName(month: number): string {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}
