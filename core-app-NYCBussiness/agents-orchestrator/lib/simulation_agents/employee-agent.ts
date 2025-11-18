/**
 * 👥 EMPLOYEE PERFORMANCE AGENT
 * 
 * Rol: Calculează performanța echipei (PURE MATH, no LLM)
 * Model: NONE (doar calcule TypeScript)
 * Execution: PHASE 3 (preliminary) + PHASE 4 (recalc cu customers real)
 * Timp estimat: ~0.1s
 * 
 * ENHANCED with Turnover & Retention Models:
 * - Turnover rate calculation (morale-based)
 * - Replacement cost formulas (1.5x-2x salary)
 * - Productivity loss from departures
 * - Training amortization
 * 
 * @module employee-agent
 * @author NYC Business Simulator
 * @version 2.0.0
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  calculateTurnoverRate,
  calculateExpectedDepartures,
  calculateTurnoverImpact,
  calculateProductivityLoss,
  calculateEngagementRevenueMultiplier,
} from './employee-math';

/**
 * Input interface pentru Employee Agent
 */
export interface EmployeeInput {
  /** Numărul total de angajați */
  num_employees: number;
  
  /** Salariul lunar per angajat (în USD) */
  salary_per_employee: number;
  
  /** Numărul total de clienți deserviți */
  customers_served: number;
  
  /** Venitul median din zona (din Census data) */
  market_median_income: number;
}

/**
 * Output interface pentru Employee Agent
 */
export interface EmployeeResult {
  /** Numărul total de angajați */
  total_employees: number;
  
  /** Costul total cu salariile (lunar) */
  total_salaries: number;
  
  /** Scor de productivitate (0-100) */
  productivity_score: number;
  
  /** Scor de moral (0-100) */
  morale: number;
  
  /** Flag care indică dacă echipa e suprasolicitată */
  overworked: boolean;
  
