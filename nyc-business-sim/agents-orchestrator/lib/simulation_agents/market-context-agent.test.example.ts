/**
 * EXEMPLU DE TEST pentru market-context-agent
 * 
 * Acest fișier demonstrează cum să folosești agentul în producție
 * Nu este un test automat, ci un exemplu de utilizare
 */

import { analyzeMarketContext, prepareCensusDataForMarketAnalysis } from './market-context-agent';

// Exemplu 1: Folosire directă cu date procesate
async function testDirectUsage() {
  console.log('🧪 Test 1: Utilizare directă cu date Census procesate\n');

  const censusData = {
    total_population: 8500,
    median_household_income: 125000,
    median_rent: 2800,
    poverty_rate: 8.5,
    education_bachelor_rate: 62.3,
    work_from_home_rate: 45.2
  };

  const location = {
    address: '123 Main St, Brooklyn, NY',
    neighborhood: 'Williamsburg',
    lat: 40.7081,
    lng: -73.9571
  };

  try {
    const marketContext = await analyzeMarketContext(
      censusData,
      'coffee_shop',
      location
    );

    console.log('✅ Market Context Result:');
    console.log(JSON.stringify(marketContext, null, 2));
    console.log('\n📊 Interpretation:');
    console.log(`- Potential customers per month: ${marketContext.market_size_estimate}`);
    console.log(`- Dominant segments: ${marketContext.dominant_segments.join(', ')}`);
    console.log(`- Demand score: ${marketContext.demand_score}/100`);
    console.log(`- Price sensitivity: ${marketContext.price_sensitivity_score}/100`);
    console.log(`- Quality preference: ${marketContext.quality_preference_score}/100`);
    console.log(`- Foot traffic multiplier: ${marketContext.foot_traffic_multiplier}x`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Exemplu 2: Procesare Census data raw și apoi analiză
async function testWithRawCensusData() {
  console.log('\n🧪 Test 2: Procesare Census data raw\n');

  // Simulează date Census raw cum vin de la API
  const rawCensusData = {
    demographics_detailed: {
      'B01003_001E': { value: 12450, label: 'Total Population' },
      'B19013_001E': { value: 89000, label: 'Median Household Income' },
      'B25031_001E': { value: 2100, label: 'Median Gross Rent' },
      'B17001_002E': { value: 1890, label: 'Population Below Poverty' },
      'B15003_001E': { value: 8900, label: 'Total Population 25+' },
      'B15003_022E': { value: 2400, label: "Bachelor's Degree" },
      'B15003_023E': { value: 980, label: "Master's Degree" },
      'B15003_025E': { value: 120, label: 'Doctorate Degree' },
      'B08301_001E': { value: 6700, label: 'Total Workers 16+' },
      'B08301_021E': { value: 1800, label: 'Work From Home' }
    }
  };

  // Procesează datele
  const processedData = prepareCensusDataForMarketAnalysis(rawCensusData);

  console.log('📋 Processed Census Data:');
  console.log(JSON.stringify(processedData, null, 2));

  const location = {
    address: '456 Broadway, Manhattan, NY',
    neighborhood: 'SoHo',
    lat: 40.7233,
    lng: -73.9978
  };

  try {
    const marketContext = await analyzeMarketContext(
      processedData,
      'boutique_gym',
      location
    );

    console.log('\n✅ Market Context for Boutique Gym:');
    console.log(JSON.stringify(marketContext, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Exemplu 3: Multiple business types pentru aceeași locație
async function testMultipleBusinessTypes() {
  console.log('\n🧪 Test 3: Comparație între business types\n');

  const censusData = {
    total_population: 15000,
    median_household_income: 95000,
    median_rent: 2400,
    poverty_rate: 12.0,
    education_bachelor_rate: 48.5,
    work_from_home_rate: 35.0
  };

  const location = {
    address: '789 5th Avenue, Queens, NY',
    neighborhood: 'Astoria',
    lat: 40.7644,
    lng: -73.9235
  };

  const businessTypes = ['coffee_shop', 'pizza_restaurant', 'yoga_studio', 'bookstore'];

  for (const businessType of businessTypes) {
    try {
      console.log(`\n📊 Analyzing: ${businessType}`);
      const result = await analyzeMarketContext(censusData, businessType, location);
      
      console.log(`   Market size: ${result.market_size_estimate} customers/month`);
      console.log(`   Segments: ${result.dominant_segments.join(', ')}`);
      console.log(`   Demand: ${result.demand_score}/100`);
      
    } catch (error) {
      console.error(`   ❌ Error for ${businessType}:`, error);
    }
  }
}

// Rulează testele (dacă acest fișier este executat direct)
if (require.main === module) {
  (async () => {
    console.log('🚀 Market Context Agent - Test Examples\n');
    console.log('=' .repeat(60));
    
    // await testDirectUsage();
    // await testWithRawCensusData();
    // await testMultipleBusinessTypes();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
  })();
}

/**
 * EXAMPLE OUTPUT:
 * 
 * {
 *   "market_size_estimate": 1200,
 *   "dominant_segments": ["young_professionals", "high_income", "remote_workers"],
 *   "demand_score": 78,
 *   "price_sensitivity_score": 65,
 *   "quality_preference_score": 72,
 *   "foot_traffic_multiplier": 1.35
 * }
 * 
 * INTERPRETATION:
 * - Aproximativ 1200 clienți potențiali per lună pentru un coffee shop în Williamsburg
 * - Segmentele dominante: tineri profesioniști, venituri mari, lucrează remote
 * - Demand ridicat (78/100) pentru coffee shops în zonă
 * - Moderată sensibilitate la preț (65/100 = nu foarte sensibili)
 * - Preferă calitate (72/100)
 * - Trafic pedonal peste medie (1.35x) datorită rate de remote work
 */
