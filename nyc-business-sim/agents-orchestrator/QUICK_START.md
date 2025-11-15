# 🚀 Quick Start Guide - Agents Orchestrator

## Pași Rapidi

### 1. Instalare (10 secunde)
```bash
cd agents-orchestrator
chmod +x setup.sh
./setup.sh
```

SAU manual:
```bash
npm install
```

### 2. Pornire Server (5 secunde)
```bash
npm run dev
```

✅ Server pornit pe **http://localhost:3000**

---

## Test API Rapid

### Test cu cURL
```bash
curl -X POST http://localhost:3000/api/recommend-business \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "lat": 40.7580,
      "lng": -73.9855,
      "address": "Times Square, NYC"
    },
    "census_data": {
      "total_population": 50000,
      "median_age": 34.2,
      "median_household_income": 95000
    },
    "detailed_data": {
      "income_75k_99k": 12000,
      "income_100k_124k": 8000,
      "bachelor_degree": 15000,
      "renter_rate": 68.5,
      "wfh_rate": 35.2
    }
  }'
```

### Response Așteptat
```json
{
  "final_recommendations": {
    "recommendations": [
      {
        "rank": 1,
        "business_type": "Upscale Coworking Space",
        "confidence_score": 92,
        "why_this_location": "Area has 35.2% WFH rate...",
        "target_customer": "Remote professionals",
        "investment_range": "$50k-$100k",
        "risk_level": "medium",
        "key_data_points": [...]
      }
    ]
  }
}
```

---

## Arhitectură 3-Servere

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vite (5173)   │────▶│ FastAPI (8000)  │────▶│  Next.js (3000) │
│   Frontend      │     │  Census APIs    │     │  AI Agents      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       ▲                        │                        │
       │                        ▼                        ▼
       │                 PostgreSQL DB            Claude 3.5 Sonnet
       │                                                  │
       └──────────────────────────────────────────────────┘
              Display Top 3 Recommendations
```

---

## Flow Complet

1. **User selectează locație** pe Google Maps (Vite frontend)
2. **Click "Launch My Business"** → POST la FastAPI
3. **FastAPI rulează paralel**:
   - Census API standard (ACS 2022)
   - Census API detaliat (ACS 2021 - app4.py logic)
4. **FastAPI salvează** în PostgreSQL (2 tabele)
5. **FastAPI returnează** date Census la frontend
6. **Frontend trimite** date Census la Next.js microservice
7. **Next.js rulează paralel 3 agenți AI**:
   - Demographics Agent (income/education)
   - Lifestyle Agent (housing/WFH)
   - Industry Agent (workforce/competition)
8. **Aggregator combină** cele 3 analize
9. **Claude generează** Top 3 recomandări
10. **Frontend afișează** recomandări cu streaming

---

## Verificare Health

### Verifică toate serverele pornite:
```bash
# Terminal 1 - Backend
cd nyc-business-sim/backend
python main.py  # Port 8000

# Terminal 2 - Frontend
cd nyc-business-sim/frontend
npm run dev  # Port 5173

# Terminal 3 - AI Agents
cd nyc-business-sim/agents-orchestrator
npm run dev  # Port 3000
```

### Test rapid toate serviciile:
```bash
# Backend health
curl http://localhost:8000/

# Frontend health
curl http://localhost:5173/

# AI service health
curl http://localhost:3000/
```

---

## Configurare API Key

Deja configurat în `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-AdHKveAhAY00k4AMLwC...
```

⚠️ **NU commita** acest fișier în Git (deja în `.gitignore`)

---

## Debugging

### Logs detaliate
Serverul afișează automat:
- ✅ Agent start/completion
- ⏱️ Processing times
- 📊 Census data received
- 🤖 AI responses generated

### Verifică console în browser:
```javascript
// Frontend va loga:
console.log("Coordinates:", lat, lng)
console.log("Census data:", response.data)
console.log("AI recommendations:", recommendations)
```

---

## Pași Următori

### 1. Integrare Frontend (Confirmation.tsx)
Modifică logica de "Launch Business":
```typescript
// Step 1: Get Census data
const censusResponse = await fetch('http://localhost:8000/api/launch-business', {
  method: 'POST',
  body: JSON.stringify({
    location: businessData.location,
    businessName: businessData.name,
    businessType: businessData.type,
  }),
})
const censusData = await censusResponse.json()

// Step 2: Get AI recommendations
const aiResponse = await fetch('http://localhost:3000/api/recommend-business', {
  method: 'POST',
  body: JSON.stringify({
    location: businessData.location,
    census_data: censusData.data,
    detailed_data: censusData.detailed_data,
  }),
})
const recommendations = await aiResponse.json()

// Step 3: Display recommendations
setRecommendations(recommendations.final_recommendations)
```

### 2. Creare UI Component
`RecommendationsDisplay.tsx` pentru a afișa:
- Top 3 business types
- Confidence scores (progress bars)
- Target customers
- Investment ranges
- Risk levels
- Key data points

### 3. Test End-to-End
1. Pornește toate 3 serverele
2. Selectează locație pe hartă
3. Click "Launch Business"
4. Verifică flow complet până la recomandări

---

## Troubleshooting

### Port deja folosit
```bash
# Găsește procesul pe port 3000
lsof -ti:3000 | xargs kill -9

# Sau schimbă portul în package.json
"dev": "next dev -p 3001"
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS errors
Verifică `next.config.js`:
```javascript
headers: async () => [
  {
    source: "/api/:path*",
    headers: [
      { key: "Access-Control-Allow-Origin", value: "*" },
    ],
  },
]
```

---

## Resurse

- **README.md** - Documentație completă
- **lib/schemas.ts** - Toate structurile de date
- **lib/agents/** - Implementări agenți
- **INTEGRATION_NOTES.md** (backend) - Logica Census API

---

**Succes! 🎉**
