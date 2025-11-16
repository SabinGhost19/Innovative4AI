/**
 * Financial Agent - Mathematical Forecasting Models
 * 
 * Advanced financial projections using statistical methods.
 * NO LLM - pure mathematical forecasting.
 * 
 * Key Models:
 * - Linear Regression for cash runway forecasting
 * - Confidence intervals (95%)
 * - Trend analysis (revenue, profit)
 * - Break-even analysis
 * 
 * Sources:
 * - Standard statistical formulas
 * - Time series forecasting (simple linear regression)
 * - Small business financial benchmarks
 */

export interface HistoricalDataPoint {
  month: number;
  revenue: number;
  profit: number;
  cashBalance: number;
  burnRate: number;
}

export interface ForecastResult {
  projectedValue: number;
  confidenceIntervalLow: number;  // 95% CI lower bound
  confidenceIntervalHigh: number; // 95% CI upper bound
  trend: 'increasing' | 'decreasing' | 'stable';
  monthlyGrowthRate: number; // Average % growth per month
}

/**
 * Simple Linear Regression
 * 
 * Formula: y = mx + b
 * Where:
 * - m = slope (Σ((x - x̄)(y - ȳ)) / Σ((x - x̄)²))
 * - b = intercept (ȳ - m * x̄)
 * 
 * @param dataPoints - Array of [x, y] pairs
 * @returns {slope, intercept, r_squared}
 */
function linearRegression(dataPoints: [number, number][]): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const n = dataPoints.length;
  
  if (n < 2) {
    return { slope: 0, intercept: 0, rSquared: 0 };
  }
  
  // Calculate means
  const xMean = dataPoints.reduce((sum, [x]) => sum + x, 0) / n;
  const yMean = dataPoints.reduce((sum, [, y]) => sum + y, 0) / n;
  
  // Calculate slope (m)
  let numerator = 0;
  let denominator = 0;
  
  for (const [x, y] of dataPoints) {
    numerator += (x - xMean) * (y - yMean);
    denominator += (x - xMean) ** 2;
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  
  // Calculate intercept (b)
  const intercept = yMean - slope * xMean;
  
  // Calculate R² (coefficient of determination)
  let ssRes = 0; // Sum of squared residuals
  let ssTot = 0; // Total sum of squares
  
  for (const [x, y] of dataPoints) {
    const predicted = slope * x + intercept;
    ssRes += (y - predicted) ** 2;
    ssTot += (y - yMean) ** 2;
  }
  
  const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
  
  return { slope, intercept, rSquared: Math.max(0, Math.min(1, rSquared)) };
}

/**
 * Calculate standard error of regression
 * 
 * Formula: SE = √(Σ(y - ŷ)² / (n - 2))
 */
function calculateStandardError(
  dataPoints: [number, number][],
  slope: number,
  intercept: number
): number {
  const n = dataPoints.length;
  
  if (n < 3) return 0;
  
  let sumSquaredErrors = 0;
  
  for (const [x, y] of dataPoints) {
    const predicted = slope * x + intercept;
    sumSquaredErrors += (y - predicted) ** 2;
  }
  
  return Math.sqrt(sumSquaredErrors / (n - 2));
}

/**
 * Forecast cash runway with confidence intervals
 * 
 * Uses linear regression on historical cash balance data.
 * Predicts when cash will hit $0 with 95% confidence interval.
 * 
 * @param historicalData - Array of historical monthly data points
 * @param monthsAhead - How many months to forecast (default 12)
 * @returns Forecast with confidence intervals
 */
export function forecastCashRunway(
  historicalData: HistoricalDataPoint[],
  monthsAhead: number = 12
): ForecastResult & { monthsUntilZero: number; zeroConfidenceInterval: [number, number] } {
  // Prepare data points: [month_index, cash_balance]
  const dataPoints: [number, number][] = historicalData.map((point, index) => [
    index + 1,
    point.cashBalance,
  ]);
  
  // Run linear regression
  const { slope, intercept, rSquared } = linearRegression(dataPoints);
  
  // Predict cash balance at monthsAhead
  const futureMonth = dataPoints.length + monthsAhead;
  const projectedValue = slope * futureMonth + intercept;
  
  // Calculate standard error and confidence interval
  const standardError = calculateStandardError(dataPoints, slope, intercept);
  const tValue = 1.96; // 95% CI for large samples (approximate)
  
  const marginOfError = tValue * standardError * Math.sqrt(1 + 1 / dataPoints.length);
  const confidenceIntervalLow = projectedValue - marginOfError;
  const confidenceIntervalHigh = projectedValue + marginOfError;
  
  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable';
  if (slope > 100) {
    trend = 'increasing';
  } else if (slope < -100) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }
  
  // Calculate monthly growth rate (%)
  const firstCash = dataPoints[0]?.[1] || 1;
  const lastCash = dataPoints[dataPoints.length - 1]?.[1] || 1;
  const monthlyGrowthRate = firstCash !== 0
    ? ((lastCash - firstCash) / firstCash / dataPoints.length) * 100
    : 0;
  
  // Calculate months until cash hits $0
  let monthsUntilZero = 999;
  let zeroLow = 999;
  let zeroHigh = 999;
  
  if (slope < 0) {
    // Cash is declining - find when it hits 0
    monthsUntilZero = -intercept / slope;
    
    // Confidence interval for zero crossing
    zeroLow = -(intercept + marginOfError) / slope;
    zeroHigh = -(intercept - marginOfError) / slope;
    
    // Ensure positive and reasonable values
    monthsUntilZero = Math.max(0, monthsUntilZero - dataPoints.length);
    zeroLow = Math.max(0, zeroLow - dataPoints.length);
    zeroHigh = Math.max(0, zeroHigh - dataPoints.length);
  }
  
  return {
    projectedValue: Math.round(projectedValue * 100) / 100,
    confidenceIntervalLow: Math.round(confidenceIntervalLow * 100) / 100,
    confidenceIntervalHigh: Math.round(confidenceIntervalHigh * 100) / 100,
    trend,
    monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100,
    monthsUntilZero: Math.round(monthsUntilZero * 10) / 10,
    zeroConfidenceInterval: [
      Math.round(zeroLow * 10) / 10,
      Math.round(zeroHigh * 10) / 10,
    ],
  };
}

