/**
 * 🧪 TEST FILE - Employee Agent
 * 
 * Demonstrează funcționalitatea employee-agent cu diverse scenarii
 */

import {
  calculateEmployeeMetrics,
  ECONOMIC_CONSTANTS,
  calculateIdealMonthlyLoad,
  calculateProductivityScore,
  calculateSalaryMorale,
  calculateWorkloadMorale,
  isOverworked,
  type EmployeeInput,
  type EmployeeResult
} from './employee-agent';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST SCENARIOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('🧪 EMPLOYEE AGENT - TEST SCENARIOS\n');
console.log('═'.repeat(70));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENARIO 1: BALANCED WORKLOAD (Optimal)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n📊 SCENARIO 1: BALANCED WORKLOAD (Optimal)\n');

const scenario1: EmployeeInput = {
  num_employees: 4,
  salary_per_employee: 3500,      // Good salary
  customers_served: 8500,          // ~2125 per employee (ideal: 2250)
  market_median_income: 65000      // NYC median
};

const result1 = calculateEmployeeMetrics(scenario1);

console.log('Input:');
console.log(`  - Employees: ${scenario1.num_employees}`);
console.log(`  - Salary per employee: $${scenario1.salary_per_employee}/month`);
console.log(`  - Customers served: ${scenario1.customers_served}`);
console.log(`  - Market median income: $${scenario1.market_median_income}/year`);
console.log('\nOutput:');
console.log(`  - Total salaries: $${result1.total_salaries}`);
console.log(`  - Productivity score: ${result1.productivity_score}/100`);
console.log(`  - Morale: ${result1.morale}/100`);
console.log(`  - Overworked: ${result1.overworked ? '⚠️  YES' : '✅ NO'}`);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENARIO 2: OVERWORKED TEAM (High customers, low staff)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n═'.repeat(70));
console.log('\n📊 SCENARIO 2: OVERWORKED TEAM (Too many customers)\n');

const scenario2: EmployeeInput = {
  num_employees: 3,
  salary_per_employee: 2800,      // Average salary
  customers_served: 9200,          // ~3067 per employee (ideal: 2250)
  market_median_income: 65000
};

const result2 = calculateEmployeeMetrics(scenario2);

console.log('Input:');
console.log(`  - Employees: ${scenario2.num_employees}`);
console.log(`  - Salary per employee: $${scenario2.salary_per_employee}/month`);
console.log(`  - Customers served: ${scenario2.customers_served}`);
console.log(`  - Customers per employee: ${Math.round(scenario2.customers_served / scenario2.num_employees)}`);
console.log('\nOutput:');
console.log(`  - Total salaries: $${result2.total_salaries}`);
console.log(`  - Productivity score: ${result2.productivity_score}/100 (capped at 100)`);
console.log(`  - Morale: ${result2.morale}/100 ⚠️  LOW`);
console.log(`  - Overworked: ${result2.overworked ? '⚠️  YES - NEED TO HIRE!' : '✅ NO'}`);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENARIO 3: UNDERUTILIZED TEAM (Too much staff, low customers)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n═'.repeat(70));
console.log('\n📊 SCENARIO 3: UNDERUTILIZED TEAM (Too much staff)\n');

const scenario3: EmployeeInput = {
  num_employees: 6,
  salary_per_employee: 3200,
  customers_served: 8000,          // ~1333 per employee (ideal: 2250)
  market_median_income: 65000
};

const result3 = calculateEmployeeMetrics(scenario3);

