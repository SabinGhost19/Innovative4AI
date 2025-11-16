import { NextRequest, NextResponse } from 'next/server';
import { runRegisterReviewAgent } from '@/lib/agents/register-review-agent';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout

// Schema pentru validarea request-ului
const RegisterReviewRequestSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
    neighborhood: z.string().optional(),
  }),
  businessType: z.string(),
  survivalData: z.object({
    county_name: z.string(),
    industry: z.string(),
    naics_code: z.string(),
    survival_rate_5_year: z.number(),
    firms_2017_start_pool: z.number(),
    interpretation: z.string(),
    risk_level: z.string().optional(),
  }).nullable(),
  censusData: z.any().nullable(), // Simplified validation for census data
});

/**
 * POST /api/register-review
 * 
 * Endpoint pentru analiza rapidă a locației selectate în timpul înregistrării.
 * Returnează o recomandare dacă locația este potrivită pentru business.
 */
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Register Review Agent - Starting analysis...');
    
    // Parse și validare request body
    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    const validatedData = RegisterReviewRequestSchema.parse(body);
    
    const { location, businessType, survivalData, censusData } = validatedData;
    
    console.log('📍 Location:', location.address || `${location.lat}, ${location.lng}`);
    console.log('🏢 Business Type:', businessType);
    console.log('📊 Survival Data Available:', !!survivalData);
    console.log('👥 Census Data Available:', !!censusData);
    
    // Rulăm agentul
    const startTime = Date.now();
    const recommendation = await runRegisterReviewAgent(
      location,
      businessType,
      survivalData,
      censusData
    );
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Analysis completed in ${processingTime}ms`);
    console.log(`🎯 Recommendation: ${recommendation.recommendation}`);
    console.log(`💯 Confidence: ${recommendation.confidence}%`);
    
    // Returnăm rezultatul
    return NextResponse.json({
      success: true,
      recommendation,
      metadata: {
        processingTime,
        location: location.address || `${location.lat}, ${location.lng}`,
        businessType,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error: any) {
    console.error('❌ Error in Register Review API:', error);
    
    // Validare error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze location',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/register-review
 * 
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    agent: 'register-review-agent',
    version: '1.0.0',
    description: 'Quick location analysis for business registration',
  });
}
