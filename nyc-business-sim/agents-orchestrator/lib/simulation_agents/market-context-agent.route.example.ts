/**
 * EXEMPLU DE API ROUTE pentru market-context-agent
 * 
 * Acest fișier demonstrează cum să integrezi agentul în Next.js API routes
 * Copiază în: app/api/market-context/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  analyzeMarketContext, 
  prepareCensusDataForMarketAnalysis 
} from '@/lib/simulation_agents/market-context-agent';

/**
 * POST /api/market-context
 * 
 * Body:
 * {
 *   "businessType": "coffee_shop",
 *   "location": {
 *     "address": "123 Main St, Brooklyn, NY",
 *     "neighborhood": "Williamsburg",
 *     "lat": 40.7081,
 *     "lng": -73.9571
 *   },
 *   "censusData": {
 *     // Raw Census data sau processed data
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { businessType, location, censusData } = body;

    // Validare input
    if (!businessType || !location || !censusData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: businessType, location, censusData' 
        },
        { status: 400 }
      );
    }

    console.log(`🏪 Analyzing market context for: ${businessType}`);
    console.log(`📍 Location: ${location.neighborhood}, ${location.address}`);

    // Procesează Census data dacă e raw
    let processedCensusData;
    
    if (censusData.demographics_detailed) {
      // Este Census data raw de la backend
      console.log('📊 Processing raw Census data...');
      processedCensusData = prepareCensusDataForMarketAnalysis(censusData);
    } else {
      // Este deja procesată
      processedCensusData = censusData;
    }

    console.log('📈 Census data processed:', {
      population: processedCensusData.total_population,
      income: processedCensusData.median_household_income,
      education: `${processedCensusData.education_bachelor_rate.toFixed(1)}%`
    });

    // Rulează agentul
    const startTime = Date.now();
    
    const marketContext = await analyzeMarketContext(
      processedCensusData,
      businessType,
      location
    );

    const executionTime = Date.now() - startTime;

    console.log(`✅ Market context generated in ${executionTime}ms`);
    console.log('📊 Results:', {
      market_size: marketContext.market_size_estimate,
      segments: marketContext.dominant_segments,
      demand: marketContext.demand_score
    });

    return NextResponse.json({
      success: true,
      data: marketContext,
      metadata: {
        execution_time_ms: executionTime,
        business_type: businessType,
        location: location.neighborhood
      }
    });

  } catch (error: any) {
    console.error('❌ Error analyzing market context:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * INTEGRATION EXAMPLE în sistemul existent
 * 
 * În app/api/simulation/next-month/route.ts, ÎNAINTE de a apela events-agent:
 * 
 * ```typescript
 * // 1. Analizează market context
 * const censusDataProcessed = prepareCensusDataForMarketAnalysis(censusData);
 * const marketContext = await analyzeMarketContext(
 *   censusDataProcessed,
 *   businessType,
 *   location
 * );
 * 
 * // 2. Folosește marketContext în events-agent
 * const event = await generateBusinessEvent(
 *   businessType,
 *   location,
 *   censusData,
 *   currentMonth,
 *   currentYear,
 *   marketContext  // <- Pasează context-ul
 * );
 * 
 * // 3. Returnează toate datele
 * return NextResponse.json({
 *   success: true,
 *   marketContext,
 *   event,
 *   trends
 * });
 * ```
 */
