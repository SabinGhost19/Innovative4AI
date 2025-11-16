# 🤖 Simulation Agents - NYC Business Simulator

Acest director conține agenții AI optimizați pentru simularea lunară a business-urilor din NYC.

**🆕 NEW**: Sistem RAG (Retrieval-Augmented Generation) cu Qdrant pentru memorie istorică și învățare continuă.

## 📚 Documentație

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arhitectură completă cu RAG integration (⭐ START HERE pentru LLM)
- **[QUICK_START.md](./QUICK_START.md)** - Ghid rapid de utilizare
- **[OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)** - Comparație înainte/după optimizări
- **[PROJECT_STATUS.md](../../../PROJECT_STATUS.md)** - Status complet proiect (ce e făcut vs TODO)

## 🚀 Quick Overview

Sistemul simulează o lună de business în **~10 secunde** folosind 9 agenți AI + RAG:

| Agent | Status | Model | Output | Timp |
|-------|--------|-------|--------|------|
| **🧠 RAG Retrieval** | 🔨 TODO | - | Historical context | 0.5s |
| Market Context | 🔨 TODO | gpt-4o-mini | Numeric | 1s |
| **Events** | ✅ **DONE** | gpt-4o | 1 event | 2s |
| **Trends** | ✅ **DONE** | gpt-4o | 1 trend | 2s |
| Supplier | 🔨 TODO | gpt-4o-mini | Cost+quality | 1s |
| Competition | 🔨 TODO | gpt-4o-mini | Strategies | 1.5s |
| Customer | 🔨 TODO | gpt-4o-mini | Revenue | 2s |
| Employee | 🔨 TODO | Math only | Efficiency | 0.1s |
| Financial | 🔨 TODO | Math only | P&L | 0.1s |
| Report | 🔨 TODO | gpt-4o + RAG | Narrative | 3s |
| **🧠 RAG Storage** | 🔨 TODO | - | Store state | 0.2s |

**Total: ~10 secunde** ⚡ (inclusiv RAG overhead)

---

## 📁 Structura Optimizată

```
simulation_agents/
├── ARCHITECTURE.md              # ⭐ Documentație completă cu RAG
├── QUICK_START.md              # Ghid rapid
├── OPTIMIZATION_SUMMARY.md     # Îmbunătățiri vs versiunea inițială
├── README.md                   # Acest fișier
│
├── core/                       # 🔨 TODO (PRIORITATE CRITICAL)
│   ├── types.ts               # TypeScript interfaces
│   ├── schemas.ts             # Zod validation schemas
│   ├── constants.ts           # Economic constants
│   └── orchestrator.ts        # Master orchestrator + RAG flow
│
├── services/                   # 🆕 RAG Infrastructure
│   └── rag-service.ts         # 🔨 TODO - Qdrant integration
│
├── agents/                     
│   ├── events-agent.ts         # ✅ IMPLEMENTED (optimizat)
│   ├── trends-agent.ts         # ✅ IMPLEMENTED (optimizat)
│   ├── market-context-agent.ts # 🔨 TODO (gpt-4o-mini)
│   ├── supplier-agent.ts       # 🔨 TODO (gpt-4o-mini)
│   ├── competition-agent.ts    # 🔨 TODO (gpt-4o-mini)
│   ├── customer-behavior-agent.ts # 🔨 TODO (gpt-4o-mini)
│   ├── employee-agent.ts       # 🔨 TODO (PURE MATH)
│   ├── financial-agent.ts      # 🔨 TODO (PURE MATH)
│   └── report-agent.ts         # 🔨 TODO (gpt-4o + RAG context)
│   ├── competition-agent.ts    # 🔨 TODO
│   ├── customer-behavior-agent.ts # 🔨 TODO
│   ├── employee-agent.ts       # 🔨 TODO
│   ├── financial-agent.ts      # 🔨 TODO
│   └── report-agent.ts         # 🔨 TODO
│
└── utils/                      # 🔨 TODO
    ├── calculations.ts
    ├── customer-segmentation.ts
    ├── competitor-modeling.ts
    └── cache.ts
```

---

## ✅ Agenți Implementați

### 1. Events Agent (events-agent.ts)

**Rol**: Generează 1 eveniment economic/social per lună bazat pe date Census + sezon.

**Model**: `gpt-4o` (creativitate pentru evenimente realiste)

