/**
 * Event Templates for Business Simulation
 * 
 * Pre-defined event templates with probabilistic selection (Monte Carlo method).
 * Events have base probabilities modified by seasonal, demographic, and economic factors.
 * 
 * Key Models:
 * - Monte Carlo weighted random selection
 * - Seasonal probability multipliers
 * - Demographic filters (income, education, population density)
 * - Economic climate adjustments
 * 
 * Sources:
 * - NYC historical business impact data
 * - Seasonal tourism patterns (NYC & Company)
 * - Economic cycle research (NBER)
 */

export type EventCategory = 
  | 'weather' 
  | 'holiday' 
  | 'economic' 
  | 'local' 
  | 'regulatory' 
  | 'technology' 
  | 'social';

export type EventImpact = 'positive' | 'negative' | 'neutral';

export interface EventTemplate {
  id: string;
  name: string;
  category: EventCategory;
  description: string;
  
  // Impact multipliers
  customerTrafficMultiplier: number; // 0.5 = -50%, 1.5 = +50%
  revenueMultiplier: number;
  cogsMultiplier: number; // Some events increase costs
  
  // Probability (0-1, base probability per month)
  baseProbability: number;
  
  // Seasonal multipliers (multiply baseProbability)
  seasonalMultipliers: {
    spring: number; // Mar-May
    summer: number; // Jun-Aug
    fall: number;   // Sep-Nov
    winter: number; // Dec-Feb
  };
  
  // Demographic filters (if event applies)
  demographicFilters?: {
    minMedianIncome?: number;
    maxMedianIncome?: number;
    minEducationRate?: number; // % with bachelor's+
    minPopulation?: number;
    maxPopulation?: number;
    borough?: ('Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island')[];
  };
  
  // Business type relevance (multiply probability)
  businessTypeMultipliers?: {
    [businessType: string]: number;
  };
  
  // Duration in months
  durationMonths: number;
}

/**
 * Master event template library
 * 
 * Probabilities calibrated so average business sees 2-3 events per year
 */
