/**
 * Financial Agent (Pure Math - NO LLM)
 * 
 * Calculates P&L (Profit & Loss), cash flow, and financial health metrics.
 * This is the final aggregator of all financial data.
 * 
 * ENHANCED with Mathematical Forecasting:
 * - Linear regression for cash runway prediction
 * - Revenue & profit trend forecasting
 * - 95% confidence intervals
 * - Break-even analysis
 * 
 * NO AI MODEL - Pure TypeScript calculations
 */

import {
  forecastCashRunway,
  forecastRevenue,
  forecastProfit,
  calculateBreakEven,
  type HistoricalDataPoint,
} from './financial-math';

export interface FinancialAnalysisInput {
  // Revenue (from Customer Agent)
  totalRevenue: number;
  
  // Costs (from various agents)
  laborCost: number;              // From Employee Agent
  inventoryCost: number;          // From Supplier Agent
  utilitiesCost: number;          // From Supplier Agent
  rentCost: number;               // From Supplier Agent / Constants
  marketingSpend: number;         // From player decisions
  otherOperatingCosts: number;    // Misc (insurance, etc.)
  
  // Previous month data
  previousCashBalance: number;
  previousRevenue: number;
  previousProfit: number;
  
  // Historical data for forecasting (optional)
  historicalData?: HistoricalDataPoint[];
  
  // Context
  currentMonth: number;
}

export interface FinancialAnalysis {
  // P&L Statement
  profit_loss: {
    revenue: number;
    total_costs: number;
    gross_profit: number;
    operating_expenses: number;
    net_profit: number;
    profit_margin: number; // %
  };
  
  // Cost breakdown
  cost_breakdown: {
    labor: number;
    inventory: number;
    rent: number;
    utilities: number;
    marketing: number;
    other: number;
  };
  
  // Cash flow
  cash_flow: {
    opening_balance: number;
    cash_in: number;
    cash_out: number;
    closing_balance: number;
    burn_rate: number; // Monthly burn
  };
  
  // Financial health metrics
  health_metrics: {
    revenue_growth_rate: number; // % vs last month
    profit_growth_rate: number;  // % vs last month
    cash_runway_months: number;  // Months until cash runs out
    financial_health_score: number; // 0-100
  };
  
