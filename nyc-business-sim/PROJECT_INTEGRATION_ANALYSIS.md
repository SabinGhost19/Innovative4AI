# 🔍 ANALIZĂ COMPLETĂ PROIECT & PLAN INTEGRARE BUSINESS SURVIVAL DATA

## 📊 Stare Actuală (Post-Integrare Business Survival)

### ✅ Ce Am Adăugat Acum

1. **Database Model** (`backend/database.py`)
   - `BusinessSurvival` table cu 5-year survival rates per industrie/county
   - Indexed pe: county_name, naics_code pentru căutări rapide

2. **Service Layer** (`backend/business_survival_service.py`)
   - 10 funcții de query pentru analiza survival rates
   - Business type mapping (coffee shop -> NAICS 72, etc.)
   - Risk assessment logic (LOW/MEDIUM/HIGH based on survival %)

3. **Data Population** (`backend/populate_business_survival.py`)
   - Script de populare CSV → PostgreSQL
   - Rulează automat la pornirea containerului (în `startup.sh`)
   - Batch commit pentru eficiență

4. **API Endpoints** (`backend/main.py`)
   - `GET /api/survival/industry/{county}/{naics}` - Survival rate per industrie
   - `GET /api/survival/business-type/{county}?business_type=X` - Survival by business type
   - `GET /api/survival/county/{county}` - Overview complet per county
   - `GET /api/survival/county/{county}/statistics` - Statistici comprehensive
   - `GET /api/survival/county/{county}/highest` - Top safest industries
   - `GET /api/survival/county/{county}/lowest` - Top riskiest industries
   - `GET /api/survival/industry-comparison?naics_code=X` - Cross-county comparison

5. **Infrastructure**
   - CSV copiat în backend directory
   - Dockerfile actualizat (deja copiază toate fișierele)
   - startup.sh actualizat cu popularea business survival

### 📦 Date Disponibile Acum

#### Business Survival Dataset
```
County_Name, NAICS_Industry_Label, NAICS_Code, Firms_2017_Start_Pool, Aggregate_5_Year_Survival_Pct
```

**Exemplu NYC Counties:**
- New York County (Manhattan)
- Kings County (Brooklyn)
- Queens County
- Bronx County
- Richmond County (Staten Island)

**NAICS Codes Relevante:**
- `00` - Total for all sectors
- `72` - Accommodation and food services (restaurante, coffee shops)
- `44-45` - Retail trade
- `54` - Professional, scientific, and technical services
- `62` - Health care and social assistance
- `81` - Other services

**Survival Rates Examples (Manhattan):**
- Accommodation/Food: ~60-65% (risc ridicat)
- Wholesale trade: ~83% (risc scăzut)
- Management: ~94% (risc foarte scăzut)

---

## 🏗️ STRUCTURĂ COMPLETĂ PROIECT

### Backend (FastAPI - Python)

```
backend/
├── main.py                          # FastAPI app + endpoints
├── database.py                      # SQLAlchemy models
│   ├── AreaOverview                 # Census data basic
│   ├── DetailedAreaAnalysis         # Census data detailed (ACS 2021)
│   ├── CensusTractData             # Pre-loaded clusters
│   └── BusinessSurvival            # 🆕 Survival rates by industry
│
├── census_service.py                # Census API integration
├── detailed_analysis_service.py     # Detailed Census analysis
├── trends_service.py                # Google Trends integration
├── business_survival_service.py     # 🆕 Survival data queries
│
├── populate_census_data.py          # Load ny_tract_clusters_2022.csv
├── populate_business_survival.py    # 🆕 Load survival CSV
│
├── startup.sh                       # Init script (runs both population scripts)
├── requirements.txt                 # Python deps
└── Dockerfile                       # Container definition
```

### Frontend (Vite + React - TypeScript)

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── LaunchBusiness.tsx      # Business launch wizard
│   │   ├── SimulatorView.tsx       # Monthly simulation UI
│   │   └── AreaAnalysisDebug.tsx   # Census data viewer
│   │
│   └── components/
│       ├── dashboard/
│       ├── onboarding/
│       └── ui/                      # shadcn components
```

### Agents Orchestrator (Next.js - TypeScript)

```
agents-orchestrator/
├── app/
│   ├── api/
│   │   ├── recommend-business/route.ts    # Business recommendation
│   │   └── simulation/                    # 🔨 TODO: Monthly simulation
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   ├── schemas.ts                          # Zod schemas existente
│   │
│   ├── agents/                             # Onboarding agents (✅ implemented)
│   │   ├── demographics-agent.ts
│   │   ├── lifestyle-agent.ts
│   │   ├── industry-agent.ts
│   │   └── aggregator.ts
│   │
│   └── simulation_agents/                  # Simulation agents
│       ├── ARCHITECTURE.md                 # 🏗️ Master plan (2800+ lines)
│       ├── events-agent.ts                 # ✅ implemented
│       ├── trends-agent.ts                 # ✅ implemented
│       │
│       ├── market-context-agent.ts         # 🔨 TODO (cu RAG)
│       ├── supplier-agent.ts               # 🔨 TODO
│       ├── competition-agent.ts            # 🔨 TODO
│       ├── customer-behavior-agent.ts      # 🔨 TODO
│       ├── employee-agent.ts               # 🔨 TODO (pure math)
│       ├── financial-agent.ts              # 🔨 TODO (pure math)
│       └── report-agent.ts                 # 🔨 TODO (cu RAG)
│
└── core/                                   # 🔨 TODO: Core infrastructure
    ├── types.ts                            # TypeScript interfaces
    ├── schemas.ts                          # Centralized Zod schemas
    ├── constants.ts                        # Economic constants
    ├── orchestrator.ts                     # Master coordinator
    └── services/
        └── rag-service.ts                  # Qdrant integration
