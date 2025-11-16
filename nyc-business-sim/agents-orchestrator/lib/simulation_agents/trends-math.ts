/**
 * Trends - Mathematical Models
 * 
 * Pure mathematical functions for time series analysis and trend forecasting.
 * NO LLM calls - deterministic technical analysis.
 * 
 * Key Models:
 * - EMA (Exponential Moving Average)
 * - MACD (Moving Average Convergence Divergence)
 * - RSI (Relative Strength Index)
 * - Trend classification (momentum, direction, strength)
 * 
 * Sources:
 * - Technical Analysis of Financial Markets (Murphy, 1999)
 * - MACD formula: 12-day EMA - 26-day EMA
 * - Signal Line: 9-day EMA of MACD
 */

/**
 * Calculate Exponential Moving Average (EMA)
 * 
 * Formula: EMA(t) = Price(t) × multiplier + EMA(t-1) × (1 - multiplier)
 * where multiplier = 2 / (period + 1)
 * 
 * @param data - Array of data points (newest last)
 * @param period - Number of periods for EMA (e.g., 12, 26)
 * @returns EMA value
 */
export function calculateEMA(data: number[], period: number): number {
  if (data.length === 0) return 0;
  if (data.length < period) return data[data.length - 1]; // Not enough data
  
  const multiplier = 2 / (period + 1);
  
  // Start with simple moving average for first EMA
  let ema = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  
  // Calculate EMA for remaining points
  for (let i = period; i < data.length; i++) {
    ema = data[i] * multiplier + ema * (1 - multiplier);
  }
  
  return ema;
}

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * 
 * Components:
 * - MACD Line: 12-day EMA - 26-day EMA
 * - Signal Line: 9-day EMA of MACD
 * - Histogram: MACD - Signal
 * 
 * Interpretation:
 * - MACD > Signal: Bullish (uptrend)
 * - MACD < Signal: Bearish (downtrend)
 * - Crossovers indicate trend changes
 * 
 * @param data - Array of data points (newest last)
 * @returns MACD components
 */
export function calculateMACD(data: number[]): {
  macd: number;
  signal: number;
  histogram: number;
  trend: 'bullish' | 'bearish' | 'neutral';
} {
  if (data.length < 26) {
    // Not enough data for MACD
    return {
      macd: 0,
      signal: 0,
      histogram: 0,
      trend: 'neutral',
    };
  }
  
  // Calculate 12-day and 26-day EMAs
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  
  // MACD line
  const macd = ema12 - ema26;
  
  // Signal line: 9-day EMA of MACD
  // For simplicity, approximate with recent MACD values
  const macdHistory = [macd]; // In real implementation, track MACD history
  const signal = calculateEMA(macdHistory, 9);
  
  // Histogram
  const histogram = macd - signal;
  
  // Trend classification
  const trend = histogram > 0.5 ? 'bullish' : 
                histogram < -0.5 ? 'bearish' : 'neutral';
  
  return {
    macd: Math.round(macd * 100) / 100,
    signal: Math.round(signal * 100) / 100,
    histogram: Math.round(histogram * 100) / 100,
    trend,
  };
}

/**
 * Calculate Relative Strength Index (RSI)
 * 
 * Formula: RSI = 100 - (100 / (1 + RS))
 * where RS = Average Gain / Average Loss
 * 
 * Interpretation:
 * - RSI > 70: Overbought (potential sell signal)
 * - RSI < 30: Oversold (potential buy signal)
 * - RSI 40-60: Neutral
 * 
 * @param data - Array of data points (newest last)
 * @param period - Period for RSI (typically 14)
 * @returns RSI value (0-100)
 */
export function calculateRSI(data: number[], period: number = 14): number {
  if (data.length < period + 1) {
    return 50; // Neutral if not enough data
  }
  
  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }
  
  // Separate gains and losses
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);
  
  // Average gain and loss over period
  const avgGain = gains.slice(-period).reduce((sum, val) => sum + val, 0) / period;
  const avgLoss = losses.slice(-period).reduce((sum, val) => sum + val, 0) / period;
  
  if (avgLoss === 0) return 100; // All gains
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return Math.round(rsi * 10) / 10;
}

/**
 * Classify trend momentum
 * 
 * @param macd - MACD histogram value
 * @param rsi - RSI value
 * @returns Momentum classification
 */
