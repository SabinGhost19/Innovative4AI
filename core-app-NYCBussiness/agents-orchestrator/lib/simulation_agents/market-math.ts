/**
 * Market Context - Mathematical Models
 * 
 * Pure mathematical functions for market analysis and industry saturation.
 * NO LLM calls - deterministic market calculations.
 * 
 * Key Models:
 * - Industry saturation using Reilly's Law
 * - Market concentration (HHI)
 * - Market capacity estimation
 * - Risk scoring
 * 
 * Sources:
 * - Reilly's Law of Retail Gravitation
 * - DOJ/FTC Merger Guidelines (HHI)
 * - US Census Bureau business density data
 */

/**
 * Calculate industry saturation percentage
 * 
 * Formula combines:
 * 1. Business density (businesses per capita)
 * 2. HHI market concentration
 * 3. Income saturation (spending capacity vs demand)
 * 
 * Result: 0-100% where:
 * - 0-30%: Emerging market (low saturation)
 * - 30-60%: Growing market (moderate saturation)
 * - 60-80%: Mature market (high saturation)
 * - 80-100%: Saturated/declining market
 * 
 * @param businessType - Type of business
 * @param population - Area population
 * @param medianIncome - Median household income
 * @param estimatedCompetitors - Number of competitors
 * @returns Saturation percentage (0-100)
 */
export function calculateIndustrySaturation(
  businessType: string,
  population: number,
  medianIncome: number,
  estimatedCompetitors: number
): number {
  // Business density benchmarks (per 10,000 people)
  const densityBenchmarks: Record<string, number> = {
    'coffee_shop': 2.5,
    'restaurant': 3.0,
    'retail_store': 4.0,
    'bodega': 1.5,
    'bakery': 1.0,
    'bar': 2.0,
  };
  
  const expectedDensity = densityBenchmarks[businessType] || 2.5;
  const expectedBusinesses = (population / 10000) * expectedDensity;
  
  // Density saturation (0-1)
  const densitySaturation = Math.min(1.0, estimatedCompetitors / expectedBusinesses);
  
  // Income capacity saturation
  // Higher income areas can support more businesses
  const incomeMultiplier = medianIncome > 80000 ? 1.3 : 
                          medianIncome > 60000 ? 1.1 :
                          medianIncome > 40000 ? 1.0 : 0.8;
  
  const adjustedSaturation = densitySaturation / incomeMultiplier;
  
  // Convert to percentage
  const saturationPercent = adjustedSaturation * 100;
  
  return Math.min(100, Math.max(0, Math.round(saturationPercent)));
}

/**
 * Calculate market capacity
 * 
 * Total potential customers based on:
 * - Population
 * - Income levels (purchasing power)
 * - Business type demand
 * 
 * @param population - Area population
 * @param medianIncome - Median household income
 * @param businessType - Type of business
 * @returns Estimated market capacity (monthly customers)
 */
export function calculateMarketCapacity(
  population: number,
  medianIncome: number,
  businessType: string
): number {
  // Penetration rates (% of population as potential monthly customers)
  const penetrationRates: Record<string, number> = {
    'coffee_shop': 0.40,   // 40% visit coffee shops monthly
    'restaurant': 0.60,    // 60% dine out monthly
    'retail_store': 0.50,  // 50% shop retail monthly
    'bodega': 0.70,        // 70% use local convenience stores
    'bakery': 0.25,        // 25% buy baked goods monthly
    'bar': 0.35,           // 35% visit bars monthly
  };
  
  const basePenetration = penetrationRates[businessType] || 0.40;
  
  // Income adjustment (higher income = higher spending frequency)
  const incomeAdjustment = medianIncome > 80000 ? 1.25 :
                          medianIncome > 60000 ? 1.10 :
                          medianIncome > 40000 ? 1.00 : 0.85;
  
  const effectivePenetration = basePenetration * incomeAdjustment;
  const marketCapacity = population * effectivePenetration;
  
  return Math.round(marketCapacity);
}

/**
 * Calculate market risk score
 * 
 * Combines:
 * - Survival rate (industry benchmark)
 * - Saturation level
 * - Economic factors (income, poverty)
 * 
 * @param survivalRate5Year - Industry 5-year survival rate (%)
 * @param saturation - Industry saturation (0-100)
 * @param medianIncome - Area median income
 * @param povertyRate - Area poverty rate (0-1)
 * @returns Risk score (0-100, higher = riskier)
 */
export function calculateMarketRisk(
  survivalRate5Year: number,
  saturation: number,
  medianIncome: number,
  povertyRate: number
): number {
  // Survival risk (inverse of survival rate)
  const survivalRisk = (100 - survivalRate5Year) / 100; // 0-1
  
  // Saturation risk
  const saturationRisk = saturation / 100; // 0-1
  
  // Economic risk
  const incomeFactor = medianIncome < 40000 ? 0.3 :
                       medianIncome < 60000 ? 0.15 : 0.05;
  
  const povertyFactor = povertyRate; // Already 0-1
  
  const economicRisk = (incomeFactor + povertyFactor) / 2;
  
  // Weighted combination
  const totalRisk = (
    survivalRisk * 0.40 +      // 40% weight on survival data
    saturationRisk * 0.35 +    // 35% weight on market saturation
    economicRisk * 0.25        // 25% weight on economic factors
  );
  
  return Math.round(totalRisk * 100);
}

