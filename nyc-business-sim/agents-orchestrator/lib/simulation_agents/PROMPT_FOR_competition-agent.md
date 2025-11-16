# 🚀 IMPLEMENTATION PROMPT - Ready to Copy to Claude Sonnet 4.5

Copy everything below this line and paste into Claude.

---

# 🤖 LLM Agent Implementation Prompt Template

**Versiune**: 1.0 - Optimizat pentru Claude Sonnet 4.5
**Scop**: Implementare perfectă a unui agent AI conform arhitecturii existente

---

## 📝 Cum să Folosești Acest Prompt

1. Înlocuiește `competition-agent` cu numele agentului (ex: `market-context-agent`, `supplier-agent`)
2. Copiază prompt-ul complet în Claude
3. Atașează fișierele relevante când este necesar

---

## 🎯 PROMPT TEMPLATE (Copiază de aici în jos)

```
# CONTEXT: NYC Business Simulator - Agent Implementation

Tu ești un senior TypeScript developer expert în Vercel AI SDK, OpenAI integration și sisteme multi-agent.

## SARCINA TA

Implementează agentul **competition-agent** pentru sistemul NYC Business Simulator, conform arhitecturii complete definite în documentația de mai jos.

## CERINȚE CRITICE

1. **CONFORMITATE TOTALĂ** cu arhitectura existentă
2. **TYPE SAFETY** - Toate types explicit definite
3. **ERROR HANDLING** - Try/catch și validare Zod
4. **COMPATIBILITATE** - Trebuie să funcționeze cu agenții existenți
5. **CONSISTENCY** - Același coding style ca agenții existenți
6. **ZERO DEPENDENCIES NOI** - Folosește doar dependențele existente

---

## 📁 ARHITECTURA COMPLETĂ

```markdown
<ÎN ACEST LOC ATAȘEAZĂ SAU COPIAZĂ CONȚINUTUL DIN ARCHITECTURE.md>
```

---

## ✅ AGENȚI DEJA IMPLEMENTAȚI (Pentru Referință)

### 1. Events Agent (`events-agent.ts`)

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Schema definition
const BusinessEventSchema = z.object({
  nume_eveniment: z.string().max(80),
  impact_clienti_lunar: z.number().min(-30).max(30),
  relevanta_pentru_business: z.boolean(),
  descriere_scurta: z.string().max(100)
});

type BusinessEvent = z.infer<typeof BusinessEventSchema>;

interface EventGeneratorInput {
  business_type: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  census_data: any;
  current_month: number;
  current_year: number;
}

export async function generateBusinessEvent(
  input: EventGeneratorInput
): Promise<BusinessEvent> {
  const systemPrompt = `
Tu ești un expert în eventi economici și sociali care afectează businessurile locale din NYC.

REGULI:
- Generezi 0-1 eveniment per lună
- Evenimentele sunt REALISTE și contextuale (ex: Pride Month în iunie, Black Friday în noiembrie)
- Impact: -30% to +30% (moderat, nu extreme)
- Descriere: MAX 100 caractere (ultra-concis)
- Relevanta: true doar dacă evenimentul afectează DIRECT acest tip de business

OUTPUT: DOAR date structurate, nu text narrativ.
`.trim();

  const userPrompt = `
Business: ${input.business_type}
Locație: ${input.location.address}
Luna: ${input.current_month} / ${input.current_year}

Context demografic:
- Populație: ${input.census_data.total_population}
- Venit mediu: $${input.census_data.median_household_income}

Generează un eveniment economic/social relevant pentru această lună și locație.
`.trim();

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: BusinessEventSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.9
  });

  return result.object;
}
```

### 2. Trends Agent (`trends-agent.ts`)

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const TrendInsightSchema = z.object({
  keyword: z.string().max(60),
  impact_score: z.number().min(-100).max(100),
  relevance: z.boolean(),
  confidence: z.enum(['low', 'medium', 'high'])
});

