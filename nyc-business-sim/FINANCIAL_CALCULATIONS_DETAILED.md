# 💰 ANALIZA DETALIATĂ - CALCULE FINANCIARE & STATE MANAGEMENT

## 📋 CUPRINS
1. [Calculul Revenue (Venituri)](#1-revenue-venituri)
2. [Calculul Costs (Costuri)](#2-costs-costuri)
3. [Calculul Cash Flow](#3-cash-flow)
4. [Calculul Profit Margin](#4-profit-margin)
5. [Customer Metrics](#5-customer-metrics)
6. [Employee Metrics](#6-employee-metrics)
7. [Supply Chain Costs](#7-supply-chain-costs)
8. [Versatilitate & Context](#8-versatilitate--context)
9. [Propunere State Management](#9-propunere-state-management)

---

## 1. REVENUE (VENITURI)

### 📊 **Formula Actuală (SIMPLIFICATĂ - PROBLEMĂ!):**

**Locație:** `agents-orchestrator/app/api/simulation/run-full/route.ts` (linia 195-202)

```typescript
// STEP 1: Calculate weighted average spend per customer
const avgSpend = customerData.customer_segments.reduce((sum, seg) => {
  return sum + (seg.avg_spend * seg.size);
}, 0) / (customerData.total_active_customers || 1);

// STEP 2: Hardcoded visit frequency (PROBLEMATIC!)
const avgVisitFrequency = 4;  // ❌ ACELAȘI pentru toate business-urile!

// STEP 3: Calculate total revenue
totalRevenue = total_active_customers × avgSpend × avgVisitFrequency
```

### 🔢 **Exemplu Numeric:**

**Luna 1 - Coffee Shop:**
```
Customer Segments:
  - Office Workers: 100 clienți × $8/visit = $800
  - Tourists: 50 clienți × $12/visit = $600
  - Residents: 30 clienți × $6/visit = $180
  
Total Active Customers: 180
Weighted Avg Spend: (800 + 600 + 180) / 180 = $8.78

Visit Frequency: 4 (hardcoded)

Total Revenue = 180 × $8.78 × 4 = $6,321
```

### ❌ **PROBLEME IDENTIFICATE:**

1. **Visit Frequency Hardcoded la 4**
   - Coffee shop ar trebui ~20-25 vizite/lună (zilnic sau aproape)
   - Restaurant ar trebui ~2-4 vizite/lună
   - Gym ar trebui ~12-16 vizite/lună
   - Salon ar trebui ~1-2 vizite/lună

2. **Nu Variază pe Luni**
   - Luna 1 = 4 vizite
   - Luna 6 = tot 4 vizite (fără loyalty growth)

3. **Nu Ține Cont de Seasonal Demand**
   - Customer agent generează `seasonal_demand.adjustment` (ex: -10% iarnă)
   - Dar **NU se folosește nicăieri!**

### ✅ **SOLUȚIE PROPUSĂ:**

```typescript
// STEP 1: Business-specific visit frequency
function getBaseVisitFrequency(businessType: string): number {
  const type = businessType.toLowerCase();
  
  if (type.includes('coffee') || type.includes('cafe')) {
    return 22; // ~Daily visits
  } else if (type.includes('restaurant')) {
    return 3; // Few times per month
  } else if (type.includes('gym')) {
    return 14; // ~3-4x per week
  } else if (type.includes('salon')) {
    return 1.5; // Every 3-4 weeks
  } else if (type.includes('retail') || type.includes('boutique')) {
    return 2; // Occasional
  }
  
  return 4; // Default
}

// STEP 2: Apply seasonal adjustment
const baseFrequency = getBaseVisitFrequency(businessType);
const seasonalMultiplier = 1 + (customerData.seasonal_demand.adjustment / 100);
const adjustedFrequency = baseFrequency * seasonalMultiplier;

// STEP 3: Apply loyalty boost (returning customers visit more often)
const returningRate = customerData.returning_customers / customerData.total_active_customers;
const loyaltyBoost = 1 + (returningRate * 0.2); // +20% max for high retention
const finalFrequency = adjustedFrequency * loyaltyBoost;

// STEP 4: Calculate revenue
const totalRevenue = customerData.total_active_customers 
                   × avgSpend 
                   × finalFrequency;
```

**Exemplu cu Soluția:**
```
Coffee Shop, Luna 1 (Ianuarie - Iarnă):
- Base frequency: 22 visits/month
- Seasonal adjustment: -10% → 22 × 0.9 = 19.8 visits
- Returning rate: 0% (first month) → no loyalty boost
- Final frequency: 19.8 visits
- Revenue: 180 × $8.78 × 19.8 = $31,265

Coffee Shop, Luna 6 (Iunie - Vară):
- Base frequency: 22 visits/month
- Seasonal adjustment: +5% → 22 × 1.05 = 23.1 visits
- Returning rate: 75% → loyalty boost 1.15
- Final frequency: 23.1 × 1.15 = 26.6 visits
- Revenue: 320 × $9.20 × 26.6 = $78,323
```

### 🎯 **Factori care Influențează Revenue:**

| Factor | Sursă | Impact | Variază Lunar? |
|--------|-------|--------|----------------|
| **Total Active Customers** | Customer Agent (LLM) | Direct × | ✅ Da (churn + acquisition) |
| **Avg Spend per Visit** | Customer Agent (LLM) | Direct × | ✅ Da (segmentation changes) |
| **Visit Frequency** | Hardcoded (ACUM) / Business Type (PROPUS) | Direct × | ❌ Nu / ✅ Da (propus) |
| **Seasonal Demand** | Customer Agent (LLM) | Multiplier | ✅ Da (vară/iarnă) |
| **Pricing Strategy** | Player Decision | Influențează avg_spend | ✅ Da (player control) |
| **Marketing Spend** | Player Decision | Influențează new customers | ✅ Da (player control) |
| **Quality Level** | Player Decision | Influențează loyalty + avg_spend | ✅ Da (player control) |
| **Competition** | Competition Agent (LLM) | Influențează customers | ✅ Da (market changes) |
| **Events** | Events Agent (LLM) | Influențează customers | ✅ Da (random events) |
| **Trends** | Trends Agent (LLM) | Influențează customers | ✅ Da (market trends) |

**Versatilitate Actuală:** 🟡 **MEDIE** (6/10 factori variază lunar, dar visit frequency e static)

**Versatilitate Propusă:** 🟢 **MARE** (10/10 factori variază lunar sau dinamic)

---

## 2. COSTS (COSTURI)

### 💸 **Formula Actuală:**

**Locație:** `agents-orchestrator/lib/simulation_agents/financial-agent.ts`

```typescript
totalCosts = laborCost 
           + inventoryCost 
           + rentCost 
           + utilitiesCost 
           + marketingCost 
           + otherCosts
```

### 📋 **Breakdown Detaliat:**

#### 2.1 **LABOR COST** (Cost Angajați)

**Sursă:** Employee Agent (Pure Math)

**Formula:**
```typescript
num_employees = playerDecisions.target_employee_count  // Ex: 3
salary_per_employee = playerDecisions.avg_hourly_wage × 160  // Ex: $20/h × 160h = $3,200
total_salaries = num_employees × salary_per_employee  // 3 × $3,200 = $9,600
```

**Factori de Influență:**

| Factor | Variază Lunar? | Impact |
|--------|----------------|--------|
| Număr angajați | ✅ Da (player decision) | Direct × |
| Salary per employee | ✅ Da (player decision) | Direct × |
| Median income (zonă) | ❌ Nu (static from Census) | Indirect (influențează morale) |

**Versatilitate:** 🟢 **MARE** - Player controlează complet

**Exemplu Evolutiv:**
```
Luna 1: 3 angajați × $3,200 = $9,600
Luna 3: Busy season, hire +1 → 4 × $3,200 = $12,800
Luna 6: Revenue grew, raise wages → 4 × $3,500 = $14,000
Luna 9: Slow season, reduce -1 → 3 × $3,500 = $10,500
```

---

#### 2.2 **INVENTORY COST** (Cost Mărfuri/COGS)

**Sursă:** Supplier Agent (LLM)

**Formula:**
```typescript
// STEP 1: Estimate baseline percentage
inventoryPercentage = getInventoryPercentage(businessType)
// Coffee shop: 35%
// Restaurant: 32%
// Retail: 50%
// Services: 15%

// STEP 2: Estimate based on revenue
estimatedRevenue = previousMonthState.revenue || 50000 (default)
baseInventoryCost = estimatedRevenue × inventoryPercentage

// STEP 3: LLM refines estimate
const result = await generateObject({
  model: 'gpt-4o-mini',
  prompt: `Refine inventory cost estimate:
    - Business: Coffee Shop
    - Estimated Revenue: $50,000
    - Baseline Inventory: $17,500 (35%)
    - Season: January (Winter)
    - Supplier reliability: ???
    
    Adjust based on:
    - Seasonal pricing (winter → cheaper dairy?)
    - Supplier relationships
    - Bulk purchasing opportunities
  `
})

// STEP 4: LLM returns refined cost
inventoryCost = result.estimated_monthly_costs.inventory  // Ex: $15,800
```

**Factori de Influență:**

| Factor | Variază Lunar? | Impact |
|--------|----------------|--------|
| Business Type | ❌ Nu | Determină % COGS |
| Previous Revenue | ✅ Da | Bază de calcul |
| Seasonal Pricing | ✅ Da (LLM) | Multiplier ±5-15% |
| Supplier Reliability | ✅ Da (LLM) | Influențează preț |
| Bulk Negotiations | ✅ Da (LLM) | Discount posibil |

**Versatilitate:** 🟢 **MARE** - LLM ajustează dinamic

**Exemplu Evolutiv:**
```
Luna 1 (Iarnă): Revenue $6,000 → Inventory $2,100 (35%, dairy cheaper -10%)
Luna 3 (Primăvară): Revenue $15,000 → Inventory $5,400 (36%, produce up +5%)
Luna 6 (Vară): Revenue $78,000 → Inventory $24,180 (31%, bulk discount -10%)
Luna 12: Revenue $95,000 → Inventory $28,500 (30%, loyal supplier -15%)
```

**❌ PROBLEMĂ:** Inventorul e calculat pe `previousRevenue`, dar previousRevenue e setat la 0! Deci prima lună folosește default $50,000 → inventory greșit.

---

#### 2.3 **RENT COST** (Chirie)

**Sursă:** Constants (Hardcoded)

**Formula:**
```typescript
function calculateMonthlyRent(businessType: string, county: string): number {
  // STEP 1: Get square footage for business type
  const sqFt = TYPICAL_BUSINESS_SIZES[businessType] || 1500;
  // Coffee shop: 1200 sq ft
  // Restaurant: 2500 sq ft
  // Gym: 5000 sq ft
  
  // STEP 2: Get price per sq ft for county
  const pricePerSqFt = RENT_PER_SQ_FT_NYC[county] || 67;
  // Manhattan: $120/sq ft/year
  // Brooklyn: $65/sq ft/year
  // Queens: $55/sq ft/year
  
  // STEP 3: Calculate annual rent, convert to monthly
  const annualRent = sqFt × pricePerSqFt;
  const monthlyRent = annualRent / 12;
  
  return monthlyRent;
}

// Exemplu: Coffee Shop în Manhattan
sqFt = 1200
pricePerSqFt = 120
annualRent = 1200 × 120 = $144,000
monthlyRent = $144,000 / 12 = $12,000
```

**Factori de Influență:**

| Factor | Variază Lunar? | Impact |
|--------|----------------|--------|
| Business Type | ❌ Nu | Determină sqFt |
| County | ❌ Nu | Determină $/sqft |
| Market trends | ❌ Nu (static) | N/A |

**Versatilitate:** 🔴 **SCĂZUTĂ** - Complet static, nicio variație

**❌ PROBLEME:**

1. **Chiria nu crește niciodată** (inflație, contract renewal)
2. **Nu poți negocia** chirie mai mică
3. **Nu poți muta** în spațiu mai mic/mare

**✅ SOLUȚIE PROPUSĂ:**

```typescript
interface RentState {
  baseCost: number;
  contractStartMonth: number;
  negotiatedDiscount: number; // 0-20%
  squareFeet: number;
}

// Luna 1: Sign initial lease
rentState = {
  baseCost: 12000,
  contractStartMonth: 1,
  negotiatedDiscount: 0,
  squareFeet: 1200
}
monthlyRent = 12000

// Luna 13: Contract renewal (annual)
// If financialHealth > 80: landlord increases +3%
// If financialHealth < 40: negotiate -5% or risk eviction
rentState.baseCost = 12000 × 1.03 = 12360
rentState.negotiatedDiscount = 5
monthlyRent = 12360 × 0.95 = 11742

// Luna 20: Business growing, expand space
rentState.squareFeet = 1500 (+300 sqft)
rentState.baseCost = 1500 × 120 / 12 = 15000
monthlyRent = 15000
```

---

#### 2.4 **UTILITIES COST** (Utilități)

**Sursă:** Supplier Agent (LLM)

**Formula Actuală:**
```typescript
// În supplier-agent.ts
const monthlyRent = calculateMonthlyRent(...);
const estimatedUtilities = monthlyRent × 0.04;  // 4% of rent

// LLM poate ajusta
const result = await generateObject({
  prompt: `Estimate utilities for:
    - Business: Coffee Shop
    - Rent: $12,000
    - Baseline: $480 (4%)
    - Season: January (Winter - heating costs)
    
    Adjust for seasonal factors.
  `
})

utilitiesCost = result.estimated_monthly_costs.utilities  // Ex: $650
```

**Factori de Influență:**

| Factor | Variază Lunar? | Impact |
|--------|----------------|--------|
| Rent (base) | ❌ Nu (static) | Bază de calcul |
| Season | ✅ Da (LLM) | ±20-50% (iarnă/vară) |
| Business Type | ✅ Da (LLM) | Ex: Gym = higher AC costs |
| Energy efficiency | ❌ Nu (nu există în sistem) | N/A |

**Versatilitate:** 🟡 **MEDIE** - Variază sezonier prin LLM

**Exemplu Evolutiv:**
```
Luna 1 (Ianuarie): Rent $12,000 → Utilities $650 (heating)
Luna 4 (Aprilie): Rent $12,000 → Utilities $480 (mild weather)
Luna 7 (Iulie): Rent $12,000 → Utilities $720 (AC blast)
Luna 10 (Octombrie): Rent $12,000 → Utilities $500 (moderate)
```

---

#### 2.5 **MARKETING COST** (Marketing)

**Sursă:** Player Decision

**Formula:**
```typescript
marketingCost = playerDecisions.marketing_spend  // Ex: $1,000
```

**Factori de Influență:**

| Factor | Variază Lunar? | Impact |
|--------|----------------|--------|
| Player budget allocation | ✅ Da | Direct × |
| ROI from prev month | ❌ Nu (nu se trackuiește) | N/A |

**Versatilitate:** 🟢 **MARE** - Player control complet

**❌ PROBLEMĂ:** Nu există tracking de ROI!

**Exemplu Actual:**
```
Luna 1: Marketing $1,000 → Acquired 50 customers via social media
Luna 2: Marketing $1,000 → Acquired ??? (nu știi dacă a funcționat)
```

**✅ SOLUȚIE:** Track acquisition channels și cost per customer

```typescript
// Din customer agent output
acquisition_channels: [
  { channel: "social_media", customers: 50, cost_per_customer: 20 },
  { channel: "paid_ads", customers: 30, cost_per_customer: 33 }
]

// Calculate actual marketing cost used
actualMarketingCost = (50 × 20) + (30 × 33) = $1,990

// If player allocated $1,000 but cost was $1,990:
// - Either: reduce customers acquired
// - Or: player needs to increase budget
```

---

#### 2.6 **OTHER COSTS** (Altele)

**Sursă:** Hardcoded

**Formula:**
```typescript
otherOperatingCosts = 500  // ❌ HARDCODED la $500 mereu!
```

**Ce Include:**
- Insurance
- Licenses & Permits
- Accounting/Legal
- Cleaning/Maintenance
- POS system fees
- Bank fees

**Versatilitate:** 🔴 **ZERO** - Complet static

**✅ SOLUȚIE:**

```typescript
function calculateOtherCosts(
  businessType: string,
  revenue: number,
  employees: number
): number {
  // Base insurance: $200-500/month
  const insurance = 200 + (employees × 50);
  
  // Licenses/permits: $100/month
  const licenses = 100;
  
  // Accounting: 1% of revenue
  const accounting = revenue × 0.01;
  
  // POS/software: $50-200/month
  const software = businessType.includes('restaurant') ? 200 : 100;
  
  // Cleaning/maintenance: 0.5% of revenue
  const maintenance = revenue × 0.005;
  
  return insurance + licenses + accounting + software + maintenance;
}

// Exemplu: Coffee shop, $30,000 revenue, 3 employees
otherCosts = 350 + 100 + 300 + 100 + 150 = $1,000
```

---

### 📊 **REZUMAT COSTS:**

| Cost Category | Valoare Luna 1 | Variază Lunar? | Versatilitate | Sursă |
|---------------|-----------------|----------------|---------------|-------|
| **Labor** | $9,600 | ✅ Da | 🟢 MARE | Player + Math |
| **Inventory** | $2,100 | ✅ Da | 🟢 MARE | LLM (seasonal) |
| **Rent** | $12,000 | ❌ Nu | 🔴 SCĂZUTĂ | Hardcoded |
| **Utilities** | $650 | ✅ Da | 🟡 MEDIE | LLM (seasonal) |
| **Marketing** | $1,000 | ✅ Da | 🟢 MARE | Player |
| **Other** | $500 | ❌ Nu | 🔴 ZERO | Hardcoded |
| **TOTAL** | **$25,850** | ✅ Parțial | 🟡 MEDIE | Mix |

**Total Costs Variability:** ~60% (4/6 categorii variază)

---

## 3. CASH FLOW

### 💵 **Formula (SIMPLĂ - CORECTĂ!):**

**Locație:** `financial-agent.ts`

```typescript
// STEP 1: Opening balance (from previous month)
openingBalance = previousMonthState.cashBalance

// STEP 2: Cash IN (revenue only)
cashIn = totalRevenue

// STEP 3: Cash OUT (all costs)
cashOut = totalCosts

// STEP 4: Closing balance
closingBalance = openingBalance + cashIn - cashOut

// STEP 5: Burn rate (negative cash flow)
burnRate = cashOut - cashIn  // Pozitiv = burning cash
```

### 🔢 **Exemplu Numeric Evolutiv:**

**LUNA 1:**
```
Opening Balance: $100,000 (initial investment)
Cash IN: $6,321 (revenue)
Cash OUT: $25,850 (costs)
Closing Balance: $100,000 + $6,321 - $25,850 = $80,471
Burn Rate: $25,850 - $6,321 = $19,529/month
Cash Runway: $80,471 / $19,529 = 4.1 months
```

**LUNA 2:**
```
Opening Balance: $80,471 (previous closing)
Cash IN: $12,500 (customers growing)
Cash OUT: $26,100 (costs similar)
Closing Balance: $80,471 + $12,500 - $26,100 = $66,871
Burn Rate: $26,100 - $12,500 = $13,600/month (improving!)
Cash Runway: $66,871 / $13,600 = 4.9 months
```

**LUNA 6:**
```
Opening Balance: $45,000
Cash IN: $78,323 (summer boost!)
Cash OUT: $35,200 (more inventory, hired +1 employee)
Closing Balance: $45,000 + $78,323 - $35,200 = $88,123
Burn Rate: $35,200 - $78,323 = -$43,123 (PROFITABLE! Negative burn)
Cash Runway: 999 months (infinite - making money)
```

### 🎯 **Factori care Influențează Cash Flow:**

| Factor | Impact pe Cash | Controlabil? |
|--------|----------------|--------------|
| **Revenue Growth** | ⬆️ Cash IN | ✅ Partial (marketing, quality) |
| **Cost Control** | ⬇️ Cash OUT | ✅ Da (wages, marketing) |
| **Seasonal Trends** | ↕️ Both | ❌ Nu (exogen) |
| **Competition** | ⬇️ Cash IN | ❌ Nu (exogen) |
| **Events** | ↕️ Cash IN | ❌ Nu (random) |
| **Initial Capital** | ⬆️ Opening Balance | ✅ Da (onboarding) |

**Versatilitate:** 🟢 **EXCELENTĂ** - Reflectă dinamic toate schimbările

---

## 4. PROFIT MARGIN

### 📈 **Formula:**

```typescript
// P&L Components
revenue = totalRevenue
COGS = inventoryCost
grossProfit = revenue - COGS

operatingExpenses = laborCost + rentCost + utilitiesCost 
                  + marketingCost + otherCosts

netProfit = revenue - totalCosts  // sau: grossProfit - operatingExpenses

// Profit Margin (percentage)
profitMargin = (netProfit / revenue) × 100

// Handle edge case
if (revenue === 0) profitMargin = 0
```

### 🔢 **Exemplu Evolutiv:**

**LUNA 1: PIERDERE**
```
Revenue: $6,321
COGS: $2,100
Gross Profit: $4,221 (67% margin)

Operating Expenses:
  Labor: $9,600
  Rent: $12,000
  Utilities: $650
  Marketing: $1,000
  Other: $500
  Total OpEx: $23,750

Net Profit: $6,321 - $25,850 = -$19,529
Profit Margin: (-$19,529 / $6,321) × 100 = -309%
```

**LUNA 6: PROFITABIL**
```
Revenue: $78,323
COGS: $24,180
Gross Profit: $54,143 (69% margin - improved with bulk discount)

Operating Expenses:
  Labor: $14,000 (hired +1, raised wages)
  Rent: $12,000
  Utilities: $720 (summer AC)
  Marketing: $2,000 (doubled budget)
  Other: $500
  Total OpEx: $29,220

Net Profit: $78,323 - $53,400 = $24,923
Profit Margin: ($24,923 / $78,323) × 100 = 31.8%
```

### 🎯 **Factori care Influențează Profit Margin:**

| Factor | Impact | Variază Lunar? |
|--------|--------|----------------|
| **Pricing Strategy** | ⬆️ Revenue | ✅ Da (player) |
| **COGS %** | ⬇️ Gross Margin | ✅ Da (supplier negotiations) |
| **Labor Efficiency** | ⬇️ OpEx | ✅ Da (productivity) |
| **Customer Volume** | ⬆️ Revenue (scale) | ✅ Da (marketing, trends) |
| **Fixed Costs** (rent) | ⬇️ Margin | ❌ Nu (static) |

**Versatilitate:** 🟢 **MARE** - 4/5 factori variază

---

## 5. CUSTOMER METRICS

### 👥 **Metrici Calculați de Customer Agent (LLM):**

```typescript
// OUTPUT del Customer Agent
{
  total_potential_customers: 2125,
  new_customers_acquired: 180,
  returning_customers: 0,
  churned_customers: 0,
  total_active_customers: 180,
  
  customer_segments: [
    { segment_name: "Office Workers", size: 100, avg_spend: 8, loyalty: 70 },
    { segment_name: "Tourists", size: 50, avg_spend: 12, loyalty: 30 },
    { segment_name: "Residents", size: 30, avg_spend: 6, loyalty: 85 }
  ],
  
  acquisition_channels: [
    { channel: "walk_by", customers: 80, cost_per_customer: 0 },
    { channel: "social_media", customers: 50, cost_per_customer: 15 },
    { channel: "word_of_mouth", customers: 30, cost_per_customer: 0 },
    { channel: "paid_ads", customers: 20, cost_per_customer: 50 }
  ],
  
  loyalty_rate: 68,
  churn_rate: 0,
  avg_customer_lifetime_value: 450,
  
  behavioral_insights: [
    "Event impact increased foot traffic",
    "Premium demographics support higher prices",
    "Tourist traffic volatile but profitable"
  ],
  
  seasonal_demand: {
    adjustment: -5,
    reasoning: "Winter decreases walk-by traffic slightly"
  }
}
```

### 🔢 **Cum se Calculează (în LLM Prompt):**

**LUNA 1 (Starting):**
```
Previous Customers: 0
Potential Market: 2,125 (25% of 8,500 population)

CHURN:
  churned = previous × churn_rate = 0 × 0.15 = 0

NEW ACQUISITION:
  Base rate: population × business_type_rate = 8500 × 0.025 = 213
  
  Adjustments:
    + Marketing boost: $1000 → +15% = +32 customers
    + Event impact: +12% = +26 customers
    + Trend momentum: +45 score → +20% = +43 customers
    - Competition: 21 competitors → -25% = -53 customers
    - Saturation: 72% → -15% = -32 customers
  
  new_customers_acquired = 213 + 32 + 26 + 43 - 53 - 32 = 229
  
  Cap at realistic: min(229, 180) = 180 (LLM judgment)

RETURNING:
  returning = previous - churned = 0 - 0 = 0

TOTAL ACTIVE:
  total = new + returning = 180 + 0 = 180
```

**LUNA 2 (Growth):**
```
Previous Customers: 180
Potential Market: 2,125

CHURN:
  Base churn: 15%
  Adjustments:
    - High quality: -3%
    - Competitive pricing: neutral
    - Good morale (employees): -2%
  
  churn_rate = 10%
  churned = 180 × 0.10 = 18

NEW ACQUISITION:
  Similar process as Luna 1
  new_customers_acquired = 145

RETURNING:
  returning = 180 - 18 = 162

TOTAL ACTIVE:
  total = 145 + 162 = 307
```

### 🎯 **Versatilitate Customers:**

| Metric | Variază Lunar? | Factori |
|--------|----------------|---------|
| **New Customers** | ✅ Da | Marketing, events, trends, competition, saturation |
| **Churn** | ✅ Da | Quality, pricing, competition, morale |
| **Returning** | ✅ Da | Previous total - churn |
| **Segments** | ⚠️ Nu (LLM regenerează) | Demographics (static), spending patterns |
| **Loyalty Rate** | ✅ Da | Quality, experience, competition |
| **CLV** | ✅ Da | Avg spend × loyalty × expected months |

**PROBLEMĂ:** Customer segments se regenerează complet fiecare lună (nu evoluează)

---

## 6. EMPLOYEE METRICS

### 👔 **Formule (PURE MATH - Foarte Bine Documentat!):**

#### 6.1 **Total Salaries:**
```typescript
total_salaries = num_employees × salary_per_employee

// Exemplu
num_employees = 3
salary_per_employee = $3,200
total_salaries = 3 × $3,200 = $9,600
```

#### 6.2 **Productivity Score:**
```typescript
// STEP 1: Calculate ideal workload
CUSTOMERS_PER_EMPLOYEE_PER_DAY = 75
WORKING_DAYS_PER_MONTH = 30
idealMonthlyLoad = 75 × 30 = 2,250 customers/employee/month

// STEP 2: Calculate actual workload
customers_served = 180  // from customer agent
customersPerEmployee = 180 / 3 = 60 customers/employee/month

// STEP 3: Calculate productivity
productivity_score = min(100, (60 / 2250) × 100) = 2.67% → cap la 100
productivity_score = 3  // Very low (starting business)
```

#### 6.3 **Morale:**
```typescript
// COMPONENT 1: Salary Morale (60% weight)
market_median_income = $95,000/year = $7,917/month
salary_per_employee = $3,200/month

salary_fairness = $3,200 / $7,917 = 0.404
salary_morale = min(100, 0.404 × 80) = 32.3

// COMPONENT 2: Workload Morale (40% weight)
workload_ratio = 60 / 2250 = 0.027

if (workload_ratio < 0.8):  // Under-utilized
  workload_morale = 90

// FINAL MORALE
morale = (32.3 × 0.6) + (90 × 0.4) = 19.4 + 36 = 55.4 ≈ 55
```

#### 6.4 **Overworked Status:**
```typescript
workload_ratio = customersPerEmployee / idealLoad
overworked = workload_ratio > 1.2

// Exemplu Luna 1:
workload_ratio = 60 / 2250 = 0.027
overworked = false (way below threshold)

// Exemplu Luna 6 (busy):
customers = 320, employees = 3
workload_ratio = (320/3) / 2250 = 0.047
overworked = false (still not overworked)

// Exemplu Luna 6 (understaffed):
customers = 7200, employees = 3
workload_ratio = (7200/3) / 2250 = 1.07
overworked = false (close but not yet)

customers = 8200, employees = 3
workload_ratio = (8200/3) / 2250 = 1.21
overworked = TRUE (hire more people!)
```

### 🎯 **Versatilitate Employees:**

| Metric | Formula | Variază Lunar? | Factori |
|--------|---------|----------------|---------|
| **Total Employees** | Player input | ✅ Da | Player decision |
| **Total Salaries** | employees × wage | ✅ Da | Player decision |
| **Productivity** | actual/ideal × 100 | ✅ Da | Customers served, employee count |
| **Morale** | salary + workload | ✅ Da | Wage fairness, workload balance |
| **Overworked** | ratio > 1.2 | ✅ Da | Customers vs employees |

**Versatilitate:** 🟢 **EXCELENTĂ** - Toate metricile variază dinamic

**❌ PROBLEMĂ:** Nu există memorie! Morale se resetează fiecare lună (nu există progression/deterioration)

---

## 7. SUPPLY CHAIN COSTS

### 📦 **Calculul Supplier Agent (LLM):**

```typescript
// INPUT
businessType = "Coffee Shop"
currentRevenue = $6,321
currentMonth = 1 (January)

// STEP 1: Calculate baseline costs (in agent code)
monthlyRent = calculateMonthlyRent("Coffee Shop", "New York County")
            = 1200 sqft × $120/sqft/year / 12
            = $12,000

estimatedUtilities = monthlyRent × 0.04 = $480

inventoryPercentage = getInventoryPercentage("Coffee Shop") = 0.35
estimatedInventory = $6,321 × 0.35 = $2,212

// STEP 2: Send to LLM for refinement
prompt = `
Analyze supplier dynamics:
- Business: Coffee Shop
- Revenue: $6,321
- Baseline Costs:
  - Rent: $12,000
  - Utilities: $480
  - Inventory: $2,212

Season: Winter (January)
Location: Manhattan

Refine estimates based on:
1. Seasonal pricing (winter dairy/produce prices)
2. Supplier availability in NYC
3. Negotiation opportunities
4. Quality requirements
`

// STEP 3: LLM Output
{
  supplier_availability: "excellent",
  estimated_monthly_costs: {
    rent: 12000,
    utilities: 650,  // Higher (winter heating)
    inventory: 2100,  // Lower (winter produce discount)
    total: 14750
  },
  price_volatility: "low",
  supplier_reliability_score: 92,
  cost_optimization_tips: [
    "Negotiate bulk coffee bean contracts",
    "Use local dairy suppliers",
    "Install energy-efficient equipment"
  ],
  seasonal_adjustment: {
    adjustment: -5,
    reasoning: "Winter = lower dairy/produce prices"
  }
}
```

### 🎯 **Versatilitate Supply Chain:**

| Cost | Baseline | LLM Adjusts? | Variază Lunar? | Factori |
|------|----------|--------------|----------------|---------|
| **Rent** | Hardcoded | ❌ Nu | ❌ Nu | Business type + County (static) |
| **Utilities** | 4% of rent | ✅ Da | ✅ Da | Season, business type, efficiency |
| **Inventory** | % of revenue | ✅ Da | ✅ Da | Season, supplier relationships, volume |

**Versatilitate:** 🟡 **MEDIE** (2/3 variază, dar rent e static)

---

## 8. VERSATILITATE & CONTEXT

### 📊 **SCORECARD GENERAL:**

| Categorie | Versatilitate | Ține Cont de Context Lunar? | Score |
|-----------|---------------|------------------------------|-------|
| **Revenue** | 🟡 Medie (visit freq static) | ⚠️ Parțial (lipsă seasonal) | 6/10 |
| **Labor Costs** | 🟢 Mare (player control) | ✅ Da (player decisions) | 9/10 |
| **Inventory** | 🟢 Mare (LLM seasonal) | ✅ Da (seasonal + revenue) | 8/10 |
| **Rent** | 🔴 Scăzut (hardcoded) | ❌ Nu (static) | 2/10 |
| **Utilities** | 🟡 Medie (LLM seasonal) | ✅ Da (seasonal) | 7/10 |
| **Marketing** | 🟢 Mare (player control) | ⚠️ Nu (no ROI tracking) | 6/10 |
| **Other Costs** | 🔴 Zero (hardcoded $500) | ❌ Nu (static) | 1/10 |
| **Customers** | 🟢 Mare (multi-factor LLM) | ⚠️ Parțial (segments reset) | 7/10 |
| **Employees** | 🟢 Excelent (pure math) | ⚠️ Nu (no memory) | 7/10 |
| **Cash Flow** | 🟢 Excelent (reflective) | ✅ Da (cumulative) | 10/10 |
| **Profit Margin** | 🟢 Mare (derived) | ✅ Da (toate inputs) | 8/10 |

**OVERALL VERSATILITY SCORE: 6.5/10** 🟡 **MEDIE-MARE**

### ❌ **PROBLEME MAJORE DE CONTEXT:**

1. **Customer Segments se resetează** - Nu evoluează, se regenerează
2. **Employee Morale nu are memorie** - Fiecare lună e recalculat de la zero
3. **Rent niciodată nu se schimbă** - No inflation, negotiations, moves
4. **Visit Frequency hardcoded** - Același pentru toate business-urile
5. **Other Costs static** - $500 mereu, indiferent de scale
6. **Marketing ROI nu se trackuiește** - Nu știi ce a funcționat
7. **Supplier Relationships nu persistă** - Reliability score se pierde

### ✅ **CE FUNCȚIONEAZĂ BINE:**

1. **Cash Flow** - Cumulativ perfect, reflectă toate schimbările
2. **Employee Math** - Formule corecte, actualizare real-time
3. **Customer LLM** - Multi-factor analysis (8+ inputs)
4. **Inventory Seasonal** - LLM ajustează pentru sezoane
5. **Competition Dynamic** - Variază realistic

---

## 9. PROPUNERE STATE MANAGEMENT

### 🗄️ **OPȚIUNEA 1: PostgreSQL Tables (RECOMANDAT)**

#### **Schema Propusă:**

```sql
-- ============================================
-- CORE SIMULATION STATE
-- ============================================

CREATE TABLE simulation_runs (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL,  -- Link to business setup
    area_id INTEGER REFERENCES area_overview(id),
    
    -- Business Info
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    
    -- Timing
    current_month INTEGER NOT NULL,
    current_year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    ended_at TIMESTAMP,
    end_reason VARCHAR(50),  -- 'bankrupt', 'sold', 'user_quit'
    
    -- Initial State
    initial_capital DECIMAL(12,2),
    
    -- Indexes
    CONSTRAINT unique_business_month UNIQUE (business_id, current_year, current_month)
);

CREATE INDEX idx_sim_business ON simulation_runs(business_id);
CREATE INDEX idx_sim_active ON simulation_runs(is_active);


-- ============================================
-- MONTHLY SNAPSHOTS (Complete State)
-- ============================================

CREATE TABLE monthly_states (
    id SERIAL PRIMARY KEY,
    simulation_run_id INTEGER REFERENCES simulation_runs(id) ON DELETE CASCADE,
    
    -- Timing
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    simulated_at TIMESTAMP DEFAULT NOW(),
    execution_time_ms INTEGER,  -- Performance tracking
    
    -- ==========================================
    -- FINANCIAL SNAPSHOT
    -- ==========================================
    
    -- P&L
    revenue DECIMAL(12,2) NOT NULL,
    gross_profit DECIMAL(12,2),
    net_profit DECIMAL(12,2),
    profit_margin DECIMAL(5,2),  -- Percentage
    
    -- Costs Breakdown
    labor_cost DECIMAL(12,2),
    inventory_cost DECIMAL(12,2),
    rent_cost DECIMAL(12,2),
    utilities_cost DECIMAL(12,2),
    marketing_cost DECIMAL(12,2),
    other_costs DECIMAL(12,2),
    total_costs DECIMAL(12,2),
    
    -- Cash Flow
    opening_cash_balance DECIMAL(12,2),
    cash_in DECIMAL(12,2),
    cash_out DECIMAL(12,2),
    closing_cash_balance DECIMAL(12,2),
    burn_rate DECIMAL(12,2),
    cash_runway_months DECIMAL(5,2),
    
    -- Health Metrics
    revenue_growth_rate DECIMAL(5,2),
    profit_growth_rate DECIMAL(5,2),
    financial_health_score INTEGER,  -- 0-100
    
    -- ==========================================
    -- CUSTOMER SNAPSHOT
    -- ==========================================
    
    total_potential_customers INTEGER,
    new_customers_acquired INTEGER,
    returning_customers INTEGER,
    churned_customers INTEGER,
    total_active_customers INTEGER,
    
    loyalty_rate DECIMAL(5,2),
    churn_rate DECIMAL(5,2),
    avg_customer_lifetime_value DECIMAL(10,2),
    
    -- ==========================================
    -- EMPLOYEE SNAPSHOT
    -- ==========================================
    
    total_employees INTEGER,
    new_hires INTEGER,
    resignations INTEGER,
    total_salaries DECIMAL(12,2),
    productivity_score INTEGER,  -- 0-100
    morale_score INTEGER,  -- 0-100
    is_overworked BOOLEAN,
    
    -- ==========================================
    -- MARKET SNAPSHOT
    -- ==========================================
    
    economic_climate VARCHAR(50),
    industry_saturation DECIMAL(5,2),
    market_demand_score INTEGER,
    total_competitors INTEGER,
    pricing_pressure VARCHAR(50),
    
    -- ==========================================
    -- COMPLETE OUTPUTS (JSONB for flexibility)
    -- ==========================================
    
    market_context_output JSONB,
    events_output JSONB,
    trends_output JSONB,
    supplier_output JSONB,
    competition_output JSONB,
    employee_output JSONB,
    customer_output JSONB,
    financial_output JSONB,
    
    -- Alerts
    alerts JSONB,  -- Array of alert strings
    
    -- Indexes
    CONSTRAINT unique_sim_month UNIQUE (simulation_run_id, year, month)
);

CREATE INDEX idx_monthly_sim ON monthly_states(simulation_run_id);
CREATE INDEX idx_monthly_date ON monthly_states(year, month);
CREATE INDEX idx_monthly_cash ON monthly_states(closing_cash_balance);


-- ============================================
-- CUSTOMER SEGMENTS (Track Evolution)
-- ============================================

CREATE TABLE customer_segments_history (
    id SERIAL PRIMARY KEY,
    monthly_state_id INTEGER REFERENCES monthly_states(id) ON DELETE CASCADE,
    
    segment_name VARCHAR(100) NOT NULL,
    segment_size INTEGER NOT NULL,
    avg_spend DECIMAL(8,2),
    loyalty_score INTEGER,  -- 0-100
    
    -- Track segment evolution
    size_change_from_prev_month INTEGER,
    avg_spend_change_from_prev_month DECIMAL(8,2)
);

CREATE INDEX idx_segments_monthly ON customer_segments_history(monthly_state_id);


-- ============================================
-- ACQUISITION CHANNELS (Track ROI)
-- ============================================

CREATE TABLE acquisition_channels_history (
    id SERIAL PRIMARY KEY,
    monthly_state_id INTEGER REFERENCES monthly_states(id) ON DELETE CASCADE,
    
    channel_name VARCHAR(100) NOT NULL,
    customers_acquired INTEGER,
    cost_per_customer DECIMAL(8,2),
    total_spent DECIMAL(10,2),
    
    -- ROI Tracking
    roi_percentage DECIMAL(5,2),  -- Can calculate: (LTV × customers - cost) / cost
    is_profitable BOOLEAN
);

CREATE INDEX idx_channels_monthly ON acquisition_channels_history(monthly_state_id);


-- ============================================
-- PLAYER DECISIONS (Track Choices)
-- ============================================

CREATE TABLE player_decisions_history (
    id SERIAL PRIMARY KEY,
    monthly_state_id INTEGER REFERENCES monthly_states(id) ON DELETE CASCADE,
    
    pricing_strategy VARCHAR(50),  -- 'premium', 'competitive', 'discount'
    marketing_spend DECIMAL(10,2),
    quality_level VARCHAR(50),  -- 'basic', 'standard', 'premium'
    target_employee_count INTEGER,
    avg_hourly_wage DECIMAL(6,2),
    
    -- Additional decisions (expandable)
    other_decisions JSONB
);


-- ============================================
-- EVENTS LOG (All Random Events)
-- ============================================

CREATE TABLE events_history (
    id SERIAL PRIMARY KEY,
    monthly_state_id INTEGER REFERENCES monthly_states(id) ON DELETE CASCADE,
    
    event_name VARCHAR(255),
    event_description TEXT,
    impact_percentage DECIMAL(5,2),
    is_relevant BOOLEAN,
    
    event_type VARCHAR(50),  -- 'economic', 'social', 'competitive', 'regulatory'
    severity VARCHAR(50)  -- 'minor', 'moderate', 'major'
);


-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View: Business Performance Over Time
CREATE VIEW business_performance_timeline AS
SELECT 
    sr.business_name,
    sr.business_type,
    ms.year,
    ms.month,
    ms.revenue,
    ms.net_profit,
    ms.profit_margin,
    ms.closing_cash_balance,
    ms.total_active_customers,
    ms.total_employees,
    ms.financial_health_score
FROM simulation_runs sr
JOIN monthly_states ms ON sr.id = ms.simulation_run_id
ORDER BY sr.id, ms.year, ms.month;


-- View: Customer Segment Evolution
CREATE VIEW customer_segment_trends AS
SELECT 
    sr.business_name,
    ms.year,
    ms.month,
    csh.segment_name,
    csh.segment_size,
    csh.avg_spend,
    csh.loyalty_score,
    LAG(csh.segment_size) OVER (
        PARTITION BY sr.id, csh.segment_name 
        ORDER BY ms.year, ms.month
    ) as prev_month_size,
    csh.segment_size - LAG(csh.segment_size) OVER (
        PARTITION BY sr.id, csh.segment_name 
        ORDER BY ms.year, ms.month
    ) as size_change
FROM simulation_runs sr
JOIN monthly_states ms ON sr.id = ms.simulation_run_id
JOIN customer_segments_history csh ON ms.id = csh.monthly_state_id
ORDER BY sr.id, ms.year, ms.month, csh.segment_name;


-- View: Marketing ROI Analysis
CREATE VIEW marketing_roi_analysis AS
SELECT 
    sr.business_name,
    ms.year,
    ms.month,
    pdh.marketing_spend,
    SUM(ach.customers_acquired) as total_customers,
    SUM(ach.total_spent) as total_channel_cost,
    AVG(ach.cost_per_customer) as avg_cac,
    ms.revenue,
    (ms.revenue - pdh.marketing_spend) / NULLIF(pdh.marketing_spend, 0) * 100 as marketing_roi_pct
FROM simulation_runs sr
JOIN monthly_states ms ON sr.id = ms.simulation_run_id
JOIN player_decisions_history pdh ON ms.id = pdh.monthly_state_id
LEFT JOIN acquisition_channels_history ach ON ms.id = ach.monthly_state_id
GROUP BY sr.id, sr.business_name, ms.id, ms.year, ms.month, 
         pdh.marketing_spend, ms.revenue
ORDER BY sr.id, ms.year, ms.month;
```

---

### 📝 **USAGE EXAMPLES:**

#### **Save Monthly State:**

```typescript
// After simulation completes
const monthlyState = {
  simulation_run_id: simulationId,
  month: currentMonth,
  year: currentYear,
  execution_time_ms: totalTime,
  
  // Financial
  revenue: financialData.profit_loss.revenue,
  gross_profit: financialData.profit_loss.gross_profit,
  net_profit: financialData.profit_loss.net_profit,
  profit_margin: financialData.profit_loss.profit_margin,
  
  labor_cost: financialData.cost_breakdown.labor,
  inventory_cost: financialData.cost_breakdown.inventory,
  // ... all other costs
  
  opening_cash_balance: financialData.cash_flow.opening_balance,
  closing_cash_balance: financialData.cash_flow.closing_balance,
  
  // Customer
  total_active_customers: customerData.total_active_customers,
  new_customers_acquired: customerData.new_customers_acquired,
  // ... all customer metrics
  
  // Employee
  total_employees: employeeData.total_employees,
  morale_score: employeeData.morale,
  productivity_score: employeeData.productivity_score,
  
  // Market
  economic_climate: marketContext.economic_climate,
  total_competitors: competitionData.total_competitors,
  
  // Complete outputs (JSONB)
  market_context_output: marketContext,
  customer_output: customerData,
  // ... all agent outputs
  
  alerts: financialData.alerts
};

await db.monthly_states.insert(monthlyState);

// Save customer segments
for (const segment of customerData.customer_segments) {
  await db.customer_segments_history.insert({
    monthly_state_id: monthlyState.id,
    segment_name: segment.segment_name,
    segment_size: segment.size,
    avg_spend: segment.avg_spend,
    loyalty_score: segment.loyalty
  });
}
```

#### **Load Previous Month State:**

```typescript
async function getPreviousMonthState(simulationId: number, currentMonth: number) {
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  const prevState = await db.query(`
    SELECT * FROM monthly_states
    WHERE simulation_run_id = $1
      AND year = $2
      AND month = $3
  `, [simulationId, prevYear, prevMonth]);
  
  if (!prevState) {
    // First month - return defaults
    return {
      revenue: 0,
      profit: 0,
      customers: 0,
      cashBalance: initialCapital,
      customerSegments: [],
      employeeState: null,
      competitorCount: 0
    };
  }
  
  // Load customer segments for context
  const segments = await db.query(`
    SELECT * FROM customer_segments_history
    WHERE monthly_state_id = $1
  `, [prevState.id]);
  
  return {
    revenue: prevState.revenue,
    profit: prevState.net_profit,
    customers: prevState.total_active_customers,
    cashBalance: prevState.closing_cash_balance,
    customerSegments: segments,
    employeeState: {
      count: prevState.total_employees,
      morale: prevState.morale_score,
      productivity: prevState.productivity_score
    },
    competitorCount: prevState.total_competitors,
    
    // Full outputs for context
    fullOutputs: {
      customer: prevState.customer_output,
      employee: prevState.employee_output,
      competition: prevState.competition_output,
      // ... all outputs
    }
  };
}
```

#### **Query: Business Performance Trend:**

```sql
-- Get 12-month performance
SELECT 
    month,
    revenue,
    net_profit,
    closing_cash_balance,
    total_active_customers,
    financial_health_score
FROM monthly_states
WHERE simulation_run_id = 42
ORDER BY year, month
LIMIT 12;
```

#### **Query: Customer Segment Evolution:**

```sql
-- See how "Office Workers" segment evolved
SELECT 
    ms.month,
    csh.segment_size,
    csh.avg_spend,
    csh.loyalty_score,
    csh.segment_size - LAG(csh.segment_size) OVER (ORDER BY ms.month) as growth
FROM monthly_states ms
JOIN customer_segments_history csh ON ms.id = csh.monthly_state_id
WHERE ms.simulation_run_id = 42
  AND csh.segment_name = 'Office Workers'
ORDER BY ms.month;
```

---

### 🗄️ **OPȚIUNEA 2: Frontend State + LocalStorage (NOT RECOMMENDED)**

**Avantaje:**
- ✅ Simplu de implementat
- ✅ No backend changes

**Dezavantaje:**
- ❌ Se pierde la page refresh (dacă nu salvezi în localStorage)
- ❌ localStorage limitat la 5-10MB
- ❌ Nu poți face queries/analytics
- ❌ Nu poți partaja între devices
- ❌ Nu există backup

**Implementare (dacă neapărat vrei):**

```typescript
// frontend/src/contexts/SimulationContext.tsx
interface MonthlyState {
  month: number;
  year: number;
  outputs: AllAgentOutputs;
  decisions: PlayerDecisions;
  executionTime: number;
}

const SimulationContext = React.createContext({
  businessId: null,
  monthHistory: [] as MonthlyState[],
  currentMonth: 1,
  currentYear: 2024,
  cashBalance: 100000,
  
  saveMonthState: (state: MonthlyState) => {},
  getPreviousMonth: () => {},
  loadFromStorage: () => {},
  saveToStorage: () => {}
});

export function SimulationProvider({ children }) {
  const [monthHistory, setMonthHistory] = useState<MonthlyState[]>([]);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('simulation_history');
    if (saved) {
      setMonthHistory(JSON.parse(saved));
    }
  }, []);
  
  // Save to localStorage on every update
  useEffect(() => {
    localStorage.setItem('simulation_history', JSON.stringify(monthHistory));
  }, [monthHistory]);
  
  const saveMonthState = (state: MonthlyState) => {
    setMonthHistory(prev => [...prev, state]);
  };
  
  const getPreviousMonth = () => {
    return monthHistory[monthHistory.length - 1] || null;
  };
  
  // ... rest
}
```

---

### 🎯 **RECOMANDARE FINALĂ:**

**✅ FOLOSEȘTE OPȚIUNEA 1: PostgreSQL**

**Beneficii:**
1. **Persistență Garantată** - Nu se pierde nimic
2. **Analytics & Reporting** - Poți face queries complexe
3. **Scalabilitate** - Unlimited storage
4. **Multi-device** - Sync între devices
5. **Backup & Recovery** - Database backups automate
6. **Performance** - Indexed queries foarte rapide
7. **Data Integrity** - Foreign keys, constraints
8. **Audit Trail** - Vezi exact ce s-a întâmplat când

**Implementation Plan:**

**Phase 1: Core Tables** (1-2 zile)
- `simulation_runs`
- `monthly_states`
- Basic save/load functionality

**Phase 2: Detailed Tracking** (2-3 zile)
- `customer_segments_history`
- `acquisition_channels_history`
- `player_decisions_history`
- `events_history`

**Phase 3: Analytics** (1-2 zile)
- Create views
- Backend API endpoints pentru charts
- Frontend dashboards

**Total: ~1 săptămână**

---

**Autor:** AI Analysis System  
**Data:** 2024-11-16  
**Versiune:** 2.0  
**Status:** ✅ COMPLET - READY FOR IMPLEMENTATION
