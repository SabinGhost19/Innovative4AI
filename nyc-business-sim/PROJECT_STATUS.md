
### **4. ⚔️ COMPETITION AGENT**

**Surse de date:**
- ✅ **Census**: Population, Median Income
- ✅ **Market Context**: Industry saturation, Economic climate
- ❌ **Function hardcodată**: estimateCompetitorCount()

**Valori HARDCODATE:**
```typescript
estimateCompetitorCount():
- Coffee: 2.5 per 10K people    // 🔴 STATIC
- Restaurant: 3.0 per 10K       // 🔴 STATIC
- Retail: 2.0 per 10K           // 🔴 STATIC
- Gym: 0.5 per 10K              // 🔴 STATIC
- Salon: 1.5 per 10K            // 🔴 STATIC
```

**⚠️ PROBLEME:**
1. Nu folosește date reale din Google Places API sau alte surse
2. Saturation e doar un multiplicator simplu

**✅ RECOMANDĂRI:**

```typescript
// Huff Model pentru densitate competitori
function estimateCompetitorsHuffModel(
  businessType: string,
  location: { lat: number, lng: number },
  radius: number, // miles
  population: number,
  medianIncome: number
): number {
  // Huff Gravity Model: P = (S / D^λ) / Σ(S / D^λ)
  // S = store size/attractiveness
  // D = distance
  // λ = distance decay parameter (1.5-2.5 for retail)
  
  const lambda = getDecayParameter(businessType); // 1.5-2.5
  const avgStoreSize = TYPICAL_BUSINESS_SIZES[businessType];
  
  // Market potential
  const marketPotential = population * getPotentialCustomerPercentage(businessType);
  const avgCustomersPerStore = getAvgCustomersPerStore(businessType);
  
  // Estimate competitors that market can support
  const marketCapacity = marketPotential / avgCustomersPerStore;
  
  // Apply gravity model with income adjustment
  const incomeMultiplier = medianIncome / 60000;
  
  return Math.round(marketCapacity * incomeMultiplier);
}

// BETTER: Integrare Google Places API
async function getActualCompetitorCount(
  lat: number,
  lng: number,
  businessType: string,
  radius: number = 1000 // meters
): Promise<number> {
  const placeType = mapBusinessTypeToGooglePlaceType(businessType);
  
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
    `location=${lat},${lng}&radius=${radius}&type=${placeType}&key=${API_KEY}`
  );
  
  const data = await response.json();
  return data.results?.length || 0;
}
```

---

### **5. 📦 SUPPLIER AGENT**

**Surse de date:**
- ✅ **Constants**: Monthly rent (calculateMonthlyRent)
- ✅ **Census**: Median income, Renter rate
- ❌ **Hardcodat**: Utilities (4% din rent), COGS percentages

**Valori HARDCODATE:**
```typescript
Utilities: rent * 0.04              // 🔴 STATIC 4%
COGS:
- Restaurant: 0.32 (32%)            // 🔴 STATIC
- Coffee: 0.35 (35%)                // 🔴 STATIC
- Retail: 0.50 (50%)                // 🔴 STATIC
- Services: 0.15 (15%)              // 🔴 STATIC
- Default: 0.30 (30%)               // 🔴 STATIC
```

**✅ RECOMANDĂRI:**

```typescript
// Utilities bazate pe sqft + sezon
function calculateUtilities(
  businessType: string,
  sqft: number,
  month: number,
  borough: string
): number {
  // Real NYC data: $2-4 per sq ft/year pentru utilități
  const baseRate = {
    'manhattan': 4.0,
    'brooklyn': 3.2,
    'queens': 2.8,
    'bronx': 2.5,
    'staten_island': 2.6
  }[borough.toLowerCase()] || 3.0;
  
  // Seasonal adjustment (heating in winter, AC in summer)
  const seasonalMultiplier = month >= 6 && month <= 8 ? 1.25 : // summer AC
                            month >= 12 || month <= 2 ? 1.35 : // winter heat
                            1.0;
  
  // Business type multiplier (restaurant > office)
  const typeMultiplier = {
    'restaurant': 1.5,  // Cooking equipment
    'coffee': 1.3,
    'retail': 1.0,
    'office': 0.8,
    'gym': 1.4         // Showers, AC
  }[businessType] || 1.0;
  
  return (sqft * baseRate / 12) * seasonalMultiplier * typeMultiplier;
}

// Dynamic COGS bazat pe volume purchasing
function calculateCOGS(
  businessType: string,
  revenue: number,
  monthlyVolume: number
): number {
  const baseCOGS = {
    'restaurant': 0.32,
    'coffee': 0.35,
    'retail': 0.50
  }[businessType] || 0.30;
  
  // Volume discounts (economies of scale)
  // 1% reduction for every $10K in monthly revenue
  const volumeDiscount = Math.min(0.10, revenue / 100000 * 0.01);
  
  return baseCOGS * (1 - volumeDiscount);
}
```

