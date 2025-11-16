# 🔍 ANALIZA DETALIATĂ - FLOW-UL DE DATE ȘI AGENȚI

## 📋 CUPRINS
1. [Surse de Date și Baze de Date](#surse-de-date)
2. [Flow-ul Complet cu Exemple](#flow-complet)
3. [Analiza Fiecărui Agent](#analiza-agentilor)
4. [Context Lunar - Cum se Păstrează Starea](#context-lunar)
5. [Probleme Identificate](#probleme-identificate)

---

## 1. SURSE DE DATE ȘI BAZE DE DATE

### 🗄️ **PostgreSQL Database** (Backend)

**Locație:** `backend/database.py`

**Tabele:**

#### 1.1 `area_overview`
```sql
- id (PRIMARY KEY)
- created_at
- latitude, longitude
- state_fips, county_fips, tract_fips
- area_name
- total_population
- median_age
- median_household_income
- per_capita_income
- poverty_population, poverty_rate
- bachelors_degree, masters_degree, doctorate_degree
- total_housing_units, renter_rate
- median_gross_rent, median_home_value
- total_workforce
- finance_insurance_real_estate
- arts_entertainment_hospitality
- professional_services
```

**Când se populează:** La apelul `/api/launch-business` (când user-ul selectează locația)

**Sursă:** US Census API (ACS - American Community Survey)

#### 1.2 `detailed_area_analysis`
```sql
- id (PRIMARY KEY)
- area_overview_id (FOREIGN KEY -> area_overview.id)
- latitude, longitude
- state_fips, county_fips, tract_fips, block_fips
- full_tract_id, full_block_id
- median_household_income
- households_75k_99k, households_100k_124k, etc.
- bachelor_plus_rate
- work_from_home_rate
- poverty_rate
- high_income_households_rate
- raw_demographics_json (JSON backup)
```

**Când se populează:** La apelul `/api/launch-business` (paralel cu area_overview)

**Sursă:** US Census API (ACS 2021) - Date mai detaliate

#### 1.3 `business_survival` (Citire doar)
```sql
- id (PRIMARY KEY)
- county_name (ex: "New York County, New York")
- naics_code (ex: "72" = Accommodation and Food Services)
- naics_industry_label
- firms_2017_start_pool
- aggregate_5_year_survival_pct
```

**Când se populează:** Populată MANUAL cu `populate_business_survival.py` din fișierul CSV

**Sursă:** `ny_bds_aggregate_5_year_survival_2017_2022.csv` (NY Business Dynamics Statistics)

**Cum se folosește:** Agenții NU interogează direct baza de date. Datele sunt preluate de backend și trimise către agenți.

### 🌐 **Surse Externe (API)**

#### 1.4 US Census API
- **URL:** `https://api.census.gov/data/2021/acs/acs5`
- **Acces:** Prin `census_service.py` și `detailed_analysis_service.py`
- **Când:** La crearea unui nou business (onboarding)
- **Rate limit:** Da (500 requests/zi fără key, mai mult cu key)

#### 1.5 Google Trends API (Pytrends)
- **URL:** Google Trends neoficial
- **Acces:** Prin `trends_service.py`
- **Când:** La fiecare simulare de lună (opțional)
- **Rate limit:** Da (poate da captcha dacă prea multe requests)

---

## 2. FLOW-UL COMPLET CU EXEMPLE EXACTE

### 🎯 **Scenariul:** User lansează un coffee shop în Manhattan și simulează luna 1

### **STEP 1: ONBOARDING (Frontend → Backend)**

**Frontend:** `pages/Onboarding.tsx`

User selectează locație: `lat: 40.7589, lng: -73.9851` (Times Square, Manhattan)

**Request:**
```http
POST http://localhost:8000/api/launch-business
Content-Type: application/json

{
  "latitude": 40.7589,
  "longitude": -73.9851,
  "business_name": "Joe's Coffee",
  "industry": "Coffee Shop"
}
```

**Backend:** `main.py` → `launch_business()`

1. Convertește coordonatele în FIPS codes:
   - State: `36` (NY)
   - County: `061` (New York County - Manhattan)
   - Tract: `009800`

2. Interogare **Census API** (paralel, 2 thread-uri):
   - **Thread 1:** `census_service.py` → Date standard (population, income, etc.)
   - **Thread 2:** `detailed_analysis_service.py` → Date detaliate (high income breakdown, work from home, etc.)

3. **Salvare în PostgreSQL:**
   - INSERT în `area_overview` → **ID = 42** (exemplu)
   - INSERT în `detailed_area_analysis` → Link către `area_overview_id = 42`

**Response:**
```json
{
  "success": true,
  "area_id": 42,
  "data": {
    "area_name": "Census Tract 98, New York County, New York",
    "latitude": 40.7589,
    "longitude": -73.9851
  },
  "detailed_data": {
    "demographics_detailed": {
      "B01001_001E": {"value": 8500, "label": "Total Population"},
      "B19013_001E": {"value": 95000, "label": "Median Household Income"},
      "B15003_022E": {"value": 4250, "label": "Bachelor's Degree"},
      "B08301_021E": {"value": 1500, "label": "Work from Home"},
      ...
    },
    "derived_statistics": {
      "poverty_rate": 0.12,
      "high_income_households_rate": 0.35,
      "bachelor_plus_rate": 0.65,
      "renter_rate": 0.85,
      "work_from_home_rate": 0.25
    },
    "fips_codes": {
      "state": "36",
      "county": "061",
      "tract": "009800"
    }
  }
}
```

**Frontend salvează:**
```javascript
localStorage.setItem('businessData', JSON.stringify({
  name: "Joe's Coffee",
  industry: "Coffee Shop",
  location: { lat: 40.7589, lng: -73.9851 },
  areaId: 42,
  budget: 100000
}))
```

---

### **STEP 2: SIMULARE LUNA 1 (Frontend → Agents Orchestrator)**

**Frontend:** `pages/Dashboard.tsx` → User apasă "Run Full Month Simulation"

**Pregătire date:**

1. **Fetch Census Data din Backend:**
```http
GET http://localhost:8000/api/get-area/42
```

Response: Același `detailed_data` de mai sus (din PostgreSQL)

2. **Fetch Google Trends (opțional):**
```http
POST http://localhost:8000/api/get-trends
{
  "business_type": "Coffee Shop",
  "location": "US-NY"
}
```

Response:
```json
{
  "success": true,
  "business_type": "Coffee Shop",
  "trends": {
    "interest_trend": "rising",
    "average_interest": 75,
    "peak_interest": 92,
    "related_rising_queries": [
      {"query": "specialty coffee", "value": 150},
      {"query": "cold brew", "value": 120}
    ],
    "keywords_performance": {
      "coffee shop": {"average_interest": 75, "trend": "stable"}
    }
  }
}
```

3. **Call Agents Orchestrator:**
```http
POST http://localhost:3000/api/simulation/run-full
Content-Type: application/json

{
  "businessType": "Coffee Shop",
  "location": {
    "address": "Census Tract 98, New York County, New York",
    "neighborhood": "Times Square",
    "county": "New York County",
    "lat": 40.7589,
    "lng": -73.9851
  },
  "censusData": {
    "demographics_detailed": { ... },
    "derived_statistics": { ... },
    "fips_codes": { ... }
  },
  "trendsData": { ... },
  "survivalData": null,
  "currentMonth": 1,
  "currentYear": 2024,
  "playerDecisions": {
    "pricing_strategy": "competitive",
    "marketing_spend": 1000,
    "quality_level": "standard",
    "target_employee_count": 3,
    "avg_hourly_wage": 20
  },
  "previousMonthState": {
    "revenue": 0,
    "profit": 0,
    "customers": 0,
    "cashBalance": 100000
  }
}
```

---

### **STEP 3: AGENȚII PROCESEAZĂ (Agents Orchestrator)**

**Fișier:** `agents-orchestrator/app/api/simulation/run-full/route.ts`

#### **PHASE 1: Market Context** (Secvențial, ~2-3s)

**Agent:** `market-context-agent.ts`

**Input:**
- businessType: "Coffee Shop"
- location: { ... }
- censusData: { demographics_detailed, derived_statistics }
- survivalData: null (nu e disponibil pentru acest tract)
- currentMonth: 1
- currentYear: 2024

**Procesare:**
- **NU interogează baza de date**
- Primește toate datele Census ca parametri
- Folosește **OpenAI GPT-4o-mini** pentru analiza LLM

**Prompt către LLM:**
```
Analyze market context for this business:
- Type: Coffee Shop
- Location: Times Square, New York County
- Population: 8,500
- Median Income: $95,000
- Bachelor's Degree+: 65%
- High Income Households: 35%
- Month: 1/12 (Winter)

ANALYZE:
1. Economic Climate
2. Industry Saturation
3. Market Risk
...
```

**Output (exemplu):**
```json
{
  "economic_climate": "strong",
  "industry_saturation": 72,
  "market_demand_score": 85,
  "survival_benchmark_estimate": 62,
  "recommended_strategy": "Focus on premium offerings for high-income demographic",
  "key_trends": [
    "High concentration of office workers",
    "Strong tourist traffic in Times Square",
    "Premium pricing sustainable given income levels"
  ],
  "opportunities": ["Premium coffee", "Breakfast rush", "Tourist market"],
  "threats": ["High rent", "Intense competition", "Seasonal tourism"]
}
```

**Durată:** ~2500ms

---

#### **PHASE 2: External Analysis** (Paralel, ~3-4s)

**2 Agenți în paralel:**

##### **2.1 Events Agent** (`events-agent.ts`)

**Input:**
- businessType, location, censusData, currentMonth, currentYear

**Procesare:**
- **NU interogează baza de date**
- Folosește **GPT-4o** cu temperature 0.9 (creativitate)
- Generează evenimente random realiste

**Output (exemplu):**
```json
{
  "nume_eveniment": "Winter Restaurant Week NYC",
  "impact_clienti_lunar": 12,
  "relevanta_pentru_business": true,
  "descriere_scurta": "Annual winter promotion increases foot traffic +12%"
}
```

##### **2.2 Trends Agent** (`trends-agent.ts`)

**Input:**
- businessType, location, trendsData (de la Google Trends), currentMonth

**Procesare:**
- **NU interogează baza de date**
- Primește Google Trends data ca parametru
- Folosește **GPT-4o** pentru analiză

**Output (exemplu):**
```json
{
  "main_trend": {
    "trend_name": "Specialty Coffee Boom",
    "impact_score": 45,
    "relevance": true,
    "description": "Rising interest in specialty coffee +50% YoY",
    "actionable_insight": "Introduce single-origin pour-over options",
    "confidence": "high"
  },
  "secondary_trends": [...],
  "overall_sentiment": "positive",
  "market_momentum": "accelerating"
}
```

**Durată totală Phase 2:** ~3200ms

---

#### **PHASE 3: Market Dynamics** (Paralel, ~2-3s)

**3 Operații în paralel:**

##### **3.1 Supplier Agent** (`supplier-agent.ts`)

**Input:**
- businessType, location, censusData, estimatedRevenue (din previousMonthState), currentMonth

**Procesare:**
- **NU interogează baza de date**
- Calculează chiria cu funcție locală: `calculateMonthlyRent("Coffee Shop", "New York County")` → **$8,000/lună**
- Folosește **GPT-4o-mini** pentru estimări

**Output (exemplu):**
```json
{
  "supplier_availability": "excellent",
  "estimated_monthly_costs": {
    "rent": 8000,
    "utilities": 500,
    "inventory": 15000,
    "total": 23500
  },
  "price_volatility": "low",
  "supplier_reliability_score": 92,
  "cost_optimization_tips": [
    "Negotiate bulk coffee bean contracts",
    "Use local dairy suppliers",
    "Install energy-efficient equipment"
  ],
  "seasonal_adjustment": {
    "adjustment": -5,
    "reasoning": "Winter = lower dairy/produce prices"
  }
}
```

##### **3.2 Competition Agent** (`competition-agent.ts`)

**Input:**
- businessType, location, censusData, marketContext (din Phase 1), currentMonth

**Procesare:**
- **NU interogează baza de date**
- Estimează număr competitori: `estimateCompetitorCount()` bazat pe populație
  - Population 8,500 → Coffee shops: ~21 competitori (2.5 per 10k residents × saturation)
- Folosește **GPT-4o-mini**

**Output (exemplu):**
```json
{
  "total_competitors": 21,
  "new_entrants_this_month": 1,
  "closures_this_month": 0,
  "market_space": "saturated",
  "pricing_pressure": "high",
  "competitor_actions": [
    {
      "competitor_name": "Competitor A (Starbucks)",
      "action": "Launched new seasonal menu",
      "impact": "neutral"
    }
  ],
  "your_advantages": [
    "Local neighborhood focus",
    "Personalized service"
  ],
  "threats": [
    "Chain coffee shops nearby",
    "High rent squeezing margins"
  ]
}
```

##### **3.3 Employee Agent** (`employee-agent.ts`)

**Procesare:**
- **PURE MATH - NU folosește LLM**
- **NU interogează baza de date**

**Calcul:**
```typescript
num_employees = 3
salary_per_employee = 20 * 160 = $3,200/lună
total_salaries = 3 * 3200 = $9,600

customers_served = 0 (prima lună)
ideal_workload = 3 * 75 * 30 = 6,750 customers/lună
actual_workload_ratio = 0 / 6750 = 0

productivity_score = 70 (default pentru new team)
morale = 90 (low workload, fair salary)
overworked = false
```

**Output:**
```json
{
  "total_employees": 3,
  "new_hires": 3,
  "resignations": 0,
  "total_salaries": 9600,
  "productivity_score": 70,
  "morale": 90,
  "overworked": false
}
```

**Durată Phase 3:** ~2100ms

---

#### **PHASE 4: Customer Simulation** (Secvențial, ~3-5s)

**Agent:** `customer-behavior-agent.ts`

**Input:**
- businessType, location, censusData
- marketContext (din Phase 1)
- competitionData (din Phase 3)
- eventsData (din Phase 2)
- trendsData (din Phase 2)
- supplierData (din Phase 3)
- playerDecisions
- **previousMonthCustomers: 0** (prima lună!)
- currentMonth: 1

**Procesare:**
- **NU interogează baza de date**
- Folosește **GPT-4o-mini** cu temperature 0.3 (deterministic)

**Calcul Potential Customers:**
```
Population = 8,500
Potential % for Coffee = 25% (hardcoded în agent)
Total Potential = 8,500 * 0.25 = 2,125 clienți posibili
```

**Prompt către LLM (simplificat):**
```
Last Month Active Customers: 0 (starting fresh)
Total Potential Customers: 2,125
Population: 8,500
Median Income: $95,000
Economic Climate: strong
Competitors: 21
Event Impact: +12% (Restaurant Week)
Trend Impact: +45 (Specialty Coffee Boom)
Marketing Spend: $1,000
Month: 1/12 (Winter)

SIMULATE:
1. Churn: 0 (no previous customers)
2. New Customers Acquired: ?
3. Returning: 0
4. Total Active: new + returning
5. Customer Segments (max 3)
6. Acquisition Channels (max 4)
...
```

**Output (exemplu):**
```json
{
  "total_potential_customers": 2125,
  "new_customers_acquired": 180,
  "returning_customers": 0,
  "churned_customers": 0,
  "total_active_customers": 180,
  "customer_segments": [
    {
      "segment_name": "Office Workers",
      "size": 100,
      "avg_spend": 8,
      "loyalty": 70
    },
    {
      "segment_name": "Tourists",
      "size": 50,
      "avg_spend": 12,
      "loyalty": 30
    },
    {
      "segment_name": "Residents",
      "size": 30,
      "avg_spend": 6,
      "loyalty": 85
    }
  ],
  "acquisition_channels": [
    {"channel": "walk_by", "customers": 80, "cost_per_customer": 0},
    {"channel": "social_media", "customers": 50, "cost_per_customer": 15},
    {"channel": "word_of_mouth", "customers": 30, "cost_per_customer": 0},
    {"channel": "paid_ads", "customers": 20, "cost_per_customer": 50}
  ],
  "loyalty_rate": 68,
  "churn_rate": 0,
  "avg_customer_lifetime_value": 450,
  "behavioral_insights": [
    "Event impact increased foot traffic",
    "Premium demographics support higher prices",
    "Tourist traffic volatile but profitable"
  ],
  "seasonal_demand": {
    "adjustment": -5,
    "reasoning": "Winter decreases walk-by traffic slightly"
  }
}
```

**Durată Phase 4:** ~4200ms

---

#### **PHASE 5: Financial Analysis** (Secvențial, ~0.1s)

**Agent:** `financial-agent.ts`

**Procesare:**
- **PURE MATH - NU folosește LLM**
- **NU interogează baza de date**

**Calcul Revenue:**
```typescript
// Weighted average spend per customer
avgSpend = (100*8 + 50*12 + 30*6) / 180 = 8.67

// Assume 4 visits per month (hardcoded în route.ts)
avgVisitFrequency = 4

// Total Revenue
totalRevenue = 180 * 8.67 * 4 = $6,242
```

**Calcul Costs:**
```typescript
laborCost = 9600 (din employee agent)
inventoryCost = 15000 (din supplier agent)
rentCost = 8000
utilitiesCost = 500
marketingCost = 1000
otherCosts = 500

totalCosts = 34,600
```

**Calcul P&L:**
```typescript
grossProfit = 6242 - 15000 = -8,758
netProfit = 6242 - 34600 = -28,358
profitMargin = -454%
```

**Calcul Cash Flow:**
```typescript
openingBalance = 100,000 (din previousMonthState)
cashIn = 6,242
cashOut = 34,600
closingBalance = 100,000 + 6,242 - 34,600 = 71,642
burnRate = 28,358/lună
cashRunway = 71,642 / 28,358 = 2.5 luni
```

**Output:**
```json
{
  "profit_loss": {
    "revenue": 6242,
    "total_costs": 34600,
    "gross_profit": -8758,
    "net_profit": -28358,
    "profit_margin": -454
  },
  "cost_breakdown": {
    "labor": 9600,
    "inventory": 15000,
    "rent": 8000,
    "utilities": 500,
    "marketing": 1000,
    "other": 500
  },
  "cash_flow": {
    "opening_balance": 100000,
    "cash_in": 6242,
    "cash_out": 34600,
    "closing_balance": 71642,
    "burn_rate": 28358
  },
  "health_metrics": {
    "revenue_growth_rate": 0,
    "profit_growth_rate": 0,
    "cash_runway_months": 2.5,
    "financial_health_score": 25
  },
  "alerts": [
    "⚠️ CRITICAL: Negative profit margin",
    "⚠️ High burn rate - only 2.5 months runway",
    "💡 Revenue too low for cost structure"
  ]
}
```

**Durată Phase 5:** ~10ms

---

### **STEP 4: RESPONSE LA FRONTEND**

**Total Execution Time:** ~15,000ms (15 secunde)

**Response:**
```json
{
  "success": true,
  "month": 1,
  "year": 2024,
  "outputs": {
    "marketContext": { ... },
    "eventsData": { ... },
    "trendsData": { ... },
    "supplierData": { ... },
    "competitionData": { ... },
    "employeeData": { ... },
    "customerData": { ... },
    "financialData": { ... }
  },
  "executionTime": 15000,
  "phaseTimes": {
    "phase1_market_context": 2500,
    "phase2_external": 3200,
    "phase3_market_dynamics": 2100,
    "phase4_customers": 4200,
    "phase5_financial": 10
  }
}
```

**Frontend salvează în state:**
```javascript
setSimulationOutputs(data)
setCashBalance(71642) // Update cash
setCurrentMonth(2) // Next month
```

---

## 3. ANALIZA FIECĂRUI AGENT

### Agent Summary Table

| Agent | LLM? | DB Query? | Input Source | Output | Durată |
|-------|------|-----------|--------------|--------|--------|
| **Market Context** | ✅ GPT-4o-mini | ❌ | Census data (parametru) | Economic climate, saturation | ~2.5s |
| **Events** | ✅ GPT-4o | ❌ | Census data (parametru) | Random event, impact % | ~1.5s |
| **Trends** | ✅ GPT-4o | ❌ | Google Trends (parametru) | Trend analysis, insights | ~1.8s |
| **Supplier** | ✅ GPT-4o-mini | ❌ | Census + local calc | Cost estimates | ~2s |
| **Competition** | ✅ GPT-4o-mini | ❌ | Census + market context | Competitor count, actions | ~1.5s |
| **Employee** | ❌ Math | ❌ | Player decisions | Salaries, morale, productivity | ~0.01s |
| **Customer** | ✅ GPT-4o-mini | ❌ | All agent outputs | Customer acquisition, revenue | ~4s |
| **Financial** | ❌ Math | ❌ | Customer + costs | P&L, cash flow | ~0.01s |

### 🚨 **IMPORTANT:** NICIUN AGENT NU INTEROGEAZĂ DIRECT BAZA DE DATE!

Toți agenții primesc datele ca parametri, care provin din:
1. **Frontend** → salvează Census data în `localStorage` sau state
2. **Backend** → citește din PostgreSQL la `/api/get-area/{id}` și trimite către Orchestrator
3. **Orchestrator** → distribuie datele către agenți

---

## 4. CONTEXT LUNAR - CUM SE PĂSTREAZĂ STAREA

### ❌ **PROBLEMA IDENTIFICATĂ: CONTEXT LUNAR SLAB!**

**Ce se păstrează între luni:**

#### ✅ **Date care se actualizează:**
1. **`currentMonth`** - incrementat în frontend (1 → 2 → 3 ... → 12 → 1)
2. **`currentYear`** - incrementat când month = 12 → 1
3. **`cashBalance`** - actualizat cu `closing_balance` din financial agent
4. **`previousMonthState`** - obiect cu 4 câmpuri:
   ```json
   {
     "revenue": 6242,
     "profit": -28358,
     "customers": 180,
     "cashBalance": 71642
   }
   ```

#### ❌ **Date care NU se păstrează (PROBLEME MAJORE):**

1. **Customer Segments** - PIERDUTE
   - Luna 1: Generezi 180 clienți (100 office workers, 50 tourists, 30 residents)
   - Luna 2: Agent nu știe nimic despre segmentele existente
   - **Impact:** Churn rate calculat greșit, loyalty ignorat

2. **Employee State** - PARȚIAL PIERDUT
   - Luna 1: 3 angajați, morale 90, productivity 70
   - Luna 2: Agent știe doar `target_employee_count: 3` din `playerDecisions`
   - **Impact:** Morale reset, productivity reset, resignation history pierdută

3. **Supplier Relationships** - PIERDUTE
   - Luna 1: Reliability score 92, negotiated costs
   - Luna 2: Totul regenerat de la zero
   - **Impact:** Costs pot varia dramatic fără sens

4. **Competition Evolution** - PIERDUTĂ
   - Luna 1: 21 competitori, 1 nou, 0 closed
   - Luna 2: Regenerat de la zero (poate genera 23, 18, sau 21)
   - **Impact:** Market share inconsistent

5. **Marketing ROI** - PIERDUT
   - Luna 1: Ai cheltuit $1000 marketing, achiziționat 50 clienți prin social media
   - Luna 2: Nu există istoric că marketing-ul a funcționat
   - **Impact:** Decisions fără feedback loop

### 🔧 **Locul unde se pierde contextul:**

**Fișier:** `frontend/src/pages/Dashboard.tsx`

**Linia 167-172:**
```typescript
previousMonthState: {
  revenue: 0,  // ❌ Ar trebui: previousOutputs.financialData.profit_loss.revenue
  profit: 0,   // ❌ Ar trebui: previousOutputs.financialData.profit_loss.net_profit
  customers: 0, // ❌ Ar trebui: previousOutputs.customerData.total_active_customers
  cashBalance: businessData.budget // ❌ Ar trebui: cashBalance (state)
}
```

**Problema:** Se resetează la `0` de fiecare dată!

### ✅ **Cum ar trebui să funcționeze contextul lunar:**

#### **Schema Corectă:**

**Frontend state:**
```typescript
const [monthHistory, setMonthHistory] = useState<MonthlyOutput[]>([])

interface MonthlyOutput {
  month: number
  year: number
  outputs: {
    marketContext: {...}
    customerData: {...}
    employeeData: {...}
    competitionData: {...}
    supplierData: {...}
    financialData: {...}
  }
}
```

**La fiecare simulare:**
```typescript
// AFTER simulation success
setMonthHistory(prev => [...prev, {
  month: currentMonth,
  year: currentYear,
  outputs: data.outputs
}])
```

**Next month input:**
```typescript
const lastMonth = monthHistory[monthHistory.length - 1]

previousMonthState: {
  revenue: lastMonth?.outputs.financialData.profit_loss.revenue || 0,
  profit: lastMonth?.outputs.financialData.profit_loss.net_profit || 0,
  customers: lastMonth?.outputs.customerData.total_active_customers || 0,
  cashBalance: cashBalance,
  
  // ADD THESE:
  customerSegments: lastMonth?.outputs.customerData.customer_segments || [],
  employeeState: {
    count: lastMonth?.outputs.employeeData.total_employees || 3,
    morale: lastMonth?.outputs.employeeData.morale || 50,
    productivity: lastMonth?.outputs.employeeData.productivity_score || 50
  },
  competitorCount: lastMonth?.outputs.competitionData.total_competitors || 0,
  supplierRelationships: lastMonth?.outputs.supplierData.supplier_reliability_score || 50
}
```

---

## 5. PROBLEME IDENTIFICATE

### 🔴 **CRITICE:**

1. **Context Lunar Aproape Inexistent**
   - Doar 4 valori se transmit între luni (revenue, profit, customers, cash)
   - Toate celelalte outputs (customer segments, employee morale, supplier reliability, competition state) se pierd
   - **Fix:** Adaugă `previousMonthOutputs` complet în request

2. **Customer Agent nu primește Previous Segments**
   - Nu poate calcula churn corect
   - Nu poate segmenta consistent
   - **Fix:** Trimite `previousMonthState.customerSegments` și actualizează agent prompt

3. **Employee Agent Pure Math fără Memorie**
   - Morale și productivity se recalculează de la zero
   - Nu există progression sau deterioration
   - **Fix:** Transmite previous employee state și calculează delta

4. **Competition Count Volatile**
   - Poate varia dramatic lună de lună fără logică
   - **Fix:** Transmite previous count și lasă LLM să facă +/- changes

### 🟡 **MEDII:**

5. **Google Trends Optional**
   - Dacă API-ul dă eroare, trends agent primește fallback
   - **Impact:** Lipsă insight pentru decisions
   - **Fix:** Cache trends data pentru fallback

6. **Survival Data nu se folosește**
   - `survivalData: null` mereu în request
   - Există în DB dar nu se fetch-uiește
   - **Fix:** Backend să returneze survival data pentru county + industry

7. **Revenue Calculation Hardcoded**
   - `avgVisitFrequency = 4` hardcoded în `run-full/route.ts`
   - Ar trebui să vină din customer agent sau să fie dinamic
   - **Fix:** Customer agent să genereze visit frequency sau să fie bazat pe business type

### 🟢 **MINORE:**

8. **Temperature inconsistentă**
   - Market context: 0.3 (deterministic)
   - Events: 0.9 (creative)
   - Competition: 0.5 (balanced)
   - **Impact:** Events prea random, competition too varied
   - **Sugestie:** Uniformizează la 0.4-0.5 pentru consistență

9. **Schema validation nu include toate câmpurile**
   - Customer agent generează `visit_frequency` și `avg_transaction` (în error log)
   - Dar schema nu le include
   - **Status:** FIXED în documentul anterior (am eliminat din prompt)

10. **No Persistence în Orchestrator**
    - Outputs nu se salvează nicăieri
    - Frontend ține tot în memory/state
    - **Risc:** Page refresh = pierdere totală
    - **Fix:** Backend să salveze simulation history în PostgreSQL

---

## 6. FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌────────────┐    ┌─────────────┐    ┌──────────────┐         │
│  │ Onboarding │───▶│  Dashboard  │───▶│ Simulation   │         │
│  │  (Step 1)  │    │   (Step 2)  │    │   Results    │         │
│  └────────────┘    └─────────────┘    └──────────────┘         │
│         │                 │                                       │
│         │                 │                                       │
│         ▼                 ▼                                       │
└─────────┼─────────────────┼───────────────────────────────────────┘
          │                 │
          │                 │
          │                 │  ┌─────────────────────────────────┐
          │                 └─▶│  GET /api/get-area/{id}         │
          │                    │  GET /api/get-trends            │
          │                    │  POST /api/simulation/run-full  │
          │                    └─────────────────────────────────┘
          │                                │
          │                                │
          ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI - Python)                    │
│                                                                   │
│  POST /api/launch-business                                       │
│    │                                                              │
│    ├─▶ census_service.py ─────▶ US Census API                   │
│    ├─▶ detailed_analysis_service.py ─▶ US Census API            │
│    ├─▶ business_survival_service.py ─▶ PostgreSQL (read)        │
│    │                                                              │
│    └─▶ INSERT into area_overview                                │
│        INSERT into detailed_area_analysis                        │
│                                                                   │
│  GET /api/get-area/{id}                                          │
│    └─▶ SELECT from area_overview + detailed_area_analysis       │
│                                                                   │
│  POST /api/get-trends                                            │
│    └─▶ trends_service.py ─────▶ Google Trends API (pytrends)   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                                   │
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│             AGENTS ORCHESTRATOR (Next.js - TypeScript)           │
│                                                                   │
│  POST /api/simulation/run-full                                   │
│    │                                                              │
│    ├─ PHASE 1: Market Context                                   │
│    │   └─▶ market-context-agent.ts ───▶ OpenAI GPT-4o-mini      │
│    │                                                              │
│    ├─ PHASE 2: External Analysis (PARALLEL)                     │
│    │   ├─▶ events-agent.ts ───────────▶ OpenAI GPT-4o           │
│    │   └─▶ trends-agent.ts ───────────▶ OpenAI GPT-4o           │
│    │                                                              │
│    ├─ PHASE 3: Market Dynamics (PARALLEL)                       │
│    │   ├─▶ supplier-agent.ts ─────────▶ OpenAI GPT-4o-mini      │
│    │   ├─▶ competition-agent.ts ──────▶ OpenAI GPT-4o-mini      │
│    │   └─▶ employee-agent.ts ─────────▶ Pure Math (no LLM)      │
│    │                                                              │
│    ├─ PHASE 4: Customer Simulation                              │
│    │   └─▶ customer-behavior-agent.ts ▶ OpenAI GPT-4o-mini      │
│    │                                                              │
│    └─ PHASE 5: Financial Analysis                               │
│        └─▶ financial-agent.ts ────────▶ Pure Math (no LLM)      │
│                                                                   │
│  Returns: All agent outputs + execution times                    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                                   │
                                   │
                                   ▼
                         ┌─────────────────┐
                         │  OpenAI API     │
                         │  (GPT-4o-mini,  │
                         │   GPT-4o)       │
                         └─────────────────┘
```

---

## 7. DATABASE SCHEMA

```sql
┌──────────────────────────────────────────────────────────────┐
│                        PostgreSQL                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ area_overview                                        │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ id (PK)                                              │    │
│  │ latitude, longitude                                  │    │
│  │ state_fips, county_fips, tract_fips                 │    │
│  │ total_population                                     │    │
│  │ median_household_income                              │    │
│  │ median_age                                           │    │
│  │ poverty_rate                                         │    │
│  │ total_workforce                                      │    │
│  │ ... (20+ more fields)                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                     │
│                          │ 1:1                                │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ detailed_area_analysis                               │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ id (PK)                                              │    │
│  │ area_overview_id (FK) ───────────────────┐          │    │
│  │ latitude, longitude                        │          │    │
│  │ block_fips                                 │          │    │
│  │ households_150k_199k                       │          │    │
│  │ households_200k_plus                       │          │    │
│  │ high_income_households_rate                │          │    │
│  │ work_from_home_rate                        │          │    │
│  │ bachelor_plus_rate                         │          │    │
│  │ raw_demographics_json (JSONB)              │          │    │
│  │ ... (30+ more fields)                      │          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ business_survival (Read-Only, Pre-populated)         │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ id (PK)                                              │    │
│  │ county_name (ex: "New York County, New York")       │    │
│  │ naics_code (ex: "72" = Food Services)               │    │
│  │ naics_industry_label                                 │    │
│  │ firms_2017_start_pool                                │    │
│  │ aggregate_5_year_survival_pct                        │    │
│  └─────────────────────────────────────────────────────┘    │
│      ▲                                                        │
│      │ Populated by: populate_business_survival.py           │
│      │ Source: ny_bds_aggregate_5_year_survival.csv         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. REZUMAT EXECUTIV

### ✅ **Ce funcționează bine:**
1. **Arhitectura multi-agent** - separare clară a responsabilităților
2. **Paralelizare** - Phase 2 și 3 rulează concurent (economisește 3-4s)
3. **Pure math agents** - Employee și Financial foarte rapide (0.01s)
4. **Census data integration** - Date reale, comprehensive

### ❌ **Ce NU funcționează:**
1. **Context lunar aproape absent** - doar 4 valori se transmit
2. **Nicio persistență** - refresh page = pierdere totală
3. **Customer segments volatili** - regenerați complet fiecare lună
4. **Revenue calculation simplificată** - hardcoded visit frequency
5. **Survival data neutilizată** - există dar nu se trimite către agenți

### 🔧 **Prioritizare Fix-uri:**

**P0 (CRITICAL):**
1. Implementează `monthHistory` în frontend (salvează toate outputs)
2. Transmite `previousMonthOutputs` complet în next month request
3. Actualizează agenți să proceseze previous state (Customer, Employee, Competition)

**P1 (HIGH):**
4. Adaugă persistență în backend (simulation_runs table)
5. Include survival data în requests (fetch din backend)
6. Fix revenue calculation (dynamic visit frequency)

**P2 (MEDIUM):**
7. Uniformizează temperature settings
8. Cache Google Trends pentru fallback
9. Add validation pentru dramatic changes între luni

---

**Autor:** AI Analysis System  
**Data:** 2024-11-16  
**Versiune:** 1.0  
**Status:** ✅ COMPLET - GATA PENTRU IMPLEMENTARE FIX-URI
