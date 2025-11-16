/**
 * Economic Constants pentru Business Simulator
 * 
 * Constante realiste bazate pe date din NYC și industrie.
 */

// ============================================
// RENT & REAL ESTATE (NYC Averages)
// ============================================

export const RENT_PER_SQ_FT_NYC = {
  manhattan: 120,      // $/sq ft/year
  brooklyn: 65,
  queens: 55,
  bronx: 45,
  staten_island: 50,
  average: 67,
};

export const TYPICAL_BUSINESS_SIZES = {
  coffee_shop: 1200,      // sq ft
  restaurant: 2500,
  boutique: 1500,
  gym: 5000,
  salon: 1000,
  office: 1500,
  retail_small: 1200,
  retail_medium: 2500,
};

// ============================================
// LABOR COSTS (NYC 2024)
// ============================================

export const NYC_MINIMUM_WAGE = 16.00;  // $/hour as of 2024

export const AVERAGE_HOURLY_WAGES = {
  barista: 18,
  server: 20,
  cook: 22,
  manager: 35,
  retail_associate: 19,
  personal_trainer: 30,
  stylist: 25,
  receptionist: 18,
  janitor: 17,
};

export const PAYROLL_TAX_RATE = 0.0765;  // Social Security + Medicare
export const BENEFITS_RATE = 0.20;       // 20% of salary for benefits

export const HOURS_PER_MONTH_FULL_TIME = 160;  // ~40 hours/week
export const HOURS_PER_MONTH_PART_TIME = 80;

// ============================================
// CUSTOMER ECONOMICS
// ============================================

export const CUSTOMER_ACQUISITION_COST = {
  organic: 0,           // Word of mouth, walk-ins
  social_media: 15,     // Per customer via social ads
  google_ads: 25,
  flyers: 5,
  events: 10,
};

export const AVERAGE_TRANSACTION_VALUES = {
  coffee_shop: 8,
  restaurant: 45,
  boutique: 85,
  gym_membership: 120,  // monthly
  salon_service: 65,
  retail_general: 35,
};

export const CUSTOMER_VISIT_FREQUENCY = {
  coffee_shop: 12,      // times per month
  restaurant: 2,
  boutique: 0.5,        // once every 2 months
  gym: 12,
  salon: 1,             // once per month
  retail_general: 1.5,
};

// ============================================
// OPERATING EXPENSES
// ============================================

export const UTILITIES_MONTHLY = {
  small_business: 500,
  medium_business: 1200,
  large_business: 2500,
};

export const MARKETING_BUDGET_PERCENTAGE = 0.05;  // 5% of revenue

export const INSURANCE_MONTHLY = {
  small_business: 300,
  medium_business: 600,
  large_business: 1200,
};

// ============================================
// COST OF GOODS SOLD (COGS) - Percentage of Revenue
// ============================================

export const COGS_PERCENTAGE = {
  food_beverage: 0.30,      // 30% of revenue
  retail: 0.50,             // 50% of revenue
  services: 0.15,           // 15% of revenue (mostly labor)
  gym: 0.20,                // Equipment, maintenance
};

// ============================================
// BUSINESS SURVIVAL THRESHOLDS
// ============================================

export const MINIMUM_CASH_RESERVE_MONTHS = 3;   // Minimum 3 months expenses
export const HEALTHY_CASH_RESERVE_MONTHS = 6;   // Healthy = 6 months

export const PROFITABILITY_THRESHOLDS = {
  critical: -5000,      // Losing more than $5k/month = critical
  struggling: 0,        // Break-even
  healthy: 5000,        // Making $5k+/month
  thriving: 15000,      // Making $15k+/month
};

// ============================================
// CUSTOMER BEHAVIOR CONSTANTS
// ============================================

export const BASE_CHURN_RATE = 0.10;  // 10% monthly churn baseline
export const BASE_LOYALTY_RATE = 0.70;  // 70% customer loyalty baseline

export const CHURN_MODIFIERS = {
  poor_service: 0.15,      // +15% churn
  price_increase: 0.08,    // +8% churn
  competition: 0.05,       // +5% churn
  economic_downturn: 0.12, // +12% churn
};

// ============================================
// SEASONAL ADJUSTMENTS (NYC)
// ============================================

export const SEASONAL_REVENUE_MULTIPLIERS = {
  // Month -> multiplier
  1: 0.85,   // January - post-holiday slump
  2: 0.90,   // February - slow
  3: 1.00,   // March - normal
  4: 1.05,   // April - spring pickup
  5: 1.10,   // May - good weather
  6: 1.05,   // June - summer start
  7: 0.95,   // July - many on vacation
  8: 0.90,   // August - vacation month
  9: 1.05,   // September - back to school
  10: 1.10,  // October - busy
  11: 1.15,  // November - holiday shopping
  12: 1.20,  // December - peak holiday
};

// ============================================
// STARTUP COSTS (Initial Investment Ranges)
// ============================================

export const STARTUP_COSTS = {
  coffee_shop: { min: 80000, max: 250000 },
  restaurant: { min: 150000, max: 500000 },
  boutique: { min: 50000, max: 150000 },
  gym: { min: 100000, max: 300000 },
  salon: { min: 40000, max: 120000 },
  tech_startup: { min: 20000, max: 100000 },
  consulting: { min: 10000, max: 50000 },
};

