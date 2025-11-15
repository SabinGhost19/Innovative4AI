# 🔄 Flow de Date & Interacțiuni - Explicație Completă

## 📊 Откуда се взимат данните (Sursa Datelor)

### 1️⃣ SETUP INIȚIAL - Când introduci locația

**Input Utilizator**: `"Piața Victoriei, București"`

**Ce se întâmplă**:

```typescript
// Frontend (SetupScreen.tsx)
const handleLocationSubmit = async () => {
  // 1. Trimite request la backend
  const response = await fetch('/api/scrape-location', {
    method: 'POST',
    body: JSON.stringify({ 
      location: "Piața Victoriei", 
      useMock: true  // ⚠️ IMPORTANT: Folosește date MOCK
    })
  });
}
```

**Backend** (`app/api/scrape-location/route.ts`):
```typescript
export async function POST(request: NextRequest) {
  const { location, useMock } = await request.json();
  
  // Dacă useMock = true (default pentru dev)
  if (useMock) {
    return getMockLocationData(location);  // ← Date PRE-DEFINITE
  }
  
  // Altfel ar face scraping real pe Google
  return scrapeLocationData(location);
}
```

**Sursa Datelor** (`lib/scraper.ts` - funcția `getMockLocationData`):

```typescript
export function getMockLocationData(location: string): LocationData {
  const mockData = {
    'Piața Victoriei': {
      averageCoffeePrice: 15,      // ← HARDCODED în cod
      rentEstimate: 3500,           // ← HARDCODED în cod
      competitors: ['Starbucks', '5 to go', "Ted's Coffee"],  // ← HARDCODED
      footTraffic: 'high',          // ← HARDCODED
      marketData: {
        priceRange: { min: 12, max: 20 },  // ← HARDCODED
        competitorCount: 3,
      },
    },
    'Universitate': {
      averageCoffeePrice: 14,
      rentEstimate: 4000,
      competitors: ['Starbucks', '5 to go', 'Costa Coffee'],
      footTraffic: 'high',
      // ...
    }
  };
  
  // Dacă nu găsește locația, returnează valori default
  return mockData[location] || {
    averageCoffeePrice: 12,
    rentEstimate: 2500,
    competitors: ['5 to go', 'Starbucks'],
    footTraffic: 'medium',
  };
}
```

**✅ CONCLUZIE**: Datele din setup sunt **MOCK (false)**, nu scraped real!

---

## 2️⃣ CREAREA BUSINESS-ULUI

**Ce se întâmplă când apeși "Începe Jocul"**:

```typescript
// Frontend
const handleConfirm = async () => {
  const response = await fetch('/api/business', {
    method: 'POST',
    body: JSON.stringify({
      name: "Coffee Paradise",         // ← de la tine
      location: "Piața Victoriei",     // ← de la tine
      locationData: {                   // ← de la mock sau scraping
        averageCoffeePrice: 15,
        rentEstimate: 3500,
        competitors: [...],
      },
    }),
  });
};
```

**Backend** (`app/api/business/route.ts`):
```typescript
export async function POST(request: NextRequest) {
  const { name, location, locationData } = await request.json();
  
  // Creează obiect business cu date INIȚIALE
  const business: BusinessSetup = {
    id: "business_" + Date.now(),
    name,                              // ← de la tine
    location,                          // ← de la tine
    locationData,                      // ← de la mock
    currentMonth: 1,                   // ← HARDCODED
    cash: 50000,                       // ← HARDCODED (capital start)
    reputation: 50,                    // ← HARDCODED (start)
    createdAt: new Date(),
  };
  
  // Salvează în memorie (Map)
  businesses.set(businessId, business);
  
  return { business };
}
```

**✅ CONCLUZIE**: Business-ul pornește cu:
- **Capital**: 50,000 RON (hardcoded)
- **Reputație**: 50/100 (hardcoded)
- **Luna**: 1 (hardcoded)

---

## 3️⃣ SIMULAREA LUNARĂ - Cel mai complex!

**Input Utilizator** (din Dashboard):
```typescript
decisions = {
  employees: 3,              // ← tu alegi
  coffeeQuality: 'medium',   // ← tu alegi
  marketingBudget: 2000,     // ← tu alegi
  productPrice: 15,          // ← tu alegi
}
```

