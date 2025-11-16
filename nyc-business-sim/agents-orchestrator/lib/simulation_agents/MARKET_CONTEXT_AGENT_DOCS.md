# Market Context Agent - Documentation

## 📋 Overview

`market-context-agent` este primul agent din pipeline-ul de simulare, rulând în **PHASE 1 (Sequential)**. Rolul său este să proceseze datele Census și să genereze un context de piață detaliat care va fi folosit de agenții următori.

## 🎯 Responsabilități

1. **Estimarea dimensiunii pieței** - Câți clienți potențiali există în zonă
2. **Identificarea segmentelor** - 2-3 segmente dominante de clienți
3. **Scoruri de comportament** - Demand, price sensitivity, quality preference
4. **Trafic pedonal** - Multiplicator bazat pe densitate și work-from-home

## 📥 Input

```typescript
interface CensusDataInput {
  total_population: number;           // Populația totală din zona Census Tract
  median_household_income: number;    // Venitul mediu per gospodărie ($/an)
  median_rent: number;                // Chiria medie ($/lună)
  poverty_rate: number;               // Rata sărăciei (%)
  education_bachelor_rate: number;    // Rata educației superioare (%)
  work_from_home_rate: number;        // Rata muncii de acasă (%)
}

// Plus business type și location
```

## 📤 Output

```typescript
interface MarketContext {
  market_size_estimate: number;        // Clienți potențiali/lună
  dominant_segments: string[];         // Max 3 segmente
  demand_score: number;                // 0-100
  price_sensitivity_score: number;     // 0-100 (0=foarte sensibili)
  quality_preference_score: number;    // 0-100 (100=preferă calitate)
  foot_traffic_multiplier: number;     // 0.5-2.0 (1.0=normal)
}
```

## 🔧 Usage

### Basic Usage

```typescript
import { analyzeMarketContext } from './market-context-agent';

const censusData = {
  total_population: 8500,
  median_household_income: 125000,
  median_rent: 2800,
  poverty_rate: 8.5,
  education_bachelor_rate: 62.3,
  work_from_home_rate: 45.2
};

const location = {
  address: '123 Main St, Brooklyn, NY',
  neighborhood: 'Williamsburg',
  lat: 40.7081,
  lng: -73.9571
};

const marketContext = await analyzeMarketContext(
  censusData,
  'coffee_shop',
  location
);
```

### With Raw Census Data

```typescript
import { prepareCensusDataForMarketAnalysis, analyzeMarketContext } from './market-context-agent';

// Procesează datele Census raw
const processedData = prepareCensusDataForMarketAnalysis(rawCensusFromAPI);

// Apoi analizează
const marketContext = await analyzeMarketContext(
  processedData,
  'restaurant',
  location
);
```

## 📊 Segmente Posibile

Agentul poate identifica următoarele segmente:

- `young_professionals` - Tineri cu venituri bune, educație
- `high_income` - Venituri peste medie
- `families` - Zone rezidențiale cu populație stabilă
- `students` - Zone universitare
- `seniors` - Populație în vârstă
- `price_sensitive` - Zone cu venituri mai mici
- `remote_workers` - Work from home rate ridicat
- `commuters` - Work from home rate scăzut, trafic în zonă

## 🎨 Interpretarea Output-ului

### Market Size Estimate
- **Coffee Shop**: 500-1500 clienți/lună pentru 10,000 locuitori
- **Restaurant**: 300-800 clienți/lună
- **Gym**: 200-600 membri potențiali

### Demand Score
- **80-100**: Demand foarte mare, categorie populară
- **60-79**: Demand bun, piață stabilă
- **40-59**: Demand moderat, niche market
- **0-39**: Demand scăzut, foarte niche

### Price Sensitivity Score
- **0-30**: Foarte sensibili la preț (zone cu venituri mici)
- **31-60**: Moderată sensibilitate
- **61-100**: Nesensibili la preț (zone affluente)

### Quality Preference Score
- **0-30**: Prioritate pe preț
- **31-60**: Echilibru preț-calitate
- **61-100**: Prioritate pe calitate

### Foot Traffic Multiplier
- **< 1.0**: Zonă mai retrasă, mai puțin trafic
- **1.0**: Normal, trafic standard urban
- **> 1.0**: Zonă cu trafic mare (remote workers, high density)

## 🔗 Integration with Other Agents

`market-context-agent` rulează **PRIMUL** în pipeline și output-ul său este folosit de:

1. **Customer Segments Agent** - Folosește `dominant_segments` și `demand_score`
2. **Pricing Strategy Agent** - Folosește `price_sensitivity_score` și `quality_preference_score`
3. **Revenue Projections Agent** - Folosește `market_size_estimate` și `foot_traffic_multiplier`

## ⚙️ Configuration

- **Model**: `gpt-4o-mini` (rapid și ieftin pentru analiză factuală)
- **Temperature**: `0.3` (consistență și acuratețe)
- **Execution Phase**: Phase 1 - Sequential
- **Estimated Time**: ~1-2 secunde

## 🐛 Error Handling

```typescript
try {
  const marketContext = await analyzeMarketContext(censusData, businessType, location);
  console.log('Success:', marketContext);
} catch (error) {
  if (error.message.includes('Invalid census data')) {
    // Handle invalid input
  } else if (error.message.includes('API key')) {
    // Handle API key issues
  } else {
    // General error
  }
}
```

## 📝 Example Output

```json
{
  "market_size_estimate": 1200,
  "dominant_segments": [
    "young_professionals",
    "high_income",
    "remote_workers"
  ],
  "demand_score": 78,
  "price_sensitivity_score": 65,
  "quality_preference_score": 72,
  "foot_traffic_multiplier": 1.35
}
```

**Interpretation**: 
- Coffee shop în Williamsburg, Brooklyn
- ~1200 clienți potențiali pe lună
- Segmente: tineri profesioniști cu venituri mari care lucrează remote
- Demand ridicat (78/100)
- Nu foarte sensibili la preț (65/100)
- Preferă calitate (72/100)
- Trafic pedonal peste medie datorită remote work (1.35x)

## 🚀 Performance Tips

1. **Cache Census Data** - Nu procesați aceleași date Census de fiecare dată
2. **Batch Processing** - Analizați multiple business types pentru aceeași locație în paralel
3. **Validare Input** - Verificați că `total_population > 0` înainte de apel

## 🔄 Updates & Maintenance

- **Version**: 1.0.0
- **Last Updated**: November 2025
- **Dependencies**: 
  - `ai` (Vercel AI SDK)
  - `@ai-sdk/openai`
  - `zod`

## 📚 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arhitectura completă a sistemului
- [events-agent.ts](./events-agent.ts) - Event generation agent
- [trends-agent.ts](./trends-agent.ts) - Trends analysis agent
