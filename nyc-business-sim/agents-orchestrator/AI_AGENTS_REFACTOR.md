# AI Agents Architecture - Refactored

## Overview

This refactor improves the robustness and type-safety of AI agents using Vercel AI SDK best practices.

## Key Improvements

### 1. **Structured JSON Output with Vercel AI SDK**
- Uses `generateObject()` with Zod schemas for type-safe responses
- Validates all outputs against strict schemas
- Automatic retry on validation failures

### 2. **Message-Based Prompting**
All agents now use the `messages` parameter instead of `prompt`:
```typescript
const result = await generateObject({
  model: openai('gpt-4o'),
  schema: FinalRecommendationsSchema,
  messages: [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.7,
  maxRetries: 2,
});
```

**Benefits:**
- Clearer separation of system instructions vs user input
- Better control over conversation context
- More consistent with OpenAI/Anthropic best practices

### 3. **Robust Error Handling**
Each agent implements:
- **Retry logic** with exponential backoff (1s, 2s, 4s)
- **Zod validation** with detailed error logging
- **Graceful degradation** - API continues with partial agent data
- **Timeout protection** using `AbortSignal`

### 4. **Enhanced Validation**
```typescript
// Explicit Zod validation after generation
const validatedObject = SchemaName.parse(result.object);

// Additional business logic validation
if (validatedObject.recommendations.length < 3) {
  throw new Error('Insufficient recommendations');
}
```

### 5. **Parallel Execution with Fault Tolerance**
```typescript
const [demo, lifestyle, industry] = await Promise.allSettled([
  runDemographicsAgent(...),
  runLifestyleAgent(...),
  runIndustryAgent(...)
]);

// Continue if at least 2 agents succeed
const successfulAgents = [demo, lifestyle, industry].filter(r => r.status === 'fulfilled');
if (successfulAgents.length < 2) {
  throw new Error('Insufficient agent data');
}
```

## Agent Architecture

### Demographics Agent
- **Model:** Claude Haiku 4.5
- **Output:** Income-based business recommendations
- **Key validations:** 3-5 recommendations, 2-3 key insights

### Lifestyle Agent
- **Model:** Claude Haiku 4.5
- **Output:** Lifestyle & housing pattern recommendations
- **Key validations:** 3-5 recommendations, foot traffic profile, 2-3 lifestyle insights

### Industry Agent
- **Model:** Claude Haiku 4.5
- **Output:** Workforce-based business recommendations
- **Key validations:** 3-5 recommendations, workforce profile, market gaps

### Aggregator Agent
- **Model:** GPT-4o
- **Output:** Final top 3 recommendations + wild card
- **Key validations:** Exactly 3 ranked recommendations, location strengths/challenges

## Response Format

All agents return **fully typed** responses:

```typescript
// Demographics Agent
type DemographicsAnalysis = {
  recommendations: Array<{
    business_type: string;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
    target_segment: string;
    price_point: 'budget' | 'mid-range' | 'premium';
  }>;
  key_insights: string[];
};

// Aggregator Agent
type FinalRecommendations = {
  top_recommendations: Array<{
    rank: number;
    business_type: string;
    confidence_score: number;
    why_this_location: string;
    target_customer: string;
    investment_range: string;
    risk_level: 'low' | 'medium' | 'high';
    key_data_points: string[];
    consensus: string;
  }>;
  wild_card: {
    business_type: string;
    reasoning: string;
    data_support: string;
  };
  location_strengths: string[];
  location_challenges: string[];
};
```

## Error Handling Strategy

### 1. Agent-Level Errors
- Retry 3 times with exponential backoff
- Log detailed error messages and validation failures
- Throw descriptive error after all retries exhausted

### 2. Orchestrator-Level Errors
- Use `Promise.allSettled()` to prevent one failure from blocking others
- Require minimum 2/3 agents to succeed
- Return partial results with error indicators

### 3. API-Level Errors
- Catch Zod validation errors (400)
- Catch AI SDK errors (503)
- Return structured error response (500)

## Usage Metrics

Each agent logs:
- Attempt number and status
- Token usage (input/output/total)
- Execution time
- Validation results

Example output:
```
🔄 Demographics Agent attempt 1/3...
✅ Demographics Agent validation passed
📊 Usage: 1,450 tokens
```

## Configuration

### Retry Settings
```typescript
const maxRetries = 3; // Number of retry attempts
const baseDelay = 1000; // Base delay in ms (exponential backoff)
```

### Model Settings
```typescript
// Anthropic models for specialized agents
model: anthropic('claude-haiku-4-5-20251001')

// OpenAI model for aggregator
model: openai('gpt-4o')

// Common settings
temperature: 0.7  // Balance creativity and consistency
maxRetries: 2     // AI SDK internal retries
```

### Timeout Protection
```typescript
abortSignal: AbortSignal.timeout(30000) // 30s timeout
```

## Testing

To test the refactored agents:

1. **Start the development server:**
```bash
cd agents-orchestrator
npm run dev
```

2. **Send test request:**
```bash
curl -X POST http://localhost:3000/api/recommend-business \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

3. **Monitor console logs** for:
   - Agent retry attempts
   - Validation results
   - Token usage
   - Execution time

## Benefits Summary

✅ **Type Safety:** Full TypeScript + Zod validation
✅ **Robustness:** Retry logic + graceful degradation
✅ **Observability:** Detailed logging and metrics
✅ **Performance:** Parallel execution + timeout protection
✅ **Maintainability:** Clear separation of concerns
✅ **Developer Experience:** Type inference + error messages

## Migration Notes

### Before (Old Code)
```typescript
const result = await generateObject({
  model: anthropic('claude-haiku-4-5-20251001'),
  schema: LifestyleAnalysisSchema,
  prompt: largePromptString,
  temperature: 0.7,
});

return result.object;
```

### After (New Code)
```typescript
const result = await generateObject({
  model: anthropic('claude-haiku-4-5-20251001'),
  schema: LifestyleAnalysisSchema,
  messages: [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.7,
  maxRetries: 2,
});

const validatedObject = LifestyleAnalysisSchema.parse(result.object);
return validatedObject;
```

## Future Enhancements

- [ ] Add streaming support for real-time updates
- [ ] Implement caching for repeated queries
- [ ] Add telemetry/analytics integration
- [ ] Support for multiple model providers
- [ ] A/B testing framework for prompt optimization