**Frontend** (GameDashboard.tsx):
```typescript
const handleRunSimulation = async () => {
  const response = await fetch('/api/simulate', {
    method: 'POST',
    body: JSON.stringify({
      businessId: business.id,
      decisions: decisions,  // ← deciziile tale
    }),
  });
  
  const data = await response.json();
  // data = { result: SimulationResult, business: BusinessSetup }
};
```

**Backend** (`app/api/simulate/route.ts`):
```typescript
export async function POST(request: NextRequest) {
  const { businessId, decisions } = await request.json();
  
  // 1. Obține business-ul
  let business = businesses.get(businessId);
  
  // 2. Creează motor de simulare
  let simulation = createSimulation(business);
  
  // 3. RULEAZĂ SIMULAREA ← AICI SE ÎNTÂMPLĂ MAGIA
  const result = await simulation.runMonth(decisions);
  
  // 4. Actualizează business-ul
  business.currentMonth++;
  
  return { result, business };
}
```

---

## 🎮 MOTORUL DE SIMULARE - Pas cu Pas

**Fișier**: `lib/simulation.ts` - clasa `SimulationEngine`

### Pas 1: Inițializare Agenți

```typescript
constructor(business: BusinessSetup) {
  // COMPETITORI - bazați pe datele din scraping/mock
  this.competitors = generateCompetitorAgents(
    business.locationData.competitors,  // ['Starbucks', '5 to go', "Ted's Coffee"]
    business.locationData.averageCoffeePrice  // 15
  );
  // Rezultat: 3 agenți competitor cu strategii PRE-DEFINITE în lib/agents.ts
  
  // CLIENȚI - generați bazat pe trafic
  const customerCount = {
    low: 300,
    medium: 800,
    high: 1500,     // ← Piața Victoriei = 1500 clienți
  }[business.locationData.footTraffic];
  
  this.customers = generateCustomerAgents(customerCount, competitors);
  // Rezultat: 1500 agenți clienți cu preferințe RANDOM
}
```

**Откуда се взимат профилите конкурентов?**

Din `lib/agents.ts`:
```typescript
export function generateCompetitorAgents(names, avgPrice) {
  const profiles = {
    'Starbucks': {
      priceStrategy: 1.3,      // ← HARDCODED: 30% mai scump
      qualityLevel: 'high',    // ← HARDCODED
      marketingPower: 95,      // ← HARDCODED
      reputation: 90,          // ← HARDCODED
      marketShare: 35,         // ← HARDCODED: 35% din piață
    },
    '5 to go': {
      priceStrategy: 0.7,      // ← HARDCODED: 30% mai ieftin
      qualityLevel: 'medium',
      marketingPower: 80,
      reputation: 75,
      marketShare: 30,
    },
    "Ted's Coffee": {
      priceStrategy: 1.0,      // ← HARDCODED: la media pieței
      qualityLevel: 'high',
      marketingPower: 70,
      reputation: 80,
      marketShare: 20,
    },
  };
  
  return names.map(name => ({
    name,
    ...profiles[name],  // ← Ia profil PRE-DEFINIT
  }));
}
```

**✅ CONCLUZIE**: Competitorii au strategii **HARDCODED** în cod!

---

### Pas 2: Rularea Lunii

```typescript
public async runMonth(decisions: MonthlyDecisions) {
  // STEP 1: Actualizează angajații
  this.employees = generateEmployees(decisions.employees);
  // Generează X angajați cu nume și skill-uri RANDOM
  
  // STEP 2: Competitorii reacționează
  const competitorActions = simulateCompetitorActions(
    this.competitors,
    decisions,
    { averagePrice: 15 }
  );
  // Logică: Dacă tu ai prețuri mici, competitorii răspund (60% șansă)
  
  // STEP 3: Distribuie clienții ← CEL MAI IMPORTANT
  const { playerCustomers, competitorDistribution } = distributeCustomers(
    this.customers,        // 1500 clienți
    decisions,             // deciziile tale
    this.competitors,      // agenții competitori
    this.business.reputation,  // reputația ta (50)
    15                     // preț mediu piață
  );
  
  // STEP 4: Calculează vânzările
  const salesVolume = Math.floor(playerCustomers * 1.2);
  // Presupunem că fiecare client cumpără ~1.2 cafele în medie
  
  // STEP 5: Calculează P&L
  const profitLoss = this.calculateProfitLoss(decisions, salesVolume);
  
  // STEP 6: Generează evenimente și feedback
  const events = this.generatePerformanceEvents(...);
  const customerFeedback = generateCustomerFeedback(...);
  
  // STEP 7: Actualizează reputația
  const repChange = this.calculateReputationChange(...);
  this.business.reputation += repChange;
  this.business.cash += profitLoss.profit;
  
  return { profitLoss, events, customerFeedback, ... };
}
```

