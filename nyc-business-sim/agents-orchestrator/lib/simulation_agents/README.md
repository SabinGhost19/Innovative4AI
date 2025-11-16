# 🤖 Simulation Agents - NYC Business Simulator

Acest director conține agenții AI optimizați pentru simularea lunară a business-urilor din NYC.

**🆕 NEW**: Sistem RAG (Retrieval-Augmented Generation) cu Qdrant pentru memorie istorică și învățare continuă.

## 📚 Documentație

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arhitectură completă cu RAG integration (⭐ START HERE pentru LLM)
- **[QUICK_START.md](./QUICK_START.md)** - Ghid rapid de utilizare
- **[OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)** - Comparație înainte/după optimizări
- **[PROJECT_STATUS.md](../../../PROJECT_STATUS.md)** - Status complet proiect (ce e făcut vs TODO)

## 🚀 Quick Overview

Sistemul simulează o lună de business în **~10 secunde** folosind 9 agenți AI + RAG:

| Agent | Status | Model | Output | Timp |
|-------|--------|-------|--------|------|
| **🧠 RAG Retrieval** | 🔨 TODO | - | Historical context | 0.5s |
| Market Context | 🔨 TODO | gpt-4o-mini | Numeric | 1s |
| **Events** | ✅ **DONE** | gpt-4o | 1 event | 2s |
| **Trends** | ✅ **DONE** | gpt-4o | 1 trend | 2s |
| Supplier | 🔨 TODO | gpt-4o-mini | Cost+quality | 1s |
| Competition | 🔨 TODO | gpt-4o-mini | Strategies | 1.5s |
| Customer | 🔨 TODO | gpt-4o-mini | Revenue | 2s |
| Employee | 🔨 TODO | Math only | Efficiency | 0.1s |
| Financial | 🔨 TODO | Math only | P&L | 0.1s |
| Report | 🔨 TODO | gpt-4o + RAG | Narrative | 3s |
| **🧠 RAG Storage** | 🔨 TODO | - | Store state | 0.2s |

**Total: ~10 secunde** ⚡ (inclusiv RAG overhead)

---

## 📁 Structura Optimizată

```
simulation_agents/
├── ARCHITECTURE.md              # ⭐ Documentație completă cu RAG
├── QUICK_START.md              # Ghid rapid
├── OPTIMIZATION_SUMMARY.md     # Îmbunătățiri vs versiunea inițială
├── README.md                   # Acest fișier
│
├── core/                       # 🔨 TODO (PRIORITATE CRITICAL)
│   ├── types.ts               # TypeScript interfaces
│   ├── schemas.ts             # Zod validation schemas
│   ├── constants.ts           # Economic constants
│   └── orchestrator.ts        # Master orchestrator + RAG flow
│
├── services/                   # 🆕 RAG Infrastructure
│   └── rag-service.ts         # 🔨 TODO - Qdrant integration
│
├── agents/                     
│   ├── events-agent.ts         # ✅ IMPLEMENTED (optimizat)
│   ├── trends-agent.ts         # ✅ IMPLEMENTED (optimizat)
│   ├── market-context-agent.ts # 🔨 TODO (gpt-4o-mini)
│   ├── supplier-agent.ts       # 🔨 TODO (gpt-4o-mini)
│   ├── competition-agent.ts    # 🔨 TODO (gpt-4o-mini)
│   ├── customer-behavior-agent.ts # 🔨 TODO (gpt-4o-mini)
│   ├── employee-agent.ts       # 🔨 TODO (PURE MATH)
│   ├── financial-agent.ts      # 🔨 TODO (PURE MATH)
│   └── report-agent.ts         # 🔨 TODO (gpt-4o + RAG context)
│   ├── competition-agent.ts    # 🔨 TODO
│   ├── customer-behavior-agent.ts # 🔨 TODO
│   ├── employee-agent.ts       # 🔨 TODO
│   ├── financial-agent.ts      # 🔨 TODO
│   └── report-agent.ts         # 🔨 TODO
│
└── utils/                      # 🔨 TODO
    ├── calculations.ts
    ├── customer-segmentation.ts
    ├── competitor-modeling.ts
    └── cache.ts
```

---

## ✅ Agenți Implementați

### 1. Events Agent (events-agent.ts)

**Rol**: Generează 1 eveniment economic/social per lună bazat pe date Census + sezon.

**Model**: `gpt-4o` (creativitate pentru evenimente realiste)

**Input**:
```typescript
{
  businessType: string,
  location: { address, neighborhood, lat, lng },
  censusData: DetailedCensusData,
  currentMonth: number,
  currentYear: number
}
```

**Output**:
```typescript
{
  nume_eveniment: string,              // max 80 chars
  impact_clienti_lunar: number,        // -30 to +30 (%)
  relevanta_pentru_business: boolean,
  descriere_scurta: string            // max 100 chars
}
```

**Date Census utilizate**:
- Demografie: Populație, vârstă medie, venit
- Forță muncă: Distribuție pe industrii
- Educație: Rate licență/master/doctorat
- Economic: Rata sărăciei

**Exemple Evenimente**:
- ✅ "NYC Pride Month" (+30% foot traffic - Jun)
- ✅ "Festival Artizanal de Toamnă" (+15% - Oct)
- ❌ "Recesiune Sector Financiar" (-18% - zonă finance-heavy)

**Optimizări**:
- Temperature: 0.9 (creativitate)
- Max 1 eveniment/lună (nu 0-2)
- Descriere limitată la 100 caractere

---

### 2. Trends Agent (trends-agent.ts)

**Rol**: Analizează Google Trends și identifică 1 trend principal + impact.

**Model**: `gpt-4o` (analiză complexă)

**Input**:
```typescript
{
  business_type: string,
  location: { address, neighborhood },
  trends_data: GoogleTrendsData,
  current_month: number
}
```

**Output**:
```typescript
{
  main_trend: {
    trend_name: string,              // max 60 chars
    impact_score: number,            // -100 to +100
    relevance: boolean,
    confidence: 'low' | 'medium' | 'high'
  },
  overall_sentiment: 'positive' | 'neutral' | 'negative',
  market_momentum: 'accelerating' | 'stable' | 'decelerating'
}
```

**Google Trends Data utilizate**:
- Interest trend (growing/declining)
- Average interest score
- Related rising queries
- Trending searches

**Exemple Trends**:
- ✅ "Cold Brew Coffee în creștere" (+45 impact)
- ✅ "Specialty Coffee demand" (+35 impact)
- ❌ "Fast Food declining" (-20 impact)

**Optimizări**:
- ❌ Eliminat: secondary_trends, actionable_insight, description
- Temperature: 0.5 (balans)
- Output minimal (doar date numerice)

---

## 🔌 Utilizare

### Simulare Completă

```typescript
import { runMonthSimulation } from '@/lib/simulation_agents/core/orchestrator';

const result = await runMonthSimulation({
  business_id: 123,
  business_type: "Coffee Shop",
  location: {
    address: "Greenwich Village, NYC",
    lat: 40.7336,
    lng: -74.0027
  },
  current_month: 6,
  current_year: 2024,
  player_decisions: {
    num_employees: 4,
    salary_per_employee: 2800,
    supplier_tier: "premium",
    product_price: 7.50,
    marketing_budget: 3000
  },
  census_data: { /* cached */ },
  trends_data: { /* from backend */ },
  competitors: [ /* Google Places */ ]
});

console.log(result.financial.net_profit);  // 20370
console.log(result.events.nume_eveniment);  // "NYC Pride Month"
console.log(result.trends.main_trend.trend_name);  // "Cold Brew în creștere"
```