```

---

## 🎯 CUM FOLOSIM BUSINESS SURVIVAL DATA ÎN AGENȚI

### 1. **Market Context Agent** (Phase 0 - Before Simulation)

**ROL**: Setează contextul economic general pentru luna următoare

**INTEGRARE SURVIVAL DATA:**
```typescript
// În market-context-agent.ts
async function analyzeMarketContext(
  businessType: string,
  location: LocationData,
  censusData: CensusData
): Promise<MarketContext> {
  
  // 🆕 Call backend pentru survival rate
  const survivalData = await fetch(
    `${BACKEND_URL}/api/survival/business-type/${location.county}?business_type=${businessType}`
  ).then(r => r.json());
  
  const prompt = `
    📊 BUSINESS SURVIVAL DATA (5-YEAR):
    - Industry: ${survivalData.industry}
    - Survival Rate: ${survivalData.survival_rate_5_year}%
    - Risk Level: ${survivalData.risk_level}
    - Similar businesses started in 2017: ${survivalData.firms_2017_start_pool}
    
    Având în vedere că doar ${survivalData.survival_rate_5_year}% din 
    ${survivalData.industry} au supraviețuit 5 ani în ${location.county},
    evaluează contextul economic actual și riscurile specifice.
  `;
  
  // LLM generează context bazat pe survival rates
}
```

**OUTPUT:**
- `market_risk_level`: "high" dacă survival < 60%
- `industry_saturation`: bazat pe firms_2017_start_pool
- `recommended_strategy`: "differentiate aggressively" dacă risc mare

---

### 2. **Competition Agent** (Phase 1)

**ROL**: Simulează comportamentul competitorilor

**INTEGRARE SURVIVAL DATA:**
```typescript
async function analyzeCompetition(
  businessType: string,
  location: LocationData,
  marketContext: MarketContext
): Promise<CompetitionAnalysis> {
  
  // 🆕 Get survival statistics pentru county
  const countyStats = await fetch(
    `${BACKEND_URL}/api/survival/county/${location.county}/statistics`
  ).then(r => r.json());
  
  const prompt = `
    📊 COUNTY BUSINESS HEALTH:
    - Industries below 60% survival: ${countyStats.industries_below_60pct}
    - Average survival rate: ${countyStats.average_survival_rate}%
    - Riskiest industries: ${JSON.stringify(countyStats.high_risk_industries)}
    
    Simulează comportamentul a 3-5 competitori în acest mediu economic.
    Dacă survival rate e scăzut, unii competitori ar putea ÎNCHIDE sau REDUCE prețuri.
  `;
  
  // LLM generează:
  // - competitor_actions: ["Coffee Shop A închide după 3 luni", "Shop B reduce prețuri cu 15%"]
  // - market_space: "opening" | "saturated" bazat pe survival rates
}
```

**OUTPUT:**
- `competitors_closing`: număr estimat de competitori care vor ieși din piață
- `pricing_pressure`: "high" dacă survival rate scăzut (competiție disperată)
- `market_opportunity`: "expanding" dacă alții eșuează dar tu ai diferențiere

---

### 3. **Customer Behavior Agent** (Phase 2)

**ROL**: Simulează cererea clienților

**INTEGRARE SURVIVAL DATA:**
```typescript
async function predictCustomerBehavior(
  businessType: string,
  marketContext: MarketContext,
  competitionAnalysis: CompetitionAnalysis
): Promise<CustomerBehavior> {
  
  const prompt = `
    📊 BUSINESS SURVIVAL CONTEXT:
    - ${marketContext.survival_rate_5_year}% din afaceri similare supraviețuiesc 5 ani
    - Risc industry: ${marketContext.risk_level}
    
    🤔 CUSTOMER PSYCHOLOGY:
    Într-o industrie cu survival rate ${marketContext.survival_rate_5_year}%:
    - Clienții pot fi mai PRUDENȚI (au văzut multe închizări)
    - Loyalty poate fi SCĂZUTĂ (obișnuiți cu schimbări frecvente)
    - Premium positioning e mai GREU (risc perceput)
    
    Simulează comportamentul a 100-500 clienți potențiali.
  `;
  
  // LLM ajustează:
  // - customer_acquisition_difficulty: mai mare dacă survival rate scăzut
  // - loyalty_rate: mai scăzută în industrii volatile
  // - price_sensitivity: mai mare dacă multe afaceri eșuează
}
```

**OUTPUT:**
- `acquisition_rate`: ajustat după risc industry
- `churn_rate`: mai mare în industrii cu survival scăzut
- `trust_level`: bazat pe stabilitatea industriei

---

### 4. **Financial Agent** (Phase 3)

**ROL**: Calculează P&L lunar (ZERO LLM - pure math)

**INTEGRARE SURVIVAL DATA:**
```typescript
function calculateFinancialMetrics(
  revenue: number,
  expenses: EmployeeExpenses,
  supplierCosts: SupplierCosts,
  marketContext: MarketContext
): FinancialStatement {
  
  // 🆕 Adjust risk reserve bazat pe survival rate
  const industryRiskFactor = (100 - marketContext.survival_rate_5_year) / 100;
  
  const recommendedReserve = revenue * 0.2 * (1 + industryRiskFactor);
  // Dacă survival 50% → reserve = 20% * 1.5 = 30% din revenue
  // Dacă survival 80% → reserve = 20% * 1.2 = 24% din revenue
  
  return {
    net_profit: revenue - expenses - supplierCosts,
    cash_reserve_target: recommendedReserve,
    survival_adjusted_runway: calculateRunway(cash, expenses, industryRiskFactor),
    risk_warning: industryRiskFactor > 0.4 ? "HIGH_RISK_INDUSTRY" : null
  };
}
```

**OUTPUT:**
- `recommended_cash_reserve`: mai mare pentru industrii riscante
- `runway_months`: calculat cu buffer pentru risc
- `financial_health_score`: penalizat dacă industry risc ridicat

---

### 5. **Report Agent** (Phase 6 - Final Report cu RAG)

**ROL**: Generează raportul final lunar cu insights acționabile

**INTEGRARE SURVIVAL DATA:**
```typescript
async function generateMonthlyReport(
  allAgentOutputs: AgentOutputs,
  marketContext: MarketContext,
  ragContext: RAGContext  // 🆕 Historical context from Qdrant
): Promise<MonthlyReport> {
  
  // 🆕 Get survival data pentru comparație
  const survivalData = marketContext.survival_data;
  const historicalPerformance = ragContext.last_3_months;
  
  const prompt = `
    📊 INDUSTRY BENCHMARK:
    - La 5 ani, doar ${survivalData.survival_rate_5_year}% din afaceri similare mai funcționează
    - Ești în luna ${currentMonth} - ${survivalData.survival_rate_5_year * (currentMonth/60)}% ar fi eșuat deja
    
    📈 PERFORMANȚA TA:
    - Net profit: $${financialData.net_profit}
    - Customer retention: ${customerData.loyalty_rate}%
    - Cash runway: ${financialData.runway_months} luni
    
    🔮 HISTORICAL CONTEXT (RAG):
    ${ragContext.summary_last_3_months}
    
    Generează:
    1. "Survival Scorecard" - Ești above/below industry average?
    2. "Critical Warnings" - Ce te poate duce la eșec?
    3. "Next Month Strategy" - Cum să îmbunătățești șansele de survival?
  `;
  
  // LLM generează raport cu context complet
}
```

**OUTPUT:**
```typescript
{
  survival_scorecard: {
    current_health: "above_average" | "at_risk" | "critical",
    survival_probability_12_months: 75,  // % bazat pe metrici + industry rate
    comparison_to_industry: "+15% better than average"
  },
  
  critical_warnings: [
    "Cash runway (4 luni) sub recommended (6+ luni pentru industry cu 65% survival)",
    "Customer churn 15% mai mare decât luna trecută (trend periculos)"
  ],
  
  recommended_actions: [
    {
      priority: "HIGH",
      action: "Crește cash reserve la $X pentru supraviețuire 6+ luni",
      reasoning: "65% din businesses similare eșuează în 5 ani - ai nevoie buffer mai mare"
    }
  ]
}
```

---

## 🔄 FLUX COMPLET DE DATE (End-to-End)

### Phase 0: Market Context Agent (cu RAG + Survival Data)

```typescript
// 1. Fetch survival data from backend
const survivalData = await fetchSurvivalData(businessType, county);

