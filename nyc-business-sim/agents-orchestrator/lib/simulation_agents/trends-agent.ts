import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

/**
 * Schema pentru trend insights generate de agent
 */
export const TrendInsightSchema = z.object({
  trend_name: z.string().describe('Numele trendului identificat'),
  impact_score: z.number().min(-100).max(100).describe('Scor de impact pentru business (-100 la +100)'),
  relevance: z.boolean().describe('Dacă trendul este relevant pentru tipul de business'),
  description: z.string().describe('Descriere scurtă a trendului și impactului'),
  actionable_insight: z.string().describe('Insight acționabil pentru business bazat pe trend'),
  confidence: z.enum(['low', 'medium', 'high']).describe('Nivelul de încredere în acest trend')
});

export type TrendInsight = z.infer<typeof TrendInsightSchema>;

/**
 * Schema pentru răspunsul complet al agentului de trends
 */
export const TrendsAnalysisSchema = z.object({
  main_trend: TrendInsightSchema.describe('Trendul principal identificat'),
  secondary_trends: z.array(TrendInsightSchema).max(2).describe('Maxim 2 trenuri secundare'),
  overall_sentiment: z.enum(['positive', 'neutral', 'negative']).describe('Sentimentul general al trendurilor'),
  market_momentum: z.enum(['accelerating', 'stable', 'decelerating']).describe('Momentum-ul pieței')
});

export type TrendsAnalysis = z.infer<typeof TrendsAnalysisSchema>;

/**
 * Interfață pentru datele Google Trends primite de la backend
 */
interface GoogleTrendsData {
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

/**
 * Agent care analizează Google Trends și generează insights pentru business.
 */
export async function analyzeTrendsForBusiness(
  businessType: string,
  location: { address: string; neighborhood: string },
  trendsData: GoogleTrendsData,
  currentMonth: number,
  currentYear: number
): Promise<TrendsAnalysis> {
  
  if (!trendsData.success) {
    // Fallback dacă trends data nu e disponibilă
    return {
      main_trend: {
        trend_name: "No trend data available",
        impact_score: 0,
        relevance: false,
        description: "Google Trends data could not be fetched",
        actionable_insight: "Continue monitoring market conditions",
        confidence: 'low'
      },
      secondary_trends: [],
      overall_sentiment: 'neutral',
      market_momentum: 'stable'
    };
  }

  const trends = trendsData.trends;
  
  // Construiește context pentru LLM
  const systemPrompt = `Ești un expert în analiza tendințelor de piață pentru business-uri locale.
Rolul tău este să analizezi datele Google Trends și să generezi insights acționabile.

IMPORTANT:
- Fii SPECIFIC și bazează-te pe datele reale furnizate
- Impact score: pozitiv (+) = oportunitate, negativ (-) = risc/scădere
- Oferă insights ACȚIONABILE, nu doar observații
- Ține cont de context temporal (luna ${currentMonth}/${currentYear})`;

  const userPrompt = `Analizează următoarele date Google Trends pentru business-ul meu:

🏢 BUSINESS:
- Tip: ${businessType}
- Locație: ${location.neighborhood}

📊 GOOGLE TRENDS DATA (Ultima Lună):
- Trend general: ${trends.interest_trend}
- Interest mediu: ${trends.average_interest}/100
- Interest maxim: ${trends.peak_interest}/100

🔑 KEYWORDS PERFORMANCE:
${Object.entries(trends.keywords_performance).map(([keyword, perf]) => 
  `- "${keyword}": ${perf.average_interest}/100 (trend: ${perf.trend})`
).join('\n')}

📈 TOP RISING QUERIES (Cele mai populare căutări în creștere):
${trends.related_rising_queries.slice(0, 5).map((q, i) => 
  `${i+1}. "${q.query}" (${q.value})`
).join('\n') || 'N/A'}

🔥 TRENDING SEARCHES (Căutări în trend):
${trends.trending_searches.slice(0, 5).map((s, i) => `${i+1}. ${s}`).join('\n') || 'N/A'}

📅 CONTEXT TEMPORAL:
- Luna curentă: ${currentMonth}/12 (${getSeasonFromMonth(currentMonth)})
- An: ${currentYear}

GENEREAZĂ:
1. UN trend principal care are cel mai mare impact pentru acest business
2. Maxim 2 trenuri secundare relevante
3. Evaluează sentimentul general și momentum-ul pieței

IMPORTANT: Bazează-te DOAR pe datele furnizate. Dacă un trend nu e relevant pentru acest tip de business, marchează-l ca irelevant.`;

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: TrendsAnalysisSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
  });

  return result.object;
}

/**
 * Helper pentru a determina sezonul din luna curentă
 */
function getSeasonFromMonth(month: number): string {
  if (month >= 3 && month <= 5) return 'Primăvară';
  if (month >= 6 && month <= 8) return 'Vară';
  if (month >= 9 && month <= 11) return 'Toamnă';
  return 'Iarnă';
}
