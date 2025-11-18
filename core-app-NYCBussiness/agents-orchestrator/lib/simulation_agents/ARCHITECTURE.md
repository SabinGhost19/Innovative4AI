# 🏗️ Arhitectură Multi-Agent Optimizată cu RAG - Sim-Antreprenor

## 📋 Cuprins
1. [Viziune Generală](#viziune-generală)
2. [Starea Actuală a Proiectului](#starea-actuală-a-proiectului)
3. [Principii de Optimizare](#principii-de-optimizare)
4. [Design Patterns Utilizate](#design-patterns-utilizate)
5. [Arhitectura Sistemului](#arhitectura-sistemului)
6. [RAG System cu Qdrant Vector Database](#rag-system-cu-qdrant-vector-database)
7. [Agenții AI - Specificații Optimizate](#agenții-ai---specificații-optimizate)
8. [Flow de Execuție Paralelizat cu RAG](#flow-de-execuție-paralelizat-cu-rag)
9. [Starea Pieței și Modificări](#starea-pieței-și-modificări)
10. [Implementare Tehnică](#implementare-tehnică)

---

## 🎯 Viziune Generală

### Conceptul Core
Aplicația **Sim-Antreprenor** simulează o lună de business (30 zili) în **sub 10 secunde** prin intermediul unui sistem multi-agent AI paralelizat și optimizat care modelează comportamentul tuturor actorilor din ecosistemul economic local.

**🆕 INOVAȚIE**: Sistemul folosește **RAG (Retrieval-Augmented Generation)** cu **Qdrant Vector Database** pentru memorie istorică, permițând agenților să învețe din lunile anterioare și să genereze recomandări contextualizate.

### Obiective Arhitecturale
- ✅ **Performanță**: Simulare completă < 10 secunde
- ✅ **Eficiență**: Output minim necesar, calcule maxim paralelizate
- ✅ **Realism Economic**: Simularea trebuie să reflecte dinamica reală a pieței
- ✅ **Scalabilitate**: Sistemul trebuie să funcționeze pentru orice tip de business
- ✅ **Transparență**: Jucătorul trebuie să înțeleagă DE CE s-a întâmplat ceva
- ✅ **Data-Driven**: Toate deciziile AI sunt ancorate în date reale (Census, Google Trends, Google Places)
- 🆕 **Contextual Memory**: RAG oferă continuitate și învățare între luni

---

## 📊 Starea Actuală a Proiectului

### ✅ Ce Este Deja Implementat

#### 1. **Infrastructure**
- ✅ PostgreSQL Database (Docker container)
- ✅ FastAPI Backend (Python)
- ✅ Next.js Frontend + API Routes (TypeScript)
- 🆕 **Qdrant Vector Database** (Docker container - NOU ADĂUGAT)

#### 2. **Backend Services (Python)**
- ✅ `backend/census_service.py` - Interogare Census API (ACS 2022)
- ✅ `backend/detailed_analysis_service.py` - Analiză detaliată Census (ACS 2021)
- ✅ `backend/trends_service.py` - Interogare Google Trends API
- ✅ `backend/database.py` - SQLAlchemy models (AreaOverview, DetailedAreaAnalysis)
- ✅ `backend/main.py` - FastAPI endpoints

#### 3. **Database Schema (PostgreSQL)**
```sql
-- Deja există:
- area_overview (Census data aggregat)
- detailed_area_analysis (Census data detaliat per Block)

-- 🆕 VA FI ADĂUGAT:
- monthly_simulation_states (state snapshot pentru RAG)
```

#### 4. **AI Agents (TypeScript)**
- ✅ `events-agent.ts` - Generare evenimente economice (gpt-4o)
- ✅ `trends-agent.ts` - Analiză Google Trends (gpt-4o)
- 🔨 **TODO**: Market Context, Supplier, Competition, Customer, Employee, Financial, Report

#### 5. **Docker Compose Services**
```yaml
services:
  db: PostgreSQL (port 5432) ✅
  qdrant: Qdrant Vector DB (ports 6333, 6334) 🆕
  backend: FastAPI (port 8000) ✅
```

### 🔨 Ce Trebuie Implementat

#### Phase 1: RAG Infrastructure
- [ ] Qdrant collections setup
- [ ] RAG service (TypeScript)
- [ ] Embedding pipeline (OpenAI text-embedding-3-small)
- [ ] Vector storage after simulation
- [ ] Vector retrieval before simulation

#### Phase 2: Core Types & Schemas
- [ ] `core/types.ts` - TypeScript interfaces
- [ ] `core/schemas.ts` - Zod schemas pentru toate outputs
- [ ] `core/constants.ts` - Constante economice

#### Phase 3: Math Agents (Zero LLM)
- [ ] `employee-agent.ts` - Pure calculations
- [ ] `financial-agent.ts` - P&L calculations

#### Phase 4: AI Agents (LLM)
- [ ] `market-context-agent.ts` - gpt-4o-mini
- [ ] `supplier-agent.ts` - gpt-4o-mini
- [ ] `competition-agent.ts` - gpt-4o-mini
- [ ] `customer-behavior-agent.ts` - gpt-4o-mini
- [ ] `report-agent.ts` - gpt-4o (cu RAG context)

#### Phase 5: Orchestrator
- [ ] `core/orchestrator.ts` - Master orchestrator cu paralelizare + RAG

#### Phase 6: Testing
- [ ] Unit tests pentru fiecare agent
- [ ] Integration tests
- [ ] RAG retrieval tests

---

## ⚡ Principii de Optimizare

### 1. **Paralelizare Agresivă**
Agenții care nu au dependențe între ei rulează **în paralel** folosind `Promise.all()`.

### 2. **Output Minimal**
- Agenții returnează **doar date numerice** și flag-uri
- **DOAR** Report Agent generează text narrativ
- Folosim **Structured Output** (Vercel AI SDK) pentru toate response-urile

### 3. **Caching Inteligent**
- Date Census: cached pe durata simulării
- Market Context: calculat o singură dată
- Competitor data: pre-procesat

### 4. **LLM Optimization**
- Folosim `gpt-4o-mini` pentru agenți simpli (calcule, decizii binare)
- Folosim `gpt-4o` DOAR pentru Report Agent (text narrativ)
- Temperature low (0.3-0.5) pentru consistență
- Structured outputs elimină parsing errors

### 5. **Computation Offloading**
- Calcule matematice: făcute în TypeScript, NU în LLM
- LLM-ul decide **strategii**, TypeScript calculează **numere**

---

## 🎨 Design Patterns Utilizate

### 1. **Pipeline Pattern cu Paralelizare**
```
┌─────────────────────────────────────────────────┐
│ PHASE 1: Context Setup (Sequential)            │
│ → Market Context Agent                          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ PHASE 2: External Analysis (PARALLEL)          │
│ ┌─────────────┐ ┌─────────────┐                │
│ │ Events      │ │ Trends      │                │
│ │ Agent       │ │ Agent       │                │
│ └─────────────┘ └─────────────┘                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ PHASE 3: Market Dynamics (PARALLEL)            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │Supplier  │ │Competition│ │Employee  │         │
│ │ Agent    │ │  Agent    │ │  Agent   │         │
│ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ PHASE 4: Customer Simulation (Sequential)      │
│ → Customer Behavior Agent (needs all inputs)   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ PHASE 5: Reporting (PARALLEL)                  │
│ ┌─────────────┐ ┌─────────────┐                │
│ │ Financial   │ │ Narrative   │                │
│ │ Agent       │ │ Report      │                │
│ └─────────────┘ └─────────────┘                │
└─────────────────────────────────────────────────┘
```

### 2. **Structured Output Pattern** (Vercel AI SDK)
Toate răspunsurile folosesc `generateObject()` cu Zod schemas pentru:
- Zero parsing errors
- Type safety
- Validare automată
- Performanță maximă

### 3. **Strategy Pattern Lightweight**
LLM-ul alege strategia, TypeScript execută calculele.

```typescript
// LLM returnează doar:
{ strategy: "aggressive", confidence: 0.85 }

// TypeScript calculează impact-ul:
const impact = calculateImpact(strategy, marketData);
```

### 4. **Data Transfer Object (DTO) Pattern**
Între agenți circulă **doar** date numerice și enumerări.

```typescript
// ❌ NU returnăm text lung
{ description: "The competitor Starbucks decided to..." }

// ✅ Returnăm date
{ competitor_id: "starbucks", action: "PRICE_DROP", magnitude: -0.15 }
```

---

## 🏛️ Arhitectura Sistemului

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│            PRESENTATION LAYER (Frontend)                │
│  - Dashboard UI                                         │
│  - Monthly Report Display                               │
│  - Decision Input Forms                                 │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│         ORCHESTRATION LAYER (API Routes)                │
│  - /api/simulation/next-month                           │
│  - Request Validation                                   │
│  - Response Formatting                                  │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│           SIMULATION ENGINE (Core Logic)                │
│  ┌───────────────────────────────────────────────┐      │
│  │   Master Orchestrator Agent                   │      │
│  │   - Coordonează toți agenții                  │      │
│  │   - Menține starea globală                    │      │
│  │   - Validează outputs                         │      │
│  └───────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│              AGENTS LAYER (AI Logic)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Market   │  │Competition│ │ Customer │              │
│  │ Context  │  │  Agents   │ │  Agents  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Events   │  │  Trends   │ │Financial │              │
│  │  Agent   │  │   Agent   │ │  Agent   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Employee │  │ Supplier  │ │  Report  │              │
│  │  Agent   │  │   Agent   │ │  Agent   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│              DATA LAYER (External APIs)                 │
│  - Census API (Demographics)                            │
│  - Google Places API (Competitors)                      │
│  - Google Trends API (Market Trends)                    │
│  - PostgreSQL Database (Game State)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 RAG System cu Qdrant Vector Database

### Conceptul RAG în Sim-Antreprenor

**Problema fără RAG**: Agenții tratează fiecare lună ca un start fresh, fără memorie a lunilor trecute. Rezultă recomandări generice și necontextualizate.

**Soluția cu RAG**: Sistemul stochează embeddings din simulările trecute în Qdrant și le retrievează pentru context când generează rapoarte și recomandări.

### Arhitectura RAG

```
┌─────────────────────────────────────────────────────────────┐
│                     SIMULATION CYCLE                        │
│                                                             │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  BEFORE SIM      │      │   AFTER SIM      │            │
│  │  Phase 0: RAG    │      │   Phase 6: RAG   │            │
│  │  Retrieval       │      │   Storage        │            │
│  └──────────────────┘      └──────────────────┘            │
│         ↓                           ↑                       │
│  ┌─────────────────────────────────────────┐                │
│  │  Historical Context Retrieved:          │                │
│  │  - Last 3 months key metrics            │                │
│  │  - Similar situations (vector search)   │                │
│  │  - Past recommendations & outcomes      │                │
│  └─────────────────────────────────────────┘                │
│         ↓                                                   │
│  ┌─────────────────────────────────────────┐                │
│  │  SIMULATION (Phase 1-5)                 │                │
│  │  → Agents use RAG context               │                │
│  └─────────────────────────────────────────┘                │
│         ↓                                                   │
│  ┌─────────────────────────────────────────┐                │
│  │  New State Embedded & Stored:           │                │
│  │  - Month state snapshot                 │                │
│  │  - Report text                          │                │
│  │  - Recommendations given                │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Qdrant Infrastructure

#### Docker Setup (YA IMPLEMENTAT)
```yaml
# docker-compose.yml
services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: nyc_business_qdrant
    ports:
      - "6333:6333"  # HTTP API
      - "6334:6334"  # gRPC API
    volumes:
      - qdrant_data:/qdrant/storage
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/healthz"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    environment:
      - QDRANT_HOST=qdrant
      - QDRANT_PORT=6333
    depends_on:
      qdrant:
        condition: service_healthy
```

#### Qdrant Collections

Vom avea **2 collections** în Qdrant:

##### 1. **simulation_states** (State Snapshots)
```typescript
// Collection config
{
  name: "simulation_states",
  vectors: {
    size: 1536,           // OpenAI text-embedding-3-small
    distance: "Cosine"
  }
}

// Document structure
{
  id: "user123_month5",   // unique per user per month
  vector: [0.123, ...],   // embedding of state summary
  payload: {
    user_id: string,
    business_id: string,
    month: number,
    state_summary: {
      revenue: number,
      expenses: number,
      profit: number,
      customers_served: number,
      employee_count: number,
      inventory_level: number,
      cash_reserve: number,
      debt_level: number,
      
      // Market conditions
      market_demand_score: number,
      competition_intensity: number,
      
      // Key events
      major_events: string[],  // max 3
      trends_followed: string[],
      
      // Decisions made
      decisions: {
        pricing_strategy: string,
        marketing_spend: number,
        inventory_strategy: string,
        hr_actions: string[]
      }
    },
    timestamp: Date
  }
}
```

##### 2. **recommendations_history** (Recommendations & Outcomes)
```typescript
// Collection config
{
  name: "recommendations_history",
  vectors: {
    size: 1536,
    distance: "Cosine"
  }
}

// Document structure
{
  id: "user123_month5_rec1",
  vector: [0.123, ...],    // embedding of recommendation text
  payload: {
    user_id: string,
    business_id: string,
    month: number,
    recommendation: {
      category: "pricing" | "marketing" | "inventory" | "hr" | "financial",
      text: string,         // full recommendation text
      priority: "high" | "medium" | "low",
      
      // Context when given
      context: {
        revenue_trend: "increasing" | "stable" | "decreasing",
        profit_margin: number,
        market_condition: string
      }
    },
    
    // Outcome tracking (added next month)
    outcome: {
      was_followed: boolean,
      impact_on_revenue?: number,   // % change
      impact_on_profit?: number,
      success_rating?: number        // 1-5
    } | null,
    
    timestamp: Date
  }
}
```

### RAG Service Implementation

#### File: `lib/services/rag-service.ts` (VA FI CREAT)

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';
import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';

// Qdrant client initialization
const qdrant = new QdrantClient({
  host: process.env.QDRANT_HOST || 'localhost',
  port: parseInt(process.env.QDRANT_PORT || '6333')
});

const EMBEDDING_MODEL = 'text-embedding-3-small';
const COLLECTIONS = {
  STATES: 'simulation_states',
  RECOMMENDATIONS: 'recommendations_history'
};

// Initialize collections (run once on startup)
export async function initializeQdrantCollections() {
  try {
    // Check if collections exist
    const collections = await qdrant.getCollections();
    const existingNames = collections.collections.map(c => c.name);
    
    // Create simulation_states if not exists
    if (!existingNames.includes(COLLECTIONS.STATES)) {
      await qdrant.createCollection(COLLECTIONS.STATES, {
        vectors: {
          size: 1536,
          distance: 'Cosine'
        }
      });
      console.log('✅ Created collection: simulation_states');
    }
    
    // Create recommendations_history if not exists
    if (!existingNames.includes(COLLECTIONS.RECOMMENDATIONS)) {
      await qdrant.createCollection(COLLECTIONS.RECOMMENDATIONS, {
        vectors: {
          size: 1536,
          distance: 'Cosine'
        }
      });
      console.log('✅ Created collection: recommendations_history');
    }
  } catch (error) {
    console.error('❌ Qdrant initialization error:', error);
    throw error;
  }
}

// Store simulation state after month completion
export async function storeSimulationState(
  userId: string,
  businessId: string,
  month: number,
  stateSummary: SimulationStateSummary
) {
  // Create text summary for embedding
  const summaryText = createStateSummaryText(stateSummary);
  
  // Generate embedding
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: summaryText
  });
  
  // Store in Qdrant
  await qdrant.upsert(COLLECTIONS.STATES, {
    points: [{
      id: `${userId}_month${month}`,
      vector: embedding,
      payload: {
        user_id: userId,
        business_id: businessId,
        month,
        state_summary: stateSummary,
        timestamp: new Date().toISOString()
      }
    }]
  });
}

// Retrieve historical context for Report Agent
export async function retrieveHistoricalContext(
  userId: string,
  businessId: string,
  currentMonth: number,
  limit: number = 3
): Promise<HistoricalContext> {
  // Get last N months (direct filter)
  const recentStates = await qdrant.scroll(COLLECTIONS.STATES, {
    filter: {
      must: [
        { key: 'user_id', match: { value: userId } },
        { key: 'business_id', match: { value: businessId } },
        { 
          key: 'month', 
          range: { 
            gte: currentMonth - limit,
            lt: currentMonth 
          } 
        }
      ]
    },
    limit,
    with_payload: true,
    with_vector: false
  });
  
  // Current state description for semantic search
  const currentStateDesc = "Similar business challenges and market conditions";
  
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: currentStateDesc
  });
  
  // Semantic search for similar situations
  const similarSituations = await qdrant.search(COLLECTIONS.STATES, {
    vector: embedding,
    filter: {
      must: [
        { key: 'user_id', match: { value: userId } },
        { key: 'business_id', match: { value: businessId } }
      ],
      must_not: [
        { key: 'month', match: { value: currentMonth } }
      ]
    },
    limit: 3,
    with_payload: true
  });
  
  // Get past recommendations
  const pastRecommendations = await qdrant.scroll(COLLECTIONS.RECOMMENDATIONS, {
    filter: {
      must: [
        { key: 'user_id', match: { value: userId } },
        { key: 'business_id', match: { value: businessId } }
      ]
    },
    limit: 5,
    with_payload: true,
    with_vector: false
  });
  
  return {
    recent_months: recentStates.points.map(p => p.payload),
    similar_situations: similarSituations.map(s => ({
      ...s.payload,
      similarity_score: s.score
    })),
    past_recommendations: pastRecommendations.points.map(p => p.payload)
  };
}

// Helper: Create summary text for embedding
function createStateSummaryText(summary: SimulationStateSummary): string {
  return `
Month ${summary.month} Summary:
Financial: Revenue $${summary.revenue}, Profit $${summary.profit}, Margin ${((summary.profit/summary.revenue)*100).toFixed(1)}%
Operations: ${summary.customers_served} customers, ${summary.employee_count} employees
Market: Demand score ${summary.market_demand_score}, Competition ${summary.competition_intensity}
Events: ${summary.major_events.join(', ')}
Trends: ${summary.trends_followed.join(', ')}
Strategy: ${summary.decisions.pricing_strategy} pricing, $${summary.decisions.marketing_spend} marketing
`.trim();
}

// Types
interface SimulationStateSummary {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
  customers_served: number;
  employee_count: number;
  inventory_level: number;
  cash_reserve: number;
  debt_level: number;
  market_demand_score: number;
  competition_intensity: number;
  major_events: string[];
  trends_followed: string[];
  decisions: {
    pricing_strategy: string;
    marketing_spend: number;
    inventory_strategy: string;
    hr_actions: string[];
  };
}

interface HistoricalContext {
  recent_months: any[];
  similar_situations: any[];
  past_recommendations: any[];
}
```

### Integration în Orchestrator

#### File: `core/orchestrator.ts` (VA FI MODIFICAT)

```typescript
import { retrieveHistoricalContext, storeSimulationState } from '../services/rag-service';

export async function runMonthlySimulation(input: SimulationInput) {
  // ========================================
  // PHASE 0: RAG RETRIEVAL (NOU!)
  // ========================================
  const historicalContext = await retrieveHistoricalContext(
    input.user_id,
    input.business_id,
    input.current_month,
    3  // last 3 months
  );
  
  // ========================================
  // PHASE 1-5: SIMULATION (ca înainte)
  // ========================================
  const marketContext = await marketContextAgent.run(input);
  // ... rest of agents ...
  
  // ========================================
  // PHASE 6: REPORT AGENT (Enhanced cu RAG)
  // ========================================
  const report = await reportAgent.run({
    ...allAgentOutputs,
    historical_context: historicalContext  // 🆕 CONTEXT DIN RAG
  });
  
  // ========================================
  // PHASE 7: RAG STORAGE (NOU!)
  // ========================================
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
      // ... etc
      major_events: [eventsOutput.nume_eveniment],
      trends_followed: [trendsOutput.main_trend.keyword],
      decisions: input.player_decisions
    }
  );
  
  return report;
}
```

### Report Agent Enhanced cu RAG

#### File: `agents/report-agent.ts` (VA FI MODIFICAT)

```typescript
const systemPrompt = `
Tu ești un consultant de business expert care analizează performanța unei afaceri.

## CONTEXT ISTORIC DISPONIBIL

Ai acces la:
1. **Ultimele 3 luni**: Metrici financiare, decizii luate, evenimente
2. **Situații similare**: Luni anterioare cu condiții de piață asemănătoare
3. **Recomandări trecute**: Ce ai recomandat înainte și ce impact a avut

## SARCINA TA

Generează un raport lunar care:
- Compară performanța curentă cu lunile trecute (trend analysis)
- Identifică pattern-uri (ex: "vânzările cresc constant de 3 luni")
- Face recomandări bazate pe ce a funcționat/nu a funcționat în trecut
- Referențiază evenimente similare din istoricul businessului

## STIL

- Concret și actionable
- Referințe la date specifice ("ca în luna 3 când...")
- Învață din greșeli și succese trecute
`;

// În prompt-ul user
const userPrompt = `
## Luna Curentă (${currentMonth})
${currentMonthData}

## Istoric Recent (Ultimele 3 luni)
${historicalContext.recent_months.map(m => `
Luna ${m.month}: Revenue $${m.revenue}, Profit $${m.profit}
Evenimente: ${m.major_events.join(', ')}
`).join('\n')}

## Situații Similare din Trecut
${historicalContext.similar_situations.map(s => `
Luna ${s.month} (similaritate: ${(s.similarity_score * 100).toFixed(0)}%)
Context: ${s.context}
Outcome: ${s.outcome}
`).join('\n')}

Generează raportul lunar bazat pe analiza COMPLETĂ (curent + istoric).
`;
```

### Costuri RAG

#### Embedding Costs
- Model: `text-embedding-3-small`
- Cost: **$0.00002 per 1K tokens**
- Average summary: ~200 tokens
- **Cost per embedding: $0.000004** (neglijabil)

#### Storage
- Qdrant: **local storage, free**
- Average document: ~2KB
- 12 months × 2 collections: **~50KB total**

#### Retrieval Costs
- Vector search: **free** (no API calls)
- Total RAG overhead: **< $0.001 per simulation**

**Impact**: RAG adaugă **<1 cent** per simulare, dar îmbunătățește SEMNIFICATIV calitatea recomandărilor.

---

## 🤖 Agenții AI - Specificații Optimizate

### 🎯 Clasament de Prioritate și Performanță

| Agent | Model | Output Type | Execuție | Timp Est. |
|-------|-------|-------------|----------|-----------|
| Market Context | `gpt-4o-mini` | Numeric | Sequential | 1s |
| Events | `gpt-4o` | Structured | Parallel | 2s |
| Trends | `gpt-4o` | Structured | Parallel | 2s |
| Supplier | `gpt-4o-mini` | Numeric | Parallel | 1s |
| Competition | `gpt-4o-mini` | Numeric | Parallel | 1.5s |
| Employee | **Math only** | Calculated | Parallel | 0.1s |
| Customer | `gpt-4o-mini` | Numeric | Sequential | 2s |
| Financial | **Math only** | Calculated | Parallel | 0.1s |
| Report | `gpt-4o` | Narrative | Parallel | 3s |

**Total timp estimat: ~6-8 secunde**

---

### Agent 1: **Market Context Agent** 🎯

**Rol**: Procesează Census data și calculează metrici de piață fundamentale.

**Model**: `gpt-4o-mini` (decision-making simplu)

**Input**:
```typescript
{
  census_data: DetailedCensusData,
  business_type: string,
  location: { lat, lng, address }
}
```

**Procesare**:
- LLM identifică 2-3 segmente de clienți dominante din Census
- TypeScript calculează toți scorii numerici

**Output** (Structured, Minimal):
```typescript
{
  market_size_estimate: number;           // clienți/lună
  dominant_segments: string[];            // max 3: ["young_professionals", "high_income"]
  demand_score: number;                   // 0-100
  price_sensitivity_score: number;        // 0-100
  quality_preference_score: number;       // 0-100
  foot_traffic_multiplier: number;        // 0.5-2.0
}
```

**Influență**: 
- ✅ Setează parametri pentru Customer Agent
- ✅ Influențează Competition Agent (market attractiveness)

---

### Agent 2: **Events Generator Agent** 🎲 ✅ IMPLEMENTAT

**Rol**: Generează 0-1 eveniment economic extern bazat pe Census + sezon.

**Model**: `gpt-4o` (creativitate pentru evenimente realiste)

**Input**:
```typescript
{
  business_type: string,
  location: LocationData,
  census_data: DetailedCensusData,
  current_month: number,
  current_year: number
}
```

**Output** (din `events-agent.ts`):
```typescript
{
  nume_eveniment: string;                      // "NYC Pride Month"
  impact_clienti_lunar: number;                // -30 to +30 (%)
  relevanta_pentru_business: boolean;
  descriere_scurta: string;                    // max 100 chars
}
```

**Optimizări**:
- Temperature: 0.9 (creativitate)
- Max 1 eveniment/lună (nu 0-2)
- Descriere limitată la 100 caractere

**Influență**:
- ✅ Modifică `foot_traffic_multiplier` în Customer Agent
- ✅ Afectează `demand_score` temporar

---

### Agent 3: **Trends Analyzer Agent** 📈 ✅ IMPLEMENTAT

**Rol**: Analizează Google Trends și identifică 1 trend principal + impact.

**Model**: `gpt-4o` (analiză complexă)

**Input**:
```typescript
{
  business_type: string,
  location: LocationData,
  trends_data: GoogleTrendsData,
  current_month: number
}
```

**Output** (din `trends-agent.ts`, OPTIMIZAT):
```typescript
{
  main_trend: {
    trend_name: string;                        // "Cold Brew în creștere"
    impact_score: number;                      // -100 to +100
    relevance: boolean;
    confidence: 'low' | 'medium' | 'high';
  },
  overall_sentiment: 'positive' | 'neutral' | 'negative';
  market_momentum: 'accelerating' | 'stable' | 'decelerating';
}
```

**Optimizări**:
- ❌ Eliminăm `secondary_trends` (doar 1 trend principal)
- ❌ Eliminăm `actionable_insight` (va fi generat de Report Agent)
- ❌ Eliminăm `description` (text minimal)
- Temperature: 0.5 (balans între creativitate și consistență)

**Influență**:
- ✅ Modifică `demand_score` (+/- impact_score/2)
- ✅ Influențează Customer preferences

---

### Agent 4: **Supplier Agent** 📦

**Rol**: Calculează cost și quality score bazat pe alegere + sezon.

**Model**: `gpt-4o-mini` (doar pentru ajustări sezoniere)

**Input**:
```typescript
{
  supplier_tier: 'budget' | 'standard' | 'premium',
  projected_volume: number,
  current_month: number,
  business_type: string
}
```

**Procesare**:
```typescript
// TypeScript calculează base costs:
const BASE_COSTS = {
  budget: { cost: 0.80, quality: 60 },
  standard: { cost: 1.20, quality: 80 },
  premium: { cost: 2.00, quality: 95 }
};

// LLM decide DOAR seasonal adjustments:
// "summer" → +10% pentru ingrediente reci
// "winter" → +5% pentru logistică
```

**Output** (Minimal):
```typescript
{
  cost_per_unit: number;              // după ajustări
  quality_score: number;              // 0-100
  seasonal_modifier: number;          // 0.9-1.2
  reliability_flag: boolean;          // true/false
}
```

**Influență**:
- ✅ Afectează COGS în Financial Agent
- ✅ Influențează `quality_score` în Customer Agent

---

### Agent 5: **Competition Strategy Agent** ⚔️

**Rol**: Fiecare competitor decide rapid o strategie vs jucătorul.

**Model**: `gpt-4o-mini` (decizii simple, rapide)

**Input**:
```typescript
{
  competitors: CompetitorData[],        // max 5
  player: {
    price: number,
    quality_score: number,
    marketing_spend: number
  },
  market_context: MarketContextOutput
}
```

**Procesare**:
```typescript
// Pentru FIECARE competitor (parallel):
// 1. LLM alege strategie: "aggressive" | "defensive" | "passive"
// 2. TypeScript calculează impact numeric
```

**Output** (Array, Minimal):
```typescript
{
  competitors: Array<{
    id: string;
    strategy: 'aggressive' | 'defensive' | 'passive';
    price_change: number;              // -0.3 to +0.3
    marketing_boost: number;           // 0 to +0.5
  }>;
  avg_competitive_pressure: number;    // 0-100
}
```

**Optimizări**:
- Procesăm max 5 competitori (cei mai apropiați)
- Fără text explicativ
- Parallel processing pentru fiecare competitor

**Influență**:
- ✅ Modifică utility scores în Customer Agent
- ✅ Schimbă distribuția market share

---

### Agent 6: **Employee Performance Agent** 👥

**Rol**: Calculează performanța echipei (PURE MATH, no LLM).

**Model**: **NONE** (doar calcule TypeScript)

**Input**:
```typescript
{
  num_employees: number,
  salary_per_employee: number,
  total_customers: number,              // din Customer Agent
  market_avg_salary: number             // din Census
}
```

**Procesare** (Pure TypeScript):
```typescript
const OPTIMAL_RATIO = 200; // customers per employee
const workload_ratio = total_customers / num_employees;

const efficiency = workload_ratio > OPTIMAL_RATIO * 1.5 
  ? Math.max(50, 100 - (workload_ratio - OPTIMAL_RATIO) * 0.2)
  : 100;

const salary_satisfaction = Math.min(100, 
  (salary_per_employee / market_avg_salary) * 100
);

const morale = (salary_satisfaction * 0.6 + 
  (100 - Math.abs(workload_ratio - OPTIMAL_RATIO) / 2) * 0.4);
```

**Output** (Calculated):
```typescript
{
  efficiency: number;                   // 0-100
  morale: number;                       // 0-100
  quality_modifier: number;             // 0.7-1.1
  overworked: boolean;
  turnover_risk: 'low' | 'medium' | 'high';
}
```

**Timp de execuție**: <100ms

**Influență**:
- ✅ Modifică `quality_score` în Customer satisfaction
- ✅ Afectează service quality (deci retention)

---

### Agent 7: **Customer Behavior Agent** 🛒 ⭐ CRITICAL

**Rol**: Distribuie clienții între business-uri bazat pe utility scores.

**Model**: `gpt-4o-mini` (pentru segment preferences)

**Input**:
```typescript
{
  market_context: MarketContextOutput,
  player_offering: {
    price: number,
    quality_score: number,
    marketing_spend: number
  },
  competitors: CompetitorActionsOutput,
  employee_performance: EmployeeOutput,
  supplier_quality: number,
  events_impact: number,
  trends_impact: number
}
```

**Procesare**:
```typescript
// 1. LLM identifică weight-urile pentru segmente (ONE call):
segments = [
  { 
    name: "young_professionals",
    size: 4500,
    weights: { price: 0.3, quality: 0.5, convenience: 0.2 }
  },
  // ... max 3 segmente
]

// 2. TypeScript calculează utility scores pentru fiecare business
// 3. TypeScript distribuie clienții bazat pe scores
```

**Output** (Numeric):
```typescript
{
  total_customers: number;
  total_revenue: number;
  avg_satisfaction: number;             // 0-100
  market_share: number;                 // 0-100 (%)
  segments: Array<{
    name: string;
    customers_acquired: number;
    revenue_contribution: number;
  }>;
}
```

**Optimizări**:
- Un singur LLM call pentru toate segmentele
- Max 3 segmente (nu mai multe)
- Fără descrieri text

**Influență**:
- ✅ **CRITICAL**: Determină revenue-ul efectiv
- ✅ Determină market share final

---

### Agent 8: **Financial Reconciliation Agent** 💰

**Rol**: Calculează P&L (PURE MATH, no LLM).

**Model**: **NONE** (doar calcule TypeScript)

**Input**:
```typescript
{
  revenue: number,                      // din Customer Agent
  cogs_per_unit: number,                // din Supplier Agent
  units_sold: number,
  operating_expenses: {
    salaries: number,
    rent: number,                       // din Census
    utilities: number,
    marketing: number
  }
}
```

**Procesare** (Pure TypeScript):
```typescript
const cogs = cogs_per_unit * units_sold;
const gross_profit = revenue - cogs;
const total_opex = Object.values(operating_expenses)
  .reduce((a, b) => a + b, 0);
const ebitda = gross_profit - total_opex;
const tax = ebitda > 0 ? ebitda * 0.25 : 0;
const net_profit = ebitda - tax;
```

**Output** (Calculated):
```typescript
{
  revenue: number;
  cogs: number;
  gross_profit: number;
  operating_expenses: number;
  ebitda: number;
  tax: number;
  net_profit: number;
  gross_margin: number;                 // %
  net_margin: number;                   // %
}
```

**Timp de execuție**: <50ms

**Influență**:
- ❌ Nu modifică (doar raportează)

---

### Agent 9: **Report Narrative Agent** 📝 ⭐ TEXT GENERATION

**Rol**: Singura sursă de text narrativ - generează inbox messages și summary.

**Model**: `gpt-4o` (text de calitate)

**Input**:
```typescript
{
  all_agent_outputs: AllAgentOutputs,
  previous_month_data?: PreviousMonthData
}
```

**Procesare**:
- LLM primește TOATE outputurile numerice
- Generează 3-5 mesaje narative
- Creează summary și recomandări

**Output** (TEXT RICH):
```typescript
{
  executive_summary: string;            // 2-3 propoziții
  inbox_messages: Array<{
    from: string;                       // "Manager Operațional"
    subject: string;                    // max 60 chars
    body: string;                       // max 200 chars
    urgency: 'low' | 'medium' | 'high';
    category: 'staff' | 'finance' | 'competition' | 'opportunity';
  }>;                                   // max 5 mesaje
  top_recommendations: Array<{
    action: string;                     // "hire_staff"
    reason: string;                     // max 100 chars
    priority: 'low' | 'medium' | 'high';
    estimated_impact: number;           // $ impact
  }>;                                   // max 3 recomandări
  sentiment: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
}
```

**Optimizări**:
- Temperature: 0.7 (creativitate moderată)
- Max tokens: 1000
- Structured output cu limite stricte de caractere

**Influență**:
- ❌ Nu modifică starea (doar raportează)
- ✅ Esențial pentru UX și înțelegere

---

## 🔄 Flow de Execuție Paralelizat cu RAG

### Diagrama Completă de Execuție (cu RAG)

```typescript
async function runMonthSimulation(input: SimulationInput): Promise<SimulationResult> {
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 0: RAG Historical Context Retrieval (Sequential) - ~0.5s 🆕
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const historicalContext = await retrieveHistoricalContext(
    input.user_id,
    input.business_id,
    input.current_month,
    3  // last 3 months + similar situations
  );
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 1: Context Setup (Sequential) - ~1s
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const marketContext = await marketContextAgent(
    input.census_data,
    input.business_type,
    input.location
  );
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 2: External Analysis (PARALLEL) - ~2s
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [eventsResult, trendsResult] = await Promise.all([
    generateBusinessEvent(
      input.business_type,
      input.location,
      input.census_data,
      input.current_month,
      input.current_year
    ),
    analyzeTrendsForBusiness(
      input.business_type,
      input.location,
      input.trends_data,
      input.current_month,
      input.current_year
    )
  ]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 3: Market Dynamics (PARALLEL) - ~1.5s
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [supplierResult, competitionResult, employeePrelim] = await Promise.all([
    supplierAgent(
      input.supplier_tier,
      marketContext.market_size_estimate,
      input.current_month,
      input.business_type
    ),
    competitionAgent(
      input.competitors,
      input.player_decisions,
      marketContext
    ),
    // Employee preliminary (recalculat după Customer Agent)
    Promise.resolve(calculateEmployeeMetrics(
      input.num_employees,
      input.salary_per_employee,
      0, // va fi actualizat
      input.census_data.median_household_income
    ))
  ]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 4: Customer Simulation (Sequential) - ~2s
  // Needs: marketContext, events, trends, supplier, competition
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const customerResult = await customerBehaviorAgent({
    market_context: marketContext,
    player_offering: {
      price: input.player_decisions.price,
      quality_score: supplierResult.quality_score,
      marketing_spend: input.player_decisions.marketing_budget
    },
    competitors: competitionResult,
    events_impact: eventsResult.impact_clienti_lunar,
    trends_impact: trendsResult.main_trend.impact_score
  });
  
  // Recalculează employee cu customer count real
  const employeeFinal = calculateEmployeeMetrics(
    input.num_employees,
    input.salary_per_employee,
    customerResult.total_customers,
    input.census_data.median_household_income
  );
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 5: Reporting (PARALLEL) - ~3s
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [financialResult, narrativeReport] = await Promise.all([
    // Financial: Pure Math (instant)
    Promise.resolve(calculateFinancials({
      revenue: customerResult.total_revenue,
      cogs_per_unit: supplierResult.cost_per_unit,
      units_sold: customerResult.total_customers,
      operating_expenses: {
        salaries: input.num_employees * input.salary_per_employee,
        rent: input.census_data.median_rent,
        utilities: 800,
        marketing: input.player_decisions.marketing_budget
      }
    })),
    
    // Narrative: LLM (longest call) - 🆕 ENHANCED WITH RAG
    reportNarrativeAgent({
      market_context: marketContext,
      events: eventsResult,
      trends: trendsResult,
      supplier: supplierResult,
      competition: competitionResult,
      customer: customerResult,
      employee: employeeFinal,
      financial: null, // va fi calculat în parallel
      previous_month: input.previous_month_data,
      historical_context: historicalContext  // 🆕 RAG CONTEXT
    })
  ]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 6: RAG Storage (Sequential) - ~0.2s 🆕
  // Store current month state for future RAG retrieval
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await storeSimulationState(
    input.user_id,
    input.business_id,
    input.current_month,
    {
      month: input.current_month,
      revenue: financialResult.revenue,
      expenses: financialResult.total_expenses,
      profit: financialResult.profit,
      customers_served: customerResult.total_customers,
      employee_count: employeeFinal.total_employees,
      inventory_level: input.current_inventory,
      cash_reserve: input.cash_reserve,
      debt_level: input.debt_level,
      market_demand_score: marketContext.demand_score,
      competition_intensity: competitionResult.avg_competitive_pressure,
      major_events: eventsResult.relevanta_pentru_business 
        ? [eventsResult.nume_eveniment] 
        : [],
      trends_followed: [trendsResult.main_trend.keyword],
      decisions: {
        pricing_strategy: input.player_decisions.pricing_strategy,
        marketing_spend: input.player_decisions.marketing_budget,
        inventory_strategy: input.player_decisions.inventory_strategy,
        hr_actions: input.player_decisions.hr_actions || []
      }
    }
  );
  
  // Also store recommendations for outcome tracking
  if (narrativeReport.recommendations && narrativeReport.recommendations.length > 0) {
    await storeRecommendations(
      input.user_id,
      input.business_id,
      input.current_month,
      narrativeReport.recommendations,
      {
        revenue_trend: calculateRevenueTrend(historicalContext.recent_months, financialResult.revenue),
        profit_margin: (financialResult.profit / financialResult.revenue) * 100,
        market_condition: marketContext.demand_score > 70 ? 'favorable' : 'challenging'
      }
    );
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FINAL: Assemble Response
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return {
    month: input.current_month,
    year: input.current_year,
    financial: financialResult,
    customer: customerResult,
    employee: employeeFinal,
    market: {
      market_share: customerResult.market_share,
      competitive_pressure: competitionResult.avg_competitive_pressure
    },
    events: eventsResult,
    trends: trendsResult,
    narrative: narrativeReport,
    execution_time_ms: Date.now() - startTime
  };
}
```

### Breakdown Temporal

| Phase | Operații | Tip | Timp |
|-------|----------|-----|------|
| 1 | Market Context | LLM (mini) | 1.0s |
| 2 | Events + Trends | 2× LLM (gpt-4o) parallel | 2.0s |
| 3 | Supplier + Competition + Employee | 2× LLM (mini) + Math parallel | 1.5s |
| 4 | Customer Behavior | LLM (mini) | 2.0s |
| 5 | Financial + Narrative | Math + LLM (gpt-4o) parallel | 3.0s |
| **TOTAL** | | | **~9.5s** |

### Optimizări Critice

1. **Paralelizare Maximă**:
   - Fiecare phase rulează call-uri LLM în paralel unde e posibil
   - Financial Math rulează în paralel cu Report Generation

2. **Model Selection**:
   - `gpt-4o-mini`: decizii rapide, output numeric
   - `gpt-4o`: doar pentru Events, Trends, și Report (text narrativ)

3. **Caching**:
   ```typescript
   // Census data e cached
   const cachedCensusData = await getCachedCensusData(location);
   
   // Competitor data e pre-procesat
   const topCompetitors = competitors.slice(0, 5); // doar primii 5
   ```

4. **Timeout Protection**:
   ```typescript
   const PHASE_TIMEOUT = 5000; // 5s per phase
   
   const result = await Promise.race([
     phaseExecution(),
     timeout(PHASE_TIMEOUT)
   ]);
   ```

---

## 💰 Starea Pieței și Modificări

### Starea Inițială (La Setup)
```typescript
interface InitialMarketState {
  // Din Census Data (cached)
  market_demographics: {
    total_population: number;
    median_income: number;
    education_rate: number;
    poverty_rate: number;
    work_from_home_rate: number;
  };
  
  // Din Google Places (pre-procesat)
  competitors: Array<{
    id: string;
    name: string;
    rating: number;
    price_level: number;
    distance: number;
  }>;
  
  // Calculated (by Market Context Agent)
  market_size_estimate: number;        // customers/month
  avg_market_price: number;
  competitive_intensity: number;        // 0-100
}
```

### Cum Se Modifică Piața (în memorie, per simulare)

#### 1. **Market Share Distribution**
```typescript
// Calculat de Customer Behavior Agent
interface MarketShareUpdate {
  player: number;                      // %
  competitors: Map<string, number>;    // competitor_id → %
}

// Exemplu:
Before: { player: 0%, starbucks: 45%, local_cafe: 30%, others: 25% }
After:  { player: 18%, starbucks: 38%, local_cafe: 25%, others: 19% }
```

#### 2. **Pricing Dynamics**
```typescript
// Competition Agent modifică prețurile temporar (în memorie)
interface CompetitorPriceAdjustment {
  competitor_id: string;
  original_price: number;
  adjusted_price: number;              // pentru această lună
  strategy: 'aggressive' | 'defensive' | 'passive';
}
```

#### 3. **Customer Satisfaction Accumulation**
```typescript
// Se acumulează de la lună la lună (DB persistent)
interface SatisfactionHistory {
  month: number;
  satisfaction: number;                // 0-100
  loyalty_boost: number;               // calculat din satisfaction history
}

// Formula loyalty:
loyalty_boost = avg(last_3_months_satisfaction) > 80 ? 1.1 : 1.0
```

#### 4. **Reputation Evolution**
```typescript
// Persistent în DB, evoluează treptat
interface BusinessReputation {
  overall_rating: number;              // 0-5 (crește încet)
  quality_score: number;               // 0-100
  service_score: number;               // din Employee performance
  value_score: number;                 // din price vs quality
}

// Se actualizează bazat pe:
- Employee efficiency → service_score
- Supplier quality → quality_score  
- Price fairness → value_score
- Customer satisfaction → overall_rating
```

### State Management Strategy

```typescript
// In-Memory (doar pentru durata simulării)
interface SimulationState {
  month: number;
  market_adjustments: {
    demand_modifier: number;           // din Events + Trends
    price_pressure: number;            // din Competition
    quality_benchmark: number;         // din Supplier + Employee
  };
}

// Persistent (salvat în DB după simulare)
interface PersistentState {
  business_id: number;
  month: number;
  financial_snapshot: FinancialResult;
  reputation: BusinessReputation;
  customer_satisfaction: number;
  market_share: number;
}
```

---

## 🛠️ Implementare Tehnică

### Stack Tehnologic
- **Backend Data**: FastAPI (Python) + PostgreSQL
- **AI Agents**: TypeScript + Vercel AI SDK (OpenAI)
- **Orchestration**: Next.js API Routes
- **State Management**: In-memory during simulation + PostgreSQL persistence

### Structura Codului Optimizată

```
agents-orchestrator/lib/simulation_agents/
├── ARCHITECTURE.md (acest document)
├── README.md (ghid de utilizare)
│
├── core/
│   ├── types.ts                    // TypeScript interfaces
│   ├── schemas.ts                  // Zod schemas pentru toate outputs
│   ├── constants.ts                // Constante economice
│   └── orchestrator.ts             // Master orchestrator cu paralelizare
│
├── agents/
│   ├── market-context-agent.ts     // ✅ NEW (gpt-4o-mini)
│   ├── events-agent.ts             // ✅ EXISTENT (refactorizat)
│   ├── trends-agent.ts             // ✅ EXISTENT (refactorizat)
│   ├── supplier-agent.ts           // ✅ NEW (gpt-4o-mini)
│   ├── competition-agent.ts        // ✅ NEW (gpt-4o-mini)
│   ├── customer-behavior-agent.ts  // ✅ NEW (gpt-4o-mini)
│   ├── employee-agent.ts           // ✅ NEW (PURE MATH)
│   ├── financial-agent.ts          // ✅ NEW (PURE MATH)
│   └── report-agent.ts             // ✅ NEW (gpt-4o)
│
└── utils/
    ├── calculations.ts             // Formule economice
    ├── customer-segmentation.ts    // Logica de segmentare
    ├── competitor-modeling.ts      // Utility functions
    └── cache.ts                    // Caching pentru Census data
```

### Schema Definitions (Zod)

```typescript
// core/schemas.ts - TOATE schema definitions centralizate

import { z } from 'zod';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Market Context Agent Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const MarketContextSchema = z.object({
  market_size_estimate: z.number().min(0),
  dominant_segments: z.array(z.string()).max(3),
  demand_score: z.number().min(0).max(100),
  price_sensitivity_score: z.number().min(0).max(100),
  quality_preference_score: z.number().min(0).max(100),
  foot_traffic_multiplier: z.number().min(0.5).max(2.0)
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Events Agent Schema (EXISTENT - optimizat)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const BusinessEventSchema = z.object({
  nume_eveniment: z.string().max(80),
  impact_clienti_lunar: z.number().min(-30).max(30),
  relevanta_pentru_business: z.boolean(),
  descriere_scurta: z.string().max(100)
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Trends Agent Schema (EXISTENT - optimizat)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const TrendInsightSchema = z.object({
  trend_name: z.string().max(60),
  impact_score: z.number().min(-100).max(100),
  relevance: z.boolean(),
  confidence: z.enum(['low', 'medium', 'high'])
});

export const TrendsAnalysisSchema = z.object({
  main_trend: TrendInsightSchema,
  overall_sentiment: z.enum(['positive', 'neutral', 'negative']),
  market_momentum: z.enum(['accelerating', 'stable', 'decelerating'])
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Supplier Agent Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const SupplierResultSchema = z.object({
  cost_per_unit: z.number().min(0),
  quality_score: z.number().min(0).max(100),
  seasonal_modifier: z.number().min(0.9).max(1.2),
  reliability_flag: z.boolean()
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Competition Agent Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const CompetitorActionSchema = z.object({
  id: z.string(),
  strategy: z.enum(['aggressive', 'defensive', 'passive']),
  price_change: z.number().min(-0.3).max(0.3),
  marketing_boost: z.number().min(0).max(0.5)
});

export const CompetitionResultSchema = z.object({
  competitors: z.array(CompetitorActionSchema).max(5),
  avg_competitive_pressure: z.number().min(0).max(100)
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Customer Behavior Agent Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const CustomerSegmentResultSchema = z.object({
  name: z.string(),
  customers_acquired: z.number().min(0),
  revenue_contribution: z.number().min(0)
});

export const CustomerBehaviorSchema = z.object({
  total_customers: z.number().min(0),
  total_revenue: z.number().min(0),
  avg_satisfaction: z.number().min(0).max(100),
  market_share: z.number().min(0).max(100),
  segments: z.array(CustomerSegmentResultSchema).max(3)
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Report Agent Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const InboxMessageSchema = z.object({
  from: z.string().max(40),
  subject: z.string().max(60),
  body: z.string().max(200),
  urgency: z.enum(['low', 'medium', 'high']),
  category: z.enum(['staff', 'finance', 'competition', 'opportunity'])
});

export const RecommendationSchema = z.object({
  action: z.string().max(40),
  reason: z.string().max(100),
  priority: z.enum(['low', 'medium', 'high']),
  estimated_impact: z.number()
});

export const ReportNarrativeSchema = z.object({
  executive_summary: z.string().max(300),
  inbox_messages: z.array(InboxMessageSchema).max(5),
  top_recommendations: z.array(RecommendationSchema).max(3),
  sentiment: z.enum(['very_negative', 'negative', 'neutral', 'positive', 'very_positive'])
});
```

### Master Orchestrator Implementation

```typescript
// core/orchestrator.ts

import { 
  marketContextAgent,
  generateBusinessEvent,
  analyzeTrendsForBusiness,
  supplierAgent,
  competitionAgent,
  customerBehaviorAgent,
  calculateEmployeeMetrics,
  calculateFinancials,
  reportNarrativeAgent
} from '../agents';

export async function runMonthSimulation(
  input: SimulationInput
): Promise<SimulationResult> {
  const startTime = Date.now();
  
  try {
    // PHASE 1: Market Context (Sequential)
    const marketContext = await marketContextAgent(
      input.census_data,
      input.business_type,
      input.location
    );
    
    // PHASE 2: External Analysis (PARALLEL)
    const [eventsResult, trendsResult] = await Promise.all([
      generateBusinessEvent(
        input.business_type,
        input.location,
        input.census_data,
        input.current_month,
        input.current_year
      ),
      analyzeTrendsForBusiness(
        input.business_type,
        input.location,
        input.trends_data,
        input.current_month,
        input.current_year
      )
    ]);
    
    // PHASE 3: Market Dynamics (PARALLEL)
    const [supplierResult, competitionResult] = await Promise.all([
      supplierAgent(
        input.supplier_tier,
        marketContext.market_size_estimate,
        input.current_month,
        input.business_type
      ),
      competitionAgent(
        input.competitors,
        input.player_decisions,
        marketContext
      )
    ]);
    
    // PHASE 4: Customer Simulation (Sequential)
    const customerResult = await customerBehaviorAgent({
      market_context: marketContext,
      player_offering: {
        price: input.player_decisions.price,
        quality_score: supplierResult.quality_score,
        marketing_spend: input.player_decisions.marketing_budget
      },
      competitors: competitionResult,
      events_impact: eventsResult.impact_clienti_lunar,
      trends_impact: trendsResult.main_trend.impact_score
    });
    
    // Employee calculation (Pure Math)
    const employeeResult = calculateEmployeeMetrics(
      input.num_employees,
      input.salary_per_employee,
      customerResult.total_customers,
      input.census_data.median_household_income
    );
    
    // PHASE 5: Reporting (PARALLEL)
    const [financialResult, narrativeReport] = await Promise.all([
      Promise.resolve(calculateFinancials({
        revenue: customerResult.total_revenue,
        cogs_per_unit: supplierResult.cost_per_unit,
        units_sold: customerResult.total_customers,
        operating_expenses: {
          salaries: input.num_employees * input.salary_per_employee,
          rent: input.census_data.median_rent || 5000,
          utilities: 800,
          marketing: input.player_decisions.marketing_budget
        }
      })),
      reportNarrativeAgent({
        market_context: marketContext,
        events: eventsResult,
        trends: trendsResult,
        supplier: supplierResult,
        competition: competitionResult,
        customer: customerResult,
        employee: employeeResult,
        previous_month: input.previous_month_data
      })
    ]);
    
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      month: input.current_month,
      year: input.current_year,
      financial: financialResult,
      customer: customerResult,
      employee: employeeResult,
      market: {
        market_share: customerResult.market_share,
        competitive_pressure: competitionResult.avg_competitive_pressure
      },
      events: eventsResult,
      trends: trendsResult,
      narrative: narrativeReport,
      execution_time_ms: executionTime
    };
    
  } catch (error) {
    console.error('Simulation error:', error);
    throw new Error(`Simulation failed: ${error.message}`);
  }
}
```

### API Endpoint

```typescript
// app/api/simulation/run-month/route.ts

import { runMonthSimulation } from '@/lib/simulation_agents/core/orchestrator';

export async function POST(request: Request) {
  try {
    const input = await request.json();
    
    // Validate input
    // ... validation logic
    
    const result = await runMonthSimulation(input);
    
    return Response.json(result);
    
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Performance Monitoring

```typescript
// utils/monitoring.ts

export function logAgentPerformance(
  agentName: string,
  duration: number,
  outputSize: number
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${agentName}] ${duration}ms | ${outputSize} bytes`);
  }
}

// Utilizare:
const start = Date.now();
const result = await agent(...);
logAgentPerformance('CustomerBehavior', Date.now() - start, JSON.stringify(result).length);
```

---

## 📊 Metrics & KPIs

### Business Metrics (returnate către player)
```typescript
interface BusinessMetrics {
  revenue: number;
  profit: number;
  market_share: number;              // %
  customer_count: number;
  customer_satisfaction: number;      // 0-100
  gross_margin: number;               // %
  net_margin: number;                 // %
}
```

### Operational Metrics (pentru raportare)
```typescript
interface OperationalMetrics {
  employee_efficiency: number;        // 0-100
  employee_morale: number;            // 0-100
  quality_score: number;              // 0-100
  competitive_pressure: number;       // 0-100
}
```

---

## 🎯 Exemplu de Execuție Completă

### Input:
```json
{
  "business_id": 123,
  "business_type": "Artisan Coffee Shop",
  "location": {
    "address": "Greenwich Village, NYC",
    "lat": 40.7336,
    "lng": -74.0027
  },
  "current_month": 6,
  "current_year": 2024,
  "player_decisions": {
    "num_employees": 4,
    "salary_per_employee": 2800,
    "supplier_tier": "premium",
    "product_price": 7.50,
    "marketing_budget": 3000
  },
  "census_data": { /* cached data */ },
  "trends_data": { /* from backend */ },
  "competitors": [ /* Google Places data */ ]
}
```

### Output (sub 10s):
```json
{
  "success": true,
  "month": 6,
  "year": 2024,
  "financial": {
    "revenue": 69000,
    "net_profit": 20370,
    "gross_margin": 70.7,
    "net_margin": 29.5
  },
  "customer": {
    "total_customers": 9200,
    "market_share": 51.1,
    "avg_satisfaction": 88
  },
  "employee": {
    "efficiency": 68,
    "morale": 75,
    "overworked": true
  },
  "narrative": {
    "executive_summary": "Lună foarte profitabilă datorită Pride Month, dar echipa e suprasolicitată.",
    "inbox_messages": [
      {
        "from": "Operations Manager",
        "subject": "Urgent: Echipa suprasolicitată",
        "body": "Avem 9200 clienți cu doar 4 baristas. Angajații lucrează overtime constant. Risc major de burnout.",
        "urgency": "high",
        "category": "staff"
      }
    ],
    "top_recommendations": [
      {
        "action": "hire_staff",
        "reason": "Angajează 2 baristas pentru a reduce workload-ul",
        "priority": "high",
        "estimated_impact": -5600
      }
    ],
    "sentiment": "positive"
  },
  "execution_time_ms": 8743
}
```

---

## ✅ Best Practices

### Development
1. **Type Safety**: Toate outputs folosesc Zod validation
2. **Error Handling**: Timeout protection pe fiecare phase
3. **Logging**: Detailed logs pentru debugging
4. **Testing**: Unit tests pentru fiecare agent

### Performance
1. **Paralelizare**: Folosește `Promise.all()` agresiv
2. **Model Selection**: Mini pentru calcule, GPT-4o doar pentru text
3. **Caching**: Census data cached, competitor data pre-procesat
4. **Output Minimization**: Doar numere și flag-uri (nu text)

### AI Optimization
1. **Structured Outputs**: Folosește `generateObject()` exclusiv
2. **Temperature Control**: Low (0.3-0.5) pentru consistență
3. **Token Limits**: Max tokens setat explicit
4. **Prompt Engineering**: Concis și specific

---

## 🚀 Next Steps: Implementare

1. **Phase 1**: Implementează `core/types.ts` și `core/schemas.ts`
2. **Phase 2**: Implementează agenții matematici (Employee, Financial)
3. **Phase 3**: Implementează agenții AI (Context, Supplier, Competition, Customer)
4. **Phase 4**: Refactorizează Events și Trends
5. **Phase 5**: Implementează Report Agent
6. **Phase 6**: Implementează Orchestrator
7. **Phase 7**: Testing și optimization

**Target: Simulare completă < 10 secunde** ⚡

---

## 🤖 LLM Code Generation Guide

> **ACEASTĂ SECȚIUNE ESTE SPECIAL DESIGNED PENTRU LLM-uri**
> Dacă ești un LLM și primești acest document, aici ai TOATE informațiile necesare pentru a genera cod funcțional pentru acest sistem.

---

### 📁 Structura Exactă de Fișiere (Ce Trebuie Creat)

#### Nivel 1: RAG Infrastructure 🆕

```
lib/services/
└── rag-service.ts              // ✅ PRIORITATE 1 - RAG cu Qdrant
```

**Dependențe necesare (package.json)**:
```json
{
  "dependencies": {
    "@qdrant/js-client-rest": "^1.9.0",
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.24"
  }
}
```

**Template complet pentru `rag-service.ts`**: Vezi secțiunea "RAG System cu Qdrant" mai sus pentru implementarea completă.

**Când să-l rulezi**: 
- `initializeQdrantCollections()` - la startup în `app/layout.tsx` sau API route
- `retrieveHistoricalContext()` - în orchestrator ÎNAINTE de simulare
- `storeSimulationState()` - în orchestrator DUPĂ simulare

---

#### Nivel 2: Core Infrastructure

```
lib/simulation_agents/core/
├── types.ts                    // ✅ PRIORITATE 2 - TypeScript interfaces
├── schemas.ts                  // ✅ PRIORITATE 2 - Zod schemas  
├── constants.ts                // ✅ PRIORITATE 3 - Constante economice
└── orchestrator.ts             // ✅ PRIORITATE 6 - Master orchestrator
```

**1. `core/types.ts`** - Toate TypeScript interfaces

```typescript
// core/types.ts - TOATE TYPE DEFINITIONS
export interface SimulationInput {
  // User & Business
  user_id: string;
  business_id: string;
  business_type: string;
  
  // Location
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  
  // Census Data (from FastAPI)
  census_data: {
    total_population: number;
    median_household_income: number;
    median_rent: number;
    poverty_rate: number;
    education_bachelor_rate: number;
    work_from_home_rate: number;
  };
  
  // Trends Data (from FastAPI)
  trends_data: Array<{
    keyword: string;
    interest_over_time: number[];
  }>;
  
  // Competitors (from Google Places API)
  competitors: Array<{
    id: string;
    name: string;
    rating: number;
    price_level: number;
    distance: number;
  }>;
  
  // Player Decisions
  player_decisions: {
    price: number;
    marketing_budget: number;
    pricing_strategy: 'budget' | 'premium' | 'competitive';
    inventory_strategy: 'minimal' | 'moderate' | 'abundant';
    hr_actions?: string[];
  };
  
  // Current State
  current_month: number;
  current_year: number;
  current_inventory: number;
  cash_reserve: number;
  debt_level: number;
  num_employees: number;
  salary_per_employee: number;
  supplier_tier: 'budget' | 'mid' | 'premium';
  
  // Previous Month (optional)
  previous_month_data?: SimulationResult;
}

export interface SimulationResult {
  month: number;
  year: number;
  
  financial: FinancialResult;
  customer: CustomerBehaviorResult;
  employee: EmployeeResult;
  market: MarketSnapshot;
  events: BusinessEvent;
  trends: TrendsAnalysis;
  report: NarrativeReport;
  
  execution_time_ms: number;
}

// Agent result types - vezi schemas.ts pentru validare
export interface MarketContextResult {
  market_size_estimate: number;
  dominant_segments: string[];
  demand_score: number;
  price_sensitivity_score: number;
  quality_preference_score: number;
  foot_traffic_multiplier: number;
}

export interface BusinessEvent {
  nume_eveniment: string;
  impact_clienti_lunar: number;
  relevanta_pentru_business: boolean;
  descriere_scurta: string;
}

export interface TrendsAnalysis {
  main_trend: {
    trend_name: string;
    impact_score: number;
    relevance: boolean;
    confidence: 'low' | 'medium' | 'high';
  };
  overall_sentiment: 'positive' | 'neutral' | 'negative';
  market_momentum: 'accelerating' | 'stable' | 'decelerating';
}

export interface SupplierResult {
  cost_per_unit: number;
  quality_score: number;
  seasonal_modifier: number;
  reliability_flag: boolean;
}

export interface CompetitionResult {
  competitors: Array<{
    id: string;
    strategy: 'aggressive' | 'defensive' | 'passive';
    price_change: number;
    marketing_boost: number;
  }>;
  avg_competitive_pressure: number;
}

export interface CustomerBehaviorResult {
  total_customers: number;
  total_revenue: number;
  avg_satisfaction: number;
  market_share: number;
  segments: Array<{
    name: string;
    customers_acquired: number;
    revenue_contribution: number;
  }>;
}

export interface EmployeeResult {
  total_employees: number;
  total_salaries: number;
  productivity_score: number;
  morale: number;
  overworked: boolean;
}

export interface FinancialResult {
  revenue: number;
  cogs: number;
  gross_profit: number;
  operating_expenses: number;
  ebitda: number;
  net_profit: number;
  profit_margin: number;
  cash_flow: number;
}

export interface NarrativeReport {
  executive_summary: string;
  inbox_messages: Array<{
    from: string;
    subject: string;
    body: string;
    urgency: 'low' | 'medium' | 'high';
    category: 'market' | 'staff' | 'financial' | 'competitors';
  }>;
  top_recommendations: Array<{
    action: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
    estimated_impact: number;
  }>;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface MarketSnapshot {
  market_share: number;
  competitive_pressure: number;
}

// RAG Types
export interface HistoricalContext {
  recent_months: Array<{
    month: number;
    state_summary: SimulationStateSummary;
  }>;
  similar_situations: Array<{
    month: number;
    state_summary: SimulationStateSummary;
    similarity_score: number;
  }>;
  past_recommendations: Array<{
    month: number;
    recommendation: Recommendation;
    outcome: RecommendationOutcome | null;
  }>;
}

export interface SimulationStateSummary {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
  customers_served: number;
  employee_count: number;
  inventory_level: number;
  cash_reserve: number;
  debt_level: number;
  market_demand_score: number;
  competition_intensity: number;
  major_events: string[];
  trends_followed: string[];
  decisions: {
    pricing_strategy: string;
    marketing_spend: number;
    inventory_strategy: string;
    hr_actions: string[];
  };
}

export interface Recommendation {
  category: 'pricing' | 'marketing' | 'inventory' | 'hr' | 'financial';
  text: string;
  priority: 'high' | 'medium' | 'low';
  context: {
    revenue_trend: 'increasing' | 'stable' | 'decreasing';
    profit_margin: number;
    market_condition: string;
  };
}

export interface RecommendationOutcome {
  was_followed: boolean;
  impact_on_revenue?: number;
  impact_on_profit?: number;
  success_rating?: number;
}
```

**2. `core/schemas.ts`** - Validation cu Zod (VEZI MAI SUS în secțiunea "Schema Definitions")

**3. `core/constants.ts`** - Economic Constants

```typescript
// core/constants.ts
export const ECONOMIC_CONSTANTS = {
  // Supplier tiers
  SUPPLIER_QUALITY: {
    budget: 60,
    mid: 75,
    premium: 90
  },
  
  // Seasonal modifiers
  SEASONAL_DEMAND: {
    1: 0.85,   // January (low)
    2: 0.90,   // February
    3: 0.95,   // March
    4: 1.00,   // April
    5: 1.05,   // May
    6: 1.15,   // June (high - summer start)
    7: 1.20,   // July (peak)
    8: 1.15,   // August
    9: 1.00,   // September
    10: 0.95,  // October
    11: 1.10,  // November (holidays)
    12: 1.25   // December (peak holidays)
  },
  
  // Customer segments
  SEGMENTS: {
    young_professionals: {
      price_sensitivity: 0.6,
      quality_preference: 0.8,
      avg_spend: 8.5
    },
    families: {
      price_sensitivity: 0.8,
      quality_preference: 0.6,
      avg_spend: 6.2
    },
    high_income: {
      price_sensitivity: 0.3,
      quality_preference: 0.95,
      avg_spend: 12.5
    },
    students: {
      price_sensitivity: 0.9,
      quality_preference: 0.4,
      avg_spend: 4.8
    }
  },
  
  // Operations
  OPERATIONS: {
    customers_per_employee_per_day: 75,
    base_utilities_cost: 800,
    marketing_efficiency: 0.02  // 2% conversion rate per $1000 spent
  }
} as const;
```

---

#### Nivel 3: Math Agents (Pure TypeScript)

```
lib/simulation_agents/agents/
├── employee-agent.ts           // ✅ PRIORITATE 4 - Pure calculations
└── financial-agent.ts          // ✅ PRIORITATE 4 - P&L calculations
```

**1. `employee-agent.ts`** - NO LLM, Pure Math

```typescript
// agents/employee-agent.ts
import type { EmployeeResult } from '../core/types';
import { ECONOMIC_CONSTANTS } from '../core/constants';

export function calculateEmployeeMetrics(
  num_employees: number,
  salary_per_employee: number,
  customers_served: number,
  market_median_income: number
): EmployeeResult {
  
  // Calculate productivity
  const customers_per_employee = num_employees > 0 
    ? customers_served / num_employees 
    : 0;
  
  const ideal_load = ECONOMIC_CONSTANTS.OPERATIONS.customers_per_employee_per_day * 30;
  const productivity_score = Math.min(100, (customers_per_employee / ideal_load) * 100);
  
  // Calculate morale based on workload & salary fairness
  const workload_ratio = customers_per_employee / ideal_load;
  const overworked = workload_ratio > 1.2;
  
  const salary_fairness = salary_per_employee / (market_median_income / 12);
  const salary_morale = Math.min(100, salary_fairness * 80);
  
  const workload_morale = workload_ratio < 0.8 
    ? 90  // underworked (bored)
    : workload_ratio > 1.2 
    ? 50  // overworked (stressed)
    : 95; // balanced
  
  const morale = (salary_morale * 0.6 + workload_morale * 0.4);
  
  return {
    total_employees: num_employees,
    total_salaries: num_employees * salary_per_employee,
    productivity_score: Math.round(productivity_score),
    morale: Math.round(morale),
    overworked
  };
}
```

**2. `financial-agent.ts`** - P&L Calculations

```typescript
// agents/financial-agent.ts
import type { FinancialResult } from '../core/types';

interface FinancialInput {
  revenue: number;
  cogs_per_unit: number;
  units_sold: number;
  operating_expenses: {
    salaries: number;
    rent: number;
    utilities: number;
    marketing: number;
  };
}

export function calculateFinancials(input: FinancialInput): FinancialResult {
  const { revenue, cogs_per_unit, units_sold, operating_expenses } = input;
  
  // COGS
  const cogs = cogs_per_unit * units_sold;
  
  // Gross Profit
  const gross_profit = revenue - cogs;
  
  // Total Operating Expenses
  const total_opex = Object.values(operating_expenses).reduce((a, b) => a + b, 0);
  
  // EBITDA (before interest, taxes, depreciation)
  const ebitda = gross_profit - total_opex;
  
  // Net Profit (simplified - no taxes/interest for now)
  const net_profit = ebitda;
  
  // Metrics
  const profit_margin = revenue > 0 ? (net_profit / revenue) * 100 : 0;
  const cash_flow = net_profit;  // simplified
  
  return {
    revenue,
    cogs,
    gross_profit,
    operating_expenses: total_opex,
    ebitda,
    net_profit,
    profit_margin,
    cash_flow
  };
}
```

---

#### Nivel 4: AI Agents (cu LLM)

```
lib/simulation_agents/agents/
├── market-context-agent.ts     // ✅ PRIORITATE 5 - gpt-4o-mini
├── supplier-agent.ts           // ✅ PRIORITATE 5 - gpt-4o-mini
├── competition-agent.ts        // ✅ PRIORITATE 5 - gpt-4o-mini
├── customer-behavior-agent.ts  // ✅ PRIORITATE 5 - gpt-4o-mini
└── report-agent.ts             // ✅ PRIORITATE 7 - gpt-4o + RAG
```

**Template Standard pentru AI Agent** (exemplu: `market-context-agent.ts`):

```typescript
// agents/market-context-agent.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { MarketContextSchema } from '../core/schemas';
import type { MarketContextResult } from '../core/types';

export async function analyzeMarketContext(input: {
  census_data: any;
  business_type: string;
  location: { lat: number; lng: number; address: string };
}): Promise<MarketContextResult> {
  
  const systemPrompt = `
Tu ești un expert în analiză de piață care procesează date Census pentru a evalua potențialul unei locații.

INSTRUCȚIUNI:
- Identifică 2-3 segmente dominante de clienți din datele Census
- Estimează dimensiunea pieței (clienți potențiali/lună)
- Calculează scoruri pentru demand, price sensitivity, quality preference
- Output: DOAR numere și flag-uri (nu text narrativ)
`.trim();

  const userPrompt = `
Analizează piața pentru: ${input.business_type}
Locație: ${input.location.address}

Date Census:
- Populație: ${input.census_data.total_population}
- Venit mediu: $${input.census_data.median_household_income}
- Educație (bachelor+): ${input.census_data.education_bachelor_rate}%
- Sărăcie: ${input.census_data.poverty_rate}%
- Work from home: ${input.census_data.work_from_home_rate}%

Identifică segmentele dominante și estimează metrici de piață.
`.trim();

  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: MarketContextSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.3
  });

  return result.object;
}
```

**IMPORTANT**: Report Agent primește `historical_context` din RAG:

```typescript
// agents/report-agent.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NarrativeReportSchema } from '../core/schemas';
import type { NarrativeReport, HistoricalContext } from '../core/types';

export async function generateNarrativeReport(input: {
  // All agent outputs
  market_context: any;
  events: any;
  trends: any;
  supplier: any;
  competition: any;
  customer: any;
  employee: any;
  financial: any;
  // 🆕 RAG CONTEXT
  historical_context: HistoricalContext;
}): Promise<NarrativeReport> {
  
  const systemPrompt = `
Tu ești un consultant de business expert care analizează performanța unei afaceri.

## CONTEXT ISTORIC DISPONIBIL
Ai acces la:
1. Ultimele 3 luni: Metrici financiare, decizii, evenimente
2. Situații similare din trecut
3. Recomandări trecute și outcome-uri

## SARCINA TA
- Compară performanța curentă cu lunile trecute
- Identifică pattern-uri și tendințe
- Recomandă acțiuni bazate pe ce a funcționat/nu a funcționat
- Referențiază date specifice din istoric

## OUTPUT
- Executive summary (max 200 chars)
- 2-4 inbox messages (urgent issues)
- Top 3 recommendations (prioritate high/medium/low)
`.trim();

  const userPrompt = `
## Luna Curentă (${input.financial.month})
Revenue: $${input.financial.revenue}
Profit: $${input.financial.net_profit}
Customers: ${input.customer.total_customers}
Employees: ${input.employee.total_employees}

## Evenimente & Trends
${input.events.relevanta_pentru_business ? `Event: ${input.events.nume_eveniment} (impact: ${input.events.impact_clienti_lunar}%)` : 'No relevant events'}
Trend: ${input.trends.main_trend.trend_name} (sentiment: ${input.trends.overall_sentiment})

## Istoric Recent
${input.historical_context.recent_months.map(m => `
Luna ${m.month}: Revenue $${m.state_summary.revenue}, Profit $${m.state_summary.profit}
Evenimente: ${m.state_summary.major_events.join(', ') || 'none'}
`).join('\n')}

## Situații Similare
${input.historical_context.similar_situations.slice(0, 2).map(s => `
Luna ${s.month} (similaritate: ${(s.similarity_score * 100).toFixed(0)}%):
Revenue $${s.state_summary.revenue}, Customers ${s.state_summary.customers_served}
`).join('\n')}

Generează raportul lunar folosind analiza completă (curent + istoric).
`.trim();

  const result = await generateObject({
    model: openai('gpt-4o'),  // Premium model pentru narrative
    schema: NarrativeReportSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
    maxTokens: 2000
  });

  return result.object;
}
```

---

#### Nivel 5: Master Orchestrator

**`core/orchestrator.ts`** - Vezi secțiunea "Flow de Execuție Paralelizat cu RAG" mai sus pentru implementarea COMPLETĂ.

**Key Points**:
1. Phase 0: RAG Retrieval (`retrieveHistoricalContext`)
2. Phase 1-5: Simulation (cu paralelizare)
3. Phase 6: RAG Storage (`storeSimulationState`)

---

### 🔌 Integration în Next.js API Route

**File: `app/api/simulation/next-month/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { runMonthSimulation } from '@/lib/simulation_agents/core/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    
    // Validate input (optional - add Zod validation)
    
    // Run simulation
    const result = await runMonthSimulation(input);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: 'Simulation failed' },
      { status: 500 }
    );
  }
}
```

---

### 📦 Dependencies Complete List

**Adaugă în `agents-orchestrator/package.json`**:

```json
{
  "dependencies": {
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.24",
    "@qdrant/js-client-rest": "^1.9.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
```

Instalează cu:
```bash
cd agents-orchestrator
npm install
```

---

### 🎯 Ordinea de Implementare pentru LLM

Dacă generezi cod, urmează această ordine EXACT:

1. **RAG Infrastructure** (`lib/services/rag-service.ts`)
2. **Core Types** (`core/types.ts`, `core/schemas.ts`, `core/constants.ts`)
3. **Math Agents** (`employee-agent.ts`, `financial-agent.ts`)
4. **AI Agents Simple** (`market-context-agent.ts`, `supplier-agent.ts`, `competition-agent.ts`, `customer-behavior-agent.ts`)
5. **Refactor Existing** (Update `events-agent.ts`, `trends-agent.ts` dacă e nevoie)
6. **Report Agent** (`report-agent.ts` - cu RAG integration)
7. **Master Orchestrator** (`core/orchestrator.ts`)
8. **API Route** (`app/api/simulation/next-month/route.ts`)
9. **Initialize Qdrant** (în `app/layout.tsx` sau separate init script)

---

### 🧪 Testing Strategy

După implementare, testează în această ordine:

```typescript
// 1. Test RAG service
await initializeQdrantCollections();
// Verifică că collections există în Qdrant

// 2. Test math agents
const employeeResult = calculateEmployeeMetrics(4, 3500, 9200, 70000);
console.log(employeeResult);

// 3. Test AI agents individual
const marketContext = await analyzeMarketContext({...});
console.log(marketContext);

// 4. Test orchestrator (full simulation)
const result = await runMonthSimulation({...});
console.log(result);

// 5. Test RAG retrieval
const historicalContext = await retrieveHistoricalContext('user123', 'biz456', 5);
console.log(historicalContext);
```

---

### ⚠️ Common Pitfalls pentru LLM Code Generation

1. **Nu uita**: Import Zod schemas din `core/schemas.ts` în fiecare agent
2. **Nu uita**: Export all functions și types
3. **Nu uita**: Use `async/await` pentru toate agent calls
4. **Nu uita**: TypeScript strict mode - toate types explicit
5. **Nu uita**: RAG context este `optional` în input (poate fi undefined în prima lună)
6. **Nu uita**: Handle errors gracefully (try/catch în orchestrator)
7. **Nu uita**: Environment variables pentru OpenAI API key și Qdrant connection

**Environment Variables necesare (.env.local)**:
```bash
OPENAI_API_KEY=sk-...
QDRANT_HOST=localhost  # sau 'qdrant' în Docker
QDRANT_PORT=6333
```

---

## ✅ Checklist Final pentru LLM

Când generezi cod, asigură-te că:

- [ ] Toate imports sunt corecte și paths absolute (`@/lib/...`)
- [ ] Toate types au export/import corect
- [ ] Toate Zod schemas sunt folosite cu `generateObject()`
- [ ] RAG service inițializează collections la startup
- [ ] Orchestrator rulează Phase 0 (RAG retrieval) ÎNAINTE de simulare
- [ ] Orchestrator rulează Phase 6 (RAG storage) DUPĂ simulare
- [ ] Report Agent primește `historical_context` în input
- [ ] Math agents returnează exact types-urile definite
- [ ] Error handling există în orchestrator
- [ ] Timeout protection pe fiecare phase (optional dar recomandat)

---

**END OF ARCHITECTURE DOCUMENT**

**Ultimă actualizare**: Ianuarie 2025 (cu RAG integration)
