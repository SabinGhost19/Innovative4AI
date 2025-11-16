# 🚀 COPY-PASTE PROMPT - Agent Implementation

**Copiază tot textul de mai jos și paste în Claude Sonnet 4.5**

Când Claude întreabă, atașează: `ARCHITECTURE.md`

---

# IMPLEMENTARE AGENT: market-context-agent.ts

Tu ești un senior TypeScript developer expert în Vercel AI SDK și sisteme multi-agent.

## SARCINA

Implementează `market-context-agent.ts` pentru NYC Business Simulator conform arhitecturii complete.

## CONTEXT ESENȚIAL

**Ce există deja**:
- ✅ `events-agent.ts` (referință pentru structură)
- ✅ `trends-agent.ts` (referință pentru pattern)
- ✅ Infrastructure: Docker (PostgreSQL, Qdrant), FastAPI backend
- ✅ Dependencies: `ai`, `@ai-sdk/openai`, `zod`

**Ce lipsește** (tu implementezi):
- ❌ `market-context-agent.ts`
- ❌ Core types (`core/types.ts`)
- ❌ Core schemas (`core/schemas.ts`)

## SPECIFICAȚII MARKET CONTEXT AGENT

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
  location: { lat: number; lng: number; address: string };
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

### Specificații
- **Model**: `gpt-4o-mini`
- **Temperature**: `0.3`
- **Execution**: Phase 1 (primul agent care rulează)
- **Timp**: ~1s

### Logică
- LLM identifică 2-3 **dominant_segments** din Census data
  - Exemple: `["young_professionals", "high_income", "families"]`
- Calculează **market_size_estimate** (clienți/lună) bazat pe populație + business type
- Scoruri 0-100 pentru demand, price sensitivity, quality preference
- **foot_traffic_multiplier**: 0.5-2.0 (lower dacă work_from_home_rate e mare)

### System Prompt Template
```
Tu ești un expert în analiză de piață care procesează date Census pentru a evalua potențialul unei locații.

REGULI:
- Identifică 2-3 segmente dominante de clienți din datele Census
- Estimează dimensiunea pieței (clienți potențiali/lună) bazat pe populație și business type
- Calculează scoruri pentru demand, price sensitivity, quality preference (0-100)
- foot_traffic_multiplier: 0.5-2.0 (bazat pe work_from_home_rate, densitate)

OUTPUT: DOAR numere și array-uri, nu text narrativ.
```

### User Prompt Include
```
Business: ${business_type}
Locație: ${location.address}

Context demografic:
- Populație: ${total_population}
- Venit mediu: $${median_household_income}
- Chirie medie: $${median_rent}
- Sărăcie: ${poverty_rate}%
- Educație (bachelor+): ${education_bachelor_rate}%
- Work from home: ${work_from_home_rate}%

Estimează market context pentru acest business.
```

## PATTERN DE URMAT (din events-agent.ts)

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// 1. Schema definition
const YourSchema = z.object({
  field1: z.string(),
  field2: z.number()
});

// 2. Type inference
type YourType = z.infer<typeof YourSchema>;

// 3. Input interface
interface YourInput {
  param1: string;
  param2: number;
}

// 4. Main function
export async function yourFunctionName(
  input: YourInput
): Promise<YourType> {
  
  const systemPrompt = `
System instructions here
`.trim();

  const userPrompt = `
User data here: ${input.param1}
`.trim();

  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: YourSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.3
  });

  return result.object;
}
```

## CERINȚE CRITICE

✅ **MUST HAVE**:
1. Imports exact: `from 'ai'`, `from '@ai-sdk/openai'`, `from 'zod'`
2. Schema EXACT conform specs (nu modifica)
3. Type inference cu `z.infer<typeof Schema>`
4. `export async function analyzeMarketContext(...)`
5. Return type explicit: `Promise<MarketContextResult>`
6. `.trim()` la sfârșitul prompt-urilor
7. Temperature: `0.3`
8. Model: `openai('gpt-4o-mini')`

❌ **NU**:
1. NU folosi `generateText()` - folosește `generateObject()`
2. NU adăuga dependencies noi
3. NU schimba schema structure
4. NU folosești `any` types
5. NU include text narrativ în output (doar numere)

## REFERINȚĂ: events-agent.ts (STRUCTURĂ EXACTĂ)

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const BusinessEventSchema = z.object({
  nume_eveniment: z.string().max(80),
  impact_clienti_lunar: z.number().min(-30).max(30),
  relevanta_pentru_business: z.boolean(),
  descriere_scurta: z.string().max(100)
});

type BusinessEvent = z.infer<typeof BusinessEventSchema>;

interface EventGeneratorInput {
  business_type: string;
  location: { lat: number; lng: number; address: string };
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
- Evenimentele sunt REALISTE și contextuale
- Impact: -30% to +30%
- Descriere: MAX 100 caractere

OUTPUT: DOAR date structurate, nu text narrativ.
`.trim();

  const userPrompt = `
Business: ${input.business_type}
Locație: ${input.location.address}
Luna: ${input.current_month} / ${input.current_year}

Generează un eveniment economic/social relevant.
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

## CHECKLIST ÎNAINTE DE LIVRARE

- [ ] Toate imports corecte
- [ ] Schema EXACT din specs
- [ ] Type inference corect
- [ ] Function signature corect
- [ ] System prompt clar și concis
- [ ] User prompt cu toate datele
- [ ] `.trim()` la prompt-uri
- [ ] Model: `gpt-4o-mini`
- [ ] Temperature: `0.3`
- [ ] Return type explicit
- [ ] Zero `any` types
- [ ] Comentarii clare

## OUTPUT AȘTEPTAT

Livrează:
1. **Cod complet** pentru `market-context-agent.ts`
2. **Comentarii** la fiecare secțiune
3. **Test example** (opțional):

```typescript
// Test
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
// Expected: { market_size_estimate: 2500, dominant_segments: [...], ... }
```

---

# ACUM IMPLEMENTEAZĂ!

Generează codul complet, production-ready, type-safe pentru `market-context-agent.ts`.

Folosește EXACT structura din `events-agent.ts` ca pattern.

GO! 🚀
