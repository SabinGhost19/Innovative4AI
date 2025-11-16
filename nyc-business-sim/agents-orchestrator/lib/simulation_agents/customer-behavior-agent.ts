/**
 * Customer Behavior Agent
 * 
 * Simulates customer acquisition, retention, churn, and spending patterns.
 * This is THE MOST IMPORTANT agent - it directly determines revenue.
 * 
 * Model: gpt-4o-mini (fast, data-driven decisions)
 * Output: CustomerBehaviorSchema (structured)
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { DetailedCensusData } from '../../core/types';
import { CustomerBehaviorSchema } from '../../core/schemas';
import { LLM_CONFIG } from '../../core/constants';

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
    marketing_spend: number;
    quality_level: 'basic' | 'standard' | 'premium';
  },
  previousMonthCustomers: number, // Last month's active customers
  currentMonth: number,
  currentYear: number
): Promise<z.infer<typeof CustomerBehaviorSchema>> {
  
  const population = Number(censusData.demographics_detailed.B01001_001E?.value) || 10000;
  const medianIncome = Number(censusData.demographics_detailed.B19013_001E?.value) || 60000;
  const highIncomeRate = censusData.derived_statistics.high_income_households_rate;
  
  // Calculate potential customer pool (% of population that might use this business type)
  const potentialCustomerPercentage = getPotentialCustomerPercentage(businessType);
  const totalPotentialCustomers = Math.round(population * potentialCustomerPercentage);
  
  const systemPrompt = `You are a customer behavior simulation engine for NYC businesses.
Your role is to realistically simulate customer acquisition, retention, and spending.

CRITICAL RULES:
1. Customer counts must be REALISTIC for the population size
2. Revenue must align with: customers × avg_transaction × visits_per_customer
3. Retention is typically 60-80% month-over-month
4. New customer acquisition depends on marketing, trends, events
5. Churn happens every month (base 10-20%)
6. Customer segments should total to 100% of customers

REQUIRED OUTPUT FIELDS (ALL MUST BE PROVIDED):
- total_potential_customers: total addressable market size
- new_customers_acquired: new customers this month
- returning_customers: retained from last month
- churned_customers: lost this month
- total_active_customers: new + returning
- customer_segments: array of 2-3 segments with segment_name, size, avg_spend, loyalty (max 3 segments)
- acquisition_channels: array of channels with channel, customers, cost_per_customer (max 4 channels)
- loyalty_rate: percentage likely to return (0-100)
- churn_rate: percentage lost (0-100)
- avg_customer_lifetime_value: expected lifetime revenue per customer
- behavioral_insights: exactly 3 key insights (max 3 items)
- seasonal_demand: object with adjustment (number) and reasoning (string)

CALCULATION CHAIN:
- Start with last month's ${previousMonthCustomers} active customers
- Calculate churn (customers lost)
- Calculate new acquisitions (based on marketing, trends, competition)
- Calculate returning customers (retained from last month)
- Total active = new + returning
- Revenue = customers × frequency × avg_spend`;

  const userPrompt = `Simulate customer behavior for this month:

🏢 BUSINESS:
- Type: ${businessType}
- Location: ${location.neighborhood}
- Last Month Active Customers: ${previousMonthCustomers}

👥 CUSTOMER POOL:
- Total Population: ${population.toLocaleString()}
- Potential Customers (${(potentialCustomerPercentage * 100).toFixed(0)}% of population): ${totalPotentialCustomers.toLocaleString()}
- Already Captured: ${previousMonthCustomers} (${((previousMonthCustomers / totalPotentialCustomers) * 100).toFixed(1)}% of potential)

📊 DEMOGRAPHICS:
- Median Income: $${medianIncome.toLocaleString()}
- High Income Households: ${(highIncomeRate * 100).toFixed(1)}%
- Bachelor's Degree+: ${(censusData.derived_statistics.bachelor_plus_rate * 100).toFixed(1)}%

🌍 MARKET CONDITIONS:
- Economic Climate: ${marketContext.economic_climate}
- Market Demand Score: ${marketContext.market_demand_score}/100
- Industry Saturation: ${marketContext.industry_saturation}%
- Market Space: ${competitionData.market_space}
- Pricing Pressure: ${competitionData.pricing_pressure}
- Competitors: ${competitionData.total_competitors}

📈 EXTERNAL FACTORS:
- Event Impact: ${eventsData.impact_clienti_lunar > 0 ? '+' : ''}${eventsData.impact_clienti_lunar}% customers (relevant: ${eventsData.relevanta_pentru_business})
- Trend Impact: ${trendsData.impact_score} score, momentum: ${trendsData.market_momentum}

💼 YOUR BUSINESS DECISIONS:
- Pricing: ${playerDecisions.pricing_strategy}
- Marketing Spend: $${playerDecisions.marketing_spend.toLocaleString()}
- Quality Level: ${playerDecisions.quality_level}

📅 TIMING:
- Month: ${currentMonth}/12 (${getSeasonName(currentMonth)})

SIMULATE THIS MONTH:

1. **Churn**: How many of ${previousMonthCustomers} stopped coming?
   - Base churn: 10-20%
   - Adjust for: competition, pricing pressure, quality, events
   - Output: churned_customers (number), churn_rate (percentage 0-100)

2. **New Customers**: How many NEW customers acquired?
   - Drivers: marketing spend, trends, events, market space
   - Constraints: saturation level, competition
   - Output: new_customers_acquired (number)

3. **Returning**: customers_lost_to_churn subtracted from last month = returning
   - Output: returning_customers (number)

4. **Total Active**: new + returning
   - Output: total_active_customers (number)

5. **Customer Segments**: Divide total into 2-3 segments by:
   - Spending level (low/medium/high)
   - Demographics match
   - Each segment: name, size, avg_spend, loyalty (0-100)
   - MUST be array of max 3 segments

6. **Acquisition Channels**: Where did new customers come from?
   - Examples: word_of_mouth, social_media, walk_by, paid_ads, events, referrals
   - Each channel: name, number of customers, cost per customer
   - MUST be array of max 4 channels
   - Total customers across channels should equal new_customers_acquired

7. **Customer Lifetime Value**: 
   - Calculate avg_customer_lifetime_value based on:
     - Average monthly spend per customer
     - Expected retention period (months)
     - Loyalty rate
   - Output: avg_customer_lifetime_value (number)

8. **Loyalty Metrics**:
   - loyalty_rate: percentage of customers likely to return (0-100)
   - Based on: quality, pricing, competition, satisfaction

9. **Behavioral Insights**: Top 3 factors affecting customer behavior this month
   - MUST be exactly 3 insights (max 3)
   - Be specific and actionable

10. **Seasonal Demand**: 
   - adjustment: percentage adjustment for season (e.g., -10, 0, +15)
   - reasoning: why this seasonal impact (1 sentence)

Be REALISTIC. A coffee shop serves 50-300 customers/day. A boutique serves 10-50/day.

CRITICAL: You MUST provide ALL fields in the schema:
- total_potential_customers
- new_customers_acquired
- returning_customers
- churned_customers
- total_active_customers
- customer_segments (array of objects with segment_name, size, avg_spend, loyalty - max 3)
- acquisition_channels (array of objects with channel, customers, cost_per_customer - max 4)
- loyalty_rate (0-100)
- churn_rate (0-100)
- avg_customer_lifetime_value
- behavioral_insights (array of strings, exactly 3)
- seasonal_demand (object with adjustment and reasoning)`;

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
 * Helper: Get percentage of population that are potential customers
 */
function getPotentialCustomerPercentage(businessType: string): number {
  const type = businessType.toLowerCase();
  
  if (type.includes('coffee') || type.includes('cafe')) {
    return 0.25; // 25% of people drink coffee regularly
  } else if (type.includes('restaurant')) {
    return 0.40; // 40% eat out regularly
  } else if (type.includes('retail') || type.includes('shop') || type.includes('boutique')) {
    return 0.15; // 15% shop at specialty retail
  } else if (type.includes('gym') || type.includes('fitness')) {
    return 0.12; // 12% have gym memberships
  } else if (type.includes('salon') || type.includes('barber')) {
    return 0.30; // 30% use these services
  }
  
  return 0.20; // Default 20%
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