// 2. Retrieve RAG context (last 3 months simulations)
const ragContext = await qdrantService.retrieveContext({
  business_id: businessId,
  limit_months: 3
});

// 3. Generate market context cu ambele surse de date
const marketContext = await generateObject({
  model: openai('gpt-4o-mini'),
  schema: MarketContextSchema,
  prompt: `
    SURVIVAL DATA: ${JSON.stringify(survivalData)}
    HISTORICAL PERFORMANCE: ${JSON.stringify(ragContext)}
    
    Analizează contextul economic pentru luna viitoare.
  `
});

// 4. Store market context pentru următorii agenți
```

### Phase 1-5: Agenți Folosesc Market Context

Toți agenții primesc `marketContext` care conține:
- `survival_rate_5_year`
- `risk_level`
- `industry_saturation`
- Historical trends (din RAG)

### Phase 6: Report Agent (cu RAG Write)

```typescript
// 1. Generate final report
const report = await generateMonthlyReport(allOutputs, marketContext, ragContext);

// 2. Store simulation state în Qdrant pentru viitoare luni
await qdrantService.storeSimulationState({
  business_id: businessId,
  month: currentMonth,
  year: currentYear,
  
  // Embedding-ul acestui text va fi stocat în Qdrant
  simulation_summary: `
    Luna ${currentMonth}/${currentYear}:
    - Revenue: $${financialData.revenue}
    - Profit: $${financialData.net_profit}
    - Customers: ${customerData.total_active}
    - Key event: ${eventData.nume_eveniment}
    - Industry survival benchmark: ${survivalData.survival_rate_5_year}%
    - Our survival score: ${report.survival_scorecard.survival_probability_12_months}%
  `,
  
  // Metadata pentru filtering
  metadata: {
    business_type: businessType,
    county: county,
    month: currentMonth,
    year: currentYear,
    survival_score: report.survival_scorecard.survival_probability_12_months
  }
});