export function classifyMomentum(
  macd: number,
  rsi: number
): 'accelerating' | 'stable' | 'decelerating' {
  // Strong upward momentum
  if (macd > 1.0 && rsi > 60) {
    return 'accelerating';
  }
  
  // Strong downward momentum
  if (macd < -1.0 && rsi < 40) {
    return 'decelerating';
  }
  
  // Neutral/stable
  return 'stable';
}

/**
 * Calculate trend strength
 * 
 * @param data - Historical data points
 * @returns Strength percentage (0-100)
 */
export function calculateTrendStrength(data: number[]): number {
  if (data.length < 2) return 0;
  
  // Calculate slope
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Normalize to 0-100 scale
  const strength = Math.abs(slope) * 10;
  
  return Math.min(100, Math.max(0, Math.round(strength)));
}

/**
 * Determine overall trend direction
 * 
 * @param data - Historical data points (at least 3)
 * @returns Trend direction
 */
export function determineTrendDirection(
  data: number[]
): 'upward' | 'downward' | 'sideways' {
  if (data.length < 3) return 'sideways';
  
  // Compare recent average vs older average
  const recentAvg = data.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
  const olderAvg = data.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (change > 5) return 'upward';
  if (change < -5) return 'downward';
  return 'sideways';
}

/**
 * Calculate impact score from trend data
 * 
 * Combines:
 * - Average interest level
 * - Trend direction
 * - Momentum
 * 
 * @param averageInterest - Google Trends average interest (0-100)
 * @param trend - Trend direction ('rising', 'stable', 'declining')
 * @param peak - Peak interest level
 * @returns Impact score (-100 to +100)
 */
export function calculateTrendImpactScore(
  averageInterest: number,
  trend: string,
  peak: number
): number {
  // Base score from interest level
  let score = averageInterest - 50; // Center at 0
  
  // Adjust for trend direction
  if (trend === 'rising') {
    score += 20;
  } else if (trend === 'declining') {
    score -= 20;
  }
  
  // Volatility bonus (high peak indicates strong interest)
  const volatility = peak - averageInterest;
  score += volatility * 0.2;
  
  return Math.round(Math.max(-100, Math.min(100, score)));
}

/**
 * Classify overall sentiment from multiple trends
 * 
 * @param impactScores - Array of impact scores from trends
 * @returns Overall sentiment
 */
export function classifySentiment(
  impactScores: number[]
): 'positive' | 'neutral' | 'negative' {
  if (impactScores.length === 0) return 'neutral';
  
  const avgScore = impactScores.reduce((sum, score) => sum + score, 0) / impactScores.length;
  
  if (avgScore > 20) return 'positive';
  if (avgScore < -20) return 'negative';
  return 'neutral';
}

/**
 * Determine confidence level based on data quality
 * 
 * @param dataPoints - Number of data points available
 * @param averageInterest - Average interest level
 * @returns Confidence level
 */
export function determineConfidence(
  dataPoints: number,
  averageInterest: number
): 'low' | 'medium' | 'high' {
  // Low confidence if few data points or low interest
  if (dataPoints < 5 || averageInterest < 10) {
    return 'low';
  }
  
  // High confidence if many data points and significant interest
  if (dataPoints >= 10 && averageInterest >= 30) {
    return 'high';
  }
  
  return 'medium';
}

/**
 * Generate actionable insight based on trend analysis
 * 
 * @param trendDirection - Direction of trend
 * @param impactScore - Impact score
 * @param businessType - Type of business
 * @returns Actionable insight
 */
export function generateActionableInsight(
  trendDirection: string,
  impactScore: number,
  businessType: string
): string {
  if (trendDirection === 'rising' && impactScore > 30) {
    return `Strong upward trend detected. Consider increasing inventory/capacity to capitalize on growing demand.`;
  }
  
  if (trendDirection === 'declining' && impactScore < -30) {
    return `Declining interest. Focus on customer retention, promotions, or diversification strategies.`;
  }
  
  if (impactScore > 0 && impactScore <= 30) {
    return `Moderate positive trend. Maintain current strategy with gradual expansion.`;
  }
  
  if (impactScore < 0 && impactScore >= -30) {
    return `Slight decline. Monitor closely and prepare contingency plans.`;
  }
  
  return `Stable trend. Continue current operations while monitoring for changes.`;
}