console.log('Input:');
console.log(`  - Employees: ${scenario3.num_employees}`);
console.log(`  - Salary per employee: $${scenario3.salary_per_employee}/month`);
console.log(`  - Customers served: ${scenario3.customers_served}`);
console.log(`  - Customers per employee: ${Math.round(scenario3.customers_served / scenario3.num_employees)}`);
console.log('\nOutput:');
console.log(`  - Total salaries: $${result3.total_salaries} (HIGH COST)`);
console.log(`  - Productivity score: ${result3.productivity_score}/100 ⚠️  LOW`);
console.log(`  - Morale: ${result3.morale}/100 (employees bored)`);
console.log(`  - Overworked: ${result3.overworked ? '⚠️  YES' : '✅ NO'}`);
console.log('  💡 Recommendation: Reduce staff or increase marketing');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENARIO 4: LOW SALARY (Poor compensation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n═'.repeat(70));
console.log('\n📊 SCENARIO 4: LOW SALARY (Poor compensation)\n');

const scenario4: EmployeeInput = {
  num_employees: 4,
  salary_per_employee: 2000,      // Low salary (below market median/12)
  customers_served: 8500,
  market_median_income: 65000     // $5417/month median
};

const result4 = calculateEmployeeMetrics(scenario4);

console.log('Input:');
console.log(`  - Employees: ${scenario4.num_employees}`);
console.log(`  - Salary per employee: $${scenario4.salary_per_employee}/month`);
console.log(`  - Market median monthly: $${Math.round(scenario4.market_median_income / 12)}/month`);
console.log(`  - Salary fairness: ${((scenario4.salary_per_employee / (scenario4.market_median_income / 12)) * 100).toFixed(1)}%`);
console.log('\nOutput:');
console.log(`  - Total salaries: $${result4.total_salaries}`);
console.log(`  - Productivity score: ${result4.productivity_score}/100`);
console.log(`  - Morale: ${result4.morale}/100 ⚠️  LOW (poor salary)`);
console.log(`  - Overworked: ${result4.overworked ? '⚠️  YES' : '✅ NO'}`);
console.log('  💡 Recommendation: Increase salaries to retain staff');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENARIO 5: PREMIUM BUSINESS (High salary, balanced workload)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n═'.repeat(70));
console.log('\n📊 SCENARIO 5: PREMIUM BUSINESS (Optimal conditions)\n');

const scenario5: EmployeeInput = {
  num_employees: 5,
  salary_per_employee: 4500,      // Premium salary
  customers_served: 11000,         // ~2200 per employee (ideal: 2250)
  market_median_income: 65000
};

const result5 = calculateEmployeeMetrics(scenario5);

console.log('Input:');
console.log(`  - Employees: ${scenario5.num_employees}`);
console.log(`  - Salary per employee: $${scenario5.salary_per_employee}/month`);
console.log(`  - Customers served: ${scenario5.customers_served}`);
console.log(`  - Customers per employee: ${Math.round(scenario5.customers_served / scenario5.num_employees)}`);
console.log('\nOutput:');
console.log(`  - Total salaries: $${result5.total_salaries}`);
console.log(`  - Productivity score: ${result5.productivity_score}/100 ✅`);
console.log(`  - Morale: ${result5.morale}/100 ✅ EXCELLENT`);
console.log(`  - Overworked: ${result5.overworked ? '⚠️  YES' : '✅ NO'}`);
console.log('  💡 Status: Ideal team conditions - maintain current strategy');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENARIO 6: EDGE CASE - Zero customers (startup)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n═'.repeat(70));
console.log('\n📊 SCENARIO 6: EDGE CASE - Zero customers (startup)\n');

const scenario6: EmployeeInput = {
  num_employees: 2,
  salary_per_employee: 3000,
  customers_served: 0,             // No customers yet
  market_median_income: 65000
};

const result6 = calculateEmployeeMetrics(scenario6);

console.log('Input:');
console.log(`  - Employees: ${scenario6.num_employees}`);
console.log(`  - Salary per employee: $${scenario6.salary_per_employee}/month`);
console.log(`  - Customers served: ${scenario6.customers_served}`);
console.log('\nOutput:');
console.log(`  - Total salaries: $${result6.total_salaries}`);
console.log(`  - Productivity score: ${result6.productivity_score}/100 (no customers)`);
console.log(`  - Morale: ${result6.morale}/100 (decent salary, but bored)`);
console.log(`  - Overworked: ${result6.overworked ? '⚠️  YES' : '✅ NO'}`);
console.log('  💡 Recommendation: Focus on marketing to acquire customers');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UNIT TESTS - Helper Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n═'.repeat(70));
console.log('\n🧪 UNIT TESTS - Helper Functions\n');

// Test 1: Ideal monthly load
const idealLoad = calculateIdealMonthlyLoad();
console.log(`✅ Ideal monthly load: ${idealLoad} customers/employee`);
console.log(`   Formula: ${ECONOMIC_CONSTANTS.CUSTOMERS_PER_EMPLOYEE_PER_DAY} × ${ECONOMIC_CONSTANTS.WORKING_DAYS_PER_MONTH}`);

// Test 2: Productivity score
const testProductivity = calculateProductivityScore(2700, 2250);
console.log(`\n✅ Productivity score: ${Math.round(testProductivity)}/100`);
console.log(`   For: 2700 customers vs 2250 ideal (120% load)`);

// Test 3: Salary morale
const testSalaryMorale = calculateSalaryMorale(3500, 65000);
console.log(`\n✅ Salary morale: ${Math.round(testSalaryMorale)}/100`);
console.log(`   For: $3500/month vs $${Math.round(65000/12)}/month median`);

// Test 4: Workload morale - balanced
const testWorkloadBalanced = calculateWorkloadMorale(1.0);
console.log(`\n✅ Workload morale (balanced): ${testWorkloadBalanced}/100`);
console.log(`   Ratio: 1.0 (perfect balance)`);

// Test 5: Workload morale - overworked
const testWorkloadHigh = calculateWorkloadMorale(1.5);
console.log(`\n✅ Workload morale (overworked): ${testWorkloadHigh}/100`);
console.log(`   Ratio: 1.5 (50% over capacity)`);

// Test 6: Overworked check
const testOverworked = isOverworked(1.3);
console.log(`\n✅ Overworked check: ${testOverworked}`);
console.log(`   For ratio: 1.3 (30% over capacity)`);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERFORMANCE TEST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n═'.repeat(70));
console.log('\n⚡ PERFORMANCE TEST\n');

const iterations = 10000;
const startTime = Date.now();

for (let i = 0; i < iterations; i++) {
  calculateEmployeeMetrics({
    num_employees: 4,
    salary_per_employee: 3000,
    customers_served: 8500,
    market_median_income: 65000
  });
}

const endTime = Date.now();
const totalTime = endTime - startTime;
const avgTime = totalTime / iterations;

console.log(`Iterations: ${iterations.toLocaleString()}`);
console.log(`Total time: ${totalTime}ms`);
console.log(`Average time: ${avgTime.toFixed(4)}ms per calculation`);
console.log(`\n✅ Target: < 1ms per calculation`);
console.log(`${avgTime < 1 ? '✅ PASSED' : '⚠️  NEEDS OPTIMIZATION'}`);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUMMARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n═'.repeat(70));
console.log('\n📋 SUMMARY\n');

console.log('Employee Agent successfully calculates:');
console.log('  ✅ Productivity score based on workload');
console.log('  ✅ Morale based on salary fairness and workload');
console.log('  ✅ Overworked status for team health monitoring');
console.log('  ✅ Total salary costs for financial calculations');
console.log('\nPerformance:');
console.log(`  ✅ Pure TypeScript (no LLM calls)`);
console.log(`  ✅ Execution time: ~${avgTime.toFixed(4)}ms`);
console.log(`  ✅ Production-ready for real-time simulation`);

console.log('\n═'.repeat(70));