### Testing Individual Agents

```typescript
// Test Events Agent
import { generateBusinessEvent } from './agents/events-agent';

const event = await generateBusinessEvent(
  "Coffee Shop",
  { address: "SoHo, NYC", neighborhood: "SoHo", lat: 40.72, lng: -74.00 },
  censusData,
  6,  // June
  2024
);

console.log(event.nume_eveniment);
console.log(event.impact_clienti_lunar);
```

```typescript
// Test Trends Agent
import { analyzeTrendsForBusiness } from './agents/trends-agent';

const trends = await analyzeTrendsForBusiness(
  "Coffee Shop",
  { address: "SoHo, NYC", neighborhood: "SoHo" },
  trendsData,
  6,
  2024
);

console.log(trends.main_trend.impact_score);
```

---

## 📊 Performance & Optimization

### Execution Strategy

```
┌─────────────────────────────────────────────┐
│ PHASE 1: Context (1s)                      │
│ → Market Context Agent                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 2: External (2s - PARALLEL)          │
│ → Events Agent     | Trends Agent           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 3: Market (1.5s - PARALLEL)          │
│ → Supplier | Competition | Employee         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 4: Customer (2s)                     │
│ → Customer Behavior Agent                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PHASE 5: Report (3s - PARALLEL)            │
│ → Financial (Math) | Report (LLM)          │
└─────────────────────────────────────────────┘

TOTAL: ~9.5 seconds
```

### Model Usage

| Agent Type | Model | Why | Cost/call |
|------------|-------|-----|-----------|
| Events | gpt-4o | Creative text | $0.015 |
| Trends | gpt-4o | Complex analysis | $0.020 |
| Context | gpt-4o-mini | Simple decisions | $0.004 |
| Supplier | gpt-4o-mini | Calculations | $0.003 |
| Competition | gpt-4o-mini | Strategy choice | $0.005 |
| Customer | gpt-4o-mini | Segmentation | $0.008 |
| Employee | **Math** | Deterministic | $0 |
| Financial | **Math** | Deterministic | $0 |
| Report | gpt-4o | Narrative text | $0.040 |

**Total cost per simulation: ~$0.095**

---

## 🧪 Development

### Setup
```bash
npm install ai @ai-sdk/openai zod
```

### Environment Variables
```bash
OPENAI_API_KEY=sk-...
```

### Testing
```bash
# Test individual agent
npm test agents/events-agent.test.ts

# Test full orchestrator
npm test core/orchestrator.test.ts
```

### Debugging
```bash
# Enable detailed logs
DEBUG_AGENTS=true npm run dev

# Output:
# [MarketContext] 1023ms | 245 bytes
# [Events] 1847ms | 312 bytes
# [Trends] 1923ms | 289 bytes
```

---

## 🚧 Roadmap

### ✅ Implemented
- [x] Events Agent (optimized)
- [x] Trends Agent (optimized)
- [x] Architecture documentation
- [x] Optimization strategy

### 🔨 In Progress
- [ ] Core types & schemas
- [ ] Math agents (Employee, Financial)

### 📋 Planned
- [ ] Market Context Agent
- [ ] Supplier Agent
- [ ] Competition Agent
- [ ] Customer Behavior Agent
- [ ] Report Narrative Agent
- [ ] Master Orchestrator
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance benchmarks

---

## 📖 References

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide
- **[OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)** - Before/after comparison

---

## 🤝 Contributing

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Follow structured output pattern (Zod schemas)
3. Minimize LLM usage (prefer math where possible)
4. Add unit tests for new agents
5. Document performance metrics

---

## 📄 License

Part of NYC Business Simulator - Sim-Antreprenor project.

---

**Built with ❤️ using Vercel AI SDK + OpenAI GPT-4** 🚀

---
  "censusData": { /* DetailedCensusData */ },
  "currentMonth": 11,
  "currentYear": 2025
}
```

**Response:**
```json
{
  "success": true,
  "event": {
    "nume_eveniment": "Festival Artizanal de Toamnă",
    "impact_clienti_lunar": 15,
    "relevanta_pentru_business": true,
    "descriere_scurta": "Festival local care atrage vizitatori..."
  },
  "metadata": {
    "generated_at": "2025-11-16T00:30:00.000Z",
    "simulation_month": 11,
    "simulation_year": 2025,
    "business_type": "Coffee Shop",
    "location": "SoHo"
  }
}
```

## 🧪 Testing

```bash
# Pornește serverul
npm run dev

# În alt terminal, rulează testul
cd agents-orchestrator
./test-simulation.sh
```

Sau manual:
```bash
curl -X POST http://localhost:3000/api/simulation/next-month \
  -H "Content-Type: application/json" \
  -d @test-simulation-payload.json | jq .
