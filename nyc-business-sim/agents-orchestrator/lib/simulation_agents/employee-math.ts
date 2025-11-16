/**
 * Employee Agent - Turnover & Retention Mathematical Models
 * 
 * Pure mathematical functions for employee turnover, replacement costs, and retention.
 * NO LLM calls - deterministic HR calculations.
 * 
 * Key Models:
 * - Turnover rate formula (morale-based)
 * - Replacement cost calculation (1.5x-2x annual salary)
 * - Retention impact on productivity
 * - Training cost amortization
 * 
 * Sources:
 * - SHRM (Society for Human Resource Management) benchmarks
 * - Gallup workplace studies
 * - Small business HR research
 */

/**
 * Calculate employee turnover rate
 * 
 * Formula: Turnover Rate = (70 - morale) × 0.015
 * 
 * Logic:
 * - Low morale (30) → 60% annual turnover (5% monthly)
 * - Medium morale (50) → 30% annual turnover (2.5% monthly)
 * - High morale (70+) → 0% turnover (stable workforce)
 * 
 * @param morale - Employee morale score (0-100)
 * @returns Annual turnover rate (0-1)
 */
export function calculateTurnoverRate(morale: number): number {
  // Clamp morale to 0-100
  const clampedMorale = Math.max(0, Math.min(100, morale));
  
  // Turnover increases as morale decreases below 70
  const baseTurnover = Math.max(0, (70 - clampedMorale) * 0.015);
  
  return Math.min(1.0, baseTurnover); // Cap at 100%
}

/**
 * Calculate expected employee departures this month
 * 
 * @param totalEmployees - Current headcount
 * @param morale - Employee morale (0-100)
 * @returns Expected number of employees leaving
 */
export function calculateExpectedDepartures(
  totalEmployees: number,
  morale: number
): number {
  const annualTurnoverRate = calculateTurnoverRate(morale);
  const monthlyTurnoverRate = annualTurnoverRate / 12;
  
  const expectedDepartures = totalEmployees * monthlyTurnoverRate;
  
  // Round to nearest integer (can't have 0.3 employees leave)
  return Math.round(expectedDepartures);
}

/**
 * Calculate replacement cost per employee
 * 
 * Formula: Cost = (Recruiting + Training + Lost Productivity) × Annual Salary
 * 
 * Industry benchmarks:
 * - Entry-level: 0.5x-1.0x annual salary
 * - Mid-level: 1.0x-1.5x annual salary
 * - Senior: 1.5x-2.5x annual salary
 * 
 * For small business average: 1.5x-2.0x
 * 
 * Components:
 * - Recruiting: 0.3x salary (job postings, interviews, onboarding)
 * - Training: 0.5x salary (learning curve, reduced productivity)
 * - Lost productivity: 0.7x salary (vacancy period, knowledge loss)
 * 
 * @param annualSalary - Employee annual salary
 * @param seniorityLevel - 'entry' | 'mid' | 'senior'
 * @returns Total replacement cost
 */
export function calculateReplacementCost(
  annualSalary: number,
  seniorityLevel: 'entry' | 'mid' | 'senior' = 'mid'
): number {
  const multipliers = {
    entry: 1.0,
    mid: 1.5,
    senior: 2.0,
  };
  
  const multiplier = multipliers[seniorityLevel];
  
  return Math.round(annualSalary * multiplier);
}

/**
 * Calculate total turnover impact (financial cost)
 * 
 * @param departures - Number of employees leaving
 * @param avgAnnualSalary - Average annual salary
 * @param seniorityMix - Distribution of seniority levels
 * @returns Total financial impact
 */
export function calculateTurnoverImpact(
  departures: number,
  avgAnnualSalary: number,
  seniorityMix: {
    entry: number; // Percentage 0-1
    mid: number;
    senior: number;
  } = { entry: 0.4, mid: 0.5, senior: 0.1 }
): {
  totalCost: number;
  costBreakdown: {
    recruiting: number;
    training: number;
    lostProductivity: number;
  };
  costPerDeparture: number;
} {
  // Calculate weighted replacement cost
  const entryReplacementCost = calculateReplacementCost(avgAnnualSalary, 'entry');
  const midReplacementCost = calculateReplacementCost(avgAnnualSalary, 'mid');
  const seniorReplacementCost = calculateReplacementCost(avgAnnualSalary, 'senior');
  
  const avgReplacementCost =
    entryReplacementCost * seniorityMix.entry +
    midReplacementCost * seniorityMix.mid +
    seniorReplacementCost * seniorityMix.senior;
  
  const totalCost = departures * avgReplacementCost;
  
  // Break down costs (approximate percentages)
  const recruiting = totalCost * 0.3;
  const training = totalCost * 0.5;
  const lostProductivity = totalCost * 0.2;
  
  return {
    totalCost: Math.round(totalCost),
    costBreakdown: {
      recruiting: Math.round(recruiting),
      training: Math.round(training),
      lostProductivity: Math.round(lostProductivity),
    },
    costPerDeparture: Math.round(avgReplacementCost),
  };
}

