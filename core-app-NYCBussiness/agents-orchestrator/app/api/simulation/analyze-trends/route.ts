import { NextRequest, NextResponse } from 'next/server';
import { analyzeTrendsForBusiness } from '@/lib/simulation_agents/trends-agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/simulation/analyze-trends
 * 
 * Analizează Google Trends și generează insights pentru business.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      businessType, 
      location, 
      trendsData,
      currentMonth, 
      currentYear 
    } = body;

    if (!businessType || !location || !trendsData) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['businessType', 'location', 'trendsData', 'currentMonth', 'currentYear']
        },
        { status: 400 }
      );
    }

    console.log(`📊 Analyzing trends for ${businessType}...`);
    console.log(`📅 Simulation time: ${currentMonth}/${currentYear}`);

    // Analizează trends folosind agentul
    const analysis = await analyzeTrendsForBusiness(
      businessType,
      location,
      trendsData,
      currentMonth || new Date().getMonth() + 1,
      currentYear || new Date().getFullYear()
    );

    console.log(`✅ Trends analysis complete: ${analysis.main_trend.trend_name}`);
    console.log(`📈 Overall sentiment: ${analysis.overall_sentiment}`);

    return NextResponse.json({
      success: true,
      analysis: analysis,
      metadata: {
        generated_at: new Date().toISOString(),
        simulation_month: currentMonth,
        simulation_year: currentYear,
        business_type: businessType
      }
    });

  } catch (error: any) {
    console.error('❌ Error analyzing trends:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze trends',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