---

### **6. 📈 TRENDS AGENT**

**Surse de date:**
- ✅ **Google Trends API**: Interest over time, Related queries
- ✅ **Backend Python**: trends_service.py
- ✅ **LLM**: Interpretează datele

**✅ BINE IMPLEMENTAT** - folosește date reale!

**Îmbunătățire:**
```typescript
// Time Series Analysis pe trends
function forecastTrendImpact(
  historicalTrends: number[],
  currentTrend: number
): { forecasted Impact: number, confidence: number } {
  // Simple Moving Average Convergence Divergence (MACD)
  const ema12 = calculateEMA(historicalTrends, 12);
  const ema26 = calculateEMA(historicalTrends, 26);
  const macd = ema12 - ema26;
  
  // Trend momentum
  const momentum = macd > 0 ? 'accelerating' : 'decelerating';
  const forecastedImpact = currentTrend * (1 + macd / 100);
  
  return { forecastedImpact, confidence: calculateConfidence(historicalTrends) };
}
```

---

### **7. 🎲 EVENTS AGENT**

**Surse de date:**
- ✅ **Census**: Demographics detailed
- ✅ **LLM**: Generează evenimente

**⚠️ PROBLEME:**
- Eventos sunt 100% generate de LLM
- Nu există evenimente pre-definite cu probabilități

**✅ RECOMANDĂRI:**

```typescript
// Event probability distribution
interface EventTemplate {
  name: string;
  probability: number;  // 0-1
  impactRange: [number, number];
  seasonalMultiplier: Record<number, number>;
  conditions?: (context: any) => boolean;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    name: "Major Construction Nearby",
    probability: 0.05,  // 5% chance per month
    impactRange: [-20, -5],
    seasonalMultiplier: { 4: 1.5, 5: 1.5, 6: 1.5 }, // spring construction
    conditions: (ctx) => ctx.borough === 'manhattan'
  },
  {
    name: "Local Festival",
    probability: 0.08,
    impactRange: [10, 25],
    seasonalMultiplier: { 6: 2.0, 7: 2.0, 8: 2.0, 9: 1.5 },
  },
  // ... etc
];

function selectEvent(
  month: number,
  businessType: string,
  context: any
): BusinessEvent {
  // Monte Carlo selection cu weighted probabilities
  const eligible = EVENT_TEMPLATES.filter(e => 
    !e.conditions || e.conditions(context)
  );
  
  const weights = eligible.map(e => 
    e.probability * (e.seasonalMultiplier[month] || 1.0)
  );
  
  return weightedRandom(eligible, weights);
}
```

---

### **8. 🏪 MARKET CONTEXT AGENT**

**Surse de date:**
- ✅ **Census**: Full demographics
- ✅ **Business Survival Data**: 5-year survival rates (REAL DATA!)
- ✅ **LLM**: Interpretare

**Valori HARDCODATE (în prompt):**
```
Industry Saturation thresholds:
- opening: <50%
- saturated: 50-80%
- contracting: >80%
```

**✅ RECOMANDĂRI:**

```typescript
// Industry Saturation Formula (Reily's Law + Herfindahl Index)
function calculateIndustrySaturation(
  actualCompetitors: number,
  population: number,
  businessType: string,
  avgRevenuePerCompetitor: number
): number {
  // Total addressable market
  const tam = population * getPotentialCustomerPercentage(businessType);
  const avgCustomersPerBusiness = 500; // varies by type
  
  // Market capacity
  const marketCapacity = tam / avgCustomersPerBusiness;
  
  // Current saturation
  const saturation = (actualCompetitors / marketCapacity) * 100;
  
  // Herfindahl-Hirschman Index pentru concentration
  // HHI = Σ(market_share_i)^2
  // Assume uniform distribution for simplicity
  const marketShare = 1 / actualCompetitors;
  const hhi = actualCompetitors * Math.pow(marketShare, 2) * 10000;
  
  // HHI < 1500 = competitive
  // HHI 1500-2500 = moderate concentration
  // HHI > 2500 = high concentration
  
  const concentrationAdjustment = hhi > 2500 ? 1.2 : hhi > 1500 ? 1.1 : 1.0;
  
  return Math.min(100, saturation * concentrationAdjustment);
}
```