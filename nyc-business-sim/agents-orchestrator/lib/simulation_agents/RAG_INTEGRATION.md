# 🧠 RAG Integration Guide - Qdrant Vector Database

**Ultima actualizare**: Ianuarie 2025

---

## 🎯 De Ce RAG?

### Problema fără RAG
```
Luna 1: "Ai venit prea scump, reduce prețurile"
Luna 2: "Ai venit prea scump, reduce prețurile"  ❌ REPETITIV
Luna 3: "Ai venit prea scump, reduce prețurile"  ❌ NU ÎNVAȚĂ
```

Player reduce prețurile în Luna 2, dar agentul **nu știe** și recomandă același lucru.

### Soluția cu RAG
```
Luna 1: "Ai venit prea scump, reduce prețurile"
Luna 2: Player reduce price de la $12 la $8
        [RAG storage: price=$12 → price=$8, outcome=...]
Luna 3: RAG retrieval: "În luna 2 ai redus la $8 și vânzările au crescut cu 40%.
        Acum piața e saturată, recomand să CREȘTI calitatea în loc de price drop"
        ✅ ÎNVAȚĂ din trecut
```

---

## 🏗️ Arhitectura RAG

### Flow Overview

```
┌─────────────────────────────────────────────────────────┐
│  ÎNAINTE DE SIMULARE (Phase 0)                          │
│  ┌──────────────────────────────────────────────┐       │
│  │ retrieveHistoricalContext()                  │       │
│  │ → Ultimele 3 luni (temporal)                 │       │
│  │ → Situații similare (semantic search)        │       │
│  │ → Recomandări trecute + outcomes             │       │
│  └──────────────────────────────────────────────┘       │
│           ↓                                             │
│  historical_context: HistoricalContext                  │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  SIMULATION (Phase 1-5)                                 │
│  Agenții rulează cu acces la historical_context         │
│  Doar Report Agent folosește efectiv contextul          │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  DUPĂ SIMULARE (Phase 6)                                │
│  ┌──────────────────────────────────────────────┐       │
│  │ storeSimulationState()                       │       │
│  │ → Embed state summary                        │       │
│  │ → Store în collection "simulation_states"    │       │
│  │                                              │       │
│  │ storeRecommendations()                       │       │
│  │ → Embed fiecare recommendation               │       │
│  │ → Store în collection "recommendations_      │       │
│  │   history"                                   │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Qdrant Collections

### Collection 1: `simulation_states`

**Scop**: Stochează state snapshot-uri pentru fiecare lună simulată.

**Vector Config**:
- Dimensiune: `1536` (OpenAI text-embedding-3-small)
- Distance: `Cosine`

**Document Structure**:
```typescript
{
  id: "user123_month5",
  vector: [0.123, 0.456, ...],  // 1536 dimensions
  payload: {
    user_id: "user123",
    business_id: "coffee_shop_brooklyn_1",
    month: 5,
    state_summary: {
      // Financial
      revenue: 28500,
      expenses: 22100,
      profit: 6400,
      
      // Operations
      customers_served: 9200,
      employee_count: 4,
      inventory_level: 850,
      cash_reserve: 15000,
      debt_level: 5000,
      
      // Market
      market_demand_score: 78,
      competition_intensity: 65,
      
      // Context
      major_events: ["NYC Pride Month"],
      trends_followed: ["cold brew coffee"],
      
      // Decisions
      decisions: {
        pricing_strategy: "competitive",
        marketing_spend: 2000,
        inventory_strategy: "moderate",
        hr_actions: []
      }
    },
    timestamp: "2025-01-15T10:30:00Z"
  }
}
```

**Embedding Source**: Text summary generat din `state_summary`:
```
Month 5 Summary:
Financial: Revenue $28500, Profit $6400, Margin 22.5%
Operations: 9200 customers, 4 employees
Market: Demand score 78, Competition 65
Events: NYC Pride Month
Trends: cold brew coffee
Strategy: competitive pricing, $2000 marketing
```

---

### Collection 2: `recommendations_history`

**Scop**: Stochează recomandările date + outcome tracking.

**Vector Config**:
- Dimensiune: `1536`
- Distance: `Cosine`

**Document Structure**:
```typescript
{
  id: "user123_month5_rec1",
  vector: [0.789, 0.234, ...],
  payload: {
    user_id: "user123",
    business_id: "coffee_shop_brooklyn_1",
    month: 5,
    recommendation: {
      category: "hr",
      text: "Angajează 2 baristas pentru a reduce workload-ul. Echipa actuală lucrează 150% din capacitate ideală.",
      priority: "high",
      context: {
        revenue_trend: "increasing",
        profit_margin: 22.5,
        market_condition: "favorable (Pride Month boost)"
      }
    },
    // Outcome adăugat în luna următoare
    outcome: {
      was_followed: true,
      impact_on_revenue: 15,  // +15% growth after hiring
      impact_on_profit: 8,    // +8% profit increase
      success_rating: 5       // 1-5 scale
    },
    timestamp: "2025-01-15T10:30:00Z"
  }
}
```

**Embedding Source**: Recommendation text direct.

---

## 🔧 Implementation Details

### 1. RAG Service (`lib/services/rag-service.ts`)

**Dependencies**:
```bash
npm install @qdrant/js-client-rest ai @ai-sdk/openai
```

**Key Functions**:

#### `initializeQdrantCollections()`
- Rulează la app startup (o singură dată)
- Creează collections dacă nu există
- **Când**: În `app/layout.tsx` sau init script

```typescript
// app/layout.tsx
import { initializeQdrantCollections } from '@/lib/services/rag-service';

export default async function RootLayout({ children }) {
  await initializeQdrantCollections();
  
  return <html>...</html>;
}
```

#### `retrieveHistoricalContext(userId, businessId, currentMonth, limit=3)`
- Returnează ultimele N luni + situații similare
- **Când**: ÎNAINTE de simulation (Phase 0)

**Retrieval Strategy**:
1. **Temporal**: Ultimele 3 luni (filter by month range)
2. **Semantic**: Vector search pentru situații similare
3. **Recommendations**: Scroll prin recommendations_history

#### `storeSimulationState(userId, businessId, month, stateSummary)`
- Embed state summary și store în Qdrant
- **Când**: DUPĂ simulation (Phase 6)

#### `storeRecommendations(userId, businessId, month, recommendations, context)`
- Embed fiecare recommendation și store
- **Când**: DUPĂ simulation (Phase 6)

---

### 2. Orchestrator Integration (`core/orchestrator.ts`)

```typescript
export async function runMonthSimulation(input: SimulationInput) {
  // ============ PHASE 0: RAG RETRIEVAL ============
  const historicalContext = await retrieveHistoricalContext(
    input.user_id,
    input.business_id,
    input.current_month,
    3
  );
  
  // ============ PHASE 1-5: SIMULATION ============
  // ... existing simulation logic ...
  
  const report = await reportAgent.run({
    ...allOutputs,
    historical_context: historicalContext  // 🆕 ADD THIS
  });
  
  // ============ PHASE 6: RAG STORAGE ============
  await storeSimulationState(
    input.user_id,
    input.business_id,
    input.current_month,
    {
      month: input.current_month,
      revenue: financialOutput.revenue,
      expenses: financialOutput.total_expenses,
      profit: financialOutput.profit,
      customers_served: customerOutput.total_customers,
      employee_count: employeeOutput.total_employees,
      inventory_level: input.current_inventory,
      cash_reserve: input.cash_reserve,
      debt_level: input.debt_level,
      market_demand_score: marketContext.demand_score,
      competition_intensity: competitionOutput.avg_competitive_pressure,
      major_events: eventsOutput.relevanta_pentru_business 
        ? [eventsOutput.nume_eveniment] 
        : [],
      trends_followed: [trendsOutput.main_trend.keyword],
      decisions: input.player_decisions
    }
  );
  
  await storeRecommendations(
    input.user_id,
    input.business_id,
    input.current_month,
    report.top_recommendations,
    {
      revenue_trend: calculateRevenueTrend(historicalContext, financialOutput.revenue),
      profit_margin: (financialOutput.profit / financialOutput.revenue) * 100,
      market_condition: marketContext.demand_score > 70 ? 'favorable' : 'challenging'
    }
  );
  
  return report;
}
```

---

### 3. Report Agent Enhancement (`agents/report-agent.ts`)

**Input Enhancement**:
```typescript
interface ReportAgentInput {
  // ... existing inputs
  historical_context: HistoricalContext;  // 🆕 ADD THIS
}
```

**Prompt Enhancement**:
```typescript
const systemPrompt = `
Tu ești un consultant de business expert care analizează performanța unei afaceri.

## CONTEXT ISTORIC DISPONIBIL
Ai acces la:
1. **Ultimele 3 luni**: Metrici financiare, decizii luate, evenimente
2. **Situații similare**: Luni anterioare cu condiții de piață asemănătoare
3. **Recomandări trecute**: Ce ai recomandat înainte și ce impact a avut

## SARCINA TA
- Compară performanța curentă cu lunile trecute (trend analysis)
- Identifică pattern-uri (ex: "vânzările cresc constant de 3 luni")
- Face recomandări bazate pe ce a funcționat/nu a funcționat în trecut
- Referențiază evenimente similare din istoricul businessului

## STIL
- Concret și actionable
- Referințe la date specifice ("ca în luna 3 când...")
- Învață din greșeli și succese trecute
`;

const userPrompt = `
## Luna Curentă (${currentMonth})
Revenue: $${financial.revenue}
Profit: $${financial.profit}
Customers: ${customer.total_customers}

## Istoric Recent (Ultimele 3 luni)
${historicalContext.recent_months.map(m => `
Luna ${m.month}: 
  Revenue $${m.state_summary.revenue}, Profit $${m.state_summary.profit}
  Evenimente: ${m.state_summary.major_events.join(', ') || 'none'}
  Decizii: ${m.state_summary.decisions.pricing_strategy} pricing, $${m.state_summary.decisions.marketing_spend} marketing
`).join('\n')}

## Situații Similare din Trecut
${historicalContext.similar_situations.map(s => `
Luna ${s.month} (similaritate: ${(s.similarity_score * 100).toFixed(0)}%)
  Context: Revenue $${s.state_summary.revenue}, Demand ${s.state_summary.market_demand_score}
  Ce s-a întâmplat: ${s.state_summary.major_events.join(', ')}
`).join('\n')}

## Recomandări Trecute & Outcomes
${historicalContext.past_recommendations.slice(0, 3).map(r => `
Luna ${r.month}: "${r.recommendation.text}"
  Priority: ${r.recommendation.priority}
  ${r.outcome ? `
  Outcome: ${r.outcome.was_followed ? 'Followed' : 'Ignored'}
  Impact: Revenue ${r.outcome.impact_on_revenue > 0 ? '+' : ''}${r.outcome.impact_on_revenue}%, Success: ${r.outcome.success_rating}/5
  ` : 'Outcome: Pending'}
`).join('\n')}

Generează raportul lunar bazat pe analiza COMPLETĂ (curent + istoric).
`;
```

---

## 💰 Cost Analysis

### Embedding Costs

**Model**: `text-embedding-3-small`
**Price**: $0.00002 / 1K tokens

**Per Simulation**:
- State summary: ~200 tokens → $0.000004
- 3 recommendations: ~300 tokens total → $0.000006
- **Total embedding cost**: ~$0.00001 (neglijabil)

### Retrieval Costs

- Vector search: **FREE** (local Qdrant)
- No API calls for retrieval

### Storage Costs

- Qdrant: **FREE** (self-hosted Docker)
- Average document: ~2KB
- 12 months × 2 collections × 1000 users = ~48MB
- **Storage cost**: FREE

**Total RAG Overhead per Simulation**: **< $0.001** (sub 1 cent)

---

## 📊 Performance Impact

### Latency Added

- Phase 0 (Retrieval): **+0.5s**
- Phase 6 (Storage): **+0.2s**
- **Total overhead**: **+0.7s**

### Overall Simulation Time

- Without RAG: ~9.5s
- With RAG: ~10.2s
- **Increase**: 7% (acceptabil pentru massive quality improvement)

---

## 🧪 Testing RAG

### 1. Test Qdrant Connection

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';

const qdrant = new QdrantClient({
  host: process.env.QDRANT_HOST || 'localhost',
  port: 6333
});

// Test connection
const health = await qdrant.api('cluster').clusterStatus();
console.log('Qdrant health:', health);
```

### 2. Test Collections Init

```bash
curl http://localhost:6333/collections
# Should return: simulation_states, recommendations_history
```

### 3. Test Vector Search

```typescript
// After storing some states
const results = await qdrant.search('simulation_states', {
  vector: someEmbedding,
  limit: 3
});

console.log('Similar situations found:', results.length);
```

### 4. Verify in Qdrant UI

Open: `http://localhost:6333/dashboard`

- Check collections exist
- View documents
- Test search queries

---

## 🚨 Common Issues & Solutions

### Issue 1: Qdrant Not Running

**Error**: `ECONNREFUSED localhost:6333`

**Solution**:
```bash
docker-compose up -d qdrant
docker ps | grep qdrant  # verify running
```

### Issue 2: Empty Historical Context

**Symptom**: `recent_months: []` în Phase 0

**Cause**: No previous simulations stored

**Solution**: Normal pentru primul run. After luna 2, data apare.

### Issue 3: Embedding Failures

**Error**: `OpenAI API error: Invalid API key`

**Solution**: Set `OPENAI_API_KEY` în `.env.local`

### Issue 4: Collection Not Found

**Error**: `Collection simulation_states not found`

**Solution**: Run `initializeQdrantCollections()` at startup

---

## 📈 Quality Improvements Expected

### Before RAG
- Generic recommendations
- No learning between months
- Repetitive advice
- No context awareness

### After RAG
- ✅ Context-aware recommendations
- ✅ Learns from past outcomes
- ✅ Compares current vs historical performance
- ✅ References similar situations
- ✅ Tracks recommendation success rate

**Example**:
```
BEFORE: "Reduce prices to increase sales" (every month)

AFTER: "În luna 3 ai redus prețurile la $8 și ai pierdut 15% profit deși 
        vânzările au crescut cu 10%. În loc să reduci din nou, recomand să 
        investești în marketing pentru a menține price premium."
```

---

## 🎯 Success Metrics

Track these to measure RAG effectiveness:

1. **Recommendation Diversity**: Sunt recomandările diferite între luni?
2. **Historical References**: Report Agent menționează lunile trecute?
3. **Outcome Correlation**: Recomandările cu success_rating=5 sunt urmate mai des?
4. **Player Satisfaction**: Percepe jucătorul că AI învață din deciziile lui?

---

**END OF RAG INTEGRATION GUIDE**

Pentru implementare completă, vezi: `ARCHITECTURE.md` secțiunea "RAG System cu Qdrant".