export const EVENT_TEMPLATES: EventTemplate[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WEATHER EVENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'winter_storm',
    name: 'Major Winter Storm',
    category: 'weather',
    description: 'Heavy snowfall reduces foot traffic significantly',
    customerTrafficMultiplier: 0.4,
    revenueMultiplier: 0.5,
    cogsMultiplier: 1.0,
    baseProbability: 0.02, // 2% per month
    seasonalMultipliers: {
      spring: 0.2,
      summer: 0,
      fall: 0.3,
      winter: 3.0, // 6% chance in winter
    },
    durationMonths: 1,
  },
  
  {
    id: 'heat_wave',
    name: 'Summer Heat Wave',
    category: 'weather',
    description: 'Extreme heat drives customers to air-conditioned venues',
    customerTrafficMultiplier: 1.2,
    revenueMultiplier: 1.15,
    cogsMultiplier: 1.1, // Higher cooling costs
    baseProbability: 0.03,
    seasonalMultipliers: {
      spring: 0.5,
      summer: 4.0, // 12% in summer
      fall: 0.3,
      winter: 0,
    },
    businessTypeMultipliers: {
      'coffee_shop': 1.3,
      'restaurant': 1.2,
      'bar': 1.4,
      'retail_store': 0.9,
    },
    durationMonths: 1,
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HOLIDAY & SEASONAL EVENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'holiday_shopping_season',
    name: 'Holiday Shopping Rush',
    category: 'holiday',
    description: 'Thanksgiving to New Year surge in consumer spending',
    customerTrafficMultiplier: 1.6,
    revenueMultiplier: 1.8,
    cogsMultiplier: 1.05,
    baseProbability: 0.8, // Nearly guaranteed
    seasonalMultipliers: {
      spring: 0,
      summer: 0,
      fall: 0.25, // November only
      winter: 5.0, // December
    },
    businessTypeMultipliers: {
      'retail_store': 2.0,
      'coffee_shop': 1.3,
      'restaurant': 1.4,
      'bakery': 1.8,
      'bar': 1.2,
      'bodega': 1.1,
    },
    durationMonths: 2,
  },
  
  {
    id: 'summer_tourism_boost',
    name: 'Summer Tourism Peak',
    category: 'holiday',
    description: 'NYC summer tourism creates higher foot traffic',
    customerTrafficMultiplier: 1.3,
    revenueMultiplier: 1.25,
    cogsMultiplier: 1.0,
    baseProbability: 0.7,
    seasonalMultipliers: {
      spring: 0.3,
      summer: 1.5,
      fall: 0.2,
      winter: 0,
    },
    demographicFilters: {
      borough: ['Manhattan', 'Brooklyn'], // Tourist areas
    },
    durationMonths: 3,
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ECONOMIC EVENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'recession_fears',
    name: 'Economic Recession Concerns',
    category: 'economic',
    description: 'Consumer confidence drops, discretionary spending declines',
    customerTrafficMultiplier: 0.85,
    revenueMultiplier: 0.80,
    cogsMultiplier: 1.05, // Supplier costs rise
    baseProbability: 0.03,
    seasonalMultipliers: {
      spring: 1.0,
      summer: 1.0,
      fall: 1.0,
      winter: 1.0,
    },
    durationMonths: 6, // Long-lasting
  },
  
  {
    id: 'inflation_spike',
    name: 'Inflation Surge',
    category: 'economic',
    description: 'Rapid price increases reduce purchasing power',
    customerTrafficMultiplier: 0.90,
    revenueMultiplier: 1.05, // Higher prices offset lower volume
    cogsMultiplier: 1.25, // Costs rise faster
    baseProbability: 0.04,
    seasonalMultipliers: {
      spring: 1.0,
      summer: 1.0,
      fall: 1.0,
      winter: 1.0,
    },
    durationMonths: 4,
  },
  
  {
    id: 'economic_boom',
    name: 'Economic Expansion',
    category: 'economic',
    description: 'Strong GDP growth, consumer confidence high',
    customerTrafficMultiplier: 1.2,
    revenueMultiplier: 1.25,
    cogsMultiplier: 1.02,
    baseProbability: 0.02,
    seasonalMultipliers: {
      spring: 1.0,
      summer: 1.0,
      fall: 1.0,
      winter: 1.0,
    },
    durationMonths: 6,
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOCAL EVENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'street_construction',
    name: 'Street Construction Project',
    category: 'local',
    description: 'Roadwork blocks access, reduces foot traffic',
    customerTrafficMultiplier: 0.65,
    revenueMultiplier: 0.70,
    cogsMultiplier: 1.0,
    baseProbability: 0.05,
    seasonalMultipliers: {
      spring: 1.5, // Construction season
      summer: 2.0,
      fall: 1.0,
      winter: 0.2,
    },
    durationMonths: 3,
  },
  
  {
    id: 'new_subway_station',
    name: 'New Subway Station Opens',
    category: 'local',
    description: 'Improved transit access increases foot traffic',
    customerTrafficMultiplier: 1.4,
    revenueMultiplier: 1.35,
    cogsMultiplier: 1.0,
    baseProbability: 0.005, // Rare
    seasonalMultipliers: {
      spring: 1.0,
      summer: 1.0,
      fall: 1.0,
      winter: 1.0,
    },
    durationMonths: 12, // Permanent improvement
  },
  
  {
    id: 'local_festival',
    name: 'Neighborhood Street Festival',
    category: 'local',
    description: 'Weekend festival brings crowds to neighborhood',
    customerTrafficMultiplier: 2.0,
    revenueMultiplier: 1.8,
    cogsMultiplier: 0.95, // Bulk purchasing
    baseProbability: 0.08,
    seasonalMultipliers: {
      spring: 1.5,
      summer: 2.5,
      fall: 1.5,
      winter: 0.2,
    },
    businessTypeMultipliers: {
      'restaurant': 1.5,
      'coffee_shop': 1.4,
      'bar': 1.6,
      'food_truck': 2.0,
    },
    durationMonths: 1,
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REGULATORY EVENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'minimum_wage_increase',
    name: 'NYC Minimum Wage Hike',
    category: 'regulatory',
    description: 'Mandated wage increase raises labor costs',
    customerTrafficMultiplier: 1.0,
    revenueMultiplier: 1.0,
    cogsMultiplier: 1.15, // Labor is part of COGS for services
    baseProbability: 0.02,
    seasonalMultipliers: {
      spring: 1.0,
      summer: 1.0,
      fall: 1.0,
      winter: 1.5, // Usually Jan 1
    },
    durationMonths: 12, // Permanent
  },
  
  {
    id: 'outdoor_dining_expansion',
    name: 'Outdoor Dining Program Expansion',
    category: 'regulatory',
    description: 'NYC Open Restaurants program adds seating capacity',
    customerTrafficMultiplier: 1.25,
    revenueMultiplier: 1.3,
    cogsMultiplier: 1.05,
    baseProbability: 0.01,
    seasonalMultipliers: {
      spring: 2.0,
      summer: 1.5,
      fall: 0.5,
      winter: 0,
    },
    businessTypeMultipliers: {
      'restaurant': 2.0,
      'coffee_shop': 1.5,
      'bar': 1.8,
    },
    durationMonths: 6,
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TECHNOLOGY EVENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'delivery_app_boost',
    name: 'Featured on Delivery App',
    category: 'technology',
    description: 'App promotion drives online orders',
    customerTrafficMultiplier: 1.5,
    revenueMultiplier: 1.4,
    cogsMultiplier: 1.08, // Platform fees
    baseProbability: 0.03,
    seasonalMultipliers: {
      spring: 1.0,
      summer: 1.0,
      fall: 1.0,
      winter: 1.5, // More delivery in winter
    },
    businessTypeMultipliers: {
      'restaurant': 2.0,
      'coffee_shop': 1.3,
      'bodega': 1.2,
    },
    durationMonths: 2,
  },
  
  {
    id: 'social_media_viral',
    name: 'Viral Social Media Post',
    category: 'social',
    description: 'Instagram/TikTok post drives foot traffic surge',
    customerTrafficMultiplier: 2.5,
    revenueMultiplier: 2.0,
    cogsMultiplier: 0.90, // Volume discounts kick in
    baseProbability: 0.01, // Rare
    seasonalMultipliers: {
      spring: 1.0,
      summer: 1.5,
      fall: 1.0,
      winter: 0.8,
    },
    demographicFilters: {
      minEducationRate: 30, // Younger, educated areas
    },
    businessTypeMultipliers: {
      'coffee_shop': 1.8,
      'bakery': 2.0,
      'restaurant': 1.5,
    },
    durationMonths: 1,
  },
];