---

## 🧮 DISTRIBUȚIA CLIENȚILOR - Algoritm Detaliat

**Откуда се взимат клиентите?** Din funcția `distributeCustomers` în `lib/agents.ts`:

```typescript
export function distributeCustomers(
  customers: CustomerAgent[],     // 1500 clienți
  playerDecisions: MonthlyDecisions,
  competitors: CompetitorAgent[],
  playerReputation: number,       // 50
  averageMarketPrice: number      // 15
) {
  const distribution = { 'Your Business': 0 };
  
  // Pentru FIECARE client (1500 iterații)
  customers.forEach((customer) => {
    const scores = {};
    
    // 1. CALCULEAZĂ SCORE pentru TU (player)
    // Componenta PREȚ (max 50 pts)
    const playerPriceScore = 
      (1 - customer.priceSensitivity) * 50 +  // Dacă nu e sensibil la preț
      customer.priceSensitivity * (1 - playerDecisions.productPrice / 15) * 50;
    // Exemplu: Dacă prețul tău e 12 RON (mai ieftin), scorul e mai mare
    
    // Componenta CALITATE (max 100 pts)
    const qualityScores = { low: 20, medium: 50, high: 100 };
    const playerQualityScore = 
      customer.qualityPreference * qualityScores[playerDecisions.coffeeQuality];
    // Exemplu: Dacă clientul preferă calitate și tu ai 'high', scorul e mare
    
    // Componenta MARKETING (max 20 pts)
    const playerMarketingBonus = Math.min(playerDecisions.marketingBudget / 100, 20);
    // Exemplu: 2000 RON marketing → 20 puncte
    
    // TOTAL SCORE pentru TU
    scores['Your Business'] = 
      playerPriceScore +           // 0-50
      playerQualityScore +         // 0-100
      playerMarketingBonus +       // 0-20
      (playerReputation / 100) * 30;  // 0-30 (reputație 50 → 15 pts)
    // TOTAL MAXIM posibil: ~200 puncte
    
    // 2. CALCULEAZĂ SCORE pentru FIECARE COMPETITOR
    competitors.forEach((competitor) => {
      const compPrice = 15 * competitor.priceStrategy;  // Starbucks: 15*1.3=19.5
      const compPriceScore = /* similar cu player */;
      const compQualityScores = { low: 20, medium: 50, high: 100 };
      const compQualityScore = customer.qualityPreference * 
                               compQualityScores[competitor.qualityLevel];
      
      scores[competitor.name] = 
        compPriceScore +
        compQualityScore +
        (competitor.marketingPower / 100) * 20 +  // Starbucks: 95→19pts
        (competitor.reputation / 100) * 30 +      // Starbucks: 90→27pts
        (customer.brandLoyalty[competitor.name] || 0);  // 20-70 pts RANDOM
    });
    
    // 3. ALEGE WINNER-ul (business cu cel mai mare score)
    const winner = Object.entries(scores).reduce((a, b) => 
      b[1] > a[1] ? b : a
    )[0];
    
    distribution[winner]++;  // Incrementează counter-ul
  });
  
  return { playerCustomers: distribution['Your Business'], ... };
}
```

**✅ CONCLUZIE Distribuție Clienți**:
- Fiecare din **1500 clienți** calculează un score pentru fiecare business
- Clientul alege business-ul cu **cel mai mare score**
- Score-ul depinde de: **preț, calitate, marketing, reputație, loialitate brand**

---

## 💰 CALCULUL P&L (Profit & Loss)

