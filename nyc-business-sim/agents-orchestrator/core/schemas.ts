/**
 * Zod Schemas pentru validare runtime
 * 
 * Toate schema-urile folosite pentru validarea input/output-urilor agenților AI.
 */

import { z } from 'zod';

// ============================================
// LOCATION SCHEMAS
// ============================================

export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  county: z.string(),
  neighborhood: z.string(),
});

// ============================================
// SURVIVAL DATA SCHEMAS
// ============================================

export const SurvivalDataSchema = z.object({
  county_name: z.string(),
  industry: z.string(),
  naics_code: z.string(),
  survival_rate_5_year: z.number(),
  firms_2017_start_pool: z.number(),
  risk_level: z.enum(["LOW", "MEDIUM", "MEDIUM-HIGH", "HIGH"]),
  interpretation: z.string(),
});

// ============================================
// AGENT OUTPUT SCHEMAS
// ============================================

// Phase 0: Market Context
export const MarketContextSchema = z.object({
  economic_climate: z.enum(['booming', 'stable', 'declining', 'recession']),
  industry_saturation: z.number().min(0).max(100),
  market_risk_level: z.enum(['low', 'medium', 'high']),
  survival_benchmark: z.object({
    industry_5yr_survival: z.number(),
    your_estimated_survival: z.number(),
    risk_factors: z.array(z.string()),
  }),
  recommended_strategy: z.string(),
  market_trends: z.array(z.string()).max(3),
});

// Phase 1: Supplier Analysis
export const SupplierAnalysisSchema = z.object({
  supplier_availability: z.enum(['abundant', 'adequate', 'limited', 'scarce']),
  estimated_monthly_costs: z.object({
    inventory: z.number(),
    supplies: z.number(),
    utilities: z.number(),
    total: z.number(),
  }),
  price_volatility: z.enum(['low', 'medium', 'high']),
  supplier_reliability: z.number().min(0).max(100),
  cost_optimization_tips: z.array(z.string()).max(3),
  seasonal_adjustments: z.object({
    expected: z.boolean(),
    percentage: z.number(),
    reasoning: z.string(),
  }),
});

// Phase 1: Competition Analysis
export const CompetitionAnalysisSchema = z.object({
  total_competitors: z.number(),
  competitors_closing: z.number(),
  new_entrants: z.number(),
  market_space: z.enum(['opening', 'saturated', 'contracting']),
  pricing_pressure: z.enum(['low', 'medium', 'high']),
  competitor_actions: z.array(z.object({
    competitor_name: z.string(),
    action: z.string(),
    impact_on_you: z.enum(['positive', 'neutral', 'negative']),
  })).max(5),
  your_competitive_advantage: z.array(z.string()).max(3),
  threats: z.array(z.string()).max(3),
});

// Phase 2: Customer Behavior
export const CustomerBehaviorSchema = z.object({
  total_potential_customers: z.number(),
  new_customers_acquired: z.number(),
  returning_customers: z.number(),
  churned_customers: z.number(),
  total_active_customers: z.number(),
  
  customer_segments: z.array(z.object({
    segment_name: z.string(),
    size: z.number(),
    avg_spend: z.number(),
    loyalty: z.number().min(0).max(100),
  })).max(3),
  
  acquisition_channels: z.array(z.object({
    channel: z.string(),
    customers: z.number(),
    cost_per_customer: z.number(),
  })).max(4),
  
  loyalty_rate: z.number().min(0).max(100),
  churn_rate: z.number().min(0).max(100),
  avg_customer_lifetime_value: z.number(),
  
  behavioral_insights: z.array(z.string()).max(3),
  seasonal_demand: z.object({
    adjustment: z.number(),
    reasoning: z.string(),
  }),
});

// Phase 3: Employee Metrics
export const EmployeeMetricsSchema = z.object({
  total_employees: z.number(),
  new_hires: z.number(),
  resignations: z.number(),
  
  salary_expenses: z.number(),
  benefits_expenses: z.number(),
  training_costs: z.number(),
  total_personnel_costs: z.number(),
  
  productivity_score: z.number().min(0).max(100),
  morale: z.number().min(0).max(100),
  
  staffing_recommendations: z.array(z.string()).max(3),
  cost_per_employee: z.number(),
});