// 3. Store în PostgreSQL pentru historical records
await db.insert(MonthlySimulationState, {
  business_id: businessId,
  month: currentMonth,
  year: currentYear,
  report_json: report,
  survival_data_json: survivalData
});
```

---

## 🎨 REFACTORIZĂRI RECOMANDATE

### 1. **Centralizare Business Type → NAICS Mapping**

**PROBLEMA**: Fiecare agent poate interpreta diferit "coffee shop"

**SOLUȚIE**: Creează `core/business-types.ts`

```typescript
export const BUSINESS_TYPE_TO_NAICS = {
  // Food & Beverage
  "coffee shop": { naics: "72", label: "Accommodation and food services" },
  "cafe": { naics: "72", label: "Accommodation and food services" },
  "restaurant": { naics: "72", label: "Accommodation and food services" },
  "bar": { naics: "72", label: "Accommodation and food services" },
  
  // Retail
  "boutique": { naics: "44-45", label: "Retail trade" },
  "bookstore": { naics: "44-45", label: "Retail trade" },
  "grocery": { naics: "44-45", label: "Retail trade" },
  
  // Professional Services
  "consulting": { naics: "54", label: "Professional, scientific, and technical services" },
  "marketing agency": { naics: "54", label: "Professional, scientific, and technical services" },
  
  // Health & Wellness
  "gym": { naics: "71", label: "Arts, entertainment, and recreation" },
  "yoga studio": { naics: "71", label: "Arts, entertainment, and recreation" },
  "clinic": { naics: "62", label: "Health care and social assistance" },
  
  // Personal Services
  "salon": { naics: "81", label: "Other services (except public administration)" },
  "dry cleaning": { naics: "81", label: "Other services (except public administration)" },
} as const;

export function getNAICSForBusinessType(businessType: string): { naics: string; label: string } | null {
  const normalized = businessType.toLowerCase().trim();
  
  // Exact match
  if (BUSINESS_TYPE_TO_NAICS[normalized]) {
    return BUSINESS_TYPE_TO_NAICS[normalized];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(BUSINESS_TYPE_TO_NAICS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}
```

**USAGE în Agenți:**
```typescript
import { getNAICSForBusinessType } from '@/core/business-types';

const naicsInfo = getNAICSForBusinessType(businessType);
if (naicsInfo) {
  const survivalData = await fetch(
    `${BACKEND_URL}/api/survival/industry/${county}/${naicsInfo.naics}`
  );
}
```

---

### 2. **Shared Data Fetching Service**

**PROBLEMA**: Fiecare agent face propriile requests către backend

**SOLUȚIE**: Creează `core/services/data-service.ts`

```typescript
export class DataService {
  private backendUrl: string;
  
  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
  }
  
  async getSurvivalDataForBusiness(
    businessType: string, 
    county: string
  ): Promise<SurvivalData | null> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/survival/business-type/${county}?business_type=${businessType}`
      );
      
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch survival data:', error);
      return null;
    }
  }
  
  async getCountySurvivalStats(county: string): Promise<CountyStats | null> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/survival/county/${county}/statistics`
      );
      
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch county stats:', error);
      return null;
    }
  }
  
  async getIndustryComparison(naicsCode: string): Promise<IndustryComparison[]> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/survival/industry-comparison?naics_code=${naicsCode}`
      );
      
      if (!response.ok) return [];
      const data = await response.json();
      return data.counties || [];
    } catch (error) {
      console.error('Failed to fetch industry comparison:', error);
      return [];
    }
  }
}

// Singleton instance
export const dataService = new DataService(process.env.BACKEND_URL || 'http://localhost:8000');
```

**USAGE:**
```typescript
import { dataService } from '@/core/services/data-service';

const survivalData = await dataService.getSurvivalDataForBusiness(businessType, county);
```

---

### 3. **Context Passing Pattern (Elimină Redundanță)**

**PROBLEMA**: Agenții re-fetch aceleași date

**SOLUȚIE**: Creează `SimulationContext` object trecut prin pipeline

```typescript
// core/types.ts
export interface SimulationContext {
  // Business Info
  business_id: string;
  business_type: string;
  business_name: string;
  
  // Location
  location: {
    lat: number;
    lng: number;
    address: string;
    county: string;
    neighborhood: string;
  };
  
  // Time
  current_month: number;
  current_year: number;
  simulation_month: number;  // Month number since start (1, 2, 3...)
  
  // Census Data (fetched once)
  census_data: CensusData;
  detailed_census_data: DetailedCensusData;
  
  // 🆕 Survival Data (fetched once în Phase 0)
  survival_data: {
    industry: string;
    naics_code: string;
    survival_rate_5_year: number;
    risk_level: "LOW" | "MEDIUM" | "MEDIUM-HIGH" | "HIGH";
    firms_2017_start_pool: number;
    county_average: number;
    county_stats: CountySurvivalStats;
  };
  
  // RAG Context (fetched once în Phase 0)
  rag_context: {
    last_3_months_summary: string;
    similar_businesses_performance: string;
    learned_patterns: string[];
  };
  
  // Agent Outputs (populated progressively)
  agent_outputs: {
    phase0_market_context?: MarketContext;
    phase1_supplier?: SupplierAnalysis;
    phase1_competition?: CompetitionAnalysis;
    phase2_customer?: CustomerBehavior;
    phase3_employee?: EmployeeMetrics;
    phase3_financial?: FinancialStatement;
    phase4_event?: BusinessEvent;
    phase5_trends?: TrendsAnalysis;
  };
}
```