```

## 🚀 Viitori Agenți

Următorii agenți planificați pentru simulare:
- **Competition Agent** - Generează competitori noi/închideri
- **Market Trends Agent** - Analizează tendințe consum
- **Regulatory Agent** - Simulează schimbări legislative
- **Weather Agent** - Impact vreme asupra afacerii
- **Economic Cycle Agent** - Simulează cicluri economice macro

## 🔧 Configurare

Agentul folosește:
- **Model:** GPT-4 (via `@ai-sdk/openai`)
- **Temperature:** 0.9 (pentru diversitate evenimente)
- **Validation:** Zod schemas

Configurează `OPENAI_API_KEY` în `.env.local`:
```bash
OPENAI_API_KEY=sk-...
```

## 📊 Metrici Impact

Impactul este calculat ca **procent lunar** de schimbare în numărul de clienți:
- **+5% până +30%** - Evenimente pozitive
- **-5% până -30%** - Evenimente negative
- **Relevanță** - Evenimentul afectează doar business-uri relevante

## 🎨 Integrare Frontend

```typescript
// Exemplu apel din dashboard
const handleNextMonth = async () => {
  const response = await fetch('/api/simulation/next-month', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessType: currentBusiness.type,
      location: currentBusiness.location,
      censusData: censusData,
      currentMonth: simulationMonth,
      currentYear: simulationYear
    })
  });
  
  const { event } = await response.json();
  
  // Aplică impactul
  updateCustomerCount(event.impact_clienti_lunar);
  showEventNotification(event);
};
```

---

**Autor:** SabinGhost19  
**Proiect:** NYC Business Simulator  
**Data:** Noiembrie 2025
























```
=== ny_acs_all_tracts_2017.csv ===
Area_Name,Resident_Population_Total,Resident_Median_Age,Resident_Median_Household_Income,Resident_Per_Capita_Income,Resident_Total_Households,Resident_Households_Income_75k_99k,Resident_Households_Income_100k_124k,Resident_Households_Income_125k_149k,Resident_Households_Income_150k_199k,Resident_Households_Income_200k_Plus,Education_Pop_25_Plus_Total,Education_Bachelors_Degree,Education_Masters_Degree,Education_Doctorate_Degree,Housing_Total_Units,Housing_Renter_Occupied_Units,Commute_Work_From_Home,Poverty_Population_Below_Poverty_Line,FIPS_State,FIPS_County,FIPS_Tract
"Census Tract 1227.07, Suffolk County, New York",3014,43.8,95040,38345,1003,156,165,60,92,146,2106,371,169,17,1003,107,31,136,36,103,122707
"Census Tract 1350.02, Suffolk County, New York",5345,40.6,104956,42121,1804,167,229,139,299,319,3569,932,622,69,1804,200,88,201,36,103,135002
"Census Tract 1112.02, Suffolk County, New York",4889,39.1,94318,34826,1510,245,177,172,223,158,3319,629,431,20,1510,282,155,516,36,103,111202
"Census Tract 1122.04, Suffolk County, New York",4090,45.0,127244,49981,1324,219,131,102,248,347,2829,789,547,61,1324,120,114,166,36,103,112204
"Census Tract 1464.02, Suffolk County, New York",3720,46.2,80000,37270,1282,181,122,98,128,164,2604,456,236,18,1282,276,67,210,36,103,146402
"Census Tract 1583.21, Suffolk County, New York",10304,37.2,83040,38168,3495,551,405,402,291,338,7083,1686,782,209,3495,1969,147,435,36,103,158321
"Census Tract 1907.04, Suffolk County, New York",3052,50.0,88778,70672,1170,109,120,71,118,251,2378,838,249,35,1170,193,221,193,36,103,190704
"Census Tract 9506, Ulster County, New York",2643,58.8,83107,71517,1379,138,102,127,97,247,2302,681,405,143,1379,235,316,224,36,111,950600
"Census Tract 9511, Ulster County, New York",2361,53.3,72031,44592,1122,136,80,169,60,105,1955,356,434,72,1122,145,97,249,36,111,951100
"Census Tract 9518, Ulster County, New York",1680,40.1,35759,25717,721,53,60,30,64,5,1161,177,75,43,721,372,40,207,36,111,951800
"Census Tract 9530, Ulster County, New York",1907,47.6,66726,36045,743,90,98,54,41,52,1373,249,181,32,743,186,141,100,36,111,953000
"Census Tract 9549, Ulster County, New York",1368,46.9,61500,30309,570,97,51,15,43,11,1030,175,53,4,570,163,53,104,36,111,954900
"Census Tract 9517, Ulster County, New York",4937,35.5,36588,22936,2038,149,70,39,61,48,3586,489,266,82,2038,1167,123,1035,36,111,951700
"Census Tract 9542, Ulster County, New York",5671,44.4,71853,39451,2127,227,185,152,288,140,3951,941,763,114,2127,442,196,456,36,111,954200
=== ny_acs_all_tracts_2018.csv ===
Area_Name,Resident_Population_Total,Resident_Median_Age,Resident_Median_Household_Income,Resident_Per_Capita_Income,Resident_Total_Households,Resident_Households_Income_75k_99k,Resident_Households_Income_100k_124k,Resident_Households_Income_125k_149k,Resident_Households_Income_150k_199k,Resident_Households_Income_200k_Plus,Education_Pop_25_Plus_Total,Education_Bachelors_Degree,Education_Masters_Degree,Education_Doctorate_Degree,Housing_Total_Units,Housing_Renter_Occupied_Units,Commute_Work_From_Home,Poverty_Population_Below_Poverty_Line,FIPS_State,FIPS_County,FIPS_Tract
"Census Tract 159, Bronx County, New York",1971,39.5,17778,12241,690,36,54,5,0,13,1261,64,38,0,690,643,16,866,36,005,015900
"Census Tract 177.01, Bronx County, New York",4812,30.4,31225,16020,1208,23,122,0,0,105,2972,212,89,0,1208,1111,0,1840,36,005,017701
"Census Tract 177.02, Bronx County, New York",5786,32.2,33426,18568,1718,84,164,120,25,21,3656,537,107,7,1718,1477,93,1836,36,005,017702
"Census Tract 179.01, Bronx County, New York",5006,29.9,37127,15567,1673,155,34,48,44,8,2869,204,175,0,1673,1492,44,2024,36,005,017901
"Census Tract 179.02, Bronx County, New York",3701,32.6,23276,13104,1160,88,25,9,26,0,2310,309,51,0,1160,1160,0,1637,36,005,017902
"Census Tract 181.01, Bronx County, New York",3107,29.5,23750,14541,1045,141,11,35,22,0,1777,79,52,0,1045,967,7,1182,36,005,018101
"Census Tract 181.02, Bronx County, New York",5791,31.6,33273,13507,1639,154,69,49,23,8,3437,448,100,9,1639,1608,86,2112,36,005,018102
"Census Tract 183.01, Bronx County, New York",4022,43.5,31638,25515,1995,187,88,91,51,37,2994,443,230,38,1995,1647,110,924,36,005,018301
"Census Tract 183.02, Bronx County, New York",3814,34.5,37139,18836,1279,159,52,28,5,26,2409,328,67,0,1279,1208,120,1025,36,005,018302
"Census Tract 185, Bronx County, New York",8625,32.3,27324,16266,2871,245,59,0,39,34,5469,449,237,36,2871,2813,166,3370,36,005,018500
"Census Tract 244.01, Richmond County, New York",6131,41.6,74014,39014,2098,189,97,173,153,409,4160,957,370,0,2098,464,48,469,36,085,024401
"Census Tract 244.02, Richmond County, New York",4654,40.0,94722,47884,1686,219,176,85,101,458,3082,788,551,23,1686,345,48,296,36,085,024402
"Census Tract 277.05, Richmond County, New York",5843,41.2,90595,37871,1916,199,247,233,189,246,4240,706,554,68,1916,470,96,671,36,085,027705
"Census Tract 277.06, Richmond County, New York",3520,39.6,81458,30285,1101,134,169,97,148,73,2433,509,279,38,1101,275,109,481,36,085,027706
=== ny_acs_all_tracts_2019.csv ===
Area_Name,Resident_Population_Total,Resident_Median_Age,Resident_Median_Household_Income,Resident_Per_Capita_Income,Resident_Total_Households,Resident_Households_Income_75k_99k,Resident_Households_Income_100k_124k,Resident_Households_Income_125k_149k,Resident_Households_Income_150k_199k,Resident_Households_Income_200k_Plus,Education_Pop_25_Plus_Total,Education_Bachelors_Degree,Education_Masters_Degree,Education_Doctorate_Degree,Housing_Total_Units,Housing_Renter_Occupied_Units,Commute_Work_From_Home,Poverty_Population_Below_Poverty_Line,FIPS_State,FIPS_County,FIPS_Tract
"Census Tract 55, Onondaga County, New York",3563,28.6,31321,19454,1820,198,46,14,14,0,2172,350,299,102,1820,1579,98,1312,36,067,005500
"Census Tract 56.01, Onondaga County, New York",1599,39.4,85417,43884,694,154,108,28,55,36,1125,260,338,102,694,153,40,117,36,067,005601
"Census Tract 61.02, Onondaga County, New York",1842,52.6,19430,21846,1305,27,72,0,3,0,1520,300,161,65,1305,1241,11,589,36,067,006102
"Census Tract 112.01, Onondaga County, New York",3844,37.5,63395,30423,1507,183,130,109,55,60,2527,441,202,11,1507,441,80,396,36,067,011201
"Census Tract 56.02, Onondaga County, New York",3950,19.8,-666666666,10948,63,0,4,0,4,0,95,32,10,8,63,55,90,144,36,067,005602
"Census Tract 103.21, Onondaga County, New York",2754,38.9,100833,38791,974,158,117,199,113,61,1920,297,255,19,974,55,45,83,36,067,010321
"Census Tract 119, Onondaga County, New York",3475,42.6,74625,32961,1270,199,148,86,132,64,2500,451,280,19,1270,163,129,171,36,067,011900
"Census Tract 126, Onondaga County, New York",5353,45.5,78155,32660,2105,476,214,139,168,85,3912,969,628,2,2105,325,125,155,36,067,012600
"Census Tract 361, Queens County, New York",2238,34.0,47419,19573,618,34,42,47,33,23,1542,206,44,5,618,402,9,290,36,081,036100
"Census Tract 363, Queens County, New York",1771,35.7,57802,21119,497,68,27,33,6,31,1120,91,45,0,497,302,5,359,36,081,036300
"Census Tract 371, Queens County, New York",1335,41.0,67419,27807,402,43,39,18,58,19,945,172,38,0,402,99,0,158,36,081,037100
"Census Tract 377, Queens County, New York",3620,30.3,71728,19317,775,201,50,47,29,39,2176,96,14,0,775,542,24,439,36,081,037700
"Census Tract 379, Queens County, New York",6851,32.2,72799,18067,1383,267,156,44,146,38,4397,173,96,21,1383,1035,36,1115,36,081,037900
"Census Tract 413, Queens County, New York",4696,32.8,55046,15805,1001,115,26,48,81,13,2899,108,7,9,1001,681,33,1245,36,081,041300
=== ny_acs_all_tracts_2020.csv ===
Area_Name,Resident_Population_Total,Resident_Median_Age,Resident_Median_Household_Income,Resident_Per_Capita_Income,Resident_Total_Households,Resident_Households_Income_75k_99k,Resident_Households_Income_100k_124k,Resident_Households_Income_125k_149k,Resident_Households_Income_150k_199k,Resident_Households_Income_200k_Plus,Education_Pop_25_Plus_Total,Education_Bachelors_Degree,Education_Masters_Degree,Education_Doctorate_Degree,Housing_Total_Units,Housing_Renter_Occupied_Units,Commute_Work_From_Home,Poverty_Population_Below_Poverty_Line,FIPS_State,FIPS_County,FIPS_Tract
"Census Tract 406, Cayuga County, New York",3400,48.0,84330,38098,1257,110,163,190,151,69,2492,514,290,27,1257,104,140,155,36,011,040600
"Census Tract 407, Cayuga County, New York",3633,48.7,93493,48435,1483,219,339,123,57,171,2588,511,454,10,1483,96,106,178,36,011,040700
"Census Tract 408, Cayuga County, New York",4668,42.2,64811,25305,1528,218,183,158,69,40,3564,396,149,16,1528,263,52,359,36,011,040800
"Census Tract 409, Cayuga County, New York",3683,47.0,66711,32477,1456,268,158,75,46,96,2565,332,136,25,1456,186,88,580,36,011,040900
"Census Tract 410.01, Cayuga County, New York",3088,44.8,73182,35962,1192,205,138,63,99,75,2271,362,218,25,1192,196,123,267,36,011,041001
"Census Tract 410.02, Cayuga County, New York",1650,42.1,79167,33872,558,131,63,41,41,29,1012,188,170,37,558,87,67,119,36,011,041002
"Census Tract 411.01, Cayuga County, New York",2542,49.6,87604,40985,1037,130,218,73,99,39,1951,264,211,14,1037,93,31,76,36,011,041101
"Census Tract 411.02, Cayuga County, New York",1587,32.6,65000,29526,588,93,62,50,27,11,1001,117,82,7,588,126,71,97,36,011,041102
"Census Tract 412.01, Cayuga County, New York",2294,45.7,70197,39128,903,169,125,51,40,40,1565,310,204,53,903,152,83,131,36,011,041201
"Census Tract 412.02, Cayuga County, New York",2661,48.2,69239,39130,1110,128,154,105,67,51,1965,169,140,16,1110,173,81,169,36,011,041202
"Census Tract 413, Cayuga County, New York",3584,38.7,38450,25769,1684,192,38,18,34,63,2569,225,68,1,1684,922,59,785,36,011,041300
"Census Tract 414, Cayuga County, New York",4702,46.0,43265,26958,2316,274,65,105,18,38,3574,752,177,13,2316,1450,0,675,36,011,041400
"Census Tract 415, Cayuga County, New York",2698,37.0,47486,25744,1201,182,87,7,45,16,1838,179,126,8,1201,553,0,273,36,011,041500
"Census Tract 416, Cayuga County, New York",2610,38.0,58800,30318,1036,177,172,80,26,24,1807,346,145,69,1036,319,99,189,36,011,041600
=== ny_acs_all_tracts_2021.csv ===
Area_Name,Resident_Population_Total,Resident_Median_Age,Resident_Median_Household_Income,Resident_Per_Capita_Income,Resident_Total_Households,Resident_Households_Income_75k_99k,Resident_Households_Income_100k_124k,Resident_Households_Income_125k_149k,Resident_Households_Income_150k_199k,Resident_Households_Income_200k_Plus,Education_Pop_25_Plus_Total,Education_Bachelors_Degree,Education_Masters_Degree,Education_Doctorate_Degree,Housing_Total_Units,Housing_Renter_Occupied_Units,Commute_Work_From_Home,Poverty_Population_Below_Poverty_Line,FIPS_State,FIPS_County,FIPS_Tract
"Census Tract 1, Albany County, New York",2215,30.5,44871,20603,825,49,51,5,12,7,1201,186,40,20,825,507,0,585,36,001,000100
"Census Tract 2.01, Albany County, New York",2890,32.0,42456,32040,1222,233,70,36,45,95,1886,458,67,36,1222,950,167,684,36,001,000201
"Census Tract 2.02, Albany County, New York",2519,32.1,24792,15922,1119,0,78,0,6,10,1499,78,5,0,1119,756,0,774,36,001,000202
"Census Tract 3.01, Albany County, New York",3108,37.4,40666,23730,1141,41,108,0,14,20,1954,63,133,30,1141,821,0,938,36,001,000301
"Census Tract 3.02, Albany County, New York",3435,34.3,42370,40656,1845,247,100,60,87,98,2413,455,401,114,1845,1261,186,785,36,001,000302
"Census Tract 4.01, Albany County, New York",2413,57.7,75994,45872,968,184,116,36,45,136,2119,396,507,26,968,350,140,162,36,001,000401
"Census Tract 4.03, Albany County, New York",4371,41.1,77835,42567,2271,280,381,176,231,108,3190,1160,520,97,2271,1153,177,755,36,001,000403
"Census Tract 4.04, Albany County, New York",5194,19.9,-666666666,4396,0,0,0,0,0,0,39,12,3,0,0,0,188,0,36,001,000404
"Census Tract 5.01, Albany County, New York",3410,29.1,25104,19791,1562,89,112,16,5,50,1959,168,141,116,1562,1282,46,1522,36,001,000501
"Census Tract 5.02, Albany County, New York",3912,21.5,61354,20260,941,86,99,83,26,62,1130,355,221,81,941,623,294,628,36,001,000502
"Census Tract 6, Albany County, New York",3522,24.7,21828,13988,1278,51,40,10,0,0,1654,176,112,18,1278,1119,224,1755,36,001,000600
"Census Tract 7, Albany County, New York",3694,35.1,40584,18778,1369,91,60,0,58,14,2246,204,288,6,1369,1078,41,1177,36,001,000700
"Census Tract 8, Albany County, New York",2061,30.7,23837,14662,866,30,9,27,0,0,1167,77,9,0,866,761,0,830,36,001,000800
"Census Tract 11, Albany County, New York",1988,35.9,45714,37128,1120,101,139,35,60,54,1623,171,173,46,1120,1028,80,631,36,001,001100
=== ny_acs_all_tracts_2022.csv ===
Area_Name,Resident_Population_Total,Resident_Median_Age,Resident_Median_Household_Income,Resident_Per_Capita_Income,Resident_Total_Households,Resident_Households_Income_75k_99k,Resident_Households_Income_100k_124k,Resident_Households_Income_125k_149k,Resident_Households_Income_150k_199k,Resident_Households_Income_200k_Plus,Education_Pop_25_Plus_Total,Education_Bachelors_Degree,Education_Masters_Degree,Education_Doctorate_Degree,Housing_Total_Units,Housing_Renter_Occupied_Units,Commute_Work_From_Home,Poverty_Population_Below_Poverty_Line,FIPS_State,FIPS_County,FIPS_Tract
Census Tract 1; Albany County; New York,2259,30.6,44547,21770,811,116,61,3,16,7,1187,173,23,19,811,491,0,641,36,001,000100
Census Tract 2.01; Albany County; New York,2465,39.8,33688,29741,1182,153,100,34,23,79,1887,404,59,34,1182,938,141,754,36,001,000201
Census Tract 2.02; Albany County; New York,2374,35.3,32585,32174,1205,0,16,26,58,52,1570,177,58,0,1205,746,116,768,36,001,000202
Census Tract 3.01; Albany County; New York,2837,42.1,43214,25265,1146,106,80,29,14,15,1929,67,144,33,1146,867,0,921,36,001,000301
Census Tract 3.02; Albany County; New York,3200,33.1,50875,46993,1786,115,191,104,84,87,2254,495,341,99,1786,1312,278,638,36,001,000302
Census Tract 4.01; Albany County; New York,2301,62.6,76641,47462,959,190,93,63,27,117,2018,400,530,36,959,334,171,154,36,001,000401
Census Tract 4.03; Albany County; New York,4348,41.9,77468,47717,2273,195,505,92,175,208,2981,1032,458,92,2273,1146,211,731,36,001,000403
Census Tract 4.04; Albany County; New York,5126,19.9,108750,5757,15,0,5,5,0,0,51,25,2,5,15,15,226,0,36,001,000404
Census Tract 5.01; Albany County; New York,3471,29.6,16585,20798,1660,78,103,14,17,64,2006,194,133,126,1660,1394,75,1811,36,001,000501
Census Tract 5.02; Albany County; New York,3788,21.8,60174,20971,1003,116,112,161,34,9,1145,385,250,51,1003,678,338,676,36,001,000502
Census Tract 6; Albany County; New York,3352,25.4,22417,14476,1365,124,28,9,0,0,1691,184,124,14,1365,1157,226,1716,36,001,000600
Census Tract 7; Albany County; New York,3733,36.0,44811,22173,1341,45,87,44,40,33,2293,216,268,0,1341,1047,71,1135,36,001,000700
Census Tract 8; Albany County; New York,1800,31.6,29188,18543,809,76,0,32,7,0,1091,113,0,0,809,709,0,669,36,001,000800
Census Tract 11; Albany County; New York,2143,33.7,46701,36646,1174,93,181,26,26,63,1778,230,169,60,1174,1123,122,757,36,001,001100
=== ny_bds_all_counties_2017.csv ===
County_Name,NAICS_Code,NAICS_Industry_Label,Business_Total_Firms,Business_Total_Establishments,Business_Total_Employees,Business_Job_Creation_Total,Business_Job_Creation_New_Firms,Business_Job_Destruction_Total,Business_Job_Destruction_Firm_Deaths,Business_New_Establishments,Business_Establishment_Exits,Business_Firm_Deaths,INDLEVEL,Analysis_Year,FIPS_State,FIPS_County
"Albany County, New York",00,Total for all sectors,7234,8751,178344,18600,4949,19606,7318,674,736,442,2,2017,36,001
"Albany County, New York",11,"Agriculture, forestry, fishing and hunting",0,0,0,0,0,0,0,0,0,0,2,2017,36,001
"Albany County, New York",21,"Mining, quarrying, and oil and gas extraction",4,4,102,1,0,7,0,0,0,0,2,2017,36,001
"Albany County, New York",22,Utilities,6,10,693,49,0,4,0,0,0,0,2,2017,36,001
"Albany County, New York",23,Construction,646,649,7420,1140,253,982,259,76,63,49,2,2017,36,001
"Albany County, New York",31-33,Manufacturing,206,213,8129,560,52,681,109,11,20,16,2,2017,36,001
"Albany County, New York",42,Wholesale trade,421,450,7858,740,187,1319,492,31,40,24,2,2017,36,001
"Albany County, New York",44-45,Retail trade,909,1232,22275,2327,586,2572,966,75,90,49,2,2017,36,001
"Albany County, New York",48-49,Transportation and warehousing,178,191,4893,649,263,331,81,18,15,8,2,2017,36,001
"Albany County, New York",51,Information,113,190,5815,906,335,986,226,19,36,6,2,2017,36,001
"Albany County, New York",52,Finance and insurance,378,613,12403,1536,377,1373,675,43,41,14,2,2017,36,001
"Albany County, New York",53,Real estate and rental and leasing,327,397,2800,335,53,422,142,30,38,30,2,2017,36,001
"Albany County, New York",71,"Arts, entertainment, and recreation",130,136,3463,482,287,313,59,22,14,10,2,2017,36,001
"Albany County, New York",54,"Professional, scientific, and technical services",1044,1111,17936,2209,491,1406,614,94,101,56,2,2017,36,001
=== ny_bds_all_counties_2018.csv ===
County_Name,NAICS_Code,NAICS_Industry_Label,Business_Total_Firms,Business_Total_Establishments,Business_Total_Employees,Business_Job_Creation_Total,Business_Job_Creation_New_Firms,Business_Job_Destruction_Total,Business_Job_Destruction_Firm_Deaths,Business_New_Establishments,Business_Establishment_Exits,Business_Firm_Deaths,INDLEVEL,Analysis_Year,FIPS_State,FIPS_County
"Albany County, New York",00,Total for all sectors,7232,8754,179956,19332,6192,17379,5515,733,723,433,2,2018,36,001
"Albany County, New York",11,"Agriculture, forestry, fishing and hunting",3,3,14,4,0,0,0,0,0,0,2,2018,36,001
"Albany County, New York",21,"Mining, quarrying, and oil and gas extraction",4,4,105,4,0,1,0,0,0,0,2,2018,36,001
"Albany County, New York",22,Utilities,6,13,701,20,0,11,0,0,0,0,2,2018,36,001
"Albany County, New York",23,Construction,653,656,7502,1134,272,1016,152,77,69,46,2,2018,36,001
"Albany County, New York",31-33,Manufacturing,213,226,8281,558,190,389,74,26,14,12,2,2018,36,001
"Albany County, New York",42,Wholesale trade,415,444,8169,810,298,530,179,20,27,15,2,2018,36,001
"Albany County, New York",44-45,Retail trade,904,1224,22137,2343,643,2446,1034,72,78,45,2,2018,36,001
"Albany County, New York",48-49,Transportation and warehousing,185,200,4980,663,272,554,109,25,17,12,2,2018,36,001
"Albany County, New York",51,Information,117,198,6172,959,73,613,119,22,16,5,2,2018,36,001
"Albany County, New York",52,Finance and insurance,375,603,12287,1768,1291,1800,834,70,77,20,2,2018,36,001
"Albany County, New York",53,Real estate and rental and leasing,323,389,2776,319,86,309,107,30,37,26,2,2018,36,001
"Albany County, New York",54,"Professional, scientific, and technical services",1053,1117,18022,1826,377,1570,420,101,91,59,2,2018,36,001
"Albany County, New York",55,Management of companies and enterprises,55,67,3355,663,294,97,0,4,0,0,2,2018,36,001
=== ny_bds_all_counties_2019.csv ===
County_Name,NAICS_Code,NAICS_Industry_Label,Business_Total_Firms,Business_Total_Establishments,Business_Total_Employees,Business_Job_Creation_Total,Business_Job_Creation_New_Firms,Business_Job_Destruction_Total,Business_Job_Destruction_Firm_Deaths,Business_New_Establishments,Business_Establishment_Exits,Business_Firm_Deaths,INDLEVEL,Analysis_Year,FIPS_State,FIPS_County
"Albany County, New York",00,Total for all sectors,7211,8766,182720,18198,6457,15304,4488,683,668,447,2,2019,36,001
"Albany County, New York",11,"Agriculture, forestry, fishing and hunting",3,3,15,1,0,0,0,0,0,0,2,2019,36,001
"Albany County, New York",21,"Mining, quarrying, and oil and gas extraction",4,4,78,7,0,34,0,0,0,0,2,2019,36,001
"Albany County, New York",22,Utilities,6,14,695,3,0,8,0,0,0,0,2,2019,36,001
"Albany County, New York",23,Construction,634,637,7482,971,129,970,227,60,78,55,2,2019,36,001
"Albany County, New York",31-33,Manufacturing,209,216,7809,593,85,1123,423,9,18,6,2,2019,36,001
"Albany County, New York",42,Wholesale trade,407,440,8146,613,182,625,196,19,24,10,2,2019,36,001
"Albany County, New York",44-45,Retail trade,892,1211,22250,1782,366,1706,416,71,84,59,2,2019,36,001
"Albany County, New York",48-49,Transportation and warehousing,189,205,5407,724,54,314,66,22,18,16,2,2019,36,001
"Albany County, New York",51,Information,116,198,5795,301,75,690,170,18,19,6,2,2019,36,001
"Albany County, New York",52,Finance and insurance,368,610,12685,1295,165,808,138,41,34,18,2,2019,36,001
"Albany County, New York",53,Real estate and rental and leasing,324,395,2829,315,116,251,65,33,26,22,2,2019,36,001
"Albany County, New York",54,"Professional, scientific, and technical services",1064,1122,18586,1762,620,1228,456,104,98,62,2,2019,36,001
"Albany County, New York",55,Management of companies and enterprises,52,59,3253,294,34,381,167,3,11,0,2,2019,36,001
=== ny_bds_all_counties_2020.csv ===
County_Name,NAICS_Code,NAICS_Industry_Label,Business_Total_Firms,Business_Total_Establishments,Business_Total_Employees,Business_Job_Creation_Total,Business_Job_Creation_New_Firms,Business_Job_Destruction_Total,Business_Job_Destruction_Firm_Deaths,Business_New_Establishments,Business_Establishment_Exits,Business_Firm_Deaths,INDLEVEL,Analysis_Year,FIPS_State,FIPS_County
"Albany County, New York",00,Total for all sectors,7121,8674,177738,16641,5364,21485,5526,662,753,474,2,2020,36,001
"Albany County, New York",11,"Agriculture, forestry, fishing and hunting",4,4,6,1,0,13,0,0,0,0,2,2020,36,001
"Albany County, New York",21,"Mining, quarrying, and oil and gas extraction",4,4,78,1,0,1,0,0,0,0,2,2020,36,001
"Albany County, New York",22,Utilities,7,16,729,46,0,12,0,0,0,0,2,2020,36,001
"Albany County, New York",23,Construction,637,640,7937,1239,162,786,174,74,71,44,2,2020,36,001
"Albany County, New York",31-33,Manufacturing,196,203,7685,892,286,1014,199,7,21,11,2,2020,36,001
"Albany County, New York",42,Wholesale trade,399,432,7691,637,94,1044,598,22,30,18,2,2020,36,001
"Albany County, New York",44-45,Retail trade,868,1179,21595,1533,302,2179,644,60,87,48,2,2020,36,001
"Albany County, New York",48-49,Transportation and warehousing,188,202,5665,637,253,380,134,24,27,19,2,2020,36,001
"Albany County, New York",51,Information,119,200,5370,388,106,768,226,18,14,6,2,2020,36,001
"Albany County, New York",52,Finance and insurance,358,584,11574,1187,339,2326,606,35,60,20,2,2020,36,001
"Albany County, New York",53,Real estate and rental and leasing,321,388,2745,234,56,322,149,32,38,29,2,2020,36,001
"Albany County, New York",54,"Professional, scientific, and technical services",1047,1109,17072,1900,518,3364,287,94,110,78,2,2020,36,001
"Albany County, New York",55,Management of companies and enterprises,50,56,3342,286,0,201,8,0,3,0,2,2020,36,001
=== ny_bds_all_counties_2021.csv ===
County_Name,NAICS_Code,NAICS_Industry_Label,Business_Total_Firms,Business_Total_Establishments,Business_Total_Employees,Business_Job_Creation_Total,Business_Job_Creation_New_Firms,Business_Job_Destruction_Total,Business_Job_Destruction_Firm_Deaths,Business_New_Establishments,Business_Establishment_Exits,Business_Firm_Deaths,INDLEVEL,Analysis_Year,FIPS_State,FIPS_County
"Albany County, New York",00,Total for all sectors,6952,8494,167369,17204,6721,28039,5953,637,817,465,2,2021,36,001
"Albany County, New York",11,"Agriculture, forestry, fishing and hunting",3,3,3,2,0,1,0,0,0,0,2,2021,36,001
"Albany County, New York",21,"Mining, quarrying, and oil and gas extraction",4,4,110,37,0,5,0,0,0,0,2,2021,36,001
"Albany County, New York",22,Utilities,7,18,735,16,0,10,0,0,0,0,2,2021,36,001
"Albany County, New York",23,Construction,647,651,7732,1055,359,1282,211,72,63,37,2,2021,36,001
"Albany County, New York",31-33,Manufacturing,186,195,7707,764,16,714,43,7,15,11,2,2021,36,001
"Albany County, New York",42,Wholesale trade,391,423,7477,585,174,808,286,16,24,14,2,2021,36,001
"Albany County, New York",44-45,Retail trade,856,1155,20417,1733,738,2954,634,77,101,55,2,2021,36,001
"Albany County, New York",48-49,Transportation and warehousing,178,196,5283,604,237,986,283,22,29,19,2,2021,36,001
"Albany County, New York",51,Information,113,182,5018,655,39,1033,480,15,33,12,2,2021,36,001
"Albany County, New York",52,Finance and insurance,347,581,11924,2261,1284,2033,878,41,42,15,2,2021,36,001
"Albany County, New York",53,Real estate and rental and leasing,320,380,2458,193,104,501,68,29,36,15,2,2021,36,001
"Albany County, New York",54,"Professional, scientific, and technical services",1057,1113,16415,1506,486,2188,505,115,111,66,2,2021,36,001
"Albany County, New York",55,Management of companies and enterprises,51,58,3169,208,78,386,4,7,4,0,2,2021,36,001
=== ny_bds_all_counties_2022.csv ===
County_Name,NAICS_Code,NAICS_Industry_Label,Business_Total_Firms,Business_Total_Establishments,Business_Total_Employees,Business_Job_Creation_Total,Business_Job_Creation_New_Firms,Business_Job_Destruction_Total,Business_Job_Destruction_Firm_Deaths,Business_New_Establishments,Business_Establishment_Exits,Business_Firm_Deaths,INDLEVEL,Analysis_Year,FIPS_State,FIPS_County
"Albany County, New York",00,Total for all sectors,7073,8586,175243,23874,5585,16240,4713,794,696,437,2,2022,36,001
"Albany County, New York",11,"Agriculture, forestry, fishing and hunting",0,0,0,0,0,0,0,0,0,0,2,2022,36,001
"Albany County, New York",21,"Mining, quarrying, and oil and gas extraction",3,3,61,0,0,50,0,0,0,0,2,2022,36,001
"Albany County, New York",22,Utilities,7,17,343,25,0,442,0,0,0,0,2,2022,36,001
"Albany County, New York",23,Construction,661,664,7495,1012,280,1227,472,75,58,35,2,2022,36,001
"Albany County, New York",31-33,Manufacturing,196,202,8492,1239,191,559,63,15,8,0,2,2022,36,001
"Albany County, New York",51,Information,112,181,5637,1081,28,470,49,14,14,7,2,2022,36,001
"Albany County, New York",42,Wholesale trade,381,416,7902,1152,212,722,200,26,30,15,2,2022,36,001
"Albany County, New York",44-45,Retail trade,877,1170,21420,2822,740,1792,435,97,80,40,2,2022,36,001
"Albany County, New York",48-49,Transportation and warehousing,180,200,5085,666,255,826,175,30,24,17,2,2022,36,001
"Albany County, New York",52,Finance and insurance,347,577,12334,1419,813,1079,245,47,51,20,2,2022,36,001
"Albany County, New York",53,Real estate and rental and leasing,314,378,2546,368,90,294,109,36,40,37,2,2022,36,001
"Albany County, New York",54,"Professional, scientific, and technical services",1070,1118,17502,2298,531,1246,674,124,123,86,2,2022,36,001
"Albany County, New York",55,Management of companies and enterprises,49,61,3788,771,126,381,69,6,8,3,2,2022,36,001
=== ny_lehd_all_tracts_2017.csv ===
FIPS_Tract_Full,Workforce_Total_Jobs,Workforce_Jobs_Age_29_or_Less,Workforce_Jobs_Age_30_54,Workforce_Jobs_Age_55_Plus,Workforce_Jobs_Earnings_1250_Month_or_Less,Workforce_Jobs_Earnings_1251_3333_Month,Workforce_Jobs_Earnings_3333_Month_Plus,Workforce_Jobs_Industry_Retail,Workforce_Jobs_Industry_Transport,Workforce_Jobs_Industry_Finance,Workforce_Jobs_Industry_Professional_Services,Workforce_Jobs_Industry_HoReCa,Workforce_Jobs_Industry_Healthcare
36001000100,1416,287,780,349,243,402,771,120,121,115,12,99,92
36001000201,763,192,413,158,293,298,172,13,0,5,0,139,69
36001000202,2213,384,1237,592,367,729,1117,30,58,31,60,39,181
36001000301,433,91,242,100,127,114,192,69,22,4,6,18,82
36001000302,11729,2307,6976,2446,2087,2768,6874,1442,507,77,60,311,156
36001000401,9180,2134,4892,2154,1885,2790,4505,1529,352,213,411,213,185
36001000403,8272,1273,4658,2341,1006,1301,5965,534,2,38,0,111,38
36001000404,6659,1310,3722,1627,884,1073,4702,24,0,0,0,336,58
36001000501,1072,284,514,274,213,372,487,70,0,2,0,42,29
36001000502,1765,560,750,455,698,595,472,2,0,3,183,79,12
36001000600,969,280,493,196,329,357,283,107,0,19,0,175,115
36001000700,1416,246,808,362,167,400,849,116,0,13,19,34,18
36001000800,901,221,478,202,319,347,235,255,120,14,0,51,75
36001001100,44559,6617,26026,11916,4549,7479,32531,363,136,212,223,1097,1087
=== ny_lehd_all_tracts_2018.csv ===
FIPS_Tract_Full,Workforce_Total_Jobs,Workforce_Jobs_Age_29_or_Less,Workforce_Jobs_Age_30_54,Workforce_Jobs_Age_55_Plus,Workforce_Jobs_Earnings_1250_Month_or_Less,Workforce_Jobs_Earnings_1251_3333_Month,Workforce_Jobs_Earnings_3333_Month_Plus,Workforce_Jobs_Industry_Retail,Workforce_Jobs_Industry_Transport,Workforce_Jobs_Industry_Finance,Workforce_Jobs_Industry_Professional_Services,Workforce_Jobs_Industry_HoReCa,Workforce_Jobs_Industry_Healthcare
36001000100,1449,282,795,372,272,391,786,112,125,116,7,94,95
36001000201,759,156,402,201,322,274,163,9,0,17,50,140,68
36001000202,2382,487,1284,611,387,821,1174,28,61,25,12,60,166
36001000301,418,91,220,107,130,122,166,60,0,2,6,11,116
36001000302,12178,2220,7293,2665,1860,2791,7527,1433,494,70,53,352,122
36001000401,9366,2082,5082,2202,1766,2663,4937,1562,287,144,387,209,157
36001000403,8463,1304,4770,2389,923,1223,6317,522,1,36,0,92,27
36001000404,6886,1329,3840,1717,910,1115,4861,26,0,0,0,593,25
36001000501,1070,294,503,273,235,328,507,80,0,2,0,52,22
36001000502,1666,480,729,457,633,543,490,7,0,1,172,98,13
36001000600,1047,297,509,241,339,390,318,112,0,19,0,232,108
36001000700,1428,230,818,380,156,388,884,140,0,12,21,25,14
36001000800,934,208,484,242,290,364,280,252,98,9,0,64,72
36001001100,45385,6803,26451,12131,4447,7144,33794,368,109,191,82,1401,1158
=== ny_lehd_all_tracts_2019.csv ===
FIPS_Tract_Full,Workforce_Total_Jobs,Workforce_Jobs_Age_29_or_Less,Workforce_Jobs_Age_30_54,Workforce_Jobs_Age_55_Plus,Workforce_Jobs_Earnings_1250_Month_or_Less,Workforce_Jobs_Earnings_1251_3333_Month,Workforce_Jobs_Earnings_3333_Month_Plus,Workforce_Jobs_Industry_Retail,Workforce_Jobs_Industry_Transport,Workforce_Jobs_Industry_Finance,Workforce_Jobs_Industry_Professional_Services,Workforce_Jobs_Industry_HoReCa,Workforce_Jobs_Industry_Healthcare
36001000100,1486,292,818,376,294,360,832,110,129,100,9,94,63
36001000201,1000,263,506,231,389,362,249,11,42,17,0,145,59
36001000202,2171,402,1170,599,334,706,1131,6,68,16,79,86,178
36001000301,429,82,227,120,111,131,187,47,0,3,0,55,101
36001000302,11099,1966,6613,2520,1623,2328,7148,1314,512,68,345,342,173
36001000401,9267,2035,5046,2186,1679,2499,5089,1465,222,179,406,270,162
36001000403,11018,1573,6328,3117,968,1447,8603,513,0,41,0,65,32
36001000404,1209,232,733,244,52,126,1031,16,0,0,1,0,0
36001000501,1107,306,506,295,212,325,570,69,0,10,0,43,30
36001000502,975,192,471,312,241,413,321,0,0,1,183,130,6
36001000600,975,301,460,214,318,356,301,99,5,16,0,219,110
36001000700,1688,279,961,448,198,446,1044,125,0,16,18,21,18
36001000800,883,158,484,241,257,338,288,213,83,3,0,59,59
36001001100,48778,7326,28265,13187,4626,7310,36842,372,288,226,108,1445,1060
=== ny_lehd_all_tracts_2020.csv ===
FIPS_Tract_Full,Workforce_Total_Jobs,Workforce_Jobs_Age_29_or_Less,Workforce_Jobs_Age_30_54,Workforce_Jobs_Age_55_Plus,Workforce_Jobs_Earnings_1250_Month_or_Less,Workforce_Jobs_Earnings_1251_3333_Month,Workforce_Jobs_Earnings_3333_Month_Plus,Workforce_Jobs_Industry_Retail,Workforce_Jobs_Industry_Transport,Workforce_Jobs_Industry_Finance,Workforce_Jobs_Industry_Professional_Services,Workforce_Jobs_Industry_HoReCa,Workforce_Jobs_Industry_Healthcare
36001000100,1316,222,757,337,273,293,750,92,77,84,7,54,20
36001000201,755,149,424,182,258,239,258,31,35,12,53,94,43
36001000202,1241,232,705,304,201,361,679,1,80,15,25,51,181
36001000301,401,59,232,110,96,123,182,52,0,2,0,37,85
36001000302,11128,1705,6755,2668,1255,2030,7843,1196,538,79,344,236,100
36001000401,8060,1779,4303,1978,1607,1969,4484,1206,78,172,67,106,132
36001000403,11487,1611,6692,3184,968,1401,9118,464,2,34,0,44,25
36001000404,1281,245,785,251,76,124,1081,9,0,0,0,0,25
36001000501,1077,259,521,297,207,290,580,86,0,8,0,29,24
36001000502,894,145,412,337,158,373,363,0,0,1,179,27,98
36001000600,970,283,456,231,295,391,284,120,9,24,0,184,101
36001000700,1438,216,844,378,176,321,941,108,0,11,29,6,25
36001000800,814,142,444,228,221,287,306,186,72,5,0,32,45
36001001100,47023,6716,27603,12704,4058,6120,36845,342,100,229,101,708,1031
=== ny_lehd_all_tracts_2021.csv ===
FIPS_Tract_Full,Workforce_Total_Jobs,Workforce_Jobs_Age_29_or_Less,Workforce_Jobs_Age_30_54,Workforce_Jobs_Age_55_Plus,Workforce_Jobs_Earnings_1250_Month_or_Less,Workforce_Jobs_Earnings_1251_3333_Month,Workforce_Jobs_Earnings_3333_Month_Plus,Workforce_Jobs_Industry_Retail,Workforce_Jobs_Industry_Transport,Workforce_Jobs_Industry_Finance,Workforce_Jobs_Industry_Professional_Services,Workforce_Jobs_Industry_HoReCa,Workforce_Jobs_Industry_Healthcare
36001000100,1207,208,673,326,200,317,690,77,100,80,0,64,24
36001000201,672,125,353,194,225,191,256,27,36,16,58,78,45
36001000202,1243,271,698,274,144,346,753,3,80,19,21,61,143
36001000301,400,74,211,115,75,119,206,47,0,3,0,18,90
36001000302,12273,1948,7397,2928,1182,2172,8919,1216,594,65,361,235,143
36001000401,8514,1810,4527,2177,1241,2007,5266,1221,151,134,105,125,128
36001000403,10259,1251,6078,2930,795,1472,7992,484,4,23,0,40,39
36001000404,6467,1015,3753,1699,561,1035,4871,15,0,0,0,286,50
36001000501,1078,255,551,272,197,304,577,92,0,14,0,30,24
36001000502,1666,376,762,528,448,517,701,7,0,1,148,5,79
36001000600,853,270,406,177,214,350,289,126,7,4,0,201,102
36001000700,1594,240,928,426,160,316,1118,107,0,15,16,4,20
36001000800,826,166,429,231,195,288,343,166,70,1,0,38,36
36001001100,41822,5415,25055,11352,3035,6044,32743,116,65,344,131,577,1087
=== ny_lehd_all_tracts_2022.csv ===
FIPS_Tract_Full,Workforce_Total_Jobs,Workforce_Jobs_Age_29_or_Less,Workforce_Jobs_Age_30_54,Workforce_Jobs_Age_55_Plus,Workforce_Jobs_Earnings_1250_Month_or_Less,Workforce_Jobs_Earnings_1251_3333_Month,Workforce_Jobs_Earnings_3333_Month_Plus,Workforce_Jobs_Industry_Retail,Workforce_Jobs_Industry_Transport,Workforce_Jobs_Industry_Finance,Workforce_Jobs_Industry_Professional_Services,Workforce_Jobs_Industry_HoReCa,Workforce_Jobs_Industry_Healthcare
36001000100,1471,261,798,412,261,332,878,97,109,85,6,70,15
36001000201,812,173,436,203,269,191,352,26,39,18,64,118,45
36001000202,1186,274,624,288,124,249,813,3,0,21,16,51,124
36001000301,392,61,220,111,73,108,211,51,0,0,0,11,108
36001000302,12868,1877,7793,3198,1313,2148,9407,1181,595,61,416,270,156
36001000401,7557,1740,3968,1849,1199,1722,4636,1335,155,138,154,157,147
36001000403,9065,1218,5348,2499,821,1292,6952,493,2,26,3,66,23
36001000404,7202,1169,4155,1878,714,1113,5375,10,0,0,0,447,46
36001000501,1026,246,505,275,181,265,580,64,0,12,0,34,40
36001000502,1545,384,658,503,416,425,704,8,0,1,151,18,85
36001000600,902,223,471,208,229,328,345,127,6,5,0,252,99
36001000700,1594,270,920,404,140,255,1199,94,0,13,22,1,17
36001000800,840,175,427,238,181,273,386,185,72,4,0,50,55
36001001100,52134,7435,30919,13780,5491,7810,38833,162,83,306,134,898,1190
```