/**
 * 📘 USAGE EXAMPLE - Employee Agent Integration
 * 
 * Acest fișier demonstrează cum să integrezi employee-agent
 * în orchestratorul principal de simulare.
 */

import { calculateEmployeeMetrics, type EmployeeInput, type EmployeeResult } from './employee-agent';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTEGRATION EXAMPLE 1: Basic Usage în Orchestrator
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function runMonthSimulation(input: any): Promise<any> {
  console.log('Starting simulation for month', input.current_month);
  
  // ... other agents (Market Context, Events, Trends, etc.)
  
  // PHASE 3: Employee metrics (preliminary - fără customers real)
  const employeePreliminary = calculateEmployeeMetrics({
    num_employees: input.num_employees,
    salary_per_employee: input.salary_per_employee,
    customers_served: 0,  // Nu știm încă
    market_median_income: input.census_data.median_household_income
  });
  
  console.log('Preliminary employee metrics:', employeePreliminary);
  
  // PHASE 4: Customer simulation
  const customerResult = {
    total_customers: 8500,  // Exemplu: rezultat din Customer Agent
    total_revenue: 63750
  };
  
  // Recalculăm employee metrics cu customers real
  const employeeFinal = calculateEmployeeMetrics({
    num_employees: input.num_employees,
    salary_per_employee: input.salary_per_employee,
    customers_served: customerResult.total_customers,  // REAL DATA
    market_median_income: input.census_data.median_household_income
  });
  
  console.log('Final employee metrics:', employeeFinal);
  
  // PHASE 5: Financial calculations
  const financialResult = {
    revenue: customerResult.total_revenue,
    operating_expenses: {
      salaries: employeeFinal.total_salaries,  // ← Din Employee Agent
      rent: 5000,
      utilities: 800,
      marketing: 3000
    }
  };
  
  return {
    employee: employeeFinal,
    customer: customerResult,
    financial: financialResult
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTEGRATION EXAMPLE 2: Decision Helper Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Funcție helper care analizează metricile employee și generează recomandări
 */
function analyzeEmployeeMetrics(result: EmployeeResult): {
  status: 'critical' | 'warning' | 'good' | 'excellent';
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let status: 'critical' | 'warning' | 'good' | 'excellent' = 'good';
  
  // Check overworked status
  if (result.overworked) {
    status = 'critical';
    recommendations.push('🚨 URGENT: Hire additional staff immediately');
    recommendations.push(`Current workload is ${((result.productivity_score / 100) * 1.2).toFixed(1)}x ideal capacity`);
  }
  
  // Check morale
  if (result.morale < 50) {
    status = status === 'critical' ? 'critical' : 'warning';
    recommendations.push('⚠️ Low morale detected - consider salary increase');
  } else if (result.morale < 70) {
    if (status === 'good') status = 'warning';
    recommendations.push('💡 Morale could be improved - review compensation and workload');
  }
  
  // Check productivity
  if (result.productivity_score < 60) {
    if (status === 'good') status = 'warning';
    recommendations.push('📊 Low productivity - consider reducing staff or increasing marketing');
  } else if (result.productivity_score > 95) {
    if (status === 'good') status = 'excellent';
  }
  
  // All good
  if (recommendations.length === 0) {
    recommendations.push('✅ Team performance is optimal - maintain current strategy');
    status = 'excellent';
  }
  
  return { status, recommendations };
}

// Usage:
const employeeResult = calculateEmployeeMetrics({
  num_employees: 4,
  salary_per_employee: 2800,
  customers_served: 9200,
  market_median_income: 65000
});

const analysis = analyzeEmployeeMetrics(employeeResult);
console.log('Status:', analysis.status);
console.log('Recommendations:', analysis.recommendations);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTEGRATION EXAMPLE 3: Inbox Message Generator
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface InboxMessage {
  from: string;
  subject: string;
  body: string;
  urgency: 'low' | 'medium' | 'high';
  category: 'staff' | 'finance' | 'operations';
}

/**
 * Generează inbox messages bazate pe employee metrics
 * (folosit de Report Agent)
 */
function generateEmployeeInboxMessages(
  result: EmployeeResult,
  num_employees: number
): InboxMessage[] {
  const messages: InboxMessage[] = [];
  
  // Message 1: Overworked warning
  if (result.overworked) {
    messages.push({
      from: 'Operations Manager',
      subject: 'Urgent: Team Overworked',
      body: `Staff is handling ${(result.productivity_score).toFixed(0)}% capacity. Working overtime constantly. High burnout risk. Recommend hiring 1-2 additional employees.`,
      urgency: 'high',
      category: 'staff'
    });
  }
  
  // Message 2: Low morale
  if (result.morale < 60 && !result.overworked) {
    messages.push({
      from: 'HR Manager',
      subject: 'Employee Satisfaction Alert',
      body: `Team morale at ${result.morale}/100. Consider salary review or performance bonuses to improve retention.`,
      urgency: result.morale < 40 ? 'high' : 'medium',
      category: 'staff'
    });
  }
  
  // Message 3: Low productivity
  if (result.productivity_score < 60 && num_employees > 2) {
    messages.push({
      from: 'Operations Manager',
      subject: 'Staffing Optimization Needed',
      body: `Current productivity at ${result.productivity_score}%. Team may be overstaffed for current customer volume. Consider reducing hours or staff.`,
      urgency: 'low',
      category: 'operations'
    });
  }
  
  // Message 4: High salary costs
  if (result.total_salaries > 15000 && result.productivity_score < 70) {
    messages.push({
      from: 'CFO',
      subject: 'High Labor Costs',
      body: `Monthly salaries at $${result.total_salaries.toLocaleString()}. Review staffing efficiency vs customer volume.`,
      urgency: 'medium',
      category: 'finance'
    });
  }
  
  return messages;
}

// Usage:
const messages = generateEmployeeInboxMessages(employeeResult, 4);
console.log('Generated messages:', messages);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTEGRATION EXAMPLE 4: Quality Modifier for Customer Agent
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculează modificatorul de calitate bazat pe employee morale
 * (folosit în Customer Agent pentru service quality)
 */
function calculateServiceQualityModifier(employeeResult: EmployeeResult): number {
  // High morale → better service → quality boost
  if (employeeResult.morale >= 85) {
    return 1.10;  // +10% quality
  }
  
  // Good morale → normal service
  if (employeeResult.morale >= 70) {
    return 1.05;  // +5% quality
  }
  
  // Average morale → no impact
  if (employeeResult.morale >= 50) {
    return 1.0;   // neutral
  }
  
  // Low morale → worse service → quality penalty
  if (employeeResult.morale >= 30) {
    return 0.95;  // -5% quality
  }
  
  // Very low morale → bad service → major penalty
  return 0.85;    // -15% quality
}

// Usage în Customer Agent:
const baseQuality = 85;  // Din Supplier Agent
const serviceModifier = calculateServiceQualityModifier(employeeResult);
const finalQuality = baseQuality * serviceModifier;

console.log('Base quality:', baseQuality);
console.log('Service modifier:', serviceModifier);
console.log('Final quality:', finalQuality);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTEGRATION EXAMPLE 5: Staffing Recommendation Calculator
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculează recomandări de hiring/firing bazate pe customer volume
 */
function calculateStaffingRecommendation(
  currentEmployees: number,
  projectedCustomers: number
): {
  action: 'hire' | 'fire' | 'maintain';
  count: number;
  reason: string;
} {
  const IDEAL_CUSTOMERS_PER_EMPLOYEE = 2250;
  
  const optimalEmployees = Math.round(projectedCustomers / IDEAL_CUSTOMERS_PER_EMPLOYEE);
  const difference = optimalEmployees - currentEmployees;
  
  if (difference > 0) {
    return {
      action: 'hire',
      count: difference,
      reason: `Projected ${projectedCustomers} customers needs ${optimalEmployees} employees`
    };
  } else if (difference < -1) {  // Buffer of 1 employee
    return {
      action: 'fire',
      count: Math.abs(difference),
      reason: `Current staff oversized for ${projectedCustomers} projected customers`
    };
  } else {
    return {
      action: 'maintain',
      count: 0,
      reason: 'Current staffing is optimal'
    };
  }
}

// Usage:
const recommendation = calculateStaffingRecommendation(4, 10000);
console.log('Staffing recommendation:', recommendation);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTEGRATION EXAMPLE 6: Full Simulation Flow
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function fullSimulationExample() {
  console.log('🎮 NYC BUSINESS SIMULATOR - Full Flow Example\n');
  
  // Input data
  const simulationInput = {
    business_id: 123,
    business_type: 'Artisan Coffee Shop',
    current_month: 6,
    
    // Player decisions
    num_employees: 4,
    salary_per_employee: 3000,
    
    // Census data
    census_data: {
      median_household_income: 65000,
      total_population: 35000
    }
  };
  
  console.log('📊 Player decisions:');
  console.log(`  - Employees: ${simulationInput.num_employees}`);
  console.log(`  - Salary: $${simulationInput.salary_per_employee}/month\n`);
  
  // Simulate customer volume (din Customer Agent)
  const projectedCustomers = 9200;
  
  console.log('🎯 Calculating employee metrics...\n');
  
  // Calculate employee metrics
  const employeeMetrics = calculateEmployeeMetrics({
    num_employees: simulationInput.num_employees,
    salary_per_employee: simulationInput.salary_per_employee,
    customers_served: projectedCustomers,
    market_median_income: simulationInput.census_data.median_household_income
  });
  
  console.log('📈 Results:');
  console.log(`  - Total salaries: $${employeeMetrics.total_salaries}/month`);
  console.log(`  - Productivity: ${employeeMetrics.productivity_score}/100`);
  console.log(`  - Morale: ${employeeMetrics.morale}/100`);
  console.log(`  - Overworked: ${employeeMetrics.overworked ? '⚠️  YES' : '✅ NO'}\n`);
  
  // Generate analysis
  const analysis = analyzeEmployeeMetrics(employeeMetrics);
  console.log(`🎯 Status: ${analysis.status.toUpperCase()}\n`);
  console.log('💡 Recommendations:');
  analysis.recommendations.forEach(rec => console.log(`  ${rec}`));
  
  // Generate inbox messages
  const inbox = generateEmployeeInboxMessages(employeeMetrics, simulationInput.num_employees);
  if (inbox.length > 0) {
    console.log('\n📬 Inbox Messages:');
    inbox.forEach(msg => {
      console.log(`\n  From: ${msg.from}`);
      console.log(`  Subject: ${msg.subject}`);
      console.log(`  Priority: ${msg.urgency.toUpperCase()}`);
      console.log(`  ${msg.body}`);
    });
  }
  
  // Staffing recommendation
  const staffingRec = calculateStaffingRecommendation(
    simulationInput.num_employees,
    projectedCustomers
  );
  
  console.log('\n👥 Staffing Recommendation:');
  console.log(`  Action: ${staffingRec.action.toUpperCase()}`);
  if (staffingRec.count > 0) {
    console.log(`  Count: ${staffingRec.count} employees`);
  }
  console.log(`  Reason: ${staffingRec.reason}`);
  
  return {
    metrics: employeeMetrics,
    analysis,
    inbox,
    staffingRec
  };
}

// Run example
fullSimulationExample().then(() => {
  console.log('\n✅ Simulation complete!');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT pentru utilizare în alte module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  analyzeEmployeeMetrics,
  generateEmployeeInboxMessages,
  calculateServiceQualityModifier,
  calculateStaffingRecommendation,
  fullSimulationExample
};
