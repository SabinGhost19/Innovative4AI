/**
 * 📊 COMPETITION MATHEMATICAL MODELS
 * 
 * Scientific models for competitive analysis:
 * - Huff Gravity Model (market area estimation)
 * - Herfindahl-Hirschman Index (market concentration)
 * - Competitor Density Formulas
 * - Entry/Exit Probability Models
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HUFF GRAVITY MODEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Distance decay parameters by business type
 * 
 * λ (lambda): How sensitive customers are to distance
 * - Higher λ = customers less willing to travel
 * - Lower λ = customers will travel farther
 * 
 * Source: Retail Geography research
 */
const DISTANCE_DECAY_PARAMS: Record<string, number> = {
  coffee: 2.5,       // High decay - convenience-based
  cafe: 2.5,
  restaurant: 2.0,   // Moderate-high decay
  food: 2.0,
  retail: 1.8,       // Moderate decay
  shop: 1.8,
  boutique: 1.5,     // Lower decay - destination shopping
  gym: 1.7,          // Moderate decay
  fitness: 1.7,
  salon: 2.2,        // High decay - local service
  barber: 2.2,
};

/**
 * Get distance decay parameter for business type
 */
function getDecayParameter(businessType: string): number {
  const type = businessType.toLowerCase();
  
  for (const [key, value] of Object.entries(DISTANCE_DECAY_PARAMS)) {
    if (type.includes(key)) {
      return value;
    }
  }
  
  return 2.0; // Default moderate decay
}

/**
 * Calculate trade area using Huff Gravity Model
 * 
 * Formula: P_ij = (S_j / D_ij^λ) / Σ(S_k / D_ik^λ)
 * 
 * Where:
 * - P_ij = Probability consumer at i shops at store j
 * - S_j = Store size/attractiveness
 * - D_ij = Distance from consumer to store
 * - λ = Distance decay parameter
 * 
 * @returns Estimated trade area in square miles
 */
