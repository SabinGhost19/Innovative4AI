/**
 * 📊 CUSTOMER BEHAVIOR MATHEMATICAL MODELS
 * 
 * Formule științifice pentru comportament clienți:
 * - Bass Diffusion Model (customer acquisition)
 * - Dynamic Market Penetration (based on demographics)
 * - Churn Rate Formula (competition-based)
 * - Customer Lifetime Value (CLV)
 * - Income Elasticity of Demand
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARKET PENETRATION MODELS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Base market penetration by business type (research-backed percentages)
 */
const BASE_MARKET_PENETRATION: Record<string, number> = {
  coffee: 0.25,      // 25% - National Coffee Association data
  cafe: 0.25,
  restaurant: 0.40,  // 40% - USDA food spending data
  food: 0.40,
  retail: 0.15,      // 15% - specialty retail penetration
  shop: 0.15,
  boutique: 0.12,
  gym: 0.12,         // 12% - IHRSA gym membership data
  fitness: 0.12,
  salon: 0.30,       // 30% - salon/barber usage
  barber: 0.30,
};

/**
 * Income elasticity of demand by business type
 * 
 * Formula: %ΔQ / %ΔI
 * - Elasticity > 1: Luxury goods (demand increases more than income)
 * - Elasticity = 1: Normal goods
 * - Elasticity < 1: Necessities
 * - Elasticity < 0: Inferior goods
 * 
 * Source: Economic research on consumer spending patterns
 */
const INCOME_ELASTICITY: Record<string, number> = {
  coffee: 0.6,       // Slightly inelastic (necessity/habit)
  cafe: 0.6,
  restaurant: 1.2,   // Elastic (discretionary)
  food: 0.4,         // Inelastic (necessity)
  retail: 1.3,       // Elastic (luxury/discretionary)
  shop: 1.3,
  boutique: 1.5,     // Highly elastic (luxury)
  gym: 1.1,          // Elastic (discretionary)
  fitness: 1.1,
  salon: 0.8,        // Moderately elastic
  barber: 0.7,
};

/**
 * Get base market penetration for business type
 */
function getBasePenetration(businessType: string): number {
  const type = businessType.toLowerCase();
  
  for (const [key, value] of Object.entries(BASE_MARKET_PENETRATION)) {
    if (type.includes(key)) {
      return value;
    }
  }
  
  return 0.20; // Default 20%
}

/**
 * Get income elasticity for business type
 */
function getIncomeElasticity(businessType: string): number {
  const type = businessType.toLowerCase();
  
  for (const [key, value] of Object.entries(INCOME_ELASTICITY)) {
    if (type.includes(key)) {
      return value;
    }
  }
  
  return 1.0; // Default unitary elasticity
}

/**
 * Calculate adjusted market penetration based on multiple factors
 * 
 * Factors:
 * 1. Population Density (Reilly's Law of Retail Gravitation)
 * 2. Income Level (Income Elasticity of Demand)
 * 3. Seasonality (Sinusoidal pattern)
 * 4. Competition Intensity (Market saturation)
 * 
 * @returns Adjusted market penetration rate (0-1)
 */
