/**
 * Test script pentru Market Context Agent
 * Rulează cu: npx tsx test-market-agent.ts
 */

import { analyzeMarketContext } from './lib/simulation_agents/market-context-agent';

async function runTest() {
  console.log('🧪 Testing Market Context Agent...\n');
  console.log('=' .repeat(60));

  // Test Case 1: Coffee Shop în Williamsburg, Brooklyn (zona affluent)
  console.log('\n📍 TEST 1: Coffee Shop - Williamsburg, Brooklyn');
  console.log('   (High income, educated, remote workers)\n');

  const test1Data = {
    total_population: 8500,
    median_household_income: 125000,
    median_rent: 2800,
    poverty_rate: 8.5,
    education_bachelor_rate: 62.3,
    work_from_home_rate: 45.2
  };

  const test1Location = {
    address: '123 Bedford Ave, Brooklyn, NY 11249',
    neighborhood: 'Williamsburg',
    lat: 40.7081,
    lng: -73.9571
  };

  try {
    console.log('⏳ Analyzing market context...');
    const startTime = Date.now();
    
    const result1 = await analyzeMarketContext(
      test1Data,
      'coffee_shop',
      test1Location
    );
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Analysis complete in', duration, 'ms\n');
    console.log('📊 RESULTS:');
    console.log(JSON.stringify(result1, null, 2));
    
    console.log('\n📈 INTERPRETATION:');
    console.log(`   • Market size: ${result1.market_size_estimate} potential customers/month`);
    console.log(`   • Target segments: ${result1.dominant_segments.join(', ')}`);
    console.log(`   • Demand level: ${result1.demand_score}/100 ${getDemandLabel(result1.demand_score)}`);
    console.log(`   • Price sensitivity: ${result1.price_sensitivity_score}/100 ${getPriceSensitivityLabel(result1.price_sensitivity_score)}`);
    console.log(`   • Quality focus: ${result1.quality_preference_score}/100 ${getQualityLabel(result1.quality_preference_score)}`);
    console.log(`   • Foot traffic: ${result1.foot_traffic_multiplier}x ${getTrafficLabel(result1.foot_traffic_multiplier)}`);

  } catch (error: any) {
    console.error('❌ Test 1 failed:', error.message);
    console.error(error);
  }

  // Test Case 2: Pizza Restaurant în Bronx (zona working class)
  console.log('\n' + '='.repeat(60));
  console.log('\n📍 TEST 2: Pizza Restaurant - Bronx');
  console.log('   (Lower income, families, price-sensitive)\n');

  const test2Data = {
    total_population: 15000,
    median_household_income: 48000,
    median_rent: 1400,
    poverty_rate: 22.5,
    education_bachelor_rate: 18.5,
    work_from_home_rate: 8.2
  };

  const test2Location = {
    address: '456 Grand Concourse, Bronx, NY 10451',
    neighborhood: 'South Bronx',
    lat: 40.8168,
    lng: -73.9258
  };

  try {
    console.log('⏳ Analyzing market context...');
    const startTime = Date.now();
    
    const result2 = await analyzeMarketContext(
      test2Data,
      'pizza_restaurant',
      test2Location
    );
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Analysis complete in', duration, 'ms\n');
    console.log('📊 RESULTS:');
    console.log(JSON.stringify(result2, null, 2));
    
    console.log('\n📈 INTERPRETATION:');
    console.log(`   • Market size: ${result2.market_size_estimate} potential customers/month`);
    console.log(`   • Target segments: ${result2.dominant_segments.join(', ')}`);
    console.log(`   • Demand level: ${result2.demand_score}/100 ${getDemandLabel(result2.demand_score)}`);
    console.log(`   • Price sensitivity: ${result2.price_sensitivity_score}/100 ${getPriceSensitivityLabel(result2.price_sensitivity_score)}`);
    console.log(`   • Quality focus: ${result2.quality_preference_score}/100 ${getQualityLabel(result2.quality_preference_score)}`);
    console.log(`   • Foot traffic: ${result2.foot_traffic_multiplier}x ${getTrafficLabel(result2.foot_traffic_multiplier)}`);

  } catch (error: any) {
    console.error('❌ Test 2 failed:', error.message);
    console.error(error);
  }

  // Test Case 3: Boutique Gym în Manhattan (zona premium)
  console.log('\n' + '='.repeat(60));
  console.log('\n📍 TEST 3: Boutique Gym - SoHo, Manhattan');
  console.log('   (Very high income, professionals, quality-focused)\n');

  const test3Data = {
    total_population: 6200,
    median_household_income: 185000,
    median_rent: 4500,
    poverty_rate: 5.2,
    education_bachelor_rate: 78.5,
    work_from_home_rate: 52.3
  };

  const test3Location = {
    address: '789 Broadway, New York, NY 10012',
    neighborhood: 'SoHo',
    lat: 40.7233,
    lng: -73.9978
  };

  try {
    console.log('⏳ Analyzing market context...');
    const startTime = Date.now();
    
    const result3 = await analyzeMarketContext(
      test3Data,
      'boutique_gym',
      test3Location
    );
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Analysis complete in', duration, 'ms\n');
    console.log('📊 RESULTS:');
    console.log(JSON.stringify(result3, null, 2));
    
    console.log('\n📈 INTERPRETATION:');
    console.log(`   • Market size: ${result3.market_size_estimate} potential customers/month`);
    console.log(`   • Target segments: ${result3.dominant_segments.join(', ')}`);
    console.log(`   • Demand level: ${result3.demand_score}/100 ${getDemandLabel(result3.demand_score)}`);
    console.log(`   • Price sensitivity: ${result3.price_sensitivity_score}/100 ${getPriceSensitivityLabel(result3.price_sensitivity_score)}`);
    console.log(`   • Quality focus: ${result3.quality_preference_score}/100 ${getQualityLabel(result3.quality_preference_score)}`);
    console.log(`   • Foot traffic: ${result3.foot_traffic_multiplier}x ${getTrafficLabel(result3.foot_traffic_multiplier)}`);

  } catch (error: any) {
    console.error('❌ Test 3 failed:', error.message);
    console.error(error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All tests completed!\n');
}

// Helper functions pentru interpretare
function getDemandLabel(score: number): string {
  if (score >= 80) return '🔥 Very High';
  if (score >= 60) return '📈 High';
  if (score >= 40) return '📊 Moderate';
  return '📉 Low';
}

function getPriceSensitivityLabel(score: number): string {
  if (score >= 70) return '💰 Not sensitive (premium market)';
  if (score >= 40) return '💵 Moderately sensitive';
  return '💸 Very sensitive (value market)';
}

function getQualityLabel(score: number): string {
  if (score >= 70) return '⭐ Quality-focused';
  if (score >= 40) return '⚖️ Balanced';
  return '💲 Price-focused';
}

function getTrafficLabel(multiplier: number): string {
  if (multiplier >= 1.3) return '🚶‍♂️🚶‍♀️🚶 High traffic';
  if (multiplier >= 0.9) return '🚶‍♂️🚶‍♀️ Normal traffic';
  return '🚶‍♂️ Lower traffic';
}

// Run tests
runTest().catch(console.error);