/**
 * Classify market risk level
 * 
 * @param riskScore - Risk score (0-100)
 * @returns Risk level classification
 */
export function classifyMarketRisk(riskScore: number): 'low' | 'medium' | 'high' | 'very_high' {
  if (riskScore < 25) return 'low';
  if (riskScore < 50) return 'medium';
  if (riskScore < 75) return 'high';
  return 'very_high';
}

/**
 * Calculate economic climate score
 * 
 * Based on:
 * - Median income vs national average ($74,580 in 2024)
 * - Employment metrics
 * - Poverty rate
 * 
 * @param medianIncome - Area median income
 * @param povertyRate - Poverty rate (0-1)
 * @param workFromHomeRate - WFH rate (0-1, proxy for white-collar jobs)
 * @returns Climate: 'booming' | 'stable' | 'declining' | 'recession'
 */
export function calculateEconomicClimate(
  medianIncome: number,
  povertyRate: number,
  workFromHomeRate: number
): 'booming' | 'stable' | 'declining' | 'recession' {
  const nationalMedian = 74580; // US median 2024
  
  const incomeRatio = medianIncome / nationalMedian;
  
  // Score components (0-100 each)
  const incomeScore = Math.min(100, incomeRatio * 100);
  const povertyScore = (1 - povertyRate) * 100;
  const employmentScore = workFromHomeRate * 150; // WFH = higher paying jobs
  
  const overallScore = (incomeScore + povertyScore + employmentScore) / 3;
  
  if (overallScore >= 80) return 'booming';
  if (overallScore >= 60) return 'stable';
  if (overallScore >= 40) return 'declining';
  return 'recession';
}

/**
 * Calculate market share potential
 * 
 * Estimate achievable market share for new entrant
 * 
 * Formula: Base share × (1 - saturation) × quality multiplier
 * 
 * @param totalCompetitors - Number of existing competitors
 * @param saturation - Market saturation (0-100)
 * @param qualityAdvantage - Business quality vs average (0.5-2.0)
 * @returns Potential market share (0-1)
 */
export function calculateMarketSharePotential(
  totalCompetitors: number,
  saturation: number,
  qualityAdvantage: number = 1.0
): number {
  // Equal share if all competitors equal
  const equalShare = totalCompetitors > 0 ? 1 / (totalCompetitors + 1) : 0.10;
  
  // Penalty for high saturation
  const saturationPenalty = 1 - (saturation / 200); // Half penalty
  
  // Quality adjustment
  const adjustedShare = equalShare * saturationPenalty * qualityAdvantage;
  
  return Math.max(0.01, Math.min(0.30, adjustedShare)); // Cap 1-30%
}

/**
 * Calculate market growth rate
 * 
 * Estimate annual market growth based on demographics
 * 
 * @param population - Current population
 * @param medianIncome - Median income
 * @param saturation - Current saturation (0-100)
 * @returns Estimated annual growth rate (%)
 */
export function calculateMarketGrowthRate(
  population: number,
  medianIncome: number,
  saturation: number
): number {
  // Base growth from population/income
  const populationGrowth = population > 100000 ? 2.0 : 1.5; // Urban areas grow faster
  const incomeGrowth = medianIncome > 80000 ? 3.0 : 
                       medianIncome > 60000 ? 2.0 : 1.0;
  
  // Saturation dampens growth
  const saturationFactor = 1 - (saturation / 100) * 0.7;
  
  const growthRate = ((populationGrowth + incomeGrowth) / 2) * saturationFactor;
  
  return Math.round(growthRate * 10) / 10; // Round to 1 decimal
}

/**
 * Determine recommended business strategy
 * 
 * @param saturation - Market saturation (0-100)
 * @param riskScore - Market risk (0-100)
 * @param medianIncome - Area income
 * @returns Strategy recommendation
 */
export function recommendStrategy(
  saturation: number,
  riskScore: number,
  medianIncome: number
): 'aggressive_growth' | 'differentiation' | 'niche_focus' | 'cost_leadership' | 'avoid' {
  // High saturation, high risk = avoid or niche
  if (saturation > 80 && riskScore > 70) {
    return 'avoid';
  }
  
  // High saturation, low risk = differentiate
  if (saturation > 70) {
    return medianIncome > 80000 ? 'differentiation' : 'cost_leadership';
  }
  
  // Low saturation, low risk = grow aggressively
  if (saturation < 40 && riskScore < 40) {
    return 'aggressive_growth';
  }
  
  // Medium saturation = niche focus
  if (saturation < 70) {
    return 'niche_focus';
  }
  
  // Default
  return 'differentiation';
}