/**
 * Calculate effective probability for an event
 * 
 * Formula: base × seasonal × demographic × business type
 * 
 * @param template - Event template
 * @param month - Current month (1-12)
 * @param businessType - Type of business
 * @param demographics - Demographic data
 * @param borough - NYC borough
 * @returns Effective probability (0-1)
 */
export function calculateEventProbability(
  template: EventTemplate,
  month: number,
  businessType: string,
  demographics: {
    medianIncome: number;
    educationRate: number;
    population: number;
  },
  borough: 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island'
): number {
  let probability = template.baseProbability;
  
  // Apply seasonal multiplier
  const season = getSeasonFromMonth(month);
  probability *= template.seasonalMultipliers[season];
  
  // Apply demographic filters
  if (template.demographicFilters) {
    const filters = template.demographicFilters;
    
    if (filters.minMedianIncome && demographics.medianIncome < filters.minMedianIncome) {
      return 0; // Event doesn't apply
    }
    if (filters.maxMedianIncome && demographics.medianIncome > filters.maxMedianIncome) {
      return 0;
    }
    if (filters.minEducationRate && demographics.educationRate < filters.minEducationRate) {
      return 0;
    }
    if (filters.minPopulation && demographics.population < filters.minPopulation) {
      return 0;
    }
    if (filters.maxPopulation && demographics.population > filters.maxPopulation) {
      return 0;
    }
    if (filters.borough && !filters.borough.includes(borough)) {
      return 0;
    }
  }
  
  // Apply business type multiplier
  if (template.businessTypeMultipliers) {
    const multiplier = template.businessTypeMultipliers[businessType] || 1.0;
    probability *= multiplier;
  }
  
  // Cap at 100%
  return Math.min(probability, 1.0);
}

/**
 * Monte Carlo event selection
 * 
 * Weighted random selection based on calculated probabilities.
 * Higher probability events more likely to occur.
 * 
 * @param month - Current month
 * @param businessType - Type of business
 * @param demographics - Demographic data
 * @param borough - NYC borough
 * @returns Selected event template or null if no event
 */
export function selectEventMonteCarlo(
  month: number,
  businessType: string,
  demographics: {
    medianIncome: number;
    educationRate: number;
    population: number;
  },
  borough: 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island'
): EventTemplate | null {
  // Calculate probabilities for all events
  const eventProbabilities = EVENT_TEMPLATES.map(template => ({
    template,
    probability: calculateEventProbability(template, month, businessType, demographics, borough),
  }));
  
  // Filter out zero-probability events
  const validEvents = eventProbabilities.filter(e => e.probability > 0);
  
  if (validEvents.length === 0) {
    return null; // No applicable events
  }
  
  // Monte Carlo weighted random selection
  const totalProbability = validEvents.reduce((sum, e) => sum + e.probability, 0);
  const randomValue = Math.random() * totalProbability;
  
  let cumulativeProbability = 0;
  for (const event of validEvents) {
    cumulativeProbability += event.probability;
    if (randomValue <= cumulativeProbability) {
      return event.template;
    }
  }
  
  // Fallback (should never reach here)
  return validEvents[validEvents.length - 1].template;
}

/**
 * Get season from month number
 */
function getSeasonFromMonth(month: number): 'spring' | 'summer' | 'fall' | 'winter' {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

/**
 * Determine if event should occur this month
 * 
 * Uses single random draw against calculated probability
 * 
 * @param template - Event template
 * @param month - Current month
 * @param businessType - Type of business
 * @param demographics - Demographic data
 * @param borough - NYC borough
 * @returns True if event occurs
 */
export function shouldEventOccur(
  template: EventTemplate,
  month: number,
  businessType: string,
  demographics: {
    medianIncome: number;
    educationRate: number;
    population: number;
  },
  borough: 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island'
): boolean {
  const probability = calculateEventProbability(template, month, businessType, demographics, borough);
  return Math.random() < probability;
}
