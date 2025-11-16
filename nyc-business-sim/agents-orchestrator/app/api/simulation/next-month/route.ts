import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessEvent } from '@/lib/simulation_agents/events-agent';
import type { DetailedCensusData } from '@/lib/schemas';

/**
 * POST /api/simulation/next-month
 * 
 * Generează un eveniment economic pentru luna următoare în simulare.
 * Apelat când utilizatorul apasă butonul "Next Month" din dashboard.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validez input-ul
    const { 
      businessType, 
      location, 
      censusData, 
      currentMonth, 
      currentYear 
    } = body;

    if (!businessType || !location || !censusData) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['businessType', 'location', 'censusData', 'currentMonth', 'currentYear']
        },
        { status: 400 }
      );
    }

    // Validez structura location
    if (!location.address || !location.neighborhood || 
        location.lat === undefined || location.lng === undefined) {
      return NextResponse.json(
        { error: 'Invalid location data' },
        { status: 400 }
      );
    }

    // Validez censusData
    if (!censusData.demographics_detailed) {
      return NextResponse.json(
        { error: 'Invalid census data structure' },
        { status: 400 }
      );
    }

    // Default values pentru lună și an dacă nu sunt furnizate
    const month = currentMonth || new Date().getMonth() + 1;
    const year = currentYear || new Date().getFullYear();

    console.log(`🎲 Generating event for ${businessType} in ${location.neighborhood}...`);
    console.log(`📅 Current simulation time: ${month}/${year}`);

    // Generez evenimentul folosind agentul
    const event = await generateBusinessEvent(
      businessType,
      location,
      censusData as DetailedCensusData,
      month,
      year
    );

    console.log(`✅ Event generated: ${event.nume_eveniment}`);
    console.log(`📊 Impact: ${event.impact_clienti_lunar > 0 ? '+' : ''}${event.impact_clienti_lunar}%`);

    return NextResponse.json({
      success: true,
      event: {
        nume_eveniment: event.nume_eveniment,
        impact_clienti_lunar: event.impact_clienti_lunar,
        relevanta_pentru_business: event.relevanta_pentru_business,
        descriere_scurta: event.descriere_scurta
      },
      metadata: {
        generated_at: new Date().toISOString(),
        simulation_month: month,
        simulation_year: year,
        business_type: businessType,
        location: location.neighborhood
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating business event:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate event',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/simulation/next-month
 * 
 * Returnează informații despre endpoint-ul de simulare.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/simulation/next-month',
    method: 'POST',
    description: 'Generează evenimente economice pentru simularea business-ului',
    required_fields: {
      businessType: 'string - Tipul de business (ex: "Coffee Shop")',
      location: {
        address: 'string',
        neighborhood: 'string',
        lat: 'number',
        lng: 'number'
      },
      censusData: 'DetailedCensusData object',
      currentMonth: 'number (1-12) - optional, default current month',
      currentYear: 'number - optional, default current year'
    },
    response_format: {
      success: 'boolean',
      event: {
        nume_eveniment: 'string',
        impact_clienti_lunar: 'number (percentage)',
        relevanta_pentru_business: 'boolean',
        descriere_scurta: 'string'
      },
      metadata: {
        generated_at: 'ISO timestamp',
        simulation_month: 'number',
        simulation_year: 'number',
        business_type: 'string',
        location: 'string'
      }
    }
  });
}
