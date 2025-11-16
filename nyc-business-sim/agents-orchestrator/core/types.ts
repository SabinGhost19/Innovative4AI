/**
 * Core TypeScript Types pentru Business Simulator
 * 
 * Acest fișier conține toate interfețele TypeScript folosite în sistem.
 * Nu conține logică de validare (vezi schemas.ts pentru Zod schemas).
 */

// ============================================
// LOCATION & GEOGRAPHY
// ============================================

export interface Location {
  lat: number;
  lng: number;
  address: string;
  county: string;
  neighborhood: string;
}

export interface FipsCodes {
  state: string;
  county: string;
  tract: string;
}

export interface DetailedFipsCodes extends FipsCodes {
  block: string;
  full_tract_id: string;
  full_block_id: string;
}

// ============================================
// CENSUS DATA
// ============================================

export interface CensusData {
  latitude: number;
  longitude: number;
  area_name: string;
  fips_codes: FipsCodes;
  demographics: Record<string, string | number>;
}

export interface DemographicsDetailedItem {
  value: string | number | null;
  label: string;
}

export interface DerivedStatistics {
  poverty_rate: number;
  high_income_households_rate: number;
  high_income_count: number;
  bachelor_plus_rate: number;
  bachelor_plus_count: number;
  renter_rate: number;
  work_from_home_rate: number;
}

export interface DetailedCensusData {
  latitude: number;
  longitude: number;
  area_name: string;
  analysis_type: string;
  year: string;
  fips_codes: DetailedFipsCodes;
  demographics_detailed: Record<string, DemographicsDetailedItem>;
  derived_statistics: DerivedStatistics;
}

// ============================================
// BUSINESS SURVIVAL DATA
// ============================================

export interface SurvivalData {
  county_name: string;
  industry: string;
  naics_code: string;
  survival_rate_5_year: number;
  firms_2017_start_pool: number;
  risk_level: "LOW" | "MEDIUM" | "MEDIUM-HIGH" | "HIGH";
  interpretation: string;
}

export interface CountySurvivalStats {
  county: string;
  total_industries: number;
  average_survival_rate: number;
  highest_survival: number;
  lowest_survival: number;
  industries_above_70pct: number;
  industries_below_60pct: number;
  high_risk_industries: Array<{
    industry: string;
    naics_code: string;
    survival_rate: number;
    firms_count: number;
    risk_level: string;
  }>;
  safest_industries: Array<{
    industry: string;
    naics_code: string;
    survival_rate: number;
    firms_count: number;
  }>;
}

// ============================================
// GOOGLE TRENDS DATA
// ============================================

export interface GoogleTrendsData {
  success: boolean;
  business_type: string;
  location: string;
  timeframe: string;
  keywords_analyzed: string[];
  trends: {
    interest_trend: string;
    average_interest: number;
    peak_interest: number;
    related_rising_queries: Array<{ query: string; value: number | string }>;
    related_top_queries: Array<{ query: string; value: number | string }>;
    trending_searches: string[];
    keywords_performance: Record<string, {
      average_interest: number;
      peak_interest: number;
      trend: string;
    }>;
  };
  timestamp: string;
}

// ============================================
// AGENT OUTPUTS
// ============================================

// Phase 0: Market Context Agent
export interface MarketContext {
  economic_climate: 'booming' | 'stable' | 'declining' | 'recession';
  industry_saturation: number; // 0-100
  market_risk_level: 'low' | 'medium' | 'high';
  survival_benchmark: {
    industry_5yr_survival: number;
    your_estimated_survival: number;
    risk_factors: string[];
  };
  recommended_strategy: string;
  market_trends: string[];
}

// Phase 1: Supplier Agent
export interface SupplierAnalysis {
  supplier_availability: 'abundant' | 'adequate' | 'limited' | 'scarce';
  estimated_monthly_costs: {
    inventory: number;
    supplies: number;
    utilities: number;
    total: number;
  };
  price_volatility: 'low' | 'medium' | 'high';
  supplier_reliability: number; // 0-100
  cost_optimization_tips: string[];
  seasonal_adjustments: {
    expected: boolean;
    percentage: number;
    reasoning: string;
  };
}

// Phase 1: Competition Agent
export interface CompetitionAnalysis {
  total_competitors: number;
  competitors_closing: number;
  new_entrants: number;
  market_space: 'opening' | 'saturated' | 'contracting';
  pricing_pressure: 'low' | 'medium' | 'high';
  competitor_actions: Array<{
    competitor_name: string;
    action: string;
    impact_on_you: 'positive' | 'neutral' | 'negative';
  }>;
  your_competitive_advantage: string[];
  threats: string[];
}

