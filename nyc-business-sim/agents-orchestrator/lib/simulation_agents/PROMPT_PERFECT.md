# 🎯 PROMPT PERFECT - Pentru Claude Sonnet 4.5

**Copiază EXACT textul de mai jos și paste în Claude. Zero modificări.**

---

Tu ești senior TypeScript developer expert în Vercel AI SDK (generateObject), OpenAI integration și Zod schemas.

Implementează `market-context-agent.ts` pentru NYC Business Simulator conform arhitecturii complete din fișierul atașat ARCHITECTURE.md.

## SPECS EXACTE

**Input Type**:
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
  location: { lat: number; lng: number; address: string };
}
```

**Output Zod Schema** (EXACT - nu modifica):
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

**Config**:
- Model: `openai('gpt-4o-mini')`
- Temperature: `0.3`
- Function name: `analyzeMarketContext`

## PATTERN EXACT (Din events-agent.ts - Referință Atașată)

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// 1. Schema
const Schema = z.object({...});

// 2. Type inference
type ResultType = z.infer<typeof Schema>;

// 3. Input interface
interface Input {...}

// 4. Export async function
export async function functionName(input: Input): Promise<ResultType> {
  const systemPrompt = `...`.trim();
  const userPrompt = `...`.trim();
  
  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: Schema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.3
  });
  
  return result.object;
}
```

## LOGICĂ AGENT

- **LLM task**: Identifică 2-3 `dominant_segments` din Census data
  - Exemple valid: `["young_professionals", "high_income", "families", "students", "seniors", "remote_workers"]`
- **LLM task**: Estimează `market_size_estimate` (clienți potențiali/lună) bazat pe populație + business type
- **LLM task**: Calculează scoruri 0-100:
  - `demand_score`: Cât de mare e cererea pentru acest business în zona asta?
  - `price_sensitivity_score`: Cât de sensibili sunt clienții la preț? (high income = low sensitivity)
  - `quality_preference_score`: Cât de important e quality vs price? (educated area = high preference)
- **LLM task**: Calculează `foot_traffic_multiplier` (0.5-2.0):
  - Low dacă `work_from_home_rate` > 40% (mai puțin foot traffic)
  - High dacă densitate mare și low work_from_home

## PROMPTS

**System Prompt** (concis, clar):
```
Tu ești expert în analiză de piață care procesează date Census pentru a evalua potențialul unei locații.

REGULI:
- Identifică 2-3 segmente dominante de clienți din datele Census
- Estimează piața (clienți/lună) bazat pe populație și tip business
- Scoruri 0-100 pentru demand, price sensitivity, quality preference
- foot_traffic_multiplier: 0.5-2.0 (bazat pe work_from_home_rate)

OUTPUT: DOAR numere și array-uri, NU text narrativ.
```

**User Prompt** (include toate datele relevante):
```
Business: ${business_type}
Locație: ${location.address}

Date Census:
- Populație: ${census_data.total_population}
- Venit mediu: $${census_data.median_household_income}
- Chirie medie: $${census_data.median_rent}
- Sărăcie: ${census_data.poverty_rate}%
- Educație (bachelor+): ${census_data.education_bachelor_rate}%
- Work from home: ${census_data.work_from_home_rate}%

Analizează market context pentru acest business.
```

## CERINȚE CRITICE

✅ **MUST**:
- Exact pattern din events-agent.ts (atașat)
- Zod schema EXACT cum e specificat mai sus
- Type inference: `type MarketContextResult = z.infer<typeof MarketContextSchema>`
- Imports: `from 'ai'`, `from '@ai-sdk/openai'`, `from 'zod'`
- `.trim()` la sfârșitul fiecărui prompt string
- Return type explicit: `Promise<MarketContextResult>`
- Zero `any` types

❌ **NEVER**:
- NU folosi `generateText()` - DOAR `generateObject()`
- NU modifica Zod schema structure
- NU adăuga dependencies noi
- NU include text narrativ în output (doar numere)
- NU uita `.trim()` la prompts

## DELIVERABLE

Codul complet pentru `market-context-agent.ts` production-ready, type-safe, zero erori TypeScript.

Include comentarii clare la fiecare secțiune.

## TEST EXAMPLE (Optional)

```typescript
const result = await analyzeMarketContext({
  census_data: {
    total_population: 50000,
    median_household_income: 75000,
    median_rent: 2500,
    poverty_rate: 12,
    education_bachelor_rate: 45,
    work_from_home_rate: 30
  },
  business_type: 'coffee_shop',
  location: { lat: 40.7128, lng: -74.0060, address: 'Brooklyn, NY' }
});

console.log(result);
```

---

**Atașează când Claude întreabă**:
1. ARCHITECTURE.md (pentru context complet)
2. events-agent.ts (pentru pattern exact)

**GO! Generează cod production-ready acum! 🚀**