  // Forecasting (if historical data provided)
  forecasts?: {
    revenue_3month: {
      projected: number;
      confidenceIntervalLow: number;
      confidenceIntervalHigh: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
    cash_runway: {
      monthsUntilZero: number;
      confidenceInterval: [number, number];
      projectedBalance12Month: number;
    };
    break_even: {
      requiredRevenue: number;
      currentGap: number;
      onTrackToReach: boolean;
    };
  };
  
  // Warnings/alerts
  alerts: string[];
}

/**
 * Analyze financial performance (pure calculation, no LLM)
 */
export function analyzeFinancialPerformance(input: FinancialAnalysisInput): FinancialAnalysis {
  // Calculate total costs
  const laborCost = input.laborCost;
  const inventoryCost = input.inventoryCost;
  const rentCost = input.rentCost;
  const utilitiesCost = input.utilitiesCost;
  const marketingCost = input.marketingSpend;
  const otherCosts = input.otherOperatingCosts;
  
  const totalCosts = laborCost + inventoryCost + rentCost + utilitiesCost + marketingCost + otherCosts;
  
  // Calculate P&L
  const revenue = input.totalRevenue;
  const grossProfit = revenue - inventoryCost; // Revenue - COGS
  const operatingExpenses = laborCost + rentCost + utilitiesCost + marketingCost + otherCosts;
  const netProfit = revenue - totalCosts;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  
  // Calculate cash flow
  const openingBalance = input.previousCashBalance;
  const cashIn = revenue;
  const cashOut = totalCosts;
  const closingBalance = openingBalance + cashIn - cashOut;
  const burnRate = cashOut - cashIn; // Positive = burning cash
  
  // Calculate growth rates
  const revenueGrowthRate = input.previousRevenue > 0 
    ? ((revenue - input.previousRevenue) / input.previousRevenue) * 100 
    : 0;
  
  const profitGrowthRate = input.previousProfit !== 0
    ? ((netProfit - input.previousProfit) / Math.abs(input.previousProfit)) * 100
    : 0;
  
  // Calculate cash runway
  const cashRunwayMonths = burnRate > 0 
    ? closingBalance / burnRate 
    : 999; // Positive cash flow = infinite runway
  
  // Calculate financial health score (0-100)
  const healthScore = calculateFinancialHealthScore({
    profitMargin,
    cashRunway: cashRunwayMonths,
    revenueGrowth: revenueGrowthRate,
    cashBalance: closingBalance,
  });
  
  // Generate alerts
  const alerts = generateFinancialAlerts({
    profitMargin,
    cashRunway: cashRunwayMonths,
    cashBalance: closingBalance,
    burnRate,
    laborPercentage: (laborCost / revenue) * 100,
    inventoryPercentage: (inventoryCost / revenue) * 100,
  });
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FORECASTING (if historical data available)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  let forecasts: FinancialAnalysis['forecasts'];
  
  if (input.historicalData && input.historicalData.length >= 3) {
    // Need at least 3 months for meaningful forecasting
    const historical = input.historicalData;
    
    // Forecast revenue 3 months ahead
    const revenueForecast = forecastRevenue(historical, 3);
    
    // Forecast cash runway 12 months ahead
    const cashForecast = forecastCashRunway(historical, 12);
    
    // Calculate break-even
    const fixedCosts = laborCost + rentCost + utilitiesCost;
    const variableCostPercent = revenue > 0 ? (inventoryCost / revenue) * 100 : 35;
    const breakEven = calculateBreakEven(fixedCosts, variableCostPercent);
    
    const currentGap = breakEven.breakEvenRevenue - revenue;
    const onTrackToReach = revenueForecast.trend === 'increasing' && currentGap > 0;
    
    forecasts = {
      revenue_3month: {
        projected: revenueForecast.projectedValue,
        confidenceIntervalLow: revenueForecast.confidenceIntervalLow,
        confidenceIntervalHigh: revenueForecast.confidenceIntervalHigh,
        trend: revenueForecast.trend,
      },
      cash_runway: {
        monthsUntilZero: cashForecast.monthsUntilZero,
        confidenceInterval: cashForecast.zeroConfidenceInterval,
        projectedBalance12Month: cashForecast.projectedValue,
      },
      break_even: {
        requiredRevenue: breakEven.breakEvenRevenue,
        currentGap: Math.max(0, currentGap),
        onTrackToReach,
      },
    };
  }
  
  return {
    profit_loss: {
      revenue,
      total_costs: totalCosts,
      gross_profit: grossProfit,
      operating_expenses: operatingExpenses,
      net_profit: netProfit,
      profit_margin: profitMargin,
    },
    cost_breakdown: {
      labor: laborCost,
      inventory: inventoryCost,
      rent: rentCost,
      utilities: utilitiesCost,
      marketing: marketingCost,
      other: otherCosts,
    },
    cash_flow: {
      opening_balance: openingBalance,
      cash_in: cashIn,
      cash_out: cashOut,
      closing_balance: closingBalance,
      burn_rate: burnRate,
    },
    health_metrics: {
      revenue_growth_rate: revenueGrowthRate,
      profit_growth_rate: profitGrowthRate,
      cash_runway_months: cashRunwayMonths,
      financial_health_score: healthScore,
    },
    forecasts,
    alerts,
  };
}

/**
 * Calculate overall financial health score (0-100)
 */
function calculateFinancialHealthScore(metrics: {
  profitMargin: number;
  cashRunway: number;
  revenueGrowth: number;
  cashBalance: number;
}): number {
  let score = 50; // Start at neutral
  
  // Profit margin component (max 30 points)
  if (metrics.profitMargin > 20) {
    score += 30;
  } else if (metrics.profitMargin > 10) {
    score += 20;
  } else if (metrics.profitMargin > 0) {
    score += 10;
  } else if (metrics.profitMargin < -20) {
    score -= 30;
  } else if (metrics.profitMargin < 0) {
    score -= 15;
  }
  
  // Cash runway component (max 30 points)
  if (metrics.cashRunway > 12) {
    score += 30; // >1 year runway
  } else if (metrics.cashRunway > 6) {
    score += 20; // 6-12 months
  } else if (metrics.cashRunway > 3) {
    score += 10; // 3-6 months
  } else if (metrics.cashRunway < 3) {
    score -= 20; // <3 months - danger!
  }
  
  // Revenue growth component (max 20 points)
  if (metrics.revenueGrowth > 20) {
    score += 20;
  } else if (metrics.revenueGrowth > 10) {
    score += 15;
  } else if (metrics.revenueGrowth > 0) {
    score += 10;
  } else if (metrics.revenueGrowth < -10) {
    score -= 15;
  }
  
  // Cash balance component (min 0)
  if (metrics.cashBalance < 0) {
    score -= 40; // Negative cash = critical
  }
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate financial alerts based on thresholds
 */
function generateFinancialAlerts(metrics: {
  profitMargin: number;
  cashRunway: number;
  cashBalance: number;
  burnRate: number;
  laborPercentage: number;
  inventoryPercentage: number;
}): string[] {
  const alerts: string[] = [];
  
  // Critical alerts
  if (metrics.cashBalance < 0) {
    alerts.push('🚨 CRITICAL: Negative cash balance - immediate action required');
  }
  
  if (metrics.cashRunway < 3 && metrics.burnRate > 0) {
    alerts.push(`⚠️ WARNING: Only ${metrics.cashRunway.toFixed(1)} months of cash runway remaining`);
  }
  
  // Profit margin alerts
  if (metrics.profitMargin < 0) {
    alerts.push(`⚠️ Operating at a loss: ${metrics.profitMargin.toFixed(1)}% profit margin`);
  } else if (metrics.profitMargin < 5) {
    alerts.push(`💡 Low profit margin: ${metrics.profitMargin.toFixed(1)}% - aim for 10%+`);
  }
  
  // Cost structure alerts
  if (metrics.laborPercentage > 40) {
    alerts.push(`💡 Labor costs are ${metrics.laborPercentage.toFixed(0)}% of revenue - consider optimization`);
  }
  
  if (metrics.inventoryPercentage > 60) {
    alerts.push(`💡 COGS is ${metrics.inventoryPercentage.toFixed(0)}% of revenue - negotiate better supplier terms`);
  }
  
  // Positive alerts
  if (metrics.profitMargin > 20) {
    alerts.push(`✅ Excellent profit margin: ${metrics.profitMargin.toFixed(1)}%`);
  }
  
  if (metrics.cashRunway > 12) {
    alerts.push('✅ Strong cash position: >12 months runway');
  }
  
  return alerts;
}
