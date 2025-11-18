/**
 * Next Month Simulation API Route - Events Generation Only
 * Generates business events based on census data
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessEvent } from '@/lib/simulation_agents/events-agent';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    console.log('📥 Event generation request received');
    
    // Extract parameters from request
    const { businessType, location, censusData, currentMonth, currentYear } = body;
    
    // Validate required fields
    if (!businessType || !location || !censusData || !currentMonth || !currentYear) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: businessType, location, censusData, currentMonth, currentYear',
      }, { status: 400 });
    }
    
    // Generate event using events agent
    const event = await generateBusinessEvent(
      businessType,
      location,
      censusData,
      currentMonth,
      currentYear
    );
    
    return NextResponse.json({
      success: true,
      event: event,
      execution_time_ms: Date.now() - startTime,
    });
    
  } catch (error: any) {
    console.error('❌ Event generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Event generation failed',
      execution_time_ms: Date.now() - startTime,
    }, { status: 500 });
  }
}