// Phase 2: Customer Behavior Agent
export interface CustomerBehavior {
  total_potential_customers: number;
  new_customers_acquired: number;
  returning_customers: number;
  churned_customers: number;
  total_active_customers: number;
  
  customer_segments: Array<{
    segment_name: string;
    size: number;
    avg_spend: number;
    loyalty: number; // 0-100
  }>;
  
  acquisition_channels: Array<{
    channel: string;
    customers: number;
    cost_per_customer: number;
  }>;
  
  loyalty_rate: number; // 0-100
  churn_rate: number; // 0-100
  avg_customer_lifetime_value: number;
  
  behavioral_insights: string[];
  seasonal_demand: {
    adjustment: number; // percentage
    reasoning: string;
  };
}

// Phase 3: Employee Agent (Pure Math)
export interface EmployeeMetrics {
  total_employees: number;
  new_hires: number;
  resignations: number;
  
  salary_expenses: number;
  benefits_expenses: number;
  training_costs: number;
  total_personnel_costs: number;
  
  productivity_score: number; // 0-100
  morale: number; // 0-100
  
  staffing_recommendations: string[];
  cost_per_employee: number;
}

// Phase 3: Financial Agent (Pure Math)
export interface FinancialStatement {
  revenue: {
    from_customers: number;
    from_other_sources: number;
    total: number;
  };
  
  expenses: {
    personnel: number;
    suppliers: number;
    rent: number;
    marketing: number;
    utilities: number;
    other: number;
    total: number;
  };
  
  net_profit: number;
  profit_margin: number; // percentage
  
  cash_flow: {
    opening_balance: number;
    ending_balance: number;
    change: number;
  };
  
  runway_months: number;
  recommended_cash_reserve: number;
  
  survival_adjusted_metrics: {
    risk_reserve_target: number;
    actual_reserve: number;
    reserve_adequacy: 'critical' | 'low' | 'adequate' | 'healthy';
  };
  
  financial_health_score: number; // 0-100
  warnings: string[];
}

// Phase 4: Business Event (Already implemented)
export interface BusinessEvent {
  nume_eveniment: string;
  impact_clienti_lunar: number; // percentage
  relevanta_pentru_business: boolean;
  descriere_scurta: string;
}

// Phase 5: Trends Analysis (Already implemented)
export interface TrendInsight {
  trend_name: string;
  impact_score: number; // -100 to +100
  relevance: boolean;
  description: string;
  actionable_insight: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface TrendsAnalysis {
  main_trend: TrendInsight;
  secondary_trends: TrendInsight[];
  overall_sentiment: 'positive' | 'neutral' | 'negative';
  market_momentum: 'accelerating' | 'stable' | 'decelerating';
}

// Phase 6: Monthly Report
export interface SurvivalScorecard {
  current_health: 'above_average' | 'at_risk' | 'critical';
  survival_probability_12_months: number; // 0-100
  comparison_to_industry: string;
  key_metrics: {
    profit_trend: 'improving' | 'stable' | 'declining';
    customer_trend: 'growing' | 'stable' | 'declining';
    cash_trend: 'improving' | 'stable' | 'declining';
  };
}

export interface RecommendedAction {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  reasoning: string;
  estimated_impact: string;
}

export interface MonthlyReport {
  month: number;
  year: number;
  simulation_month: number; // Month since business start
  
  survival_scorecard: SurvivalScorecard;
  
  financial_summary: {
    revenue: number;
    expenses: number;
    profit: number;
    cash_balance: number;
    runway_months: number;
  };
  
  customer_summary: {
    total_active: number;
    new: number;
    churned: number;
    loyalty_rate: number;
  };
  
  critical_warnings: string[];
  recommended_actions: RecommendedAction[];
  
  month_summary: string; // Narrative summary
  key_achievements: string[];
  challenges_faced: string[];
  
  next_month_outlook: string;
}

// ============================================
// SIMULATION CONTEXT (Central Data Structure)
// ============================================

export interface SimulationContext {
  // Business Identity
  business_id: string;
  business_type: string;
  business_name: string;
  
  // Location
  location: Location;
  
  // Temporal Context
  current_month: number; // 1-12
  current_year: number;
  simulation_month: number; // Months since business started
  
  // External Data (Fetched Once)
  census_data: CensusData;
  detailed_census_data: DetailedCensusData;
  survival_data: SurvivalData | null;
  county_stats: CountySurvivalStats | null;
  trends_data: GoogleTrendsData | null;
  