```typescript
private calculateProfitLoss(decisions, salesVolume) {
  // REVENUE
  const revenue = salesVolume * decisions.productPrice;
  // Exemplu: 180 cafele × 15 RON = 2,700 RON
  
  // COSTS
  const rent = business.locationData.rentEstimate;  // 3500 EUR (din mock)
  const salaries = decisions.employees * 3500;      // 3 × 3500 = 10,500 RON
  
  const qualityCosts = { low: 0.8, medium: 1.2, high: 2.0 };
  const supplies = salesVolume * qualityCosts[decisions.coffeeQuality];
  // Exemplu: 180 × 1.2 = 216 RON (cafea)
  
  const marketing = decisions.marketingBudget;      // 2000 RON
  const utilities = 800 + (salesVolume * 0.1);      // 800 + 18 = 818 RON
  const other = 500;                                 // 500 RON
  
  const totalCosts = rent + salaries + supplies + marketing + utilities + other;
  // Exemplu: 3500 + 10500 + 216 + 2000 + 818 + 500 = 17,534 RON
  
  const profit = revenue - totalCosts;
  // Exemplu: 2,700 - 17,534 = -14,834 RON (PIERDERE!)
  
  return { revenue, costs: {...}, totalCosts, profit, salesVolume };
}
```

**✅ CONCLUZIE P&L**:
- Toate costurile sunt **calculate dinamic** bazat pe decizii + date mock
- Chiria vine din **mock data** (3500 EUR)
- Salariile: **3500 RON/angajat** (hardcoded)
- Supply costs: **0.8-2.0 RON/cafea** (hardcoded)

---

## 📈 ACTUALIZAREA REPUTAȚIEI

```typescript
private calculateReputationChange(decisions, customerFeedback, profitLoss) {
  let change = 0;
  
  // 1. Din feedback clienți
  customerFeedback.forEach((feedback) => {
    if (feedback.sentiment === 'positive') change += 0.5;
    if (feedback.sentiment === 'negative') change -= 0.8;
  });
  
  // 2. Din calitate
  if (decisions.coffeeQuality === 'high') change += 1;
  if (decisions.coffeeQuality === 'low') change -= 1;
  
  // 3. Din marketing
  if (decisions.marketingBudget > 3000) change += 1;
  
  // 4. Din profitabilitate
  if (profitLoss.profit > 5000) change += 0.5;
  if (profitLoss.profit < -5000) change -= 1;
  
  return change;  // Ex: -2.3 sau +3.5
}
```

---

## 🎯 REZUMAT - Откуда се взимат toate данните?

### Date HARDCODED (în cod):
1. ✅ **Capital inițial**: 50,000 RON
2. ✅ **Reputație start**: 50/100
3. ✅ **Salariu angajați**: 3,500 RON/lună
4. ✅ **Costuri cafea**: 0.8-2.0 RON/cafea
5. ✅ **Număr clienți**: 300/800/1500 (low/medium/high traffic)
6. ✅ **Profiluri competitori**: Starbucks, 5 to go, Ted's (strategii, reputație, marketing power)
7. ✅ **Utilități**: 800 + 0.1×salesVolume RON

### Date MOCK (pre-definite pentru locații):
1. ✅ **Preț mediu cafea**: 15 RON (Piața Victoriei)
2. ✅ **Chirie**: 3,500 EUR (Piața Victoriei)
3. ✅ **Competitori**: ['Starbucks', '5 to go', "Ted's Coffee"]
4. ✅ **Trafic**: 'high'

### Date de la UTILIZATOR:
1. ✅ **Nume business**
2. ✅ **Locație**
3. ✅ **Decizii lunare**: angajați, calitate, preț, marketing

### Date CALCULATE DINAMIC:
1. ✅ **Distribuția clienților** (algoritm scoring)
2. ✅ **Vânzări**: bazat pe câți clienți te-au ales
3. ✅ **P&L**: revenue - costs
4. ✅ **Reputație**: bazat pe performanță
5. ✅ **Evenimente**: generate bazat pe profit, costuri, feedback
6. ✅ **Acțiuni competitori**: reacții la deciziile tale (probabilistice)

---

**🎮 În concluzie**: Jocul este un **simulator deterministic cu elemente probabilistice**. Majoritatea datelor sunt hardcoded sau calculate dinamic, nu scraped real (pentru că folosim `useMock: true`).