export function calculateTradeArea(
  businessType: string,
  storeSize: number,        // square feet
  competitorCount: number,
  avgCompetitorSize: number = 1500
): number {
  const lambda = getDecayParameter(businessType);
  
  // Attractiveness index (relative to competitors)
  const attractivenessRatio = storeSize / avgCompetitorSize;
  
  // Base trade area (in miles radius)
  const baseRadius = {
    coffee: 0.5,       // 0.5 mile radius (very local)
    restaurant: 1.0,   // 1 mile radius
    retail: 1.5,       // 1.5 miles
    gym: 2.0,         // 2 miles
    boutique: 3.0,    // 3 miles (destination)
  };
  
  const type = businessType.toLowerCase();
  let radius = 1.0; // Default
  
  for (const [key, value] of Object.entries(baseRadius)) {
    if (type.includes(key)) {
      radius = value;
      break;
    }
  }
  
  // Adjust for attractiveness (better stores have larger trade areas)
  const adjustedRadius = radius * Math.pow(attractivenessRatio, 1 / lambda);
  
  // Convert to square miles
  const tradeAreaSqMiles = Math.PI * Math.pow(adjustedRadius, 2);
  
  return tradeAreaSqMiles;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HERFINDAHL-HIRSCHMAN INDEX (HHI)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate Herfindahl-Hirschman Index (market concentration)
 * 
 * Formula: HHI = Σ(market_share_i)² × 10,000
 * 
 * Interpretation:
 * - HHI < 1,500: Competitive market
 * - HHI 1,500-2,500: Moderate concentration
 * - HHI > 2,500: High concentration (oligopoly)
 * 
 * Source: U.S. Department of Justice Antitrust Guidelines
 * 
 * @param marketShares Array of market shares (as decimals, summing to 1.0)
 * @returns HHI score (0-10,000)
 */
export function calculateHHI(marketShares: number[]): number {
  const sumOfSquares = marketShares.reduce((sum, share) => sum + Math.pow(share, 2), 0);
  return sumOfSquares * 10000;
}

/**
 * Calculate HHI assuming uniform market distribution
 * (all competitors have equal market share)
 */
export function calculateUniformHHI(competitorCount: number): number {
  if (competitorCount <= 0) return 10000; // Monopoly
  
  const equalShare = 1 / competitorCount;
  const hhi = competitorCount * Math.pow(equalShare, 2) * 10000;
  
  return hhi;
}

/**
 * Interpret HHI score
 */
export function interpretHHI(hhi: number): {
  level: 'competitive' | 'moderate' | 'concentrated';
  description: string;
} {
  if (hhi < 1500) {
    return {
      level: 'competitive',
      description: 'Highly competitive market with many players'
    };
  } else if (hhi < 2500) {
    return {
      level: 'moderate',
      description: 'Moderately concentrated market'
    };
  } else {
    return {
      level: 'concentrated',
      description: 'Highly concentrated market (oligopoly)'
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPETITOR DENSITY ESTIMATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Competitors per 10,000 people (research-backed densities for NYC)
 */
const COMPETITOR_DENSITY: Record<string, number> = {
  coffee: 2.5,       // NYC has ~25 coffee shops per 100k people
  cafe: 2.5,
  restaurant: 3.0,   // ~30 restaurants per 100k
  food: 3.0,
  retail: 2.0,       // ~20 specialty retail per 100k
  shop: 2.0,
  boutique: 1.2,     // ~12 boutiques per 100k
  gym: 0.5,          // ~5 gyms per 100k
  fitness: 0.5,
  salon: 1.5,        // ~15 salons per 100k
  barber: 1.5,
};

/**
 * Estimate competitor count using density-based model
 * 
 * Formula: Competitors = (Population / 10,000) × Density × Saturation_Multiplier
 */
export function estimateCompetitorCount(
  businessType: string,
  population: number,
  industrySaturation: number  // 0-100
): number {
  const type = businessType.toLowerCase();
  
  // Get base density
  let density = 1.0; // Default
  for (const [key, value] of Object.entries(COMPETITOR_DENSITY)) {
    if (type.includes(key)) {
      density = value;
      break;
    }
  }
  
  // Base competitor count
  const baseCount = (population / 10000) * density;
  
  // Saturation multiplier (saturation 50% = 1x, 100% = 2x, 0% = 0.5x)
  const saturationMultiplier = 0.5 + (industrySaturation / 100);
  
  const estimatedCount = baseCount * saturationMultiplier;
  
  return Math.round(Math.max(1, estimatedCount));
}

/**
 * Calculate market capacity (max sustainable competitors)
 * 
 * Based on:
 * - Population
 * - Average customer spend
 * - Required revenue per business
 */
export function calculateMarketCapacity(
  population: number,
  marketPenetration: number,     // % of population that are customers (0-1)
  avgSpendPerCustomer: number,   // Monthly spend
  minViableRevenue: number = 15000  // Min revenue to sustain a business
): number {
  // Total addressable market
  const totalCustomers = population * marketPenetration;
  const totalMarketRevenue = totalCustomers * avgSpendPerCustomer;
  
  // How many businesses can this market sustain?
  const capacity = totalMarketRevenue / minViableRevenue;
  
  return Math.floor(capacity);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENTRY/EXIT PROBABILITY MODELS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate probability of new competitor entry
 * 
 * Factors:
 * - Market attractiveness (profits)
 * - Barriers to entry
 * - Economic climate
 * - Current saturation
 */
export function calculateEntryProbability(
  economicClimate: 'booming' | 'stable' | 'declining' | 'recession',
  marketSaturation: number,      // 0-100
  avgProfitMargin: number,       // percentage
  barrierToEntry: 'low' | 'medium' | 'high'
): number {
  // Base entry rate (monthly probability)
  let baseRate = 0.05; // 5% chance per month in normal conditions
  
  // Economic climate adjustment
  const economicMultiplier = {
    'booming': 1.5,
    'stable': 1.0,
    'declining': 0.6,
    'recession': 0.3
  }[economicClimate];
  
  // Saturation penalty (exponential)
  // At 50% saturation, normal entry
  // At 100% saturation, very low entry
  const saturationPenalty = Math.exp(-(marketSaturation - 50) / 30);
  
  // Profit attractiveness
  const profitMultiplier = 0.5 + (avgProfitMargin / 40); // 20% margin = 1.0x
  
  // Barrier to entry
  const barrierMultiplier = {
    'low': 1.5,
    'medium': 1.0,
    'high': 0.5
  }[barrierToEntry];
  
  const entryProb = baseRate 
    * economicMultiplier 
    * saturationPenalty 
    * profitMultiplier 
    * barrierMultiplier;
  
  // Clamp between 0.5% and 20%
  return Math.min(0.20, Math.max(0.005, entryProb));
}

/**
 * Calculate expected competitor exits
 * 
 * Based on 5-year survival rates and market conditions
 */
export function calculateExpectedExits(
  currentCompetitorCount: number,
  survivalRate5Year: number,      // percentage (e.g., 45 for 45%)
  economicClimate: 'booming' | 'stable' | 'declining' | 'recession',
  marketSaturation: number         // 0-100
): number {
  // Convert 5-year survival to monthly failure rate
  // Formula: (1 - (survival_rate/100)^(1/60))
  const survivalDecimal = survivalRate5Year / 100;
  const monthlyFailureRate = 1 - Math.pow(survivalDecimal, 1 / 60);
  
  // Economic climate adjustment
  const economicMultiplier = {
    'booming': 0.7,      // -30% failure rate
    'stable': 1.0,       // Normal
    'declining': 1.3,    // +30% failure rate
    'recession': 1.8     // +80% failure rate
  }[economicClimate];
  
  // Saturation effect (overcrowded markets have more failures)
  const saturationMultiplier = marketSaturation > 80 
    ? 1 + ((marketSaturation - 80) / 100) 
    : 1.0;
  
  const adjustedFailureRate = monthlyFailureRate * economicMultiplier * saturationMultiplier;
  
  const expectedExits = currentCompetitorCount * adjustedFailureRate;
  
  // Round probabilistically
  const baseExits = Math.floor(expectedExits);
  const fractional = expectedExits - baseExits;
  const totalExits = Math.random() < fractional ? baseExits + 1 : baseExits;
  
  return Math.max(0, totalExits);
}

/**
 * Calculate competitive intensity score (0-100)
 * 
 * Combines:
 * - Number of competitors
 * - Market concentration (HHI)
 * - Market saturation
 */
export function calculateCompetitiveIntensity(
  competitorCount: number,
  hhi: number,
  marketSaturation: number  // 0-100
): number {
  // Competitor density component (0-50 points)
  const densityScore = Math.min(50, competitorCount * 2);
  
  // Market concentration component (inverse of HHI) (0-25 points)
  // Low HHI (competitive) = high score
  const concentrationScore = 25 * (1 - Math.min(1, hhi / 10000));
  
  // Saturation component (0-25 points)
  const saturationScore = (marketSaturation / 100) * 25;
  
  const intensity = densityScore + concentrationScore + saturationScore;
  
  return Math.min(100, Math.round(intensity));
}