/**
 * Calculate retention rate
 * 
 * @param morale - Employee morale (0-100)
 * @returns Retention rate (0-1)
 */
export function calculateRetentionRate(morale: number): number {
  const turnoverRate = calculateTurnoverRate(morale);
  return 1 - turnoverRate;
}

/**
 * Calculate productivity loss from turnover
 * 
 * When employees leave:
 * - Remaining employees cover workload (overtime, stress)
 * - New hires have learning curve (3-6 months to full productivity)
 * - Knowledge is lost
 * 
 * Formula: Loss = Departures × (3 months × 0.5 productivity)
 * 
 * @param departures - Number of employees leaving
 * @param totalEmployees - Total headcount
 * @returns Productivity loss multiplier (0-1)
 */
export function calculateProductivityLoss(
  departures: number,
  totalEmployees: number
): number {
  if (totalEmployees === 0) return 0;
  
  // Each departure causes 3 months of 50% reduced productivity
  const monthsOfReducedProductivity = 3;
  const productivityReduction = 0.5;
  
  // Calculate impact as percentage of total workforce capacity
  const impactPerDeparture = (monthsOfReducedProductivity * productivityReduction) / 12; // Annual impact
  const monthlyImpact = impactPerDeparture / 12;
  
  const totalImpact = (departures / totalEmployees) * monthlyImpact;
  
  return Math.min(0.5, totalImpact); // Cap at 50% productivity loss
}

/**
 * Calculate training investment amortization
 * 
 * Training costs are amortized over expected tenure.
 * Higher turnover = faster amortization = higher monthly cost.
 * 
 * @param trainingCostPerEmployee - One-time training cost
 * @param morale - Employee morale (affects tenure)
 * @returns Monthly amortized training cost
 */
export function calculateTrainingAmortization(
  trainingCostPerEmployee: number,
  morale: number
): number {
  const retentionRate = calculateRetentionRate(morale);
  
  // Expected tenure in months (1 / annual turnover rate / 12)
  const annualTurnoverRate = 1 - retentionRate;
  const expectedTenureMonths = annualTurnoverRate > 0
    ? 12 / annualTurnoverRate
    : 60; // Cap at 5 years
  
  // Amortize training cost over expected tenure
  const monthlyAmortization = trainingCostPerEmployee / expectedTenureMonths;
  
  return Math.round(monthlyAmortization * 100) / 100;
}

/**
 * Calculate hiring needs
 * 
 * Based on:
 * - Current headcount
 * - Expected departures
 * - Growth target
 * 
 * @param currentEmployees - Current headcount
 * @param expectedDepartures - Predicted departures this month
 * @param growthTarget - Additional hires needed for expansion
 * @returns Total hiring need
 */
export function calculateHiringNeeds(
  currentEmployees: number,
  expectedDepartures: number,
  growthTarget: number = 0
): {
  replacementHires: number;
  growthHires: number;
  totalHires: number;
} {
  return {
    replacementHires: expectedDepartures,
    growthHires: growthTarget,
    totalHires: expectedDepartures + growthTarget,
  };
}

/**
 * Calculate employee engagement impact on revenue
 * 
 * Gallup research: Highly engaged teams show 21% greater profitability
 * 
 * @param morale - Employee morale (proxy for engagement)
 * @returns Revenue multiplier (0.8-1.2)
 */
export function calculateEngagementRevenueMultiplier(morale: number): number {
  // Morale 80+ → 1.2x revenue (high engagement)
  // Morale 50 → 1.0x revenue (neutral)
  // Morale 20 → 0.8x revenue (disengaged)
  
  const baseline = 1.0;
  const maxBoost = 0.2;
  const maxPenalty = -0.2;
  
  if (morale >= 50) {
    // Above average: linear boost
    const boost = ((morale - 50) / 50) * maxBoost;
    return baseline + boost;
  } else {
    // Below average: linear penalty
    const penalty = ((50 - morale) / 50) * maxPenalty;
    return baseline + penalty;
  }
}

/**
 * Calculate optimal team size
 * 
 * Based on expected customer volume and service capacity
 * 
 * @param customersPerMonth - Expected monthly customers
 * @param customersPerEmployeePerDay - Service capacity
 * @param workingDaysPerMonth - Working days
 * @returns Optimal headcount
 */
export function calculateOptimalTeamSize(
  customersPerMonth: number,
  customersPerEmployeePerDay: number = 75,
  workingDaysPerMonth: number = 30
): number {
  const totalCapacityNeeded = customersPerMonth;
  const capacityPerEmployee = customersPerEmployeePerDay * workingDaysPerMonth;
  
  const optimalSize = totalCapacityNeeded / capacityPerEmployee;
  
  // Round up to ensure capacity (can't have 2.3 employees)
  return Math.ceil(optimalSize);
}
