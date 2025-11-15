import { NextRequest, NextResponse } from 'next/server';
import { runDemographicsAgent } from '@/lib/agents/demographics-agent';
import { runLifestyleAgent } from '@/lib/agents/lifestyle-agent';
import { runIndustryAgent } from '@/lib/agents/industry-agent';
import { runAggregatorAgent } from '@/lib/agents/aggregator';
import { RecommendBusinessRequestSchema } from '@/lib/schemas';

export const runtime = 'edge'; // Optional: Deploy on Edge for faster response
export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = RecommendBusinessRequestSchema.parse(body);

    const { location, census_data, detailed_data } = validatedData;

    console.log('🚀 Starting AI Agents Orchestration for:', location.neighborhood);
    console.log('📍 Location:', location.address);
    console.log('📊 Census Data Available:', !!census_data);
    console.log('🔍 Detailed Data Available:', !!detailed_data);

    // STEP 1: Run 3 specialized agents IN PARALLEL
    console.log('\n⚡ Running 3 agents in parallel...');
    const startTime = Date.now();

    const [demographicsResult, lifestyleResult, industryResult] = await Promise.all([
      runDemographicsAgent(location, census_data, detailed_data)
        .then(result => {
          console.log('✅ Demographics Agent completed');
          return result;
        })
        .catch(error => {
          console.error('❌ Demographics Agent failed:', error.message);
          throw error;
        }),
      
      runLifestyleAgent(location, census_data, detailed_data)
        .then(result => {
          console.log('✅ Lifestyle Agent completed');
          return result;
        })
        .catch(error => {
          console.error('❌ Lifestyle Agent failed:', error.message);
          throw error;
        }),
      
      runIndustryAgent(location, census_data, detailed_data)
        .then(result => {
          console.log('✅ Industry Agent completed');
          return result;
        })
        .catch(error => {
          console.error('❌ Industry Agent failed:', error.message);
          throw error;
        }),
    ]);

    const parallelTime = Date.now() - startTime;
    console.log(`\n⏱️  Parallel execution completed in ${parallelTime}ms`);

    // STEP 2: Run Aggregator with all results
    console.log('\n🧠 Running Aggregator (Strategic Advisor)...');
    const aggregatorStart = Date.now();

    const finalRecommendations = await runAggregatorAgent(
      location,
      census_data,
      detailed_data,
      demographicsResult,
      lifestyleResult,
      industryResult
    );

    const aggregatorTime = Date.now() - aggregatorStart;
    console.log(`✅ Aggregator completed in ${aggregatorTime}ms`);

    const totalTime = Date.now() - startTime;
    console.log(`\n🎉 Total processing time: ${totalTime}ms`);
    console.log(`📊 Top 3 Recommendations generated:\n`);
    finalRecommendations.top_recommendations.forEach((rec, idx) => {
      // Log all agent outputs for debugging
    console.log('\n=== AGENT OUTPUTS ===');
    finalRecommendations.top_recommendations.forEach((rec: any, idx: number) => {
      console.log(`\n${idx + 1}. ${rec.business_type} (${rec.confidence_score}% confidence)`);
      console.log(`   Target: ${rec.target_customer}`);
      console.log(`   Investment: ${rec.investment_range}`);
      console.log(`   Risk: ${rec.risk_level}`);
    });
    });

    // Return structured response
    return NextResponse.json({
      success: true,
      location: {
        neighborhood: location.neighborhood,
        address: location.address,
        tract: detailed_data.fips_codes.tract,
        block: detailed_data.fips_codes.block,
      },
      agent_analyses: {
        demographics: demographicsResult,
        lifestyle: lifestyleResult,
        industry: industryResult,
      },
      final_recommendations: finalRecommendations,
      metadata: {
        total_processing_time_ms: totalTime,
        parallel_execution_time_ms: parallelTime,
        aggregator_time_ms: aggregatorTime,
        models_used: {
          agents: 'claude-haiku-4-5-20251001',
          aggregator: 'gpt-4o'
        },
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('❌ Error in recommend-business API:', error);

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle AI SDK errors
    if (error.message?.includes('anthropic')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service error',
          message: error.message,
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
