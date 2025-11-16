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
  
  // Combined satisfaction (70% quality, 30% price)
  const customerSatisfaction = (qualityScore * 0.7 + priceSatisfaction * 0.3);
  
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
  
  // Calculate NEW CUSTOMERS using Bass Diffusion Model
  // Adjust innovation coefficient based on marketing aggression
  const marketingIntensity = playerDecisions.marketing_spend / 1000; // Normalize
  const innovationCoefficient = 0.03 + (marketingIntensity * 0.02); // Marketing boosts innovation
  
  const newCustomersAcquired = calculateNewCustomersBassDiffusion(
    totalPotentialCustomers,
    previousMonthCustomers,
    playerDecisions.marketing_spend,
    innovationCoefficient,
    0.38 // Standard imitation coefficient
  );
  
  // Apply event impact
  const eventMultiplier = eventsData.relevanta_pentru_business 
    ? (1 + eventsData.impact_clienti_lunar / 100)
    : 1.0;
  
  const adjustedNewCustomers = Math.round(newCustomersAcquired * eventMultiplier);
  
  // TOTAL ACTIVE CUSTOMERS
  const totalActiveCustomers = returningCustomers + adjustedNewCustomers;
  
  // Calculate avg revenue per customer (for CLV)
  const avgTransactionValue = getAvgTransactionValue(businessType);
  const visitFrequency = getVisitFrequency(businessType);
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
- Total Addressable Market: ${totalPotentialCustomers.toLocaleString()} potential customers
- Churn Rate: ${(churnRate * 100).toFixed(1)}% (based on competition, pricing, satisfaction)
- Retention Rate: ${(retentionRate * 100).toFixed(1)}%
- Customer Satisfaction: ${customerSatisfaction.toFixed(0)}/100
- Last Month's Customers: ${previousMonthCustomers.toLocaleString()}
- Churned This Month: ${churnedCustomers}
- Returning Customers: ${returningCustomers}
- New Customers (Bass Model): ${adjustedNewCustomers}
- Total Active Customers: ${totalActiveCustomers}
- Avg Monthly Revenue/Customer: $${avgMonthlyRevenuePerCustomer.toFixed(2)}
- Customer Lifetime Value: $${clv.toFixed(2)}
- Avg Customer Lifespan: ${avgLifespan.toFixed(1)} months
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
  
  if (type.includes('coffee') || type.includes('cafe')) return 8;
  if (type.includes('restaurant')) return 45;
  if (type.includes('boutique')) return 85;
  if (type.includes('gym') || type.includes('fitness')) return 120;
  if (type.includes('salon') || type.includes('barber')) return 65;
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
