# 🤖 AI SDK Integration Guide

Acest ghid explică cum să integrezi Vercel AI SDK pentru features avansate.

## 📦 Pachete Instalate

Deja ai:
```json
"ai": "^4.0.0",
"@ai-sdk/openai": "^1.0.0",
"@ai-sdk/anthropic": "^1.0.0"
```

## 🔑 Setup API Keys

În `.env.local`:
```env
# Alege unul:
OPENAI_API_KEY=sk-...
# SAU
ANTHROPIC_API_KEY=sk-ant-...
```

## 💡 Feature Ideas cu AI SDK

### 1. Business Consultant Chatbot

Creează `app/api/chat/route.ts`:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, businessState } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: `Tu ești un consultant business pentru cafenele în România.
    
    Business-ul actual:
    - Capital: ${businessState.cash} RON
    - Reputație: ${businessState.reputation}/100
    - Locație: ${businessState.location}
    - Luna: ${businessState.currentMonth}
    
    Oferă sfaturi concrete și specifice despre:
    - Prețuri și strategie de pricing
    - Marketing eficient
    - Optimizarea costurilor
    - Competiție cu ${businessState.competitors.join(', ')}
    
    Fii concis, practic și bazat pe datele reale.`,
    messages,
  });

  return result.toDataStreamResponse();
}
```

Frontend în `components/ChatConsultant.tsx`:

```typescript
'use client';

import { useChat } from 'ai/react';

export function ChatConsultant({ businessState }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    body: { businessState },
  });

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">💼 Business Consultant AI</h3>
      
      <div className="h-96 overflow-y-auto mb-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`p-3 rounded ${
            m.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
          }`}>
            <p className="text-sm font-semibold">
              {m.role === 'user' ? 'Tu' : '🤖 Consultant'}
            </p>
            <p>{m.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Întreabă consultantul..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          Trimite
        </button>
      </form>
    </div>
  );
}
```

### 2. AI Predictions pentru Next Month

Creează `app/api/predict/route.ts`:

```typescript
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const PredictionSchema = z.object({
  expectedRevenue: z.number(),
  expectedProfit: z.number(),
  risks: z.array(z.string()),
  opportunities: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export async function POST(req: Request) {
  const { decisions, businessState, lastMonthResult } = await req.json();

  const result = await generateObject({
    model: openai('gpt-4-turbo'),
    schema: PredictionSchema,
    prompt: `Bazat pe datele business-ului și deciziile pentru luna viitoare, 
    prezice rezultatele și oferă recomandări.
    
    Business actual:
    - Capital: ${businessState.cash} RON
    - Reputație: ${businessState.reputation}
    - Competitori: ${businessState.competitors.join(', ')}
    - Luna trecută profit: ${lastMonthResult?.profit || 0} RON
    
    Decizii pentru luna viitoare:
    - Angajați: ${decisions.employees}
    - Calitate: ${decisions.coffeeQuality}
    - Preț: ${decisions.productPrice} RON
    - Marketing: ${decisions.marketingBudget} RON
    
    Oferă predicții realiste bazate pe logica business.`,
  });

  return Response.json(result.object);
}
```

### 3. Dynamic Event Generation

În `lib/simulation.ts`, adaugă:

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

async function generateAIEvents(
  profitLoss: ProfitLoss,
  decisions: MonthlyDecisions,
  competitorActions: CompetitorAction[]
): Promise<SimulationEvent[]> {
  const result = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: `Generează 2-3 evenimente narative pentru un simulator de business.
    
    Context:
    - Profit luna aceasta: ${profitLoss.profit} RON
    - Vânzări: ${profitLoss.salesVolume} cafele
    - Angajați: ${decisions.employees}
    - Acțiuni competitori: ${competitorActions.map(a => a.description).join('; ')}
    
    Evenimentele trebuie să fie:
    - Realiste și specifice businessului de cafea
    - Scurte (1-2 propoziții)
    - Relevante pentru deciziile luate
    
    Format: JSON array de evenimente cu { type, category, title, message }
    type poate fi: 'success', 'warning', 'error', 'info'
    category poate fi: 'staff', 'customer', 'competitor', 'financial', 'marketing'`,
  });

  return JSON.parse(result.text);
}
```

### 4. Competitor Strategy Analysis

Creează `app/api/analyze-competitors/route.ts`:

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { competitors, lastMonthActions, marketData } = await req.json();

  const result = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: `Analizează strategiile competitorilor și oferă insights.
    
    Competitori:
    ${competitors.map(c => `- ${c.name}: preț ${c.priceStrategy}x, calitate ${c.qualityLevel}, marketing ${c.marketingPower}`).join('\n')}
    
    Acțiuni luna trecută:
    ${lastMonthActions.map(a => `- ${a.competitor}: ${a.description}`).join('\n')}
    
    Oferă:
    1. Analiza strategiei fiecărui competitor
    2. Vulnerabilități pe care le poți exploata
    3. Amenințări pe care trebuie să le contracarezi
    4. 3 strategii concrete de răspuns`,
  });

  return Response.json({ analysis: result.text });
}
```

### 5. Natural Language Decisions

Permite input în limbaj natural pentru decizii:

```typescript
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const DecisionSchema = z.object({
  employees: z.number(),
  coffeeQuality: z.enum(['low', 'medium', 'high']),
  marketingBudget: z.number(),
  productPrice: z.number(),
});

export async function POST(req: Request) {
  const { naturalLanguageInput, businessContext } = await req.json();

  const result = await generateObject({
    model: openai('gpt-4-turbo'),
    schema: DecisionSchema,
    prompt: `Convertește inputul în limbaj natural în decizii specifice pentru business.
    
    Input utilizator: "${naturalLanguageInput}"
    
    Context business:
    - Preț mediu piață: ${businessContext.averageCoffeePrice} RON
    - Capital disponibil: ${businessContext.cash} RON
    - Luna: ${businessContext.currentMonth}
    
    Generează decizii realiste și echilibrate.`,
  });

  return Response.json(result.object);
}
```

## 🎨 UI Components cu AI

### Loading State pentru AI:

```typescript
{isGenerating && (
  <div className="flex items-center gap-2 text-blue-600">
    <Loader2 className="w-4 h-4 animate-spin" />
    AI-ul analizează...
  </div>
)}
```

### AI Insight Card:

```typescript
<div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
  <div className="flex items-center gap-2 mb-2">
    <Sparkles className="w-5 h-5 text-purple-600" />
    <h4 className="font-semibold text-purple-900">AI Insight</h4>
  </div>
  <p className="text-sm text-gray-700">{aiInsight}</p>
</div>
```

## 🚀 Quick Integration Steps

1. **Adaugă API Key** în `.env.local`
2. **Alege un feature** (ex: ChatConsultant)
3. **Creează API route** (vezi exemplele de mai sus)
4. **Adaugă UI component** în dashboard
5. **Test** cu date reale din simulare

## 📊 Best Practices

1. **Rate Limiting**: Limitează requests AI (max 10/minut)
2. **Caching**: Cache răspunsuri similare
3. **Error Handling**: Fallback la logica deterministă
4. **Cost Control**: Monitorizează usage API
5. **User Feedback**: Arată când AI "gândește"

## 🎯 Priority Features

1. **High Impact**: Business Consultant Chat
2. **Medium Impact**: AI Predictions
3. **Nice to Have**: Dynamic Events, NL Input

---

**Următorul Pas**: Implementează ChatConsultant pentru demo wow factor! 🚀