// Phase 3: Financial Statement
export const FinancialStatementSchema = z.object({
  revenue: z.object({
    from_customers: z.number(),
    from_other_sources: z.number(),
    total: z.number(),
  }),
  
  expenses: z.object({
    personnel: z.number(),
    suppliers: z.number(),
    rent: z.number(),
    marketing: z.number(),
    utilities: z.number(),
    other: z.number(),
    total: z.number(),
  }),
  
  net_profit: z.number(),
  profit_margin: z.number(),
  
  cash_flow: z.object({
    opening_balance: z.number(),
    ending_balance: z.number(),
    change: z.number(),
  }),
  
  runway_months: z.number(),
  recommended_cash_reserve: z.number(),
  
  survival_adjusted_metrics: z.object({
    risk_reserve_target: z.number(),
    actual_reserve: z.number(),
    reserve_adequacy: z.enum(['critical', 'low', 'adequate', 'healthy']),
  }),
  
  financial_health_score: z.number().min(0).max(100),
  warnings: z.array(z.string()),
});

// Phase 4: Business Event (Already exists in events-agent.ts)
export const BusinessEventSchema = z.object({
  nume_eveniment: z.string(),
  impact_clienti_lunar: z.number(),
  relevanta_pentru_business: z.boolean(),
  descriere_scurta: z.string(),
});

// Phase 5: Trends Analysis (Already exists in trends-agent.ts)
export const TrendInsightSchema = z.object({
  trend_name: z.string(),
  impact_score: z.number().min(-100).max(100),
  relevance: z.boolean(),
  description: z.string(),
  actionable_insight: z.string(),
  confidence: z.enum(['low', 'medium', 'high']),
});

export const TrendsAnalysisSchema = z.object({
  main_trend: TrendInsightSchema,
  secondary_trends: z.array(TrendInsightSchema).max(2),
  overall_sentiment: z.enum(['positive', 'neutral', 'negative']),
  market_momentum: z.enum(['accelerating', 'stable', 'decelerating']),
});

// Phase 6: Monthly Report
export const SurvivalScorecardSchema = z.object({
  current_health: z.enum(['above_average', 'at_risk', 'critical']),
  survival_probability_12_months: z.number().min(0).max(100),
  comparison_to_industry: z.string(),
  key_metrics: z.object({
    profit_trend: z.enum(['improving', 'stable', 'declining']),
    customer_trend: z.enum(['growing', 'stable', 'declining']),
    cash_trend: z.enum(['improving', 'stable', 'declining']),
  }),
});

export const RecommendedActionSchema = z.object({
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  action: z.string(),
  reasoning: z.string(),
  estimated_impact: z.string(),
});

export const MonthlyReportSchema = z.object({
  month: z.number(),
  year: z.number(),
  simulation_month: z.number(),
  
  survival_scorecard: SurvivalScorecardSchema,
  
  financial_summary: z.object({
    revenue: z.number(),
    expenses: z.number(),
    profit: z.number(),
    cash_balance: z.number(),
    runway_months: z.number(),
  }),
  
  customer_summary: z.object({
    total_active: z.number(),
    new: z.number(),
    churned: z.number(),
    loyalty_rate: z.number(),
  }),
  
  critical_warnings: z.array(z.string()),
  recommended_actions: z.array(RecommendedActionSchema).max(5),
  
  month_summary: z.string(),
  key_achievements: z.array(z.string()).max(3),
  challenges_faced: z.array(z.string()).max(3),
  
  next_month_outlook: z.string(),
});

// ============================================
// SIMULATION REQUEST/RESPONSE SCHEMAS
// ============================================

export const SimulationRequestSchema = z.object({
  business_id: z.string(),
  business_type: z.string(),
  business_name: z.string(),
  location: LocationSchema,
  current_month: z.number().min(1).max(12),
  current_year: z.number(),
  simulation_month: z.number().min(1),
  previous_state: z.object({
    cash_balance: z.number(),
    total_customers: z.number(),
    employee_count: z.number(),
    profit: z.number(),
  }).optional(),
});

export const SimulationResponseSchema = z.object({
  success: z.boolean(),
  month: z.number(),
  year: z.number(),
  simulation_month: z.number(),
  
  outputs: z.object({
    market_context: MarketContextSchema,
    supplier: SupplierAnalysisSchema,
    competition: CompetitionAnalysisSchema,
    customer: CustomerBehaviorSchema,
    employee: EmployeeMetricsSchema,
    financial: FinancialStatementSchema,
    event: BusinessEventSchema,
    trends: TrendsAnalysisSchema,
    report: MonthlyReportSchema,
  }),
  
  summary: z.object({
    revenue: z.number(),
    profit: z.number(),
    cash_balance: z.number(),
    total_customers: z.number(),
    survival_score: z.number(),
    health_status: z.string(),
  }),
  
  execution_time_ms: z.number(),
  error: z.string().optional(),
});