const TrendsAnalysisSchema = z.object({
  main_trend: TrendInsightSchema,
  overall_sentiment: z.enum(['positive', 'neutral', 'negative']),
  market_momentum: z.enum(['accelerating', 'stable', 'decelerating'])
});

type TrendsAnalysis = z.infer<typeof TrendsAnalysisSchema>;

interface TrendsAnalyzerInput {
  business_type: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  trends_data: Array<{
    keyword: string;
    interest_over_time: number[];
  }>;
  current_month: number;
  current_year: number;
}

export async function analyzeTrendsForBusiness(
  input: TrendsAnalyzerInput
): Promise<TrendsAnalysis> {
  const systemPrompt = `
Tu ești un expert în analiză de marketing trends care interpretează date Google Trends.

REGULI:
- Analizezi DOAR main trend (cel mai relevant)
- Impact score: -100 (foarte negativ) to +100 (foarte pozitiv)
- Relevance: true doar dacă trendul afectează DIRECT acest business
- Confidence: bazat pe volatilitatea datelor

OUTPUT: DOAR date numerice și enumerări, nu text narrativ.
`.trim();

  const userPrompt = `
Business: ${input.business_type}
Locație: ${input.location.address}
Luna: ${input.current_month}

Google Trends data:
${input.trends_data.map(t => `- ${t.keyword}: [${t.interest_over_time.slice(-3).join(', ')}] (ultimele 3 luni)`).join('\n')}

Identifică main trend-ul și impactul său asupra businessului.
`.trim();

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: TrendsAnalysisSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.5
  });

  return result.object;
}
```

---

## 🎯 SPECIFICAȚII PENTRU AGENTUL competition-agent

<AICI VA FI SECȚIUNEA SPECIFICĂ PENTRU FIECARE AGENT - VEZI MAI JOS>

---

## 📋 CHECKLIST ÎNAINTE DE LIVRARE

Verifică că implementarea ta îndeplinește TOATE criteriile:

### Code Quality
- [ ] TypeScript strict mode (no `any` types, toate explicit)
- [ ] Toate imports sunt corecte (`from 'ai'`, `from '@ai-sdk/openai'`, `from 'zod'`)
- [ ] Funcția principală este `export async function`
- [ ] Comentarii clare la fiecare secțiune importantă

### Schema & Types
- [ ] Zod schema definit EXACT conform ARCHITECTURE.md
- [ ] Type inference cu `z.infer<typeof Schema>`
- [ ] Input interface definit clar
- [ ] Output type matches schema

### AI Integration
- [ ] Folosește `generateObject()` (NU `generateText()`)
- [ ] Model corect: `gpt-4o-mini` sau `gpt-4o` sau `NONE` (pentru math agents)
- [ ] Temperature conform specs (0.3-0.5 pentru consistență, 0.7-0.9 pentru creativitate)
- [ ] System prompt clar și concis
- [ ] User prompt cu toate datele relevante

### Prompt Engineering
- [ ] System prompt definește EXACT ce face agentul
- [ ] REGULI clare (bullet points)
- [ ] OUTPUT specification (ce returnează)
- [ ] User prompt cu date concrete formatate clar
- [ ] `trim()` la sfârșitul fiecărui prompt

### Error Handling
- [ ] Try/catch block pentru LLM call (dacă e cazul)
- [ ] Zod validation automată prin `generateObject()`
- [ ] Return type explicit

### Performance
- [ ] Prompt-ul este CONCIS (nu include date inutile)
- [ ] Output-ul este MINIMAL (doar ce trebuie)
- [ ] maxTokens setat dacă e nevoie

### Consistency
- [ ] Coding style identic cu `events-agent.ts` și `trends-agent.ts`
- [ ] Naming conventions consistente
- [ ] File structure identică

---

## 🚀 OUTPUT AȘTEPTAT

Livrează:

1. **Fișierul complet**: `competition-agent.ts`
2. **Comentarii explicative** în cod
3. **Exemplu de test** (opțional dar apreciat):

```typescript
// Test example
const testInput = {
  // ... input data
};

