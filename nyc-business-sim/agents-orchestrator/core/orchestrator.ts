/**
 * Master Orchestrator
 * 
 * Coordinates all agents in the correct sequence with parallelization.
 * Implements the 6-phase execution flow from ARCHITECTURE.md
 * 
 * PHASE 0: RAG Retrieval (historical context)
 * PHASE 1: Context Setup (Market Context - sequential)
 * PHASE 2: External Analysis (Events + Trends - PARALLEL)
 * PHASE 3: Market Dynamics (Supplier + Competition + Employee - PARALLEL)
 * PHASE 4: Customer Simulation (sequential, needs all inputs)
 * PHASE 5: Reporting (Financial + Report - PARALLEL)
 * PHASE 6: RAG Storage (save this month's state)
 */

import type { DetailedCensusData, SurvivalData } from '../core/types';
import { analyzeMarketContext } from '../lib/simulation_agents/market-context-agent';
import { generateBusinessEvent } from '../lib/simulation_agents/events-agent';
import { analyzeTrendsForBusiness } from '../lib/simulation_agents/trends-agent';
import { analyzeSupplierDynamics } from '../lib/simulation_agents/supplier-agent';
import { analyzeCompetition } from '../lib/simulation_agents/competition-agent';
import { calculateEmployeeMetrics, type EmployeeInput } from '../lib/simulation_agents/employee-agent';
import { simulateCustomerBehavior } from '../lib/simulation_agents/customer-behavior-agent';
import { analyzeFinancialPerformance } from '../lib/simulation_agents/financial-agent';
import { generateMonthlyReport } from '../lib/simulation_agents/report-agent';
import {
  retrieveHistoricalContext,
  storeSimulationState,
  type SimulationStateSummary,
} from '../lib/services/rag-service';
import { calculateMonthlyRent } from '../core/constants';

// ============================================
// INPUT/OUTPUT TYPES
// ============================================

export interface SimulationInput {
  // Business details
  userId: string;
  businessId: string;
  businessType: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    neighborhood: string;
    county: string;
  };
  
  // External data
  censusData: DetailedCensusData;
  survivalData: SurvivalData | null;
  trendsDataFromBackend: any; // Google Trends from Python backend
  
  // Current state
  currentMonth: number;
  currentYear: number;
  previousMonthState: {
    revenue: number;
    profit: number;
    customers: number;
    cashBalance: number;
  };
  
  // Player decisions
  playerDecisions: {
    pricing_strategy: 'premium' | 'competitive' | 'discount';
    marketing_spend: number;
    quality_level: 'basic' | 'standard' | 'premium';
    target_employee_count: number;
    avg_hourly_wage: number;
  };
}

export interface SimulationOutput {
  // Month identifier
  month: number;
  year: number;
  
  // All agent outputs
  marketContext: any;
  eventsData: any;
  trendsData: any;
  supplierData: any;
  competitionData: any;
  employeeData: any;
  customerData: any;
  financialData: any;
  report: any;
  
  // Performance metrics
  executionTime: number; // milliseconds
  phase_times: Record<string, number>;
}

// ============================================
// ORCHESTRATOR MAIN FUNCTION
// ============================================

/**
 * Run complete monthly simulation
 */