**Orchestrator Pattern:**
```typescript
async function runMonthlySimulation(
  businessId: string,
  businessType: string,
  location: Location,
  currentMonth: number,
  currentYear: number
): Promise<MonthlyReport> {
  
  // 1. Initialize context cu toate datele necesare
  const context: SimulationContext = await initializeContext(
    businessId,
    businessType,
    location,
    currentMonth,
    currentYear
  );
  
  // 2. Phase 0: Market Context (cu survival data + RAG)
  context.agent_outputs.phase0_market_context = await marketContextAgent(context);
  
  // 3. Phase 1: Parallel (supplier + competition)
  const [supplier, competition] = await Promise.all([
    supplierAgent(context),  // Folosește context.survival_data
    competitionAgent(context)  // Folosește context.survival_data
  ]);
  context.agent_outputs.phase1_supplier = supplier;
  context.agent_outputs.phase1_competition = competition;
  
  // 4. Phase 2: Customer (sequential, depinde de Phase 1)
  context.agent_outputs.phase2_customer = await customerBehaviorAgent(context);
  
  // ... rest of phases
  
  // 9. Store în Qdrant pentru RAG viitor
  await qdrantService.storeSimulationState(context, finalReport);
  
  return finalReport;
}

async function initializeContext(...): Promise<SimulationContext> {
  // Fetch toate datele necesare O SINGURĂ DATĂ
  const [censusData, detailedCensus, survivalData, ragContext] = await Promise.all([
    fetchCensusData(location),
    fetchDetailedCensusData(location),
    dataService.getSurvivalDataForBusiness(businessType, location.county),
    qdrantService.retrieveContext(businessId, 3)
  ]);
  
  return {
    business_id: businessId,
    business_type: businessType,
    location,
    current_month: currentMonth,
    current_year: currentYear,
    census_data: censusData,
    detailed_census_data: detailedCensus,
    survival_data: survivalData,
    rag_context: ragContext,
    agent_outputs: {}
  };
}
```

---

### 4. **Schema Consolidation**

**PROBLEMA**: Schemas duplicate în multiple fișiere

**SOLUȚIE**: Consolidează în `core/schemas.ts`

```typescript
// core/schemas.ts
import { z } from 'zod';

// ============================================
// SHARED BASE SCHEMAS
// ============================================

export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  county: z.string(),
  neighborhood: z.string(),
});

export const SurvivalDataSchema = z.object({
  industry: z.string(),
  naics_code: z.string(),
  survival_rate_5_year: z.number(),
  risk_level: z.enum(["LOW", "MEDIUM", "MEDIUM-HIGH", "HIGH"]),
  firms_2017_start_pool: z.number(),
  county_average: z.number(),
  interpretation: z.string(),
});

export const RAGContextSchema = z.object({
  last_3_months_summary: z.string(),
  similar_businesses_performance: z.string(),
  learned_patterns: z.array(z.string()),
});

// ============================================
// AGENT OUTPUT SCHEMAS
// ============================================

export const MarketContextSchema = z.object({
  economic_climate: z.enum(['booming', 'stable', 'declining', 'recession']),
  industry_saturation: z.number().min(0).max(100).describe('% of market saturation'),
  market_risk_level: z.enum(['low', 'medium', 'high']),
  survival_benchmark: z.object({
    industry_5yr_survival: z.number(),
    your_estimated_survival: z.number(),
    risk_factors: z.array(z.string()),
  }),
  recommended_strategy: z.string(),
});

// ... rest of agent schemas

// ============================================
// SIMULATION CONTEXT SCHEMA
// ============================================

export const SimulationContextSchema = z.object({
  business_id: z.string(),
  business_type: z.string(),
  business_name: z.string(),
  location: LocationSchema,
  current_month: z.number(),
  current_year: z.number(),
  simulation_month: z.number(),
  census_data: CensusDataSchema,
  detailed_census_data: DetailedCensusDataSchema,
  survival_data: SurvivalDataSchema,
  rag_context: RAGContextSchema,
  agent_outputs: z.object({
    phase0_market_context: MarketContextSchema.optional(),
    phase1_supplier: SupplierAnalysisSchema.optional(),
    phase1_competition: CompetitionAnalysisSchema.optional(),
    phase2_customer: CustomerBehaviorSchema.optional(),
    phase3_employee: EmployeeMetricsSchema.optional(),
    phase3_financial: FinancialStatementSchema.optional(),
    phase4_event: BusinessEventSchema.optional(),
    phase5_trends: TrendsAnalysisSchema.optional(),
  }),
});

export type SimulationContext = z.infer<typeof SimulationContextSchema>;
```

---

### 5. **Error Handling & Fallbacks**

**PROBLEMA**: Dacă survival data lipsește, agenții ar putea crăpa

**SOLUȚIE**: Graceful degradation

