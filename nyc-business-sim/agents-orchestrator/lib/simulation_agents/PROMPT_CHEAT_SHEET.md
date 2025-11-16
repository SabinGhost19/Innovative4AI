# ⚡ PROMPT CHEAT SHEET - Pentru Implementare Rapidă

## 🎯 Prompt Universal (Adaptează pentru Orice Agent)

```
# IMPLEMENTARE AGENT: {AGENT_NAME}

Implementează agentul TypeScript pentru NYC Business Simulator.

## SPECS

**Input**: {descrie input type}
**Output**: {descrie Zod schema}
**Model**: gpt-4o-mini (sau gpt-4o pentru narrative)
**Temperature**: 0.3-0.5 (sau 0.7-0.9 pentru creativitate)

## PATTERN (Copiază exact din events-agent.ts)

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const Schema = z.object({...});
type Type = z.infer<typeof Schema>;

interface Input {...}

export async function functionName(input: Input): Promise<Type> {
  const systemPrompt = `...`.trim();
  const userPrompt = `...`.trim();
  
  const result = await generateObject({
    model: openai('MODEL'),
    schema: Schema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: TEMP
  });
  
  return result.object;
}
```

## REGULI

✅ USE: generateObject, Zod, explicit types, .trim()
❌ NO: generateText, any types, new dependencies, long prompts

Generează cod production-ready conform ARCHITECTURE.md.
```

---

## 📋 Quick Reference: Agent Specs

### market-context-agent
- **Model**: gpt-4o-mini | **Temp**: 0.3
- **Input**: census_data, business_type, location
- **Output**: market_size_estimate, dominant_segments, demand_score, price_sensitivity_score, quality_preference_score, foot_traffic_multiplier

### supplier-agent
- **Model**: gpt-4o-mini | **Temp**: 0.3
- **Input**: supplier_tier, market_size_estimate, current_month, business_type
- **Output**: cost_per_unit, quality_score, seasonal_modifier, reliability_flag

### competition-agent
- **Model**: gpt-4o-mini | **Temp**: 0.5
- **Input**: competitors, player_decisions, market_context
- **Output**: competitors array (id, strategy, price_change, marketing_boost), avg_competitive_pressure

### customer-behavior-agent
- **Model**: gpt-4o-mini | **Temp**: 0.4
- **Input**: market_context, player_offering, competitors, events_impact, trends_impact
- **Output**: total_customers, total_revenue, avg_satisfaction, market_share, segments

### employee-agent
- **Model**: NONE (Pure Math)
- **Input**: num_employees, salary_per_employee, customers_served, market_median_income
- **Output**: total_employees, total_salaries, productivity_score, morale, overworked

### financial-agent
- **Model**: NONE (Pure Math)
- **Input**: revenue, cogs_per_unit, units_sold, operating_expenses
- **Output**: revenue, cogs, gross_profit, operating_expenses, ebitda, net_profit, profit_margin, cash_flow

### report-agent
- **Model**: gpt-4o | **Temp**: 0.7
- **Input**: toate outputs + historical_context (RAG)
- **Output**: executive_summary, inbox_messages, top_recommendations, sentiment

---

## 🚀 Workflow Ultra-Rapid

```bash
# 1. Generate prompt
./generate-agent-prompt.sh market-context-agent

# 2. Copy to clipboard
cat PROMPT_FOR_market-context-agent.md | pbcopy

# 3. Open Claude + Paste

# 4. Attach ARCHITECTURE.md

# 5. Get code

# 6. Save to agents/market-context-agent.ts

# 7. Repeat pentru următorii 6 agenți
```

---

## 🎯 Prompt Minimal (Dacă vrei ultra-concis)

```
Implementează {AGENT_NAME}.ts pentru NYC Business Simulator.

Folosește EXACT pattern-ul din events-agent.ts (atașat).
Schema Zod din ARCHITECTURE.md (atașat).
Model: {gpt-4o-mini sau gpt-4o}.
Temp: {0.3-0.9}.