export async function runMonthlySimulation(input: SimulationInput): Promise<SimulationOutput> {
  const startTime = Date.now();
  const phaseTimes: Record<string, number> = {};
  
  console.log(`\n🎮 Starting simulation for Month ${input.currentMonth}/${input.currentYear}`);
  console.log(`   Business: ${input.businessType} in ${input.location.neighborhood}`);
  
  // ========================================
  // PHASE 0: RAG RETRIEVAL
  // ========================================
  console.log('\n📚 PHASE 0: Retrieving historical context...');
  const phase0Start = Date.now();
  
  const historicalContext = await retrieveHistoricalContext(
    input.userId,
    input.businessId,
    input.currentMonth,
    input.currentYear,
    3 // last 3 months
  );
  
  phaseTimes.phase0_rag_retrieval = Date.now() - phase0Start;
  console.log(`✅ Phase 0 complete (${phaseTimes.phase0_rag_retrieval}ms)`);
  
  // ========================================
  // PHASE 1: CONTEXT SETUP (Sequential)
  // ========================================
  console.log('\n🏗️ PHASE 1: Setting up market context...');
  const phase1Start = Date.now();
  
  const marketContext = await analyzeMarketContext(
    input.businessType,
    input.location,
    input.censusData,
    input.survivalData,
    input.currentMonth,
    input.currentYear
  );
  
  phaseTimes.phase1_market_context = Date.now() - phase1Start;
  console.log(`✅ Phase 1 complete (${phaseTimes.phase1_market_context}ms)`);
  
  // ========================================
  // PHASE 2: EXTERNAL ANALYSIS (PARALLEL)
  // ========================================
  console.log('\n🌍 PHASE 2: Analyzing external factors (parallel)...');
  const phase2Start = Date.now();
  
  const [eventsData, trendsData] = await Promise.all([
    generateBusinessEvent(
      input.businessType,
      input.location,
      input.censusData,
      input.currentMonth,
      input.currentYear
    ),
    analyzeTrendsForBusiness(
      input.businessType,
      input.location,
      input.trendsDataFromBackend,
      input.currentMonth,
      input.currentYear
    ),
  ]);
  
  phaseTimes.phase2_external = Date.now() - phase2Start;
  console.log(`✅ Phase 2 complete (${phaseTimes.phase2_external}ms)`);
  
  // ========================================
  // PHASE 3: MARKET DYNAMICS (PARALLEL)
  // ========================================
  console.log('\n💼 PHASE 3: Analyzing market dynamics (parallel)...');
  const phase3Start = Date.now();
  
  // For supplier analysis, we need an estimate of current revenue
  const estimatedRevenue = input.previousMonthState.revenue || 50000; // Default
  
  // Calculate monthly rent
  const monthlyRent = calculateMonthlyRent(input.businessType, input.location.county);
  
  const [supplierData, competitionData, employeeData] = await Promise.all([
    analyzeSupplierDynamics(
      input.businessType,
      input.location,
      input.censusData,
      estimatedRevenue,
      input.currentMonth,
      input.currentYear
    ),
    analyzeCompetition(
      input.businessType,
      input.location,
      input.censusData,
      {
        industry_saturation: marketContext.industry_saturation,
        economic_climate: marketContext.economic_climate,
      },
      input.currentMonth,
      input.currentYear
    ),
    // Employee agent (pure math, fast)
    Promise.resolve(
      calculateEmployeeMetrics({
        num_employees: input.playerDecisions.target_employee_count,
        salary_per_employee: input.playerDecisions.avg_hourly_wage * 160, // Monthly salary
        customers_served: input.previousMonthState.customers || 1000,
        market_median_income: Number(input.censusData.demographics_detailed.B19013_001E?.value) || 60000,
      })
    ),
  ]);
  
  phaseTimes.phase3_market_dynamics = Date.now() - phase3Start;
  console.log(`✅ Phase 3 complete (${phaseTimes.phase3_market_dynamics}ms)`);
  
  // ========================================
  // PHASE 4: CUSTOMER SIMULATION (Sequential)
  // ========================================
  console.log('\n👥 PHASE 4: Simulating customer behavior...');
  const phase4Start = Date.now();
  
  const customerData = await simulateCustomerBehavior(
    input.businessType,
    input.location,
    input.censusData,
    {
      economic_climate: marketContext.economic_climate,
      industry_saturation: marketContext.industry_saturation,
      market_demand_score: 75, // From market context (TODO: add to schema)
    },
    {
      total_competitors: competitionData.total_competitors,
      pricing_pressure: competitionData.pricing_pressure,
      market_space: competitionData.market_space,
    },
    {
      impact_clienti_lunar: eventsData.impact_clienti_lunar,
      relevanta_pentru_business: eventsData.relevanta_pentru_business,
    },
    {
      impact_score: trendsData.main_trend.impact_score,
      market_momentum: trendsData.market_momentum,
    },
    {
      estimated_monthly_costs: supplierData.estimated_monthly_costs,
    },
    input.playerDecisions,
    input.previousMonthState.customers || 0,
    input.currentMonth,
    input.currentYear
  );
  
  phaseTimes.phase4_customers = Date.now() - phase4Start;
  console.log(`✅ Phase 4 complete (${phaseTimes.phase4_customers}ms)`);
  
  // ========================================
  // PHASE 5: REPORTING (PARALLEL)
  // ========================================
  console.log('\n📊 PHASE 5: Generating financial analysis and report (parallel)...');
  const phase5Start = Date.now();
  
  // Calculate total revenue from customer data
  // Use weighted average from customer segments
  const avgSpend = customerData.customer_segments.reduce((sum: number, seg: any) => {
    return sum + (seg.avg_spend * seg.size);
  }, 0) / customerData.total_active_customers;
  
  const totalRevenue = customerData.total_active_customers * avgSpend * 4; // Assume 4 visits/month avg
  
  const [financialData, report] = await Promise.all([
    // Financial agent (pure math, fast)
    Promise.resolve(
      analyzeFinancialPerformance({
        totalRevenue,
        laborCost: employeeData.total_salaries,
        inventoryCost: supplierData.estimated_monthly_costs.inventory,
        utilitiesCost: supplierData.estimated_monthly_costs.utilities,
        rentCost: monthlyRent,
        marketingSpend: input.playerDecisions.marketing_spend,
        otherOperatingCosts: 500, // Insurance, misc
        previousCashBalance: input.previousMonthState.cashBalance,
        previousRevenue: input.previousMonthState.revenue,
        previousProfit: input.previousMonthState.profit,
        currentMonth: input.currentMonth,
      })
    ),
    // Report agent (LLM-powered, slow)
    generateMonthlyReport({
      businessType: input.businessType,
      location: input.location,
      currentMonth: input.currentMonth,
      currentYear: input.currentYear,
      marketContext,
      eventsData,
      trendsData,
      supplierData,
      competitionData,
      customerData,
      employeeData: {
        total_employees: employeeData.total_employees,
        total_labor_cost: employeeData.total_salaries,
        productivity_score: employeeData.productivity_score,
      },
      financialData: {
        profit_loss: {
          revenue: totalRevenue,
          total_costs: 0, // Will be calculated
          gross_profit: 0,
          operating_expenses: 0,
          net_profit: 0,
          profit_margin: 0,
        },
        cost_breakdown: {
          labor: employeeData.total_labor_cost,
          inventory: supplierData.estimated_monthly_costs.inventory,
          rent: monthlyRent,
          utilities: supplierData.estimated_monthly_costs.utilities,
          marketing: input.playerDecisions.marketing_spend,
          other: 500,
        },
        cash_flow: {
          opening_balance: input.previousMonthState.cashBalance,
          cash_in: totalRevenue,
          cash_out: 0,
          closing_balance: 0,
          burn_rate: 0,
        },
        health_metrics: {
          revenue_growth_rate: 0,
          profit_growth_rate: 0,
          cash_runway_months: 12,
          financial_health_score: 70,
        },
      },
      historicalContext,
    }),
  ]);
  
  phaseTimes.phase5_reporting = Date.now() - phase5Start;
  console.log(`✅ Phase 5 complete (${phaseTimes.phase5_reporting}ms)`);
  
  // ========================================
  // PHASE 6: RAG STORAGE
  // ========================================
  console.log('\n💾 PHASE 6: Storing simulation state...');
  const phase6Start = Date.now();
  
  const stateSummary: SimulationStateSummary = {
    month: input.currentMonth,
    year: input.currentYear,
    revenue: financialData.profit_loss.revenue,
    profit: financialData.profit_loss.net_profit,
    customers_served: customerData.total_active_customers,
    employee_count: input.playerDecisions.target_employee_count,
    market_demand_score: 75,
    competition_intensity: competitionData.total_competitors,
    major_events: [eventsData.nume_eveniment],
    trends_followed: [trendsData.main_trend.trend_name],
    decisions: {
      pricing_strategy: input.playerDecisions.pricing_strategy,
      marketing_spend: input.playerDecisions.marketing_spend,
      hiring_decisions: `${input.playerDecisions.target_employee_count} employees`,
    },
  };
  
  await storeSimulationState(
    input.userId,
    input.businessId,
    input.currentMonth,
    input.currentYear,
    stateSummary
  );
  
  phaseTimes.phase6_rag_storage = Date.now() - phase6Start;
  console.log(`✅ Phase 6 complete (${phaseTimes.phase6_rag_storage}ms)`);
  
  // ========================================
  // FINAL OUTPUT
  // ========================================
  const totalTime = Date.now() - startTime;
  console.log(`\n✨ Simulation complete! Total time: ${totalTime}ms`);
  console.log(`   Target: <10,000ms | Actual: ${totalTime}ms | ${totalTime < 10000 ? '✅ PASS' : '⚠️ SLOW'}`);
  
  return {
    month: input.currentMonth,
    year: input.currentYear,
    marketContext,
    eventsData,
    trendsData,
    supplierData,
    competitionData,
    employeeData,
    customerData,
    financialData,
    report,
    executionTime: totalTime,
    phase_times: phaseTimes,
  };
}
