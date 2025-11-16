import { z } from 'zod';

// ============================================
// INPUT SCHEMAS - Census Data from FastAPI
// ============================================

export const FipsCodesSchema = z.object({
  state: z.string(),
  county: z.string(),
  tract: z.string(),
});

export const DetailedFipsCodesSchema = FipsCodesSchema.extend({
  block: z.string(),
  full_tract_id: z.string(),
  full_block_id: z.string(),
});

export const DemographicsDetailedItemSchema = z.object({
  value: z.union([z.string(), z.number()]).nullable(),
  label: z.string(),
});

export const DerivedStatisticsSchema = z.object({
  poverty_rate: z.number(),
  high_income_households_rate: z.number(),
  high_income_count: z.number(),
  bachelor_plus_rate: z.number(),
  bachelor_plus_count: z.number(),
  renter_rate: z.number(),
  work_from_home_rate: z.number(),
});

export const CensusDataSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  area_name: z.string(),
  fips_codes: FipsCodesSchema,
  demographics: z.record(z.union([z.string(), z.number(), z.null()])),
});

export const DetailedCensusDataSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  area_name: z.string(),
  analysis_type: z.string(),
  year: z.string(),
  fips_codes: DetailedFipsCodesSchema,
  demographics_detailed: z.record(DemographicsDetailedItemSchema),
  derived_statistics: DerivedStatisticsSchema,
});

export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  neighborhood: z.string(),
});

// Request Body Schema
export const RecommendBusinessRequestSchema = z.object({
  location: LocationSchema,
  census_data: CensusDataSchema,
  detailed_data: DetailedCensusDataSchema,
});

// ============================================
// OUTPUT SCHEMAS - AI Agent Responses
// ============================================

// Agent 1: Demographics Analyst
export const DemographicsRecommendationSchema = z.object({
  business_type: z.string().describe('Specific type of business (e.g., "Premium Coffee Shop")'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level based on data'),
  reasoning: z.string().describe('Why this income/education profile supports this business'),
  target_segment: z.string().describe('Which income bracket (e.g., "$100k-$150k households")'),
  price_point: z.enum(['budget', 'mid-range', 'premium']).describe('Suggested pricing tier'),
});

export const DemographicsAnalysisSchema = z.object({
  recommendations: z.array(DemographicsRecommendationSchema).min(3).max(5),
  key_insights: z.array(z.string()).describe('2-3 critical demographic factors'),
});

// Agent 2: Lifestyle Analyst
export const LifestyleRecommendationSchema = z.object({
  business_type: z.string(),
  lifestyle_fit: z.string().describe('How it matches renter/owner/WFH patterns'),
  traffic_pattern: z.enum(['morning', 'midday', 'evening', 'weekend', 'all-day']),
  supporting_data: z.string().describe('Cite specific percentages'),
});

export const LifestyleAnalysisSchema = z.object({
  recommendations: z.array(LifestyleRecommendationSchema).min(3).max(5),
  foot_traffic_profile: z.string().describe('When are people available in this area'),
  lifestyle_insights: z.array(z.string()).min(2).max(3),
});

// Agent 3: Industry Analyst
export const IndustryRecommendationSchema = z.object({
  business_type: z.string(),
  industry_synergy: z.string().describe('Which workforce does it serve'),
  competition_level: z.enum(['low', 'medium', 'high']),
  gap_analysis: z.string().describe('What services are underserved'),
  supporting_data: z.string().describe('Cite industry percentages'),
});

export const IndustryAnalysisSchema = z.object({
  recommendations: z.array(IndustryRecommendationSchema).min(3).max(5),
  workforce_profile: z.string().describe('Dominant industry type'),
  market_gaps: z.array(z.string()).describe('Underserved services'),
});

// Aggregator: Final Recommendations
export const FinalRecommendationSchema = z.object({
  rank: z.number().describe('1, 2, or 3'),
  business_type: z.string().describe('Specific business name/category'),
  confidence_score: z.number().min(0).max(100).describe('Overall confidence (0-100)'),
  why_this_location: z.string().describe('Cite 3+ specific Census data points'),
  target_customer: z.string().describe('Based on income/education/lifestyle'),
  investment_range: z.string().describe('Estimated startup cost (e.g., "$50k-$150k")'),
  risk_level: z.enum(['low', 'medium', 'high']),
  key_data_points: z.array(z.string()).min(3).describe('Specific metrics supporting this'),
  consensus: z.string().describe('How many agents recommended this'),
});

export const WildCardRecommendationSchema = z.object({
  business_type: z.string(),
  reasoning: z.string().describe('Why it could work despite higher risk'),
  data_support: z.string().describe('Specific numbers hinting at viability'),
});

export const FinalRecommendationsSchema = z.object({
  top_recommendations: z.array(FinalRecommendationSchema).length(3),
  wild_card: WildCardRecommendationSchema,
  location_strengths: z.array(z.string()).min(3).max(3).describe('Top advantages'),
  location_challenges: z.array(z.string()).min(2).max(2).describe('Key challenges'),
});

// ============================================
// TypeScript Types (inferred from Zod)
// ============================================

export type RecommendBusinessRequest = z.infer<typeof RecommendBusinessRequestSchema>;
export type DemographicsAnalysis = z.infer<typeof DemographicsAnalysisSchema>;
export type LifestyleAnalysis = z.infer<typeof LifestyleAnalysisSchema>;
export type IndustryAnalysis = z.infer<typeof IndustryAnalysisSchema>;
export type FinalRecommendations = z.infer<typeof FinalRecommendationsSchema>;
export type CensusData = z.infer<typeof CensusDataSchema>;
export type DetailedCensusData = z.infer<typeof DetailedCensusDataSchema>;