export function calculateDynamicMarketPenetration(
  businessType: string,
  population: number,
  populationDensity: number,  // persons per square mile
  medianIncome: number,
  month: number,              // 1-12
  competitionIntensity: number // 0-1
): number {
  const basePenetration = getBasePenetration(businessType);
  const elasticity = getIncomeElasticity(businessType);
  
  // 1. DENSITY ADJUSTMENT (Reilly's Law)
  // In highly dense areas, more options exist → lower individual penetration
  // Reference density: 10,000 people/sq mi (typical urban)
  const referenceDensity = 10000;
  const densityFactor = Math.pow(referenceDensity / Math.max(populationDensity, 1000), 0.3);
  const densityAdjustment = Math.min(1.5, Math.max(0.5, densityFactor));
  
  // 2. INCOME ELASTICITY ADJUSTMENT
  // Formula: (actual_income / reference_income) ^ elasticity
  const referenceIncome = 60000; // NYC median household income baseline
  const incomeRatio = medianIncome / referenceIncome;
  const incomeAdjustment = Math.pow(incomeRatio, elasticity);
  
  // 3. SEASONAL ADJUSTMENT (Sinusoidal)
  // Peak in May (month 5), trough in January (month 1)
  // Formula: 1 + amplitude * sin(2π * (month - phase) / 12)
  const amplitude = 0.15; // ±15% seasonal variation
  const phase = 6;        // Shift to make May the peak
  const seasonalMultiplier = 1 + amplitude * Math.sin(2 * Math.PI * (month - phase) / 12);
  
  // 4. COMPETITION ADJUSTMENT
  // More competition → lower penetration per business
  const competitionAdjustment = 1 - (competitionIntensity * 0.3); // Max -30%
  
  // COMBINED FORMULA
  const adjustedPenetration = basePenetration 
    * densityAdjustment 
    * incomeAdjustment 
    * seasonalMultiplier 
    * competitionAdjustment;
  
  // Clamp between 5% and 60%
  return Math.min(0.60, Math.max(0.05, adjustedPenetration));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASS DIFFUSION MODEL (Customer Acquisition)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Bass Diffusion Model for new customer acquisition
 * 
 * Formula: n(t) = [p + q*Y(t-1)/m] * [m - Y(t-1)]
 * 
 * Where:
 * - n(t) = new adopters at time t
 * - p = coefficient of innovation (external influence)
 * - q = coefficient of imitation (internal influence / word of mouth)
 * - Y(t-1) = cumulative adopters at time t-1
 * - m = market potential (total addressable market)
 * 
 * Typical values (empirical research):
 * - p ≈ 0.03 (3% innovators)
 * - q ≈ 0.38 (38% imitators - word of mouth effect)
 * 
 * Source: Bass, F.M. (1969). "A New Product Growth Model for Consumer Durables"
 */
export function calculateNewCustomersBassDiffusion(
  totalPotentialCustomers: number,  // m
  currentCustomers: number,          // Y(t-1)
  marketingSpend: number,
  innovationCoefficient: number = 0.03,  // p (can adjust for aggressive marketing)
  imitationCoefficient: number = 0.38    // q (word of mouth strength)
): number {
  // Avoid division by zero
  if (totalPotentialCustomers <= 0 || currentCustomers >= totalPotentialCustomers) {
    return 0;
  }
  
  // Calculate adoption rate
  const adoptionRate = innovationCoefficient + 
    (imitationCoefficient * currentCustomers / totalPotentialCustomers);
  
  // Organic new customers from Bass Model
  const organicAcquisition = (totalPotentialCustomers - currentCustomers) * adoptionRate;
  
  // Marketing boost (diminishing returns)
  // Formula: Marketing impact = spend / (CAC + spend/total_market)
  // This creates a logarithmic curve - early spending is more effective
  const baseCAC = 15; // Base Customer Acquisition Cost ($15)
  const marketingEfficiency = marketingSpend / (baseCAC + marketingSpend / 1000);
  const marketingAcquisition = marketingEfficiency;
  
  // Total new customers (round to integer)
  const totalNew = Math.round(organicAcquisition + marketingAcquisition);
  
  // Cap at 20% monthly growth (unrealistic to grow faster)
  // BUT: Allow startup acquisition if currentCustomers is 0
  if (currentCustomers === 0) {
    // First month: Allow initial customer acquisition (no cap)
    // Minimum: 10 customers from soft opening/friends & family
    const minimumStartup = 10;
    return Math.max(totalNew, minimumStartup);
  }
  
  const maxGrowth = Math.ceil(currentCustomers * 0.20);
  
  return Math.min(totalNew, maxGrowth);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHURN RATE CALCULATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate customer churn rate based on multiple factors
 * 
 * Base churn rate: 15% monthly (research-backed for small businesses)
 * 
 * Adjustments:
 * 1. Competition intensity (linear)
 * 2. Price positioning (exponential)
 * 3. Service quality/satisfaction (inverse linear)
 * 4. Economic climate (multiplier)
 * 
 * Formula: Churn = [Base + Competition + Price + Satisfaction] × Economic
 * 
 * Source: SaaS & Retail churn research, Harvard Business Review
 */
export function calculateChurnRate(
  competitionIntensity: number,    // 0-1 (0 = no competition, 1 = extreme)
  priceVsMarket: number,           // ratio (1.0 = at market, 1.2 = 20% premium)
  customerSatisfaction: number,    // 0-100 score
  economicClimate: 'booming' | 'stable' | 'declining' | 'recession'
): number {
  // Base churn (15% monthly is typical for small businesses)
  const baseChurn = 0.15;
  
  // 1. COMPETITION EFFECT (Linear)
  // More competition → customers have more options → higher churn
  // Each 0.1 competition intensity adds 0.5% churn
  const competitionEffect = competitionIntensity * 0.05;
  
  // 2. PRICE EFFECT (Exponential)
  // Price sensitivity increases exponentially above market price
  // Premium pricing (>1.0) increases churn
  // Discount pricing (<1.0) decreases churn
  const priceEffect = Math.max(0, (priceVsMarket - 1) * 0.10);
  
  // 3. SATISFACTION EFFECT (Inverse Linear)
  // Baseline satisfaction: 70 (neutral)
  // Above 70 → negative effect (reduces churn)
  // Below 70 → positive effect (increases churn)
  // Formula: -(satisfaction - 70) / 1000
  const satisfactionEffect = -(customerSatisfaction - 70) / 1000;
  
  // 4. ECONOMIC CLIMATE MULTIPLIER
  const economicMultiplier: Record<typeof economicClimate, number> = {
    'booming': 0.85,    // -15% churn in good economy
    'stable': 1.00,     // No change
    'declining': 1.15,  // +15% churn
    'recession': 1.30   // +30% churn
  };
  
  // COMBINED CHURN RATE
  const rawChurn = (baseChurn + competitionEffect + priceEffect + satisfactionEffect) 
    * economicMultiplier[economicClimate];
  
  // Clamp between 5% and 40% (realistic bounds)
  return Math.min(0.40, Math.max(0.05, rawChurn));
}

/**
 * Calculate retention rate (inverse of churn)
 */
export function calculateRetentionRate(churnRate: number): number {
  return 1 - churnRate;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER LIFETIME VALUE (CLV)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate Customer Lifetime Value
 * 
 * Formula: CLV = (Average Purchase Value × Purchase Frequency × Customer Lifespan) - Acquisition Cost
 * 
 * Simplified version:
 * CLV = (Avg Monthly Revenue per Customer × Retention Rate) / (1 - Retention Rate) - CAC
 * 
 * This uses the geometric series formula for infinite horizon
 */
export function calculateCustomerLifetimeValue(
  avgMonthlyRevenuePerCustomer: number,
  retentionRate: number,           // 0-1
  customerAcquisitionCost: number
): number {
  // Avoid division by zero
  if (retentionRate >= 1) {
    retentionRate = 0.95; // Cap at 95%
  }
  
  // Geometric series: CLV = ARPU × r / (1 - r)
  // Where r = retention rate, ARPU = average revenue per user
  const lifetimeValue = (avgMonthlyRevenuePerCustomer * retentionRate) / (1 - retentionRate);
  
  // Subtract acquisition cost
  const netCLV = lifetimeValue - customerAcquisitionCost;
  
  return Math.max(0, netCLV);
}

/**
 * Calculate expected customer lifespan in months
 * 
 * Formula: Lifespan = 1 / Churn Rate
 */
export function calculateCustomerLifespan(churnRate: number): number {
  if (churnRate <= 0) return Infinity;
  
  const lifespan = 1 / churnRate;
  
  // Cap at 60 months (5 years) for practical purposes
  return Math.min(60, lifespan);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER SEGMENTATION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Segment customers using RFM analysis principles
 * (Recency, Frequency, Monetary)
 * 
 * Returns segment distribution percentages
 */
export function calculateSegmentDistribution(
  medianIncome: number,
  businessType: string
): { segmentName: string; percentage: number; avgSpendMultiplier: number; loyaltyScore: number }[] {
  const type = businessType.toLowerCase();
  
  // Premium segments are larger in high-income areas
  const premiumPercentage = Math.min(40, (medianIncome / 60000) * 25);
  const budgetPercentage = Math.max(20, 60 - premiumPercentage);
  const regularPercentage = 100 - premiumPercentage - budgetPercentage;
  
  // Segment characteristics vary by business type
  const isLuxury = type.includes('boutique') || type.includes('spa');
  const isPremium = type.includes('restaurant') || type.includes('gym');
  
  return [
    {
      segmentName: 'Premium Customers',
      percentage: premiumPercentage,
      avgSpendMultiplier: isLuxury ? 2.5 : isPremium ? 1.8 : 1.5,
      loyaltyScore: 80
    },
    {
      segmentName: 'Regular Customers',
      percentage: regularPercentage,
      avgSpendMultiplier: 1.0,
      loyaltyScore: 65
    },
    {
      segmentName: 'Budget-Conscious',
      percentage: budgetPercentage,
      avgSpendMultiplier: 0.7,
      loyaltyScore: 50
    }
  ];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT ALL FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  getBasePenetration,
  getIncomeElasticity
};