  /** Turnover metrics (ENHANCED) */
  turnover?: {
    annual_turnover_rate: number; // % (0-100)
    expected_departures_this_month: number;
    replacement_cost_per_employee: number;
    total_turnover_cost: number;
    productivity_loss_multiplier: number; // 0-1
    engagement_revenue_multiplier: number; // 0.8-1.2
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ECONOMIC CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Constante economice pentru calculele de performanță
 */
const ECONOMIC_CONSTANTS = {
  /** Numărul ideal de clienți per angajat per zi */
  CUSTOMERS_PER_EMPLOYEE_PER_DAY: 75,
  
  /** Numărul de zile lucrătoare într-o lună */
  WORKING_DAYS_PER_MONTH: 30,
  
  /** Threshold pentru suprasolicitare (multiplicator) */
  OVERWORK_THRESHOLD: 1.2,
  
  /** Threshold pentru sub-utilizare (multiplicator) */
  UNDERWORK_THRESHOLD: 0.8,
  
  /** Ponderea salariului în calculul moralului */
  SALARY_MORALE_WEIGHT: 0.6,
  
  /** Ponderea workload-ului în calculul moralului */
  WORKLOAD_MORALE_WEIGHT: 0.4,
  
  /** Factorul de normalizare pentru fairness salarial */
  SALARY_FAIRNESS_FACTOR: 80,
  
  /** Scor moral pentru workload echilibrat */
  BALANCED_WORKLOAD_MORALE: 95,
  
  /** Scor moral pentru workload scăzut */
  LOW_WORKLOAD_MORALE: 90,
  
  /** Scor moral pentru suprasolicitare */
  OVERWORKED_MORALE: 50
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE CALCULATION FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculează load-ul ideal de clienți pe lună
 * 
 * Formula: customers_per_employee_per_day × working_days
 * 
 * @returns Numărul ideal de clienți per angajat per lună
 */
function calculateIdealMonthlyLoad(): number {
  return (
    ECONOMIC_CONSTANTS.CUSTOMERS_PER_EMPLOYEE_PER_DAY *
    ECONOMIC_CONSTANTS.WORKING_DAYS_PER_MONTH
  );
}

/**
 * Calculează scorul de productivitate bazat pe workload
 * 
 * Formula: (customers_per_employee / ideal_load) × 100
 * Cap: maxim 100
 * 
 * @param customersPerEmployee - Clienți per angajat
 * @param idealLoad - Load-ul ideal de clienți
 * @returns Scor de productivitate (0-100)
 */
function calculateProductivityScore(
  customersPerEmployee: number,
  idealLoad: number
): number {
  if (idealLoad === 0) return 0;
  
  const rawScore = (customersPerEmployee / idealLoad) * 100;
  
  // Cap la 100 (nu poate depăși productivitatea maximă)
  return Math.min(100, rawScore);
}

/**
 * Calculează componenta de moral bazată pe salariu
 * 
 * Formula:
 * 1. salary_fairness = salary_per_employee / (market_median_income / 12)
 * 2. salary_morale = min(100, salary_fairness × 80)
 * 
 * @param salaryPerEmployee - Salariul lunar per angajat
 * @param marketMedianIncome - Venitul median anual din zonă
 * @returns Scor de moral bazat pe salariu (0-100)
 */
function calculateSalaryMorale(
  salaryPerEmployee: number,
  marketMedianIncome: number
): number {
  // Convertim venitul median anual în lunar
  const marketMedianMonthlyIncome = marketMedianIncome / 12;
  
  // Evităm diviziune la 0
  if (marketMedianMonthlyIncome === 0) return 50;
  
  // Calculăm fairness-ul salarial
  const salaryFairness = salaryPerEmployee / marketMedianMonthlyIncome;
  
  // Convertim în scor de moral (cap la 100)
  const salaryMorale = Math.min(
    100,
    salaryFairness * ECONOMIC_CONSTANTS.SALARY_FAIRNESS_FACTOR
  );
  
  return salaryMorale;
}

/**
 * Calculează componenta de moral bazată pe workload
 * 
 * Logică:
 * - workload_ratio < 0.8  → Sub-utilizați (boring)    → 90
 * - workload_ratio > 1.2  → Suprasolicitați (stressed) → 50
 * - altfel                → Echilibrat (optimal)      → 95
 * 
 * @param workloadRatio - Raportul între workload real și ideal
 * @returns Scor de moral bazat pe workload (50-95)
 */
function calculateWorkloadMorale(workloadRatio: number): number {
  if (workloadRatio < ECONOMIC_CONSTANTS.UNDERWORK_THRESHOLD) {
    // Sub-utilizați - angajații se plictisesc
    return ECONOMIC_CONSTANTS.LOW_WORKLOAD_MORALE;
  } else if (workloadRatio > ECONOMIC_CONSTANTS.OVERWORK_THRESHOLD) {
    // Suprasolicitați - angajații sunt stresați
    return ECONOMIC_CONSTANTS.OVERWORKED_MORALE;
  } else {
    // Echilibrat - angajații sunt mulțumiți
    return ECONOMIC_CONSTANTS.BALANCED_WORKLOAD_MORALE;
  }
}

/**
 * Calculează scorul final de moral
 * 
 * Formula: salary_morale × 0.6 + workload_morale × 0.4
 * 
 * Logică: Salariul are ponderea mai mare (60%) vs workload (40%)
 * 
 * @param salaryMorale - Scor moral din salariu
 * @param workloadMorale - Scor moral din workload
 * @returns Scor final de moral (0-100)
 */
function calculateFinalMorale(
  salaryMorale: number,
  workloadMorale: number
): number {
  const finalMorale =
    salaryMorale * ECONOMIC_CONSTANTS.SALARY_MORALE_WEIGHT +
    workloadMorale * ECONOMIC_CONSTANTS.WORKLOAD_MORALE_WEIGHT;
  
  return Math.round(finalMorale);
}

/**
 * Determină dacă echipa este suprasolicitată
 * 
 * @param workloadRatio - Raportul între workload real și ideal
 * @returns true dacă echipa e suprasolicitată
 */
function isOverworked(workloadRatio: number): boolean {
  return workloadRatio > ECONOMIC_CONSTANTS.OVERWORK_THRESHOLD;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN AGENT FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * **EMPLOYEE PERFORMANCE AGENT**
 * 
 * Calculează metricile de performanță ale echipei (PURE MATH, no LLM).
 * 
 * ### Metrici calculate:
 * 1. **Productivity Score** (0-100): Cât de eficienți sunt angajații
 * 2. **Morale** (0-100): Cât de mulțumiți sunt angajații
 * 3. **Overworked** (boolean): Dacă echipa e suprasolicitată
 * 
 * ### Formule utilizate:
 * 
 * ```
 * // 1. Productivity
 * ideal_load = 75 customers/day × 30 days = 2250 customers/month
 * customers_per_employee = customers_served / num_employees
 * productivity_score = min(100, (customers_per_employee / ideal_load) × 100)
 * 
 * // 2. Morale
 * salary_fairness = salary_per_employee / (market_median_income / 12)
 * salary_morale = min(100, salary_fairness × 80)
 * 
 * workload_ratio = customers_per_employee / ideal_load
 * workload_morale = {
 *   90 if workload_ratio < 0.8  (underworked)
 *   50 if workload_ratio > 1.2  (overworked)
 *   95 otherwise                 (balanced)
 * }
 * 
 * morale = salary_morale × 0.6 + workload_morale × 0.4
 * 
 * // 3. Overworked
 * overworked = workload_ratio > 1.2
 * ```
 * 
 * @param input - Input parameters
 * @returns Rezultatele calculelor de performanță
 * 
 * @example
 * ```typescript
 * const result = calculateEmployeeMetrics({
 *   num_employees: 4,
 *   salary_per_employee: 2800,
 *   customers_served: 9200,
 *   market_median_income: 65000
 * });
 * 
 * console.log(result);
 * // {
 * //   total_employees: 4,
 * //   total_salaries: 11200,
 * //   productivity_score: 102, // capped at 100
 * //   morale: 68,
 * //   overworked: true
 * // }
 * ```
 */
export function calculateEmployeeMetrics(
  input: EmployeeInput
): EmployeeResult {
  const {
    num_employees,
    salary_per_employee,
    customers_served,
    market_median_income
  } = input;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1: Calculate workload per employee
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const customersPerEmployee =
    num_employees > 0 ? customers_served / num_employees : 0;
  
  const idealLoad = calculateIdealMonthlyLoad();
  
  const workloadRatio =
    idealLoad > 0 ? customersPerEmployee / idealLoad : 0;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2: Calculate productivity score
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const productivityScore = calculateProductivityScore(
    customersPerEmployee,
    idealLoad
  );
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 3: Calculate morale components
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const salaryMorale = calculateSalaryMorale(
    salary_per_employee,
    market_median_income
  );
  
  const workloadMorale = calculateWorkloadMorale(workloadRatio);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 4: Calculate final morale
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const morale = calculateFinalMorale(salaryMorale, workloadMorale);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 5: Determine overworked status
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const overworked = isOverworked(workloadRatio);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 6: Calculate total salaries
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const totalSalaries = num_employees * salary_per_employee;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 7: Calculate turnover metrics (ENHANCED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const annualTurnoverRate = calculateTurnoverRate(morale) * 100; // Convert to %
  const expectedDepartures = calculateExpectedDepartures(num_employees, morale);
  const annualSalary = salary_per_employee * 12;
  
  const turnoverImpact = calculateTurnoverImpact(expectedDepartures, annualSalary);
  const productivityLoss = calculateProductivityLoss(expectedDepartures, num_employees);
  const engagementMultiplier = calculateEngagementRevenueMultiplier(morale);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RETURN: Final result
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  return {
    total_employees: num_employees,
    total_salaries: totalSalaries,
    productivity_score: Math.round(productivityScore * (1 - productivityLoss)), // Apply turnover loss
    morale,
    overworked,
    turnover: {
      annual_turnover_rate: Math.round(annualTurnoverRate * 10) / 10,
      expected_departures_this_month: expectedDepartures,
      replacement_cost_per_employee: turnoverImpact.costPerDeparture,
      total_turnover_cost: turnoverImpact.totalCost,
      productivity_loss_multiplier: Math.round(productivityLoss * 100) / 100,
      engagement_revenue_multiplier: Math.round(engagementMultiplier * 100) / 100,
    },
  };
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY EXPORTS (pentru testing și debugging)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Exportăm constantele pentru testing
 */
export { ECONOMIC_CONSTANTS };

/**
 * Exportăm funcțiile helper pentru testing
 */
export {
  calculateIdealMonthlyLoad,
  calculateProductivityScore,
  calculateSalaryMorale,
  calculateWorkloadMorale,
  calculateFinalMorale,
  isOverworked
};