```typescript
// În market-context-agent.ts
async function analyzeMarketContext(context: SimulationContext): Promise<MarketContext> {
  
  const survivalData = context.survival_data || {
    // Fallback values dacă nu există survival data
    survival_rate_5_year: 70,  // Industry average
    risk_level: "MEDIUM",
    industry: "Unknown",
    naics_code: "00",
  };
  
  const prompt = `
    ${survivalData.survival_rate_5_year > 0 ? `
      📊 INDUSTRY SURVIVAL BENCHMARK:
      - 5-year survival rate: ${survivalData.survival_rate_5_year}%
      - Risk level: ${survivalData.risk_level}
    ` : `
      ⚠️ No historical survival data available for this industry.
      Use general economic indicators only.
    `}
    
    ... rest of prompt
  `;
  
  return generateObject({ ... });
}
```

---

## 🚀 PLAN DE IMPLEMENTARE (Ordine Optimă)

### Week 1: Foundation + Survival Integration

**Day 1-2: Core Infrastructure**
- [x] ✅ Business Survival data integration (DONE)
- [ ] Create `core/types.ts` with all interfaces
- [ ] Create `core/schemas.ts` consolidated
- [ ] Create `core/constants.ts` (economic constants)
- [ ] Create `core/business-types.ts` (NAICS mapping)
- [ ] Create `core/services/data-service.ts`

**Day 3-4: RAG Infrastructure**
- [ ] Setup Qdrant collections (via startup script)
- [ ] Create `core/services/rag-service.ts`
- [ ] Test embedding + storage + retrieval
- [ ] Create PostgreSQL table `monthly_simulation_states`

**Day 5-7: Market Context Agent (cu Survival + RAG)**
- [ ] Implement `market-context-agent.ts`
- [ ] Integrate survival data
- [ ] Integrate RAG context
- [ ] Test end-to-end
- [ ] Create API route `/api/simulation/market-context`

### Week 2: Phase 1-2 Agents (Supplier, Competition, Customer)

**Day 8-10: Supplier + Competition (Parallel)**
- [ ] Implement `supplier-agent.ts` (cu survival data)
- [ ] Implement `competition-agent.ts` (cu survival data)
- [ ] Test parallel execution
- [ ] Benchmark performance (<2s combined)

**Day 11-14: Customer Behavior Agent**
- [ ] Implement `customer-behavior-agent.ts`
- [ ] Integrate all Phase 1 outputs
- [ ] Use survival data pentru loyalty/churn
- [ ] Test realistic customer counts

### Week 3: Phase 3-4 Agents (Math + Events)

**Day 15-17: Employee + Financial (Pure Math)**
- [ ] Implement `employee-agent.ts` (zero LLM)
- [ ] Implement `financial-agent.ts` (zero LLM)
- [ ] Integrate survival-adjusted reserves
- [ ] Test P&L calculations

**Day 18-21: Events + Trends Integration**
- [ ] Update `events-agent.ts` cu survival context
- [ ] Update `trends-agent.ts` cu survival context
- [ ] Test realistic event impacts
- [ ] Verify <10s total pipeline

### Week 4: Report Agent + Orchestrator

**Day 22-25: Report Agent (cu RAG Write)**
- [ ] Implement `report-agent.ts`
- [ ] Generate survival scorecard
- [ ] Write simulation state to Qdrant
- [ ] Test RAG retrieval în next month

**Day 26-28: Orchestrator + Integration**
- [ ] Create `core/orchestrator.ts`
- [ ] Implement `SimulationContext` pattern
- [ ] Create API route `/api/simulation/next-month`
- [ ] End-to-end testing
- [ ] Performance optimization (<10s guarantee)

**Day 29-30: Frontend Integration + Polish**
- [ ] Update `SimulatorView.tsx` cu survival data display
- [ ] Show survival scorecard în UI
- [ ] Add "Industry Benchmark" comparison charts
- [ ] Final testing + bug fixes

---

## 📊 EXEMPLE DE PROMPTS OPTIMIZATE (cu Survival Data)

### Market Context Agent Prompt

```typescript
const prompt = `Tu ești Market Context Agent pentru un business simulator NYC.

📍 BUSINESS:
- Tip: ${context.business_type}
- Locație: ${context.location.county}, ${context.location.neighborhood}
- Luna simulării: ${context.current_month}/${context.current_year}

📊 INDUSTRY SURVIVAL BENCHMARK (2017-2022):
- Industrie: ${context.survival_data.industry} (NAICS ${context.survival_data.naics_code})
- Survival rate 5 ani: ${context.survival_data.survival_rate_5_year}%
- Risc: ${context.survival_data.risk_level}
- Total afaceri similare pornite 2017: ${context.survival_data.firms_2017_start_pool}
- Media county: ${context.survival_data.county_average}%

🔮 CONTEXT ISTORIC (RAG):
${context.rag_context.last_3_months_summary || 'Prima lună de simulare'}

📊 DATE DEMOGRAFICE:
- Populație: ${context.census_data.total_population}
- Venit median: $${context.census_data.median_household_income}
- Nivel educație: ${context.detailed_census_data.bachelor_plus_rate}% cu facultate+

TASK:
Analizează contextul economic pentru LUNA URMĂTOARE și generează:

1. **economic_climate**: Evaluare generală (booming/stable/declining/recession)
   - Ține cont de survival rate industry vs county average
   - Dacă survival < 60%, probabil "declining" sau "recession"
   
2. **industry_saturation**: 0-100% cât de saturată e piața
   - Bazat pe ${context.survival_data.firms_2017_start_pool} firms pornite în 2017
   - Survival rate scăzut poate indica over-saturation
   
3. **market_risk_level**: low/medium/high
   - Mapează direct din ${context.survival_data.risk_level}
   
4. **survival_benchmark**: 
   - industry_5yr_survival: ${context.survival_data.survival_rate_5_year}
   - your_estimated_survival: bazat pe performanța din RAG context
   - risk_factors: listă riscuri specifice (ex: "65% failure rate în primii 5 ani")
   
5. **recommended_strategy**: 
   - Dacă risc HIGH: "Aggressive differentiation + conservative cash management"
   - Dacă risc LOW: "Market expansion + premium positioning"

FII SPECIFIC: Citează exact survival rate-ul și explică de ce e relevant.`;
```

### Competition Agent Prompt

```typescript
const prompt = `Tu ești Competition Agent - simulezi comportamentul competitorilor.

📊 MARKET CONTEXT:
${JSON.stringify(context.agent_outputs.phase0_market_context, null, 2)}

🏪 COMPETITORI IDENTIFICAȚI:
${context.google_places_competitors.map(c => `- ${c.name} (${c.rating}★, ${c.distance}m)`).join('\n')}

📊 INDUSTRY SURVIVAL REALITY:
- Doar ${context.survival_data.survival_rate_5_year}% din ${context.survival_data.industry} supraviețuiesc 5 ani
- Asta înseamnă că ~${100 - context.survival_data.survival_rate_5_year}% din competitori vor EȘUA
- Firms similare pornite 2017: ${context.survival_data.firms_2017_start_pool}

TASK:
Simulează comportamentul a ${context.google_places_competitors.length} competitori pentru LUNA URMĂTOARE:

1. **competitors_closing**: Câți competitori se vor ÎNCHIDE?
   - Bazat pe survival rate, estimate ${Math.round((100 - context.survival_data.survival_rate_5_year) / 60)} closes per month
   - Dacă survival 65%, ~0.6% close monthly = ${Math.round(context.google_places_competitors.length * 0.006)} competitori

2. **pricing_actions**: Cum își ajustează prețurile?
   - Dacă survival rate < 60%: "Desperate discounting" (reduceri 15-30%)
   - Dacă survival rate > 75%: "Stable pricing" (±5%)

3. **new_entrants**: Câte noi afaceri intră în piață?
   - Dacă survival HIGH: piață atractivă, maybe 1-2 new
   - Dacă survival LOW: piață riscantă, maybe 0-1 new

4. **market_space**: opening/saturated/contracting?
   - Calculate based on: (new_entrants - competitors_closing)

FII REALIST: Survival rate-ul e REAL DATA din 2017-2022. Folosește-l pentru predictions.`;
```

### Report Agent Prompt (Final)

```typescript
const prompt = `Tu ești Report Agent - generezi raportul final lunar cu insights acționabile.

📊 REZULTATE SIMULARE LUNA ${context.current_month}/${context.current_year}:

💰 FINANCIAR:
- Revenue: $${context.agent_outputs.phase3_financial.revenue}
- Expenses: $${context.agent_outputs.phase3_financial.total_expenses}
- Net Profit: $${context.agent_outputs.phase3_financial.net_profit}
- Cash Reserve: $${context.agent_outputs.phase3_financial.cash_reserve}
- Runway: ${context.agent_outputs.phase3_financial.runway_months} luni

👥 CUSTOMERS:
- Total Active: ${context.agent_outputs.phase2_customer.total_active}
- New Acquired: ${context.agent_outputs.phase2_customer.new_customers}
- Churn: ${context.agent_outputs.phase2_customer.churned_customers}
- Loyalty Rate: ${context.agent_outputs.phase2_customer.loyalty_rate}%

🏪 COMPETIȚIE:
${JSON.stringify(context.agent_outputs.phase1_competition, null, 2)}

📊 INDUSTRY BENCHMARK:
- Survival rate 5 ani: ${context.survival_data.survival_rate_5_year}%
- La ${context.simulation_month} luni, statistic ${context.survival_data.survival_rate_5_year * (context.simulation_month / 60)}% ar fi supraviețuit
- Risc industry: ${context.survival_data.risk_level}

🔮 PERFORMANȚĂ ISTORICĂ:
${context.rag_context.last_3_months_summary}

TASK: Generează raport comprehensive cu:

1. **survival_scorecard**:
   - current_health: "above_average" dacă profit > $X și runway > 6 luni
                     "at_risk" dacă profit < 0 sau runway < 3 luni
                     "critical" dacă cash < 1 lună expenses
   
   - survival_probability_12_months: 
     * Start cu industry baseline: ${context.survival_data.survival_rate_5_year}%
     * Ajustează bazat pe:
       - Profit: +10% dacă consistently profitable
       - Runway: +15% dacă > 6 months
       - Customer loyalty: +5% dacă > 80%
       - Competition: -10% dacă piață saturată
     
   - comparison_to_industry: 
     * Calculează: your_survival_probability - industry_baseline
     * Ex: "Ești cu +20% mai bine decât media industriei"

