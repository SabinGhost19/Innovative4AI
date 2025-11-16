# 👥 Employee Agent

> **Pure Math Agent** - Calculează performanța echipei (NO LLM)

## Quick Start

```typescript
import { calculateEmployeeMetrics } from './employee-agent';

const result = calculateEmployeeMetrics({
  num_employees: 4,
  salary_per_employee: 3000,
  customers_served: 8500,
  market_median_income: 65000
});

console.log(result);
// {
//   total_employees: 4,
//   total_salaries: 12000,
//   productivity_score: 94,
//   morale: 78,
//   overworked: false
// }
```

## 📋 Files

| File | Description |
|------|-------------|
| `employee-agent.ts` | **Main implementation** - Core calculations |
| `employee-agent.test.ts` | Test scenarios (6 scenarios + performance) |
| `employee-agent.example.ts` | Integration examples & helper functions |
| `EMPLOYEE_AGENT_DOCS.md` | Complete documentation |
| `README_EMPLOYEE.md` | This file |

## 🎯 What It Does

Calculează **3 metrici cheie** pentru performanța echipei:

### 1. Productivity Score (0-100)
```
ideal_load = 75 customers/day × 30 days = 2250/month
productivity = (customers_per_employee / ideal_load) × 100
```

### 2. Morale (0-100)
```
morale = salary_morale × 0.6 + workload_morale × 0.4

salary_morale = based on vs market median
workload_morale = based on workload ratio
```

### 3. Overworked (boolean)
```
overworked = workload_ratio > 1.2
```

## 📊 Example Scenarios

### Scenario 1: Balanced Team ✅
```typescript
Input:  4 employees, $3500/month, 8500 customers
Output: productivity=94, morale=85, overworked=false
Status: EXCELLENT - Maintain strategy
```

### Scenario 2: Overworked Team ⚠️
```typescript
Input:  3 employees, $2800/month, 9200 customers
Output: productivity=100, morale=68, overworked=true
Status: CRITICAL - Need to hire immediately!
```

### Scenario 3: Overstaffed Team 💰
```typescript
Input:  6 employees, $3200/month, 8000 customers
Output: productivity=59, morale=84, overworked=false
Status: WARNING - Reduce staff or increase marketing
```

## 🚀 Performance

- **Execution time**: ~0.1ms per calculation
- **Zero LLM calls**: Pure TypeScript math
- **No async operations**: Synchronous
- **Production ready**: ✅

Benchmark (10,000 iterations):
```
Total: 8ms
Average: 0.0008ms per call
```

## 🔧 Usage in Orchestrator

```typescript
async function runMonthSimulation(input) {
  // ... Market Context, Events, Trends ...
  
  // PHASE 3: Preliminary (no customers yet)
  const employeePrelim = calculateEmployeeMetrics({
    num_employees: input.num_employees,
    salary_per_employee: input.salary_per_employee,
    customers_served: 0,  // Unknown yet
    market_median_income: input.census_data.median_household_income
  });
  
  // ... Supplier, Competition ...
  
  // PHASE 4: Customer simulation
  const customerResult = await customerAgent(...);
  
  // Recalculate with real customers
  const employeeFinal = calculateEmployeeMetrics({
    num_employees: input.num_employees,
    salary_per_employee: input.salary_per_employee,
    customers_served: customerResult.total_customers,  // REAL
    market_median_income: input.census_data.median_household_income
  });
  
  // PHASE 5: Financial uses employeeFinal.total_salaries
  // PHASE 5: Report uses employeeFinal for inbox messages
  
  return { employee: employeeFinal, ... };
}
```

## 📖 Documentation

See [`EMPLOYEE_AGENT_DOCS.md`](./EMPLOYEE_AGENT_DOCS.md) for:
- Complete formula explanations
- Economic constants
- Troubleshooting guide
- Future enhancements

## 🧪 Testing

```bash
# Run test scenarios
npx tsx lib/simulation_agents/employee-agent.test.ts

# Run integration examples
npx tsx lib/simulation_agents/employee-agent.example.ts
```

## 🔗 Integration Points

### Input from:
- **Player Decisions**: `num_employees`, `salary_per_employee`
- **Customer Agent**: `customers_served`
- **Census Data**: `market_median_income`

### Output to:
- **Financial Agent**: `total_salaries` (operating expenses)
- **Customer Agent**: Morale affects service quality
- **Report Agent**: Generates inbox messages & recommendations

## 💡 Helper Functions

See `employee-agent.example.ts` for:

```typescript
// Analyze metrics and generate recommendations
analyzeEmployeeMetrics(result)

// Generate inbox messages based on metrics
generateEmployeeInboxMessages(result, num_employees)

// Calculate service quality modifier for Customer Agent
calculateServiceQualityModifier(result)

// Calculate hiring/firing recommendations
calculateStaffingRecommendation(currentEmployees, projectedCustomers)
```

## ✅ Checklist

- [x] TypeScript strict mode
- [x] Zero LLM calls (pure math)
- [x] All types explicit
- [x] No external dependencies
- [x] Performance < 1ms
- [x] Comprehensive tests
- [x] Documentation complete
- [x] Integration examples
- [x] Production ready

## 🎓 Key Concepts

### Ideal Load
```
75 customers/employee/day × 30 days = 2250 customers/month
```

### Workload Ratio
```
< 0.8   → Underutilized (boring work)
0.8-1.2 → Balanced (optimal)
> 1.2   → Overworked (burnout risk)
```

### Morale Components
```
60% = Salary fairness (vs market median)
40% = Workload balance
```

## 🐛 Common Issues

### "Morale always low"
→ Check if `salary_per_employee` is below `market_median_income / 12`

### "Always overworked"
→ Increase `num_employees` or reduce customer volume expectations

### "Low productivity but not overworked"
→ Too many employees for customer volume (overstaffed)

## 📞 Support

For questions or issues:
1. Check `EMPLOYEE_AGENT_DOCS.md` for detailed explanations
2. Run test scenarios to verify behavior
3. Review integration examples

## 🔮 Future Enhancements

Potential additions:
- [ ] Turnover risk calculation
- [ ] Training level modifier
- [ ] Experience bonus (long-term employees)
- [ ] Seasonal workload variations
- [ ] Direct quality impact on customer satisfaction

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**License**: MIT  
**Part of**: NYC Business Simulator
