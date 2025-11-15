# Agents Orchestrator - AI Business Recommendation Service

Microserviciu Next.js standalone pentru recomandări business bazate pe date Census folosind Claude AI.

## 🏗️ Arhitectură

```
Frontend (Vite)  →  FastAPI (Census)  →  Agents Orchestrator (AI)
                                              ├── Demographics Agent
                                              ├── Lifestyle Agent
                                              ├── Industry Agent
                                              └── Aggregator (Final Top 3)
```

## 🚀 Quick Start

### 1. Instalare dependențe

```bash
cd agents-orchestrator
npm install
```

### 2. Configurare `.env.local`

Fișierul `.env.local` este deja configurat cu cheia Anthropic.

### 3. Rulare development

```bash
npm run dev
```

Server pornește pe: **http://localhost:3000**

## 📡 API Endpoint

### POST `/api/recommend-business`

**Request Body:**
```json
{
  "location": {
    "lat": 40.758896,
    "lng": -73.985130,
    "address": "Times Square, Manhattan, NY",
    "neighborhood": "Manhattan"
  },
  "census_data": {
    "latitude": 40.758896,
    "longitude": -73.985130,
    "area_name": "Census Tract 123",
    "fips_codes": {
      "state": "36",
      "county": "061",
      "tract": "012300"
    },
    "demographics": {
      "B01003_001E": 5000,
      "B01002_001E": 35.5,
      "B19013_001E": 125000,
      // ... toate datele Census
    }
  },
  "detailed_data": {
    // ... date detaliate din app4.py
    "derived_statistics": {
      "poverty_rate": 8.5,
      "high_income_households_rate": 47.3,
      "bachelor_plus_rate": 73.4,
      "renter_rate": 82.1,
      "work_from_home_rate": 38.2
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "location": {
    "neighborhood": "Manhattan",
    "address": "Times Square, Manhattan, NY",
    "tract": "012300",
    "block": "1001"
  },
  "agent_analyses": {
    "demographics": {
      "recommendations": [...],
      "key_insights": [...]
    },
    "lifestyle": {
      "recommendations": [...],
      "foot_traffic_profile": "...",
      "lifestyle_insights": [...]
    },
    "industry": {
      "recommendations": [...],
      "workforce_profile": "...",
      "market_gaps": [...]
    }
  },
  "final_recommendations": {
    "top_recommendations": [
      {
        "rank": 1,
        "business_type": "Premium Coffee Shop & Co-working Space",
        "confidence_score": 92,
        "why_this_location": "Block 1001 shows 47.3% high-income households...",
        "target_customer": "Remote professionals earning $100k-$150k",
        "investment_range": "$120k-$180k",
        "risk_level": "low",
        "key_data_points": [
          "47.3% households earn $75k+",
          "38.2% work from home",
          "73.4% college-educated"
        ],
        "consensus": "All 3 agents recommended"
      },
      // ... rank 2, 3
    ],
    "wild_card": {
      "business_type": "Boutique Fitness Studio",
      "reasoning": "...",
      "data_support": "..."
    },
    "location_strengths": [...],
    "location_challenges": [...]
  },
  "metadata": {
    "total_processing_time_ms": 4523,
    "parallel_execution_time_ms": 3100,
    "aggregator_time_ms": 1423,
    "model_used": "claude-3-5-sonnet-20241022",
    "timestamp": "2025-11-15T..."
  }
}
```

## 🤖 Agenți AI

### 1. Demographics Agent
- **Input**: Income distribution, education levels, poverty rate
- **Output**: 3-5 business-uri potrivite pentru profilul demografic
- **Focus**: Putere de cumpărare, preferințe educaționale

### 2. Lifestyle Agent
- **Input**: Renter/owner ratio, work-from-home %, transport patterns
- **Output**: 3-5 business-uri aliniate la stilul de viață
- **Focus**: Comportament zilnic, trafic pietonal

### 3. Industry Agent
- **Input**: Workforce composition (finance, arts, professional)
- **Output**: 3-5 business-uri complementare industriilor existente
- **Focus**: Competiție, gap-uri în piață

### 4. Aggregator (Strategic Advisor)
- **Input**: Toate analizele de la cei 3 agenți + datele Census
- **Output**: Top 3 finale + Wild Card
- **Logic**: Consensus building, data validation, risk assessment

## ⚡ Performance

- **Parallel Execution**: Cei 3 agenți rulează simultan (~3-4 secunde)
- **Aggregator**: ~1-2 secunde
- **Total**: ~4-6 secunde pentru recomandări complete
- **Model**: Claude 3.5 Sonnet (ultra-rapid, ultra-precis)

## 🔧 Integrare în Frontend (Vite)

```typescript
// În Confirmation.tsx

const handleLaunch = async () => {
  // Step 1: Get Census data
  const censusResponse = await fetch('http://localhost:8000/api/launch-business', {
    method: 'POST',
    body: JSON.stringify({ latitude, longitude, ... })
  });
  const censusResult = await censusResponse.json();

  // Step 2: Get AI recommendations
  const aiResponse = await fetch('http://localhost:3000/api/recommend-business', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: businessData.location,
      census_data: censusResult.data,
      detailed_data: censusResult.detailed_data
    })
  });

  const recommendations = await aiResponse.json();
  console.log('Top 3:', recommendations.final_recommendations.top_recommendations);
};
```

## 📊 Logging

Toate API calls loggează:
- ✅ Start/completion al fiecărui agent
- ⏱️ Timing pentru fiecare etapă
- 📊 Summary al recomandărilor
- ❌ Erori detaliate

Check console-ul Next.js pentru logs complete.

## 🧪 Testing

### Test Manual cu cURL:

```bash
curl -X POST http://localhost:3000/api/recommend-business \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

### Test în Browser:

Deschide: `http://localhost:3000/api/recommend-business` (va returna error pentru GET, expected)

## 🚢 Deployment

### Vercel (Recomandat):
```bash
vercel
```

### Docker:
```bash
docker build -t agents-orchestrator .
docker run -p 3000:3000 --env-file .env.local agents-orchestrator
```

## 🔐 Securitate

- ✅ CORS configurat pentru frontend Vite
- ✅ Request validation cu Zod
- ✅ Error handling robust
- ✅ API key în .env.local (nu în cod)

## 📝 Logs Example

```
🚀 Starting AI Agents Orchestration for: Manhattan
📍 Location: Times Square, Manhattan, NY
📊 Census Data Available: true
🔍 Detailed Data Available: true

⚡ Running 3 agents in parallel...
✅ Demographics Agent completed
✅ Industry Agent completed
✅ Lifestyle Agent completed

⏱️  Parallel execution completed in 3124ms

🧠 Running Aggregator (Strategic Advisor)...
✅ Aggregator completed in 1453ms

🎉 Total processing time: 4577ms
📊 Top 3 Recommendations generated:
   1. Premium Coffee Shop & Co-working Space (Confidence: 92%)
   2. Boutique Grocery Store (Confidence: 88%)
   3. Artisan Bakery & Cafe (Confidence: 85%)
```

## 🛠️ Troubleshooting

### Error: "Cannot find module '@ai-sdk/anthropic'"
```bash
npm install
```

### Error: "ANTHROPIC_API_KEY not found"
Check `.env.local` exists and has the key.

### CORS Error from Vite
Verifică `ALLOWED_ORIGINS` în `.env.local`.

---

Built with ❤️ using Vercel AI SDK + Claude 3.5 Sonnet