const result = await functionName(testInput);
console.log('Result:', result);
```

---

## ⚠️ GREȘELI COMUNE DE EVITAT

1. ❌ **NU** folosi `generateText()` - Folosește `generateObject()`
2. ❌ **NU** adăuga dependințe noi în package.json
3. ❌ **NU** schimba structura schema-ului din ARCHITECTURE.md
4. ❌ **NU** folosi `any` types
5. ❌ **NU** scrie prompt-uri lungi (concis și specific)
6. ❌ **NU** returnează text narrativ dacă schema cere numeric data
7. ❌ **NU** uita `.trim()` la prompt-uri
8. ❌ **NU** include date irelevante în user prompt

---

## 💡 BEST PRACTICES

1. ✅ **STUDIAZĂ** agenții existenți (`events-agent.ts`, `trends-agent.ts`)
2. ✅ **COPIAZĂ** structura exactă (imports → schema → types → function)
3. ✅ **RESPECTĂ** naming conventions din ARCHITECTURE.md
4. ✅ **VERIFICĂ** că output schema match-uiește exact specs
5. ✅ **TESTEAZĂ** mental flow-ul: input → LLM → schema validation → output
6. ✅ **MINIMIZEAZĂ** prompt size (doar date esențiale)
7. ✅ **DOCUMENTEAZĂ** cu comentarii clare

---

## 🎓 ÎNȚELEGEREA CONTEXTULUI

### Cum Funcționează Sistemul

```
Input Data (Census, Trends, etc.)
        ↓
  competition-agent Agent
        ↓
  LLM Processing (OpenAI)
        ↓
  Zod Schema Validation
        ↓
  Structured Output
        ↓
  Next Agent (in pipeline)
```

### Rolul Tău în Pipeline

Verifică în ARCHITECTURE.md:
- **PHASE-ul** în care rulează agentul tău
- **INPUT-urile** de care are nevoie (de la alți agenți?)
- **OUTPUT-ul** pe care îl așteaptă agenții următori
- **PARALELIZARE**: Rulează în paralel sau secvențial?

---

## 📖 DOCUMENTAȚIE REFERINȚĂ

### Vercel AI SDK
```typescript
import { generateObject } from 'ai';

const result = await generateObject({
  model: openai('gpt-4o-mini'),
  schema: YourZodSchema,
  system: "System prompt here",
  prompt: "User prompt here",
  temperature: 0.3,
  maxTokens: 500  // optional
});

// result.object este deja validat cu Zod
```

### Zod Schemas
```typescript
import { z } from 'zod';

const Schema = z.object({
  field1: z.string().max(100),
  field2: z.number().min(0).max(100),
  field3: z.boolean(),
  field4: z.enum(['option1', 'option2']),
  nested: z.object({
    subfield: z.number()
  }),
  array: z.array(z.string()).max(5)
});

type TypeFromSchema = z.infer<typeof Schema>;
```

---

## 🔍 DEBUGGING TIPS

Dacă ai probleme:

1. **Verifică schema**: Match-uiește cu ARCHITECTURE.md?
2. **Verifică imports**: Paths corecte?
3. **Verifică model**: `gpt-4o-mini` vs `gpt-4o`?
4. **Verifică prompt**: Include toate datele necesare?
5. **Verifică types**: Toate explicit definite?

---

# ACUM IMPLEMENTEAZĂ!

Bazându-te pe:
- Arhitectura completă (ARCHITECTURE.md)
- Agenții existenți (events-agent.ts, trends-agent.ts)
- Specificațiile pentru competition-agent
- Checklist-ul de mai sus

Generează codul complet, funcțional, production-ready pentru **competition-agent**.

GO! 🚀
```

---

## 🎯 SPECIFICAȚII PER AGENT

Adaugă la prompt-ul de mai sus una din secțiunile următoare, în funcție de agentul implementat:

---

### Pentru `market-context-agent.ts`