**Input**:
```typescript
{
  businessType: string,
  location: { address, neighborhood, lat, lng },
  censusData: DetailedCensusData,
  currentMonth: number,
  currentYear: number
}
```

**Output**:
```typescript
{
  nume_eveniment: string,              // max 80 chars
  impact_clienti_lunar: number,        // -30 to +30 (%)
  relevanta_pentru_business: boolean,
  descriere_scurta: string            // max 100 chars
}
```

**Date Census utilizate**:
- Demografie: Populație, vârstă medie, venit
- Forță muncă: Distribuție pe industrii
- Educație: Rate licență/master/doctorat
- Economic: Rata sărăciei

**Exemple Evenimente**:
- ✅ "NYC Pride Month" (+30% foot traffic - Jun)
- ✅ "Festival Artizanal de Toamnă" (+15% - Oct)
- ❌ "Recesiune Sector Financiar" (-18% - zonă finance-heavy)

**Optimizări**:
- Temperature: 0.9 (creativitate)
- Max 1 eveniment/lună (nu 0-2)
- Descriere limitată la 100 caractere

---

### 2. Trends Agent (trends-agent.ts)

**Rol**: Analizează Google Trends și identifică 1 trend principal + impact.

**Model**: `gpt-4o` (analiză complexă)

**Input**:
```typescript
{
  business_type: string,
  location: { address, neighborhood },
  trends_data: GoogleTrendsData,
  current_month: number
}
```

**Output**:
```typescript
{
  main_trend: {
    trend_name: string,              // max 60 chars
    impact_score: number,            // -100 to +100
    relevance: boolean,
    confidence: 'low' | 'medium' | 'high'
  },
  overall_sentiment: 'positive' | 'neutral' | 'negative',
  market_momentum: 'accelerating' | 'stable' | 'decelerating'
}
```

**Google Trends Data utilizate**:
- Interest trend (growing/declining)
- Average interest score
- Related rising queries
- Trending searches

**Exemple Trends**:
- ✅ "Cold Brew Coffee în creștere" (+45 impact)
- ✅ "Specialty Coffee demand" (+35 impact)
- ❌ "Fast Food declining" (-20 impact)

**Optimizări**:
- ❌ Eliminat: secondary_trends, actionable_insight, description
- Temperature: 0.5 (balans)
- Output minimal (doar date numerice)

---

## 🔌 Utilizare

### Simulare Completă

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
console.log(result.events.nume_eveniment);  // "NYC Pride Month"
console.log(result.trends.main_trend.trend_name);  // "Cold Brew în creștere"
```

### Testing Individual Agents

```typescript
// Test Events Agent
import { generateBusinessEvent } from './agents/events-agent';

const event = await generateBusinessEvent(
  "Coffee Shop",
  { address: "SoHo, NYC", neighborhood: "SoHo", lat: 40.72, lng: -74.00 },
  censusData,
  6,  // June
  2024
);

console.log(event.nume_eveniment);
console.log(event.impact_clienti_lunar);
```

```typescript
// Test Trends Agent
import { analyzeTrendsForBusiness } from './agents/trends-agent';

const trends = await analyzeTrendsForBusiness(
  "Coffee Shop",
  { address: "SoHo, NYC", neighborhood: "SoHo" },
  trendsData,
  6,
  2024
);

console.log(trends.main_trend.impact_score);
```

---

## 📊 Performance & Optimization

### Execution Strategy

```
┌─────────────────────────────────────────────┐
│ PHASE 1: Context (1s)                      │
│ → Market Context Agent                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 2: External (2s - PARALLEL)          │
│ → Events Agent     | Trends Agent           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 3: Market (1.5s - PARALLEL)          │
│ → Supplier | Competition | Employee         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 4: Customer (2s)                     │
│ → Customer Behavior Agent                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 5: Report (3s - PARALLEL)            │
│ → Financial (Math) | Report (LLM)          │
└─────────────────────────────────────────────┘

TOTAL: ~9.5 seconds
```

### Model Usage

| Agent Type | Model | Why | Cost/call |
|------------|-------|-----|-----------|
| Events | gpt-4o | Creative text | $0.015 |
| Trends | gpt-4o | Complex analysis | $0.020 |
| Context | gpt-4o-mini | Simple decisions | $0.004 |
| Supplier | gpt-4o-mini | Calculations | $0.003 |
| Competition | gpt-4o-mini | Strategy choice | $0.005 |
| Customer | gpt-4o-mini | Segmentation | $0.008 |
| Employee | **Math** | Deterministic | $0 |
| Financial | **Math** | Deterministic | $0 |
| Report | gpt-4o | Narrative text | $0.040 |

**Total cost per simulation: ~$0.095**

---

## 🧪 Development

### Setup
```bash
npm install ai @ai-sdk/openai zod
```

### Environment Variables
```bash
OPENAI_API_KEY=sk-...
```

### Testing
```bash
# Test individual agent
npm test agents/events-agent.test.ts

