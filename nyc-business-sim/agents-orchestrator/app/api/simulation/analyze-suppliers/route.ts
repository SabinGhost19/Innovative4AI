import { NextRequest, NextResponse } from 'next/server';
import { runSupplierAgent } from '@/lib/agents/supplier-agent';
import type { DetailedCensusData, CensusData } from '@/lib/schemas';

/**
 * POST /api/simulation/analyze-suppliers
 * 
 * Analizează costuri supplier și tier recommendation pentru luna curentă.
 * Apelat în paralel cu events și trends când user apasă "Next Month".
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validare input
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
          required: ['businessType', 'location', 'censusData']
        },
        { status: 400 }
      );
    }

    // Validare location
    if (!location.address || !location.neighborhood || 
        location.lat === undefined || location.lng === undefined) {
      return NextResponse.json(
        { error: 'Invalid location data' },
        { status: 400 }
      );
    }

    // Validare censusData
    if (!censusData.demographics_detailed) {
      return NextResponse.json(
        { error: 'Invalid census data structure' },
        { status: 400 }
      );
    }

    const month = currentMonth || new Date().getMonth() + 1;
    const year = currentYear || new Date().getFullYear();

    console.log(`📦 Analyzing suppliers for ${businessType} in ${location.neighborhood}...`);
    console.log(`📅 Simulation time: ${month}/${year}`);

    // Construiește census_data în formatul așteptat de supplier-agent
    const census_data: CensusData = {
      latitude: location.lat,
      longitude: location.lng,
      area_name: location.neighborhood,
      fips_codes: censusData.fips_codes || {
        state: '36',
        county: '061',
        tract: '000000'
      },
      demographics: {}
    };

    // Convertește demographics_detailed la format simplu pentru census_data
    Object.entries(censusData.demographics_detailed).forEach(([key, item]: [string, any]) => {
      census_data.demographics[key] = item.value;
    });

    // Construiește detailed_data
    const detailed_data: DetailedCensusData = {
      latitude: location.lat,
      longitude: location.lng,
      area_name: location.neighborhood,
      analysis_type: 'simulation_monthly',
      year: year.toString(),
      fips_codes: {
        state: censusData.fips_codes?.state || '36',
        county: censusData.fips_codes?.county || '061',
        tract: censusData.fips_codes?.tract || '000000',
        block: censusData.fips_codes?.block || '0000',
        full_tract_id: `${censusData.fips_codes?.state}${censusData.fips_codes?.county}${censusData.fips_codes?.tract}`,
        full_block_id: `${censusData.fips_codes?.state}${censusData.fips_codes?.county}${censusData.fips_codes?.tract}${censusData.fips_codes?.block || '0000'}`,
      },
      demographics_detailed: censusData.demographics_detailed,
      derived_statistics: {
        poverty_rate: 0,
        high_income_households_rate: 0,
        high_income_count: 0,
        bachelor_plus_rate: 0,
        bachelor_plus_count: 0,
        renter_rate: 0,
        work_from_home_rate: 0
      }
    };

    // Calculează derived statistics dacă avem datele
    const demo = censusData.demographics_detailed;
    const getValue = (key: string): number => {
      const item = demo[key];
      if (!item) return 0;
      const val = item.value;
      if (val === null || val === 'N/A') return 0;
      return typeof val === 'number' ? val : parseFloat(val as string) || 0;
    };

    const totalPop = getValue('B01001_001E') || 1;
    const totalPop25Plus = getValue('B15003_001E') || 1;
    const totalHouseholds = getValue('B19001_001E') || 1;
    const totalHousingUnits = getValue('B25003_001E') || 1;

    detailed_data.derived_statistics = {
      poverty_rate: getValue('B17001_002E') / totalPop,
      high_income_households_rate: (
        getValue('B19001_015E') + 
        getValue('B19001_016E') + 
        getValue('B19001_017E')
      ) / totalHouseholds,
      high_income_count: getValue('B19001_015E') + getValue('B19001_016E') + getValue('B19001_017E'),
      bachelor_plus_rate: (
        getValue('B15003_022E') + 
        getValue('B15003_023E') + 
        getValue('B15003_025E')
      ) / totalPop25Plus,
      bachelor_plus_count: getValue('B15003_022E') + getValue('B15003_023E') + getValue('B15003_025E'),
      renter_rate: getValue('B25003_003E') / totalHousingUnits,
      work_from_home_rate: 0 // Not available in current data
    };

    // Rulează supplier agent
    const supplierAnalysis = await runSupplierAgent(
      location,
      census_data,
      detailed_data,
      businessType
    );

    console.log(`✅ Supplier analysis complete`);
    console.log(`   Recommended Tier: ${supplierAnalysis.recommended_tier}`);
    console.log(`   Confidence Score: ${supplierAnalysis.tier_confidence_score}`);
    console.log(`   Seasonal Modifier: ${supplierAnalysis.seasonal_cost_modifier}x`);

    return NextResponse.json({
      success: true,
      supplier_analysis: supplierAnalysis,
      metadata: {
        generated_at: new Date().toISOString(),
        simulation_month: month,
        simulation_year: year,
        business_type: businessType,
        location: location.neighborhood
      }
    });

  } catch (error: any) {
    console.error('❌ Error analyzing suppliers:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze suppliers',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/simulation/analyze-suppliers
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/simulation/analyze-suppliers',
    method: 'POST',
    description: 'Analizează costuri supplier și recomandări tier pentru simulare lunară',
    required_fields: {
      businessType: 'string - Tipul de business',
      location: {
        address: 'string',
        neighborhood: 'string',
        lat: 'number',
        lng: 'number'
      },
      censusData: 'Object cu demographics_detailed',
      currentMonth: 'number (1-12) - optional',
      currentYear: 'number - optional'
    },
    response_format: {
      success: 'boolean',
      supplier_analysis: {
        recommended_tier: 'budget | mid-range | premium',
        tier_confidence_score: 'number (0-100)',
        base_quality_score: 'number (50-100)',
        seasonal_cost_modifier: 'number (0.8-1.3)',
        cost_estimates: 'object with F&B, retail, services',
        supplier_recommendations: 'array of suppliers',
        reliability_concerns: 'array of strings',
        competitive_advantages: 'array of strings',
        key_insights: 'array of strings'
      },
      metadata: 'object'
    }
  });
}