```markdown
## SPECIFICAȚII AGENT: Market Context Agent

### Detalii Tehnice
- **Model**: `gpt-4o-mini`
- **Temperature**: `0.3` (consistență)
- **Execution**: PHASE 1 (Sequential, primul agent care rulează)
- **Timp estimat**: ~1s

### Input Type
```typescript
interface MarketContextInput {
  census_data: {
    total_population: number;
    median_household_income: number;
    median_rent: number;
    poverty_rate: number;
    education_bachelor_rate: number;
    work_from_home_rate: number;
  };
  business_type: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}
```

### Output Schema (Zod)
```typescript
const MarketContextSchema = z.object({
  market_size_estimate: z.number().min(0),
  dominant_segments: z.array(z.string()).max(3),
  demand_score: z.number().min(0).max(100),
  price_sensitivity_score: z.number().min(0).max(100),
  quality_preference_score: z.number().min(0).max(100),
  foot_traffic_multiplier: z.number().min(0.5).max(2.0)
});
```

### Rol & Logică
- Procesează Census data și identifică 2-3 segmente dominante
- LLM identifică segmentele, TypeScript ar putea calcula scorurile (sau LLM)
- market_size_estimate: clienți potențiali/lună
- dominant_segments: ["young_professionals", "high_income", "families"]
- Scorurile influențează Customer Agent mai târziu

### System Prompt Template
```
Tu ești un expert în analiză de piață care procesează date Census pentru a evalua potențialul unei locații.

REGULI:
- Identifică 2-3 segmente dominante de clienți din datele Census
- Estimează dimensiunea pieței (clienți potențiali/lună) bazat pe populație și business type
- Calculează scoruri pentru demand, price sensitivity, quality preference (0-100)
- foot_traffic_multiplier: 0.5-2.0 (bazat pe work_from_home_rate, densitate, etc.)

OUTPUT: DOAR numere și array-uri, nu text narrativ.
```

### User Prompt Include
- Business type
- Location address
- Census metrics (toate cele 6)
- "Estimează market context pentru acest business"

### Validări Importante
- market_size_estimate > 0 (logic check)
- dominant_segments.length <= 3
- Toate scorurile 0-100
```

---

### Pentru `supplier-agent.ts`

```markdown
## SPECIFICAȚII AGENT: Supplier Agent

### Detalii Tehnice
- **Model**: `gpt-4o-mini`
- **Temperature**: `0.3`
- **Execution**: PHASE 3 (Parallel cu Competition și Employee)
- **Timp estimat**: ~1s

### Input Type
```typescript
interface SupplierInput {
  supplier_tier: 'budget' | 'mid' | 'premium';
  market_size_estimate: number;  // from Market Context Agent
  current_month: number;
  business_type: string;
}
```

### Output Schema
```typescript
const SupplierResultSchema = z.object({
  cost_per_unit: z.number().min(0),
  quality_score: z.number().min(0).max(100),
  seasonal_modifier: z.number().min(0.9).max(1.2),
  reliability_flag: z.boolean()
});
```

### Rol & Logică
- Calculează cost per unit bazat pe supplier tier
- Quality score: budget=60, mid=75, premium=90 (cu variație)
- Seasonal modifier: 0.9-1.2 (holidays = scump, off-season = ieftin)
- reliability_flag: true/false (supplier issues random?)

### Constants Needed
```typescript
const SUPPLIER_BASE_COSTS = {
  budget: { min: 2, max: 4 },
  mid: { min: 4, max: 7 },
  premium: { min: 7, max: 12 }
};

const SEASONAL_COST_MULTIPLIERS = {
  1: 0.95,   // January
  11: 1.15,  // November (holiday prep)
  12: 1.20   // December (peak)
  // ... etc
};
```

### System Prompt Focus
- "Calculezi cost și quality pentru supplies bazat pe tier și sezon"
- "Cost_per_unit: bazat pe tier + seasonal variation"
- "Quality_score: tier determines base quality"
- "Reliability: random issues (5% chance)"
```

---

### Pentru `competition-agent.ts`