// ============================================
// GROWTH RATES (Monthly)
// ============================================

export const CUSTOMER_GROWTH_RATES = {
  aggressive: 0.20,     // 20% growth/month (unsustainable long-term)
  healthy: 0.10,        // 10% growth/month
  steady: 0.05,         // 5% growth/month
  stagnant: 0.0,        // No growth
  declining: -0.05,     // -5% decline/month
};

// ============================================
// ECONOMIC CLIMATE ADJUSTMENTS
// ============================================

export const ECONOMIC_CLIMATE_MULTIPLIERS = {
  booming: {
    revenue: 1.15,
    customer_acquisition: 1.20,
    pricing_power: 1.10,
  },
  stable: {
    revenue: 1.00,
    customer_acquisition: 1.00,
    pricing_power: 1.00,
  },
  declining: {
    revenue: 0.90,
    customer_acquisition: 0.85,
    pricing_power: 0.95,
  },
  recession: {
    revenue: 0.75,
    customer_acquisition: 0.70,
    pricing_power: 0.85,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate monthly rent based on business type and location
 */
export function calculateMonthlyRent(businessType: string, county: string): number {
  const sqft = TYPICAL_BUSINESS_SIZES[businessType as keyof typeof TYPICAL_BUSINESS_SIZES] || TYPICAL_BUSINESS_SIZES.retail_small;
  const rentPerSqFt = getRentPerSqFt(county);
  
  // Annual rent / 12
  return (sqft * rentPerSqFt) / 12;
}

/**
 * Get rent per sq ft based on county
 */
function getRentPerSqFt(county: string): number {
  const countyLower = county.toLowerCase();
  
  if (countyLower.includes('new york county') || countyLower.includes('manhattan')) {
    return RENT_PER_SQ_FT_NYC.manhattan;
  } else if (countyLower.includes('kings county') || countyLower.includes('brooklyn')) {
    return RENT_PER_SQ_FT_NYC.brooklyn;
  } else if (countyLower.includes('queens county')) {
    return RENT_PER_SQ_FT_NYC.queens;
  } else if (countyLower.includes('bronx county')) {
    return RENT_PER_SQ_FT_NYC.bronx;
  } else if (countyLower.includes('richmond county') || countyLower.includes('staten island')) {
    return RENT_PER_SQ_FT_NYC.staten_island;
  }
  
  return RENT_PER_SQ_FT_NYC.average;
}

/**
 * Calculate employee cost (salary + taxes + benefits)
 */
export function calculateEmployeeCost(hourlyWage: number, hoursPerMonth: number): number {
  const grossSalary = hourlyWage * hoursPerMonth;
  const payrollTax = grossSalary * PAYROLL_TAX_RATE;
  const benefits = grossSalary * BENEFITS_RATE;
  
  return grossSalary + payrollTax + benefits;
}

/**
 * Get seasonal multiplier for given month
 */
export function getSeasonalMultiplier(month: number): number {
  return SEASONAL_REVENUE_MULTIPLIERS[month as keyof typeof SEASONAL_REVENUE_MULTIPLIERS] || 1.0;
}

/**
 * Calculate recommended cash reserve based on monthly expenses and risk
 */
export function calculateRecommendedReserve(
  monthlyExpenses: number,
  industryRiskLevel: 'LOW' | 'MEDIUM' | 'MEDIUM-HIGH' | 'HIGH'
): number {
  const baseMonths = HEALTHY_CASH_RESERVE_MONTHS;
  
  const riskMultiplier = {
    'LOW': 1.0,
    'MEDIUM': 1.2,
    'MEDIUM-HIGH': 1.4,
    'HIGH': 1.6,
  }[industryRiskLevel];
  
  return monthlyExpenses * baseMonths * riskMultiplier;
}

// ============================================
// RAG CONFIGURATION
// ============================================

export const RAG_CONFIG = {
  // Vector search
  TOP_K_SIMILAR_MONTHS: 3,
  SIMILARITY_THRESHOLD: 0.7,
  
  // Embedding model
  EMBEDDING_MODEL: 'text-embedding-3-small',
  EMBEDDING_DIMENSIONS: 1536,
  
  // Collections
  COLLECTIONS: {
    SIMULATION_STATES: 'simulation_states',
    RECOMMENDATIONS: 'recommendations_history',
  },
} as const;

// ============================================
// LLM CONFIGURATION
// ============================================

export const LLM_CONFIG = {
  // Model selection
  FAST_MODEL: 'gpt-4o-mini',      // For quick decisions
  SMART_MODEL: 'gpt-4o',          // For complex analysis
  
  // Temperature settings
  DETERMINISTIC: 0.3,  // For math-based decisions
  BALANCED: 0.7,       // For balanced creativity
  CREATIVE: 0.9,       // For event generation
  
  // Token limits
  MAX_TOKENS_QUICK: 500,
  MAX_TOKENS_ANALYSIS: 1500,
  MAX_TOKENS_REPORT: 3000,
} as const;