/**
 * Forecast revenue with linear regression
 * 
 * @param historicalData - Historical data points
 * @param monthsAhead - Months to forecast
 * @returns Revenue forecast
 */
export function forecastRevenue(
  historicalData: HistoricalDataPoint[],
  monthsAhead: number = 3
): ForecastResult {
  const dataPoints: [number, number][] = historicalData.map((point, index) => [
    index + 1,
    point.revenue,
  ]);
  
  const { slope, intercept } = linearRegression(dataPoints);
  
  const futureMonth = dataPoints.length + monthsAhead;
  const projectedValue = slope * futureMonth + intercept;
  
  const standardError = calculateStandardError(dataPoints, slope, intercept);
  const marginOfError = 1.96 * standardError;
  
  const trend = slope > 500 ? 'increasing' : slope < -500 ? 'decreasing' : 'stable';
  
  const firstRev = dataPoints[0]?.[1] || 1;
  const lastRev = dataPoints[dataPoints.length - 1]?.[1] || 1;
  const monthlyGrowthRate = firstRev !== 0
    ? ((lastRev - firstRev) / firstRev / dataPoints.length) * 100
    : 0;
  
  return {
    projectedValue: Math.max(0, Math.round(projectedValue)),
    confidenceIntervalLow: Math.max(0, Math.round(projectedValue - marginOfError)),
    confidenceIntervalHigh: Math.round(projectedValue + marginOfError),
    trend,
    monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100,
  };
}

/**
 * Forecast profit with linear regression
 */
export function forecastProfit(
  historicalData: HistoricalDataPoint[],
  monthsAhead: number = 3
): ForecastResult {
  const dataPoints: [number, number][] = historicalData.map((point, index) => [
    index + 1,
    point.profit,
  ]);
  
  const { slope, intercept } = linearRegression(dataPoints);
  
  const futureMonth = dataPoints.length + monthsAhead;
  const projectedValue = slope * futureMonth + intercept;
  
  const standardError = calculateStandardError(dataPoints, slope, intercept);
  const marginOfError = 1.96 * standardError;
  
  const trend = slope > 200 ? 'increasing' : slope < -200 ? 'decreasing' : 'stable';
  
  const firstProfit = dataPoints[0]?.[1] || 0;
  const lastProfit = dataPoints[dataPoints.length - 1]?.[1] || 0;
  const monthlyGrowthRate = firstProfit !== 0
    ? ((lastProfit - firstProfit) / Math.abs(firstProfit) / dataPoints.length) * 100
    : 0;
  
  return {
    projectedValue: Math.round(projectedValue),
    confidenceIntervalLow: Math.round(projectedValue - marginOfError),
    confidenceIntervalHigh: Math.round(projectedValue + marginOfError),
    trend,
    monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100,
  };
}

/**
 * Calculate break-even point
 * 
 * Break-even revenue = Fixed Costs / (1 - Variable Cost %)
 * 
 * @param fixedCosts - Monthly fixed costs (rent, salaries, etc.)
 * @param variableCostPercent - Variable costs as % of revenue (COGS, etc.)
 * @returns Break-even revenue needed
 */
export function calculateBreakEven(
  fixedCosts: number,
  variableCostPercent: number
): {
  breakEvenRevenue: number;
  currentGap: number; // If current revenue provided
  monthsToBreakEven: number;
} {
  // Break-even formula
  const breakEvenRevenue = fixedCosts / (1 - variableCostPercent / 100);
  
  return {
    breakEvenRevenue: Math.round(breakEvenRevenue),
    currentGap: 0, // Will be calculated by caller
    monthsToBreakEven: 0, // Will be calculated with growth rate
  };
}

/**
 * Calculate financial ratios
 * 
 * Standard business ratios for health assessment
 */
export function calculateFinancialRatios(
  revenue: number,
  costs: {
    cogs: number;
    operating: number;
  },
  assets: {
    cash: number;
    inventory: number;
  },
  liabilities: {
    currentLiabilities: number;
  }
): {
  grossMargin: number;
  operatingMargin: number;
  currentRatio: number;
  quickRatio: number;
} {
  const grossProfit = revenue - costs.cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  
  const operatingProfit = grossProfit - costs.operating;
  const operatingMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;
  
  const currentAssets = assets.cash + assets.inventory;
  const currentRatio = liabilities.currentLiabilities > 0
    ? currentAssets / liabilities.currentLiabilities
    : 999;
  
  const quickRatio = liabilities.currentLiabilities > 0
    ? assets.cash / liabilities.currentLiabilities
    : 999;
  
  return {
    grossMargin: Math.round(grossMargin * 10) / 10,
    operatingMargin: Math.round(operatingMargin * 10) / 10,
    currentRatio: Math.round(currentRatio * 100) / 100,
    quickRatio: Math.round(quickRatio * 100) / 100,
  };
}