```markdown
## SPECIFICAȚII AGENT: Competition Agent

### Detalii Tehnice
- **Model**: `gpt-4o-mini`
- **Temperature**: `0.5` (ceva variație pentru realism)
- **Execution**: PHASE 3 (Parallel)
- **Timp estimat**: ~1.5s

### Input Type
```typescript
interface CompetitionInput {
  competitors: Array<{
    id: string;
    name: string;
    rating: number;
    price_level: number;
    distance: number;
  }>;
  player_decisions: {
    price: number;
    marketing_budget: number;
    pricing_strategy: 'budget' | 'premium' | 'competitive';
  };
  market_context: {
    demand_score: number;
    market_size_estimate: number;
  };
}
```

### Output Schema
```typescript
const CompetitorActionSchema = z.object({
  id: z.string(),
  strategy: z.enum(['aggressive', 'defensive', 'passive']),
  price_change: z.number().min(-0.3).max(0.3),
  marketing_boost: z.number().min(0).max(0.5)
});

const CompetitionResultSchema = z.object({
  competitors: z.array(CompetitorActionSchema).max(5),
  avg_competitive_pressure: z.number().min(0).max(100)
});
```

### Rol & Logică
- LLM decide strategy pentru fiecare competitor bazat pe player actions
- aggressive: dacă player face marketing mare sau reduce prețuri
- defensive: dacă player are pricing premium
- passive: dacă market demand e mare (nu e nevoie să lupte)
- price_change: -30% to +30%
- avg_competitive_pressure: scor agregat 0-100

### System Prompt Focus
- "Simulezi acțiunile competitorilor ca răspuns la deciziile playerului"
- "Agresive: price drops, marketing increase"
- "Defensive: menține poziție"
- "Passive: nu schimbă nimic"
```

---

### Pentru `customer-behavior-agent.ts`

```markdown
## SPECIFICAȚII AGENT: Customer Behavior Agent

### Detalii Tehnice
- **Model**: `gpt-4o-mini`
- **Temperature**: `0.4`
- **Execution**: PHASE 4 (Sequential - NEEDS all previous outputs)
- **Timp estimat**: ~2s

### Input Type
```typescript
interface CustomerBehaviorInput {
  market_context: {
    market_size_estimate: number;
    dominant_segments: string[];
    demand_score: number;
    price_sensitivity_score: number;
    quality_preference_score: number;
  };
  player_offering: {
    price: number;
    quality_score: number;  // from Supplier Agent
    marketing_spend: number;
  };
  competitors: {
    competitors: Array<{
      id: string;
      strategy: string;
      price_change: number;
    }>;
    avg_competitive_pressure: number;
  };
  events_impact: number;  // from Events Agent (-30 to +30)
  trends_impact: number;  // from Trends Agent
}
```

### Output Schema
```typescript
const CustomerSegmentResultSchema = z.object({
  name: z.string(),
  customers_acquired: z.number().min(0),
  revenue_contribution: z.number().min(0)
});

const CustomerBehaviorSchema = z.object({
  total_customers: z.number().min(0),
  total_revenue: z.number().min(0),
  avg_satisfaction: z.number().min(0).max(100),
  market_share: z.number().min(0).max(100),
  segments: z.array(CustomerSegmentResultSchema).max(3)
});
```

### Rol & Logică
- CALCULEAZĂ customers_acquired pentru fiecare segment
- Formula: market_size × segment_% × demand_modifier × price_modifier × competition_modifier × events_modifier × trends_modifier × marketing_modifier
- Revenue: sum(customers × price)
- Market share: player customers / market_size
- Satisfaction: quality vs expectations

### System Prompt Focus
- "Simulezi comportamentul clienților bazat pe oferta playerului vs competitori"
- "Ia în calcul: preț, calitate, marketing, competiție, evenimente, trends"
- "Output per segment + aggregat"
```

---

### Pentru `employee-agent.ts` (MATH ONLY)