# Test full orchestrator
npm test core/orchestrator.test.ts
```

### Debugging
```bash
# Enable detailed logs
DEBUG_AGENTS=true npm run dev

# Output:
# [MarketContext] 1023ms | 245 bytes
# [Events] 1847ms | 312 bytes
# [Trends] 1923ms | 289 bytes
```

---

## 🚧 Roadmap

### ✅ Implemented
- [x] Events Agent (optimized)
- [x] Trends Agent (optimized)
- [x] Architecture documentation
- [x] Optimization strategy

### 🔨 In Progress
- [ ] Core types & schemas
- [ ] Math agents (Employee, Financial)

### 📋 Planned
- [ ] Market Context Agent
- [ ] Supplier Agent
- [ ] Competition Agent
- [ ] Customer Behavior Agent
- [ ] Report Narrative Agent
- [ ] Master Orchestrator
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance benchmarks

---

## 📖 References

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide
- **[OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)** - Before/after comparison

---

## 🤝 Contributing

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Follow structured output pattern (Zod schemas)
3. Minimize LLM usage (prefer math where possible)
4. Add unit tests for new agents
5. Document performance metrics

---

## 📄 License

Part of NYC Business Simulator - Sim-Antreprenor project.

---

**Built with ❤️ using Vercel AI SDK + OpenAI GPT-4** 🚀

---
  "censusData": { /* DetailedCensusData */ },
  "currentMonth": 11,
  "currentYear": 2025
}
```

**Response:**
```json
{
  "success": true,
  "event": {
    "nume_eveniment": "Festival Artizanal de Toamnă",
    "impact_clienti_lunar": 15,
    "relevanta_pentru_business": true,
    "descriere_scurta": "Festival local care atrage vizitatori..."
  },
  "metadata": {
    "generated_at": "2025-11-16T00:30:00.000Z",
    "simulation_month": 11,
    "simulation_year": 2025,
    "business_type": "Coffee Shop",
    "location": "SoHo"
  }
}
```

## 🧪 Testing

```bash
# Pornește serverul
npm run dev

# În alt terminal, rulează testul
cd agents-orchestrator
./test-simulation.sh
```

Sau manual:
```bash
curl -X POST http://localhost:3000/api/simulation/next-month \
  -H "Content-Type: application/json" \
  -d @test-simulation-payload.json | jq .
```

## 🚀 Viitori Agenți

Următorii agenți planificați pentru simulare:
- **Competition Agent** - Generează competitori noi/închideri
- **Market Trends Agent** - Analizează tendințe consum
- **Regulatory Agent** - Simulează schimbări legislative
- **Weather Agent** - Impact vreme asupra afacerii
- **Economic Cycle Agent** - Simulează cicluri economice macro

## 🔧 Configurare

Agentul folosește:
- **Model:** GPT-4 (via `@ai-sdk/openai`)
- **Temperature:** 0.9 (pentru diversitate evenimente)
- **Validation:** Zod schemas

Configurează `OPENAI_API_KEY` în `.env.local`:
```bash
OPENAI_API_KEY=sk-...
```

## 📊 Metrici Impact

Impactul este calculat ca **procent lunar** de schimbare în numărul de clienți:
- **+5% până +30%** - Evenimente pozitive
- **-5% până -30%** - Evenimente negative
- **Relevanță** - Evenimentul afectează doar business-uri relevante

## 🎨 Integrare Frontend

```typescript
// Exemplu apel din dashboard
const handleNextMonth = async () => {
  const response = await fetch('/api/simulation/next-month', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessType: currentBusiness.type,
      location: currentBusiness.location,
      censusData: censusData,
      currentMonth: simulationMonth,
      currentYear: simulationYear
    })
  });
  
  const { event } = await response.json();
  
  // Aplică impactul
  updateCustomerCount(event.impact_clienti_lunar);
  showEventNotification(event);
};
```

---

**Autor:** SabinGhost19  
**Proiect:** NYC Business Simulator  
**Data:** Noiembrie 2025
