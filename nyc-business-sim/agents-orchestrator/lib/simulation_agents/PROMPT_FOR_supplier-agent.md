

## 🎯 PROMPT TEMPLATE (Copiază de aici în jos)

```
# CONTEXT: NYC Business Simulator - Agent Implementation

Tu ești un senior TypeScript developer expert în Vercel AI SDK, OpenAI integration și sisteme multi-agent.

## SARCINA TA

Implementează agentul **supplier-agent** pentru sistemul NYC Business Simulator, conform arhitecturii complete definite în documentația de mai jos.

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

## 🎯 SPECIFICAȚII PENTRU AGENTUL supplier-agent

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

1. **Fișierul complet**: `supplier-agent.ts`
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
  supplier-agent Agent
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
- Specificațiile pentru supplier-agent
- Checklist-ul de mai sus

Generează codul complet, funcțional, production-ready pentru **supplier-agent**.

GO! 🚀
```

---

## 🎯 SPECIFICAȚII PER AGENT


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