```markdown
## SPECIFICAȚII AGENT: Employee Agent

### Detalii Tehnice
- **Model**: **NONE** (Pure TypeScript calculations)
- **Execution**: PHASE 3 (preliminary) + PHASE 4 (recalc cu customers real)
- **Timp estimat**: ~0.1s

### Input Type
```typescript
interface EmployeeInput {
  num_employees: number;
  salary_per_employee: number;
  customers_served: number;
  market_median_income: number;
}
```

### Output Type
```typescript
interface EmployeeResult {
  total_employees: number;
  total_salaries: number;
  productivity_score: number;  // 0-100
  morale: number;              // 0-100
  overworked: boolean;
}
```

### Formule (Pure Math)
```typescript
// Productivity
const customers_per_employee = customers_served / num_employees;
const ideal_load = 75 * 30; // 75 customers/day × 30 days
const productivity_score = Math.min(100, (customers_per_employee / ideal_load) * 100);

// Overworked
const workload_ratio = customers_per_employee / ideal_load;
const overworked = workload_ratio > 1.2;

// Morale
const salary_fairness = salary_per_employee / (market_median_income / 12);
const salary_morale = Math.min(100, salary_fairness * 80);

const workload_morale = workload_ratio < 0.8 ? 90 : (workload_ratio > 1.2 ? 50 : 95);

const morale = salary_morale * 0.6 + workload_morale * 0.4;
```

### Implementare
- **NU** folosești LLM
- **DOAR** funcție TypeScript cu calcule matematice
- Export: `export function calculateEmployeeMetrics(input): EmployeeResult`
```

---

### Pentru `financial-agent.ts` (MATH ONLY)

```markdown
## SPECIFICAȚII AGENT: Financial Agent

### Detalii Tehnice
- **Model**: **NONE** (Pure TypeScript P&L calculations)
- **Execution**: PHASE 5 (Parallel cu Report Agent)
- **Timp estimat**: ~0.1s

### Input Type
```typescript
interface FinancialInput {
  revenue: number;              // from Customer Agent
  cogs_per_unit: number;        // from Supplier Agent
  units_sold: number;           // = customers_served
  operating_expenses: {
    salaries: number;           // from Employee Agent
    rent: number;               // from Census data
    utilities: number;          // constant ~800
    marketing: number;          // player decision
  };
}
```

### Output Type
```typescript
interface FinancialResult {
  revenue: number;
  cogs: number;
  gross_profit: number;
  operating_expenses: number;
  ebitda: number;
  net_profit: number;
  profit_margin: number;        // %
  cash_flow: number;
}
```

### Formule (Standard P&L)
```typescript
const cogs = cogs_per_unit * units_sold;
const gross_profit = revenue - cogs;
const total_opex = Object.values(operating_expenses).reduce((a,b) => a+b, 0);
const ebitda = gross_profit - total_opex;
const net_profit = ebitda; // simplified (no tax/interest)
const profit_margin = (net_profit / revenue) * 100;
const cash_flow = net_profit; // simplified
```

### Implementare
- **NU** folosești LLM
- **DOAR** funcție TypeScript
- Export: `export function calculateFinancials(input): FinancialResult`
```

---

### Pentru `report-agent.ts` (WITH RAG)

```markdown
## SPECIFICAȚII AGENT: Report Agent

### Detalii Tehnice
- **Model**: `gpt-4o` (PREMIUM - pentru narrative quality)
- **Temperature**: `0.7` (creativitate în scrierea raportului)
- **Execution**: PHASE 5 (Parallel cu Financial)
- **Timp estimat**: ~3s
- **🆕 SPECIAL**: Primește RAG historical context

### Input Type
```typescript
interface ReportAgentInput {
  market_context: MarketContextResult;
  events: BusinessEvent;
  trends: TrendsAnalysis;
  supplier: SupplierResult;
  competition: CompetitionResult;
  customer: CustomerBehaviorResult;
  employee: EmployeeResult;
  financial: FinancialResult;
  previous_month_data?: SimulationResult;
  historical_context: HistoricalContext;  // 🆕 FROM RAG
}