2. **critical_warnings** (maxim 3):
   - Cash runway < 6 luni ÎN industrie cu ${context.survival_data.survival_rate_5_year}% survival = RISC MAJOR
   - Churn rate crescând = trend periculos
   - Competition closing = poate fi oportunitate SAU semn piață failing

3. **recommended_actions** (maxim 5, prioritizate):
   - Priority HIGH: acțiuni care previn eșecul
   - Priority MEDIUM: acțiuni care îmbunătățesc profitabilitatea
   - Priority LOW: optimizări nice-to-have
   
   Exemplu:
   {
     priority: "HIGH",
     action: "Crește cash reserve la $50,000 (6 luni expenses)",
     reasoning: "În ${context.survival_data.industry} cu ${context.survival_data.survival_rate_5_year}% survival, ai nevoie buffer > 6 luni. Acum ai doar ${context.agent_outputs.phase3_financial.runway_months} luni."
   }

4. **month_summary**: Narativ scurt (2-3 paragrafe) care explică CE s-a întâmplat și DE CE.

FII BRUTAL DE ONEST: Dacă business-ul e pe drumul greșit, spune clar. Survival data e REAL.`;
```

---

## ✅ CHECKLIST FINAL INTEGRARE

### Backend (Python)
- [x] ✅ BusinessSurvival model în database.py
- [x] ✅ business_survival_service.py cu 10 query functions
- [x] ✅ populate_business_survival.py script
- [x] ✅ 8 API endpoints în main.py
- [x] ✅ CSV copiat în backend/
- [x] ✅ startup.sh updated
- [x] ✅ Dockerfile updated (implicit via COPY . .)

### Frontend (TypeScript)
- [ ] 🔨 Create DataService wrapper pentru survival endpoints
- [ ] 🔨 Add survival data display în SimulatorView
- [ ] 🔨 Create "Industry Benchmark" component
- [ ] 🔨 Show survival scorecard în report

### Agents (TypeScript)
- [ ] 🔨 Create core/business-types.ts (NAICS mapping)
- [ ] 🔨 Create core/services/data-service.ts
- [ ] 🔨 Create core/types.ts (SimulationContext)
- [ ] 🔨 Create core/schemas.ts (consolidated)
- [ ] 🔨 Update market-context-agent.ts cu survival data
- [ ] 🔨 Update competition-agent.ts cu survival data
- [ ] 🔨 Update customer-behavior-agent.ts cu survival data
- [ ] 🔨 Update financial-agent.ts cu survival-adjusted reserves
- [ ] 🔨 Update report-agent.ts cu survival scorecard

### RAG (TypeScript + Qdrant)
- [ ] 🔨 Create Qdrant collections setup script
- [ ] 🔨 Create rag-service.ts
- [ ] 🔨 Test embedding + storage
- [ ] 🔨 Test retrieval în market-context-agent
- [ ] 🔨 Test write în report-agent

### Orchestrator
- [ ] 🔨 Create core/orchestrator.ts
- [ ] 🔨 Implement SimulationContext initialization
- [ ] 🔨 Implement phase pipeline
- [ ] 🔨 Create /api/simulation/next-month route
- [ ] 🔨 Performance testing (<10s)

---

## 🎓 ÎNVĂȚĂMINTE CHEIE

### 1. **Survival Data = Reality Anchor**
Fără survival rates, agenții AI ar genera scenarii nerealiste. Acum știm că:
- 65% din restaurante eșuează în 5 ani
- 83% din wholesale businesses supraviețuiesc
- Aceasta trebuie reflectată în simulare

### 2. **Context Passing > Re-fetching**
În loc să facă fiecare agent propriile API calls, trecem un `SimulationContext` object cu toate datele necesare.

### 3. **Centralizare Logică de Business**
NAICS mapping, risk assessment, economic constants - toate centralizate în `core/`.

### 4. **RAG = Memorie pe Termen Lung**
Fără RAG, fiecare lună e izolată. Cu RAG, agenții văd patterns și învață din greșelile anterioare.

### 5. **Graceful Degradation**
Dacă survival data lipsește pentru un business obscur, sistemul trebuie să funcționeze cu fallback values.

---

## 🚀 NEXT STEPS

### IMEDIAT (Next 2-3 ore):
1. ✅ Testează backend endpoints pentru survival data
2. ✅ Verifică că populate_business_survival.py rulează corect
3. 🔨 Creează `core/business-types.ts` cu NAICS mapping
4. 🔨 Creează `core/services/data-service.ts`
5. 🔨 Update market-context-agent.ts să folosească survival data

### SHORT-TERM (Next 1-2 zile):
1. 🔨 Implementează SimulationContext pattern
2. 🔨 Setup Qdrant collections
3. 🔨 Creează rag-service.ts basic
4. 🔨 Testează market-context-agent end-to-end cu RAG + Survival

### MEDIUM-TERM (Next 1-2 săptămâni):
1. 🔨 Implementează toți cei 7 agenți rămași
2. 🔨 Creează orchestrator complet
3. 🔨 Integrare frontend
4. 🔨 Performance optimization
5. 🔨 Testing comprehensive

---

**Status**: Backend integration COMPLETĂ ✅  
**Next Action**: Începe implementarea `core/` infrastructure  
**Target**: First working simulation cu survival data în 3-4 zile  
