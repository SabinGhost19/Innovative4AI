/**
 * Full Month Simulation API Route
 * Runs complete simulation with all agents and returns all outputs
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessEvent } from '@/lib/simulation_agents/events-agent';
import { analyzeTrendsForBusiness } from '@/lib/simulation_agents/trends-agent';
import { analyzeMarketContext } from '@/lib/simulation_agents/market-context-agent';
import { analyzeSupplierDynamics } from '@/lib/simulation_agents/supplier-agent';
import { analyzeCompetition } from '@/lib/simulation_agents/competition-agent';
import { calculateEmployeeMetrics } from '@/lib/simulation_agents/employee-agent';
import { simulateCustomerBehavior } from '@/lib/simulation_agents/customer-behavior-agent';
import { analyzeFinancialPerformance } from '@/lib/simulation_agents/financial-agent';
import { calculateMonthlyRent } from '@/core/constants';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

/**
 * Fetch previous month state from backend
 */
async function fetchPreviousState(
  sessionId: string | undefined,
  currentMonth: number,
  currentYear: number
): Promise<any> {
  if (!sessionId) {
    console.log('⚠️ No session ID provided, using default state');
    return null;
  }

  try {
    const response = await fetch(
      `${BACKEND_API_URL}/api/simulation/session/${sessionId}/previous-state?month=${currentMonth}&year=${currentYear}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      console.log(`⚠️ Failed to fetch previous state: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.state) {
      console.log('✅ Previous state loaded from database');
      return data.state;
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching previous state:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    console.log('🎮 Full simulation request received');
    
    // Extract parameters
    const { 
      businessType, 
      location, 
      censusData, 
      trendsData,
      survivalData,
      currentMonth, 
      currentYear,
      playerDecisions,
      previousMonthState,
      sessionId, // NEW: Session ID to fetch previous state
      initialBudget, // NEW: For fallback
    } = body;
    
    // Validate required fields
    if (!businessType || !location || !censusData || !currentMonth || !currentYear) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 });
    }

    // Set defaults with enhanced player decisions
    const decisions = playerDecisions || {
      pricing_strategy: 'competitive',
      product_price_modifier: 1.0,
      marketing_spend: 1000,
      quality_level: 'standard',
      target_employee_count: 3,
      avg_hourly_wage: 20,
      inventory_strategy: 'balanced',
      working_hours_per_week: 40,
    };

    // Fetch previous state from backend if we have a sessionId
    let prevState = previousMonthState;
    
    if (!prevState && sessionId) {
      const fetchedState = await fetchPreviousState(sessionId, currentMonth, currentYear);
      
      if (fetchedState) {
        prevState = {
          revenue: fetchedState.revenue || 0,
          profit: fetchedState.profit || 0,
          customers: fetchedState.customers || 0,
          cashBalance: fetchedState.cashBalance || (initialBudget || 100000),
        };
        console.log(`📊 Loaded previous state: Revenue=$${prevState.revenue}, Customers=${prevState.customers}`);
      }
    }

    // Final fallback to defaults
    if (!prevState) {
      prevState = {
        revenue: 0,
        profit: 0,
        customers: 0,
        cashBalance: initialBudget || 100000
      };
      console.log('📊 Using default initial state (first month)');
    }

    const phaseTimes: Record<string, number> = {};

    // ========================================
    // PHASE 1: Market Context (Sequential)
    // ========================================
    console.log('🏗️ PHASE 1: Market Context...');
    const phase1Start = Date.now();
    
    // Calculate months in business (assume month 1 if no previous data)
    const monthsInBusiness = prevState.revenue > 0 || prevState.customers > 0 ? currentMonth : 0;
    
    const marketContext = await analyzeMarketContext(
      businessType,
      location,
      censusData,
      survivalData || null,
      currentMonth,
      currentYear,
      // Pass historical performance for dynamic risk adjustment
      monthsInBusiness > 0 ? {
        previousRevenue: prevState.revenue,
        previousProfit: prevState.profit,
        previousCustomers: prevState.customers,
        monthsInBusiness: monthsInBusiness,
      } : undefined
    );
    
    phaseTimes.phase1_market_context = Date.now() - phase1Start;
    console.log(`✅ Phase 1 complete (${phaseTimes.phase1_market_context}ms)`);

    // ========================================
    // PHASE 2: External Analysis (PARALLEL)
    // ========================================
    console.log('🌍 PHASE 2: External Analysis (parallel)...');
    const phase2Start = Date.now();
    
    const [eventsData, trendsAnalysis] = await Promise.all([
      generateBusinessEvent(
        businessType,
        location,
        censusData,
        currentMonth,
        currentYear
      ),
      trendsData ? analyzeTrendsForBusiness(
        businessType,
        location,
        trendsData,
        currentMonth,
        currentYear
      ) : Promise.resolve(null)
    ]);
    
    phaseTimes.phase2_external = Date.now() - phase2Start;
    console.log(`✅ Phase 2 complete (${phaseTimes.phase2_external}ms)`);

    // ========================================
    // PHASE 3: Market Dynamics (PARALLEL)
    // ========================================
    console.log('💼 PHASE 3: Market Dynamics (parallel)...');
    const phase3Start = Date.now();
    
    const estimatedRevenue = prevState.revenue || 50000;
    const monthlyRent = calculateMonthlyRent(businessType, location.county || 'New York County');
    
    const [supplierData, competitionData, employeeData] = await Promise.all([
      analyzeSupplierDynamics(
        businessType,
        location,
        censusData,
        estimatedRevenue,
        currentMonth,
        currentYear,
        monthsInBusiness,
        decisions.inventory_strategy || 'balanced'
      ),
      analyzeCompetition(
        businessType,
        location,
        censusData,
        {
          industry_saturation: marketContext.industry_saturation,
          economic_climate: marketContext.economic_climate,
        },
        currentMonth,
        currentYear
      ),
      Promise.resolve(
        calculateEmployeeMetrics({
          num_employees: decisions.target_employee_count,
          salary_per_employee: decisions.avg_hourly_wage * (decisions.working_hours_per_week || 40) * 4.33, // Monthly salary
          customers_served: prevState.customers || 1000,
          market_median_income: Number(censusData.demographics_detailed.B19013_001E?.value) || 60000,
        })
      )
    ]);
    
    phaseTimes.phase3_market_dynamics = Date.now() - phase3Start;
    console.log(`✅ Phase 3 complete (${phaseTimes.phase3_market_dynamics}ms)`);

    // ========================================
    // PHASE 4: Customer Simulation (Sequential)
    // ========================================
    console.log('👥 PHASE 4: Customer Simulation...');
    const phase4Start = Date.now();
    
    const customerData = await simulateCustomerBehavior(
      businessType,
      location,
      censusData,
      {
        economic_climate: marketContext.economic_climate,
        industry_saturation: marketContext.industry_saturation,
        market_demand_score: 75,
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
      trendsAnalysis ? {
        impact_score: trendsAnalysis.main_trend.impact_score,
        market_momentum: trendsAnalysis.market_momentum,
      } : { impact_score: 0, market_momentum: 'stable' },
      {
        estimated_monthly_costs: supplierData.estimated_monthly_costs,
      },
      {
        total_employees: employeeData.total_employees,
        productivity_score: employeeData.productivity_score,
        morale: employeeData.morale,
      },
      decisions,
      prevState.customers || 0,
      currentMonth,
      currentYear
    );
    
    phaseTimes.phase4_customers = Date.now() - phase4Start;
    console.log(`✅ Phase 4 complete (${phaseTimes.phase4_customers}ms)`);

    // ========================================
    // PHASE 5: Financial Analysis
    // ========================================
    console.log('📊 PHASE 5: Financial Analysis...');
    const phase5Start = Date.now();
    
    // Calculate revenue based on business type
    const avgSpend = customerData.customer_segments.reduce((sum: number, seg: any) => {
      return sum + (seg.avg_spend * seg.size);
    }, 0) / (customerData.total_active_customers || 1);
    
    // Get correct visit frequency based on business type
    const businessTypeLower = businessType.toLowerCase();
    let avgVisitFrequency = 2; // Default
    
    if (businessTypeLower.includes('coffee') || businessTypeLower.includes('cafe')) {
      avgVisitFrequency = 5; // Coffee shops: almost daily visits
    } else if (businessTypeLower.includes('gym') || businessTypeLower.includes('fitness')) {
      avgVisitFrequency = 12; // Gyms: frequent visits
    } else if (businessTypeLower.includes('restaurant')) {
      avgVisitFrequency = 2; // Restaurants: weekly
    } else if (businessTypeLower.includes('boutique')) {
      avgVisitFrequency = 0.5; // Boutiques: occasional
    } else if (businessTypeLower.includes('salon') || businessTypeLower.includes('barber')) {
      avgVisitFrequency = 0.7; // Salons: monthly
    } else if (businessTypeLower.includes('retail') || businessTypeLower.includes('shop')) {
      avgVisitFrequency = 0.8; // Retail: semi-regular
    }
    
    const totalRevenue = customerData.total_active_customers * avgSpend * avgVisitFrequency;
    
    console.log(`💰 Revenue calculation: ${customerData.total_active_customers} customers × $${avgSpend.toFixed(2)} avg × ${avgVisitFrequency} visits = $${totalRevenue.toFixed(2)}`);
    
    const financialData = analyzeFinancialPerformance({
      totalRevenue,
      laborCost: employeeData.total_salaries,
      inventoryCost: supplierData.estimated_monthly_costs.inventory,
      utilitiesCost: supplierData.estimated_monthly_costs.utilities,
      rentCost: monthlyRent,
      marketingSpend: decisions.marketing_spend,
      otherOperatingCosts: 500,
      previousCashBalance: prevState.cashBalance,
      previousRevenue: prevState.revenue,
      previousProfit: prevState.profit,
      currentMonth: currentMonth,
    });
    
    phaseTimes.phase5_financial = Date.now() - phase5Start;
    console.log(`✅ Phase 5 complete (${phaseTimes.phase5_financial}ms)`);

    // ========================================
    // Return all outputs
    // ========================================
    const totalTime = Date.now() - startTime;
    console.log(`✨ Simulation complete! Total time: ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      month: currentMonth,
      year: currentYear,
      
      // All agent outputs
      outputs: {
        marketContext,
        eventsData,
        trendsData: trendsAnalysis,
        supplierData,
        competitionData,
        employeeData,
        customerData,
        financialData,
      },
      
      // Performance metrics
      executionTime: totalTime,
      phaseTimes,
    });
    
  } catch (error: any) {
    console.error('❌ Simulation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Simulation failed',
      executionTime: Date.now() - startTime,
    }, { status: 500 });
  }
}