  // Previous Month State (for continuity)
  previous_month?: {
    cash_balance: number;
    total_customers: number;
    employee_count: number;
    profit: number;
  };
  
  // Agent Outputs (Populated Progressively)
  agent_outputs: {
    phase0_market_context?: MarketContext;
    phase1_supplier?: SupplierAnalysis;
    phase1_competition?: CompetitionAnalysis;
    phase2_customer?: CustomerBehavior;
    phase3_employee?: EmployeeMetrics;
    phase3_financial?: FinancialStatement;
    phase4_event?: BusinessEvent;
    phase5_trends?: TrendsAnalysis;
    phase6_report?: MonthlyReport;
  };
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface SimulationRequest {
  business_id: string;
  business_type: string;
  business_name: string;
  location: Location;
  current_month: number;
  current_year: number;
  simulation_month: number;
  previous_state?: {
    cash_balance: number;
    total_customers: number;
    employee_count: number;
    profit: number;
  };
}

export interface SimulationResponse {
  success: boolean;
  month: number;
  year: number;
  simulation_month: number;
  
  // All agent outputs for debugging
  outputs: {
    market_context: MarketContext;
    supplier: SupplierAnalysis;
    competition: CompetitionAnalysis;
    customer: CustomerBehavior;
    employee: EmployeeMetrics;
    financial: FinancialStatement;
    event: BusinessEvent;
    trends: TrendsAnalysis;
    report: MonthlyReport;
  };
  
  // Summary for UI
  summary: {
    revenue: number;
    profit: number;
    cash_balance: number;
    total_customers: number;
    survival_score: number;
    health_status: string;
  };
  
  execution_time_ms: number;
  error?: string;
}

// ============================================
// BUSINESS TYPE TO NAICS MAPPING
// ============================================

export interface NAICSMapping {
  naics: string;
  label: string;
}

export const BUSINESS_TYPE_TO_NAICS: Record<string, NAICSMapping> = {
  // Food & Beverage
  "coffee shop": { naics: "72", label: "Accommodation and food services" },
  "cafe": { naics: "72", label: "Accommodation and food services" },
  "restaurant": { naics: "72", label: "Accommodation and food services" },
  "bar": { naics: "72", label: "Accommodation and food services" },
  "food truck": { naics: "72", label: "Accommodation and food services" },
  "bakery": { naics: "72", label: "Accommodation and food services" },
  
  // Retail
  "boutique": { naics: "44-45", label: "Retail trade" },
  "bookstore": { naics: "44-45", label: "Retail trade" },
  "grocery": { naics: "44-45", label: "Retail trade" },
  "clothing store": { naics: "44-45", label: "Retail trade" },
  "gift shop": { naics: "44-45", label: "Retail trade" },
  "convenience store": { naics: "44-45", label: "Retail trade" },
  
  // Professional Services
  "consulting": { naics: "54", label: "Professional, scientific, and technical services" },
  "marketing agency": { naics: "54", label: "Professional, scientific, and technical services" },
  "law firm": { naics: "54", label: "Professional, scientific, and technical services" },
  "accounting firm": { naics: "54", label: "Professional, scientific, and technical services" },
  "tech startup": { naics: "54", label: "Professional, scientific, and technical services" },
  
  // Health & Wellness
  "gym": { naics: "71", label: "Arts, entertainment, and recreation" },
  "yoga studio": { naics: "71", label: "Arts, entertainment, and recreation" },
  "fitness center": { naics: "71", label: "Arts, entertainment, and recreation" },
  "clinic": { naics: "62", label: "Health care and social assistance" },
  "dental office": { naics: "62", label: "Health care and social assistance" },
  
  // Personal Services
  "salon": { naics: "81", label: "Other services (except public administration)" },
  "barbershop": { naics: "81", label: "Other services (except public administration)" },
  "dry cleaning": { naics: "81", label: "Other services (except public administration)" },
  "repair shop": { naics: "81", label: "Other services (except public administration)" },
  
  // Construction
  "contractor": { naics: "23", label: "Construction" },
  "construction": { naics: "23", label: "Construction" },
  
  // Real Estate
  "real estate": { naics: "53", label: "Real estate and rental and leasing" },
  "property management": { naics: "53", label: "Real estate and rental and leasing" },
};

export function getNAICSForBusinessType(businessType: string): NAICSMapping | null {
  const normalized = businessType.toLowerCase().trim();
  
  // Exact match
  if (BUSINESS_TYPE_TO_NAICS[normalized]) {
    return BUSINESS_TYPE_TO_NAICS[normalized];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(BUSINESS_TYPE_TO_NAICS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Default fallback
  return { naics: "00", label: "Total for all sectors" };
}
