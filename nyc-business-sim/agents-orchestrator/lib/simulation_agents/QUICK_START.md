# 🚀 Quick Start - Simulation Agents

## TL;DR

Simularea lunară rulează în **~10 secunde** cu 9 agenți AI paralelizați:

```typescript
const result = await runMonthSimulation({
  business_id: 123,
  business_type: "Coffee Shop",
  location: { lat: 40.73, lng: -74.00 },
  current_month: 6,
  player_decisions: { /* ... */ }
});

// Returns: profit, revenue, customers, market_share, inbox_messages
```

---

## 🏗️ Arhitectură în 30 secunde

```
┌─────────────────────────────────────────────┐
│ INPUT: Player Decisions + Census + Trends  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 1: Market Context (1s)               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 2: Events + Trends (2s - PARALLEL)   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 3: Supplier + Competition (1.5s - P) │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 4: Customer Behavior (2s)            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 5: Financial + Report (3s - PARALLEL)│
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ OUTPUT: Complete Monthly Report            │
└─────────────────────────────────────────────┘
```

---

## 🤖 Cei 9 Agenți

| # | Agent | Tip | Output | Timp |
|---|-------|-----|--------|------|
| 1 | **Market Context** | LLM mini | Numeric scores | 1s |
| 2 | **Events** ✅ | LLM gpt-4o | 1 event | 2s |
| 3 | **Trends** ✅ | LLM gpt-4o | 1 trend | 2s |
| 4 | **Supplier** | LLM mini | Cost + quality | 1s |
| 5 | **Competition** | LLM mini | Strategies | 1.5s |
| 6 | **Customer** | LLM mini | Revenue + share | 2s |
| 7 | **Employee** | Math only | Efficiency | 0.1s |
| 8 | **Financial** | Math only | P&L | 0.1s |
| 9 | **Report** | LLM gpt-4o | Narrative | 3s |

✅ = Deja implementat

---

## 📝 Principii de Optimizare

### ⚡ Performanță
- **Paralelizare agresivă**: `Promise.all()` peste tot
- **Model selection**: `gpt-4o-mini` pentru decizii, `gpt-4o` doar pentru text
- **Math over LLM**: Employee & Financial = pure TypeScript
- **Output minimal**: Doar numere, NU text (except Report Agent)

### 🎯 Structured Outputs
```typescript
// ✅ TOATE outputs folosesc Zod schemas
const result = await generateObject({
  model: openai('gpt-4o-mini'),
  schema: MarketContextSchema,  // Zod schema
  prompt: "..."
});

// Zero parsing errors, full type safety
```

### 🔄 Flow Optimization
```typescript
// Phase 2 & 3: PARALLEL (independent agents)
const [events, trends] = await Promise.all([
  eventsAgent(...),
  trendsAgent(...)
]);

// Phase 4: Sequential (needs all inputs)
const customers = await customerAgent({
  events_impact: events.impact,
  trends_impact: trends.impact,
  ...
});
```

---

## 🎮 Cum să folosești

### 1. Instalează dependencies
```bash
npm install ai @ai-sdk/openai zod
```

### 2. Setează API key
```bash
OPENAI_API_KEY=sk-...
```

### 3. Rulează simularea
```typescript
import { runMonthSimulation } from '@/lib/simulation_agents/core/orchestrator';

const result = await runMonthSimulation({
  business_id: 123,
  business_type: "Coffee Shop",
  location: {
    address: "Greenwich Village, NYC",
    lat: 40.7336,
    lng: -74.0027
  },
  current_month: 6,
  current_year: 2024,
  player_decisions: {
    num_employees: 4,
    salary_per_employee: 2800,
    supplier_tier: "premium",
    product_price: 7.50,
    marketing_budget: 3000
  },
  census_data: { /* cached */ },
  trends_data: { /* from backend */ },
  competitors: [ /* Google Places */ ]
});

console.log(result.financial.net_profit);  // 20370
console.log(result.narrative.executive_summary);
```

---

## 📊 Output Structure

```typescript
{
  success: true,
  month: 6,
  year: 2024,
  
  // Financials (calculated)
  financial: {
    revenue: 69000,
    net_profit: 20370,
    gross_margin: 70.7,
    net_margin: 29.5
  },
  
  // Customer metrics
  customer: {
    total_customers: 9200,
    market_share: 51.1,
    avg_satisfaction: 88
  },
  
  // Employee metrics (calculated)
  employee: {
    efficiency: 68,
    morale: 75,
    overworked: true
  },
  
  // External factors
  events: {
    nume_eveniment: "NYC Pride Month",
    impact_clienti_lunar: 30,
    ...
  },
  
  trends: {
    main_trend: {
      trend_name: "Cold Brew în creștere",
      impact_score: 45,
      ...
    }
  },
  
  // Narrative (AI generated)
  narrative: {
    executive_summary: "Lună profitabilă...",
    inbox_messages: [
      {
        from: "Operations Manager",
        subject: "Echipa suprasolicitată",
        body: "...",
        urgency: "high"
      }
    ],
    top_recommendations: [
      {
        action: "hire_staff",
        priority: "high",
        estimated_impact: -5600
      }
    ],
    sentiment: "positive"
  },
  
  execution_time_ms: 8743
}
```

---

## 🔧 Debugging

### Logs
```typescript
// Activează detailed logs
process.env.DEBUG_AGENTS = 'true';

// Vei vedea:
// [MarketContext] 1023ms | 245 bytes
// [Events] 1847ms | 312 bytes
// [Trends] 1923ms | 289 bytes
// ...
```

### Testing individual agents
```typescript
// Test doar Market Context
const context = await marketContextAgent(
  census_data,
  "Coffee Shop",
  location
);

console.log(context.market_size_estimate);
```

---

## 📚 Documentație Completă

Vezi **[ARCHITECTURE.md](./ARCHITECTURE.md)** pentru:
- ✅ Design patterns detaliate
- ✅ Specificații complete pentru fiecare agent
- ✅ Flow de execuție explicat
- ✅ State management
- ✅ Best practices

---

## 🎯 Next Steps

1. **Implementează Core**: `types.ts`, `schemas.ts`, `constants.ts`
2. **Implementează Math Agents**: Employee, Financial (pure TypeScript)
3. **Implementează AI Agents**: Context, Supplier, Competition, Customer
4. **Refactorizează Existing**: Events, Trends (optimizați)
5. **Implementează Report**: Narrative generation
6. **Implementează Orchestrator**: Paralelizare completă
7. **Testing**: Unit tests + integration tests

**Target: < 10 secunde per simulare** ⚡