interface HistoricalContext {
  recent_months: Array<{
    month: number;
    state_summary: any;
  }>;
  similar_situations: Array<{
    month: number;
    state_summary: any;
    similarity_score: number;
  }>;
  past_recommendations: Array<any>;
}
```

### Output Schema
```typescript
const InboxMessageSchema = z.object({
  from: z.string().max(40),
  subject: z.string().max(80),
  body: z.string().max(300),
  urgency: z.enum(['low', 'medium', 'high']),
  category: z.enum(['market', 'staff', 'financial', 'competitors'])
});

const RecommendationSchema = z.object({
  action: z.string().max(60),
  reason: z.string().max(200),
  priority: z.enum(['low', 'medium', 'high']),
  estimated_impact: z.number()  // $ impact
});

const NarrativeReportSchema = z.object({
  executive_summary: z.string().max(200),
  inbox_messages: z.array(InboxMessageSchema).min(2).max(4),
  top_recommendations: z.array(RecommendationSchema).min(1).max(3),
  sentiment: z.enum(['positive', 'neutral', 'negative'])
});
```

### Rol & Logică
- Generează raport lunar narativ COMPLET
- Folosește TOATE output-urile de la ceilalți agenți
- 🆕 **CRITICAL**: Referențiază historical_context pentru trend analysis
- Executive summary: max 200 chars (concis)
- Inbox messages: 2-4 mesaje urgente (de la "CFO", "Operations Manager", etc.)
- Recommendations: Top 3 acțiuni prioritizate

### System Prompt Template
```
Tu ești un consultant de business expert care analizează performanța unei afaceri.

## CONTEXT ISTORIC DISPONIBIL
Ai acces la:
1. Ultimele 3 luni: Metrici financiare, decizii, evenimente
2. Situații similare din trecut
3. Recomandări trecute și outcome-uri

## SARCINA TA
- Compară performanța curentă cu lunile trecute (trend analysis)
- Identifică pattern-uri (ex: "vânzările cresc constant de 3 luni")
- Face recomandări bazate pe ce a funcționat/nu a funcționat în trecut
- Referențiază evenimente similare din istoricul businessului

## OUTPUT STRUCTURE
- Executive summary (max 200 chars)
- 2-4 inbox messages (urgent issues de la "team members")
- Top 3 recommendations (prioritizate)
- Overall sentiment

## STIL
- Concret și actionable
- Referințe la date specifice ("ca în luna 3 când...")
- Învață din greșeli și succese trecute
```

### User Prompt Include
- **Luna curentă**: Toate metrici (financial, customer, employee)
- **Evenimente & Trends**: Summary
- **🆕 Istoric Recent**: Map recent_months cu metrici key
- **🆕 Situații Similare**: Top 2-3 cu similarity scores
- **🆕 Recomandări Trecute**: Ce ai recomandat + outcomes

### IMPORTANT
- Acest agent TREBUIE să folosească `historical_context`
- Prompt-ul e mai lung decât alții (e OK, e report generation)
- maxTokens: 2000 (pentru narrative quality)
```

---

## 📦 PACKAGE.JSON DEPENDENCIES (Deja Instalate)

```json
{
  "dependencies": {
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.24",
    "@qdrant/js-client-rest": "^1.9.0",
    "zod": "^3.22.4"
  }
}
```

**NU ADĂUGA DEPENDINȚE NOI!**

---

## 🎓 FINAL TIPS PENTRU CLAUDE

1. **Citește ARCHITECTURE.md COMPLET** înainte să scrii cod
2. **Studiază agenții existenți** pentru pattern-ul exact
3. **Respectă schema-ul** exact cum e definit
4. **Testează mental** flow-ul înainte să generezi cod
5. **Scrie comentarii** la fiecare secțiune importantă
6. **Verifică checklist-ul** înainte de livrare

---

**SUCCES! 🚀**

Generează cod production-ready, type-safe, conform arhitecturii.