Livrează cod production-ready, type-safe, zero dependencies noi.
```

**Atașează**:
- `ARCHITECTURE.md`
- `events-agent.ts`
- `trends-agent.ts`

---

## 💡 Tips pentru Prompturi Eficiente

### DO ✅
- Specifică exact ce agent (`market-context-agent.ts`)
- Include Zod schema exact
- Reference existing agents (`events-agent.ts` pattern)
- Attach ARCHITECTURE.md
- Cere production-ready code

### DON'T ❌
- Nu explica ce e Vercel AI SDK (Claude știe)
- Nu da exemple lungi de cod (attach files în loc)
- Nu cere multiple agenți simultan (1 per conversație)
- Nu uita să specifici model și temperature

---

## 🔥 One-Liner Prompts (Advanced)

### Pentru Math Agents

```
Implementează {employee-agent}.ts - PURE MATH (no LLM).
Formula din ARCHITECTURE.md (atașat).
Export function calculateEmployeeMetrics(input): EmployeeResult.
TypeScript strict, zero dependencies.
```

### Pentru AI Agents

```
{market-context-agent}.ts conform ARCHITECTURE.md (atașat).
Pattern: events-agent.ts (atașat).
gpt-4o-mini, temp 0.3, Zod schema exact.
Production-ready.
```

### Pentru Report Agent (cu RAG)

```
{report-agent}.ts - PREMIUM (gpt-4o).
Input include historical_context din RAG.
System prompt referențiază istoric (vezi ARCHITECTURE.md).
Pattern: events-agent.ts dar cu narrative output.
```

---

## 📊 Template Filling (Copy-Paste & Replace)

```markdown
# AGENT: {AGENT_NAME}

Implementează conform ARCHITECTURE.md.

**Specs**:
- Input: {TYPE}
- Output: {SCHEMA}
- Model: {MODEL}
- Temp: {TEMP}

**Pattern**: events-agent.ts (exact structure)

**Deliverable**: Full TypeScript file, production-ready.

Attach: ARCHITECTURE.md, events-agent.ts
```

**Replace**:
- `{AGENT_NAME}` → `market-context-agent`
- `{TYPE}` → `MarketContextInput`
- `{SCHEMA}` → `MarketContextSchema`
- `{MODEL}` → `gpt-4o-mini`
- `{TEMP}` → `0.3`

---

## ⚡ Super Fast Workflow

**Paralel Development** (7 tabs Claude simultan):

```
Tab 1: market-context-agent.ts    [Paste prompt] → [Get code]
Tab 2: supplier-agent.ts           [Paste prompt] → [Get code]
Tab 3: competition-agent.ts        [Paste prompt] → [Get code]
Tab 4: customer-behavior-agent.ts  [Paste prompt] → [Get code]
Tab 5: employee-agent.ts           [Paste prompt] → [Get code]
Tab 6: financial-agent.ts          [Paste prompt] → [Get code]
Tab 7: report-agent.ts             [Paste prompt] → [Get code]
```

**Timp total**: ~15 min (vs 3 ore manual)

---

## 🎓 Advanced: Custom Prompts per Agent Type

### For Decision Agents (gpt-4o-mini, low temp)

```
{AGENT} - Decision making agent.
Input: {DATA}
Output: Zod schema (numeric scores/flags only)
Model: gpt-4o-mini, temp 0.3
Pattern: events-agent.ts
Minimal output, maximal efficiency.
```

### For Math Agents (no LLM)

```
{AGENT} - Pure calculation agent (NO LLM).
Input: {DATA}
Output: {RESULT_TYPE}
Formulas: {FORMULAS from ARCHITECTURE.md}
TypeScript function only.
```

### For Narrative Agents (gpt-4o, high temp)

```
{AGENT} - Narrative generation (PREMIUM).
Input: All agent outputs + RAG context
Output: Zod schema (text fields)
Model: gpt-4o, temp 0.7
Quality over speed.
Attach: ARCHITECTURE.md section on RAG integration
```

---

## 🎯 TLDR - Shortest Possible Prompt

```
{AGENT_NAME}.ts conform ARCHITECTURE.md.
Pattern: events-agent.ts.
Model: {MODEL}, Temp: {TEMP}.
Attach: ARCHITECTURE.md
```

**That's it!** Claude are suficient context.

---

## 📚 Resources Quick Links

- **Full prompt**: `LLM_IMPLEMENTATION_PROMPT.md`
- **Architecture**: `ARCHITECTURE.md`
- **Examples**: `agents/events-agent.ts`, `agents/trends-agent.ts`
- **Generator**: `./generate-agent-prompt.sh AGENT_NAME`

---

**🚀 Ready to ship! Copy, paste, code! 🚀**
