# 🎲 Simulation Agents - Business Event Generator

Acest director conține agenții AI pentru simularea mediului economic virtual al business-urilor din NYC.

## 📁 Structura

```
simulation_agents/
├── events-agent.ts          # Agent pentru generarea de evenimente economice
└── README.md               # Această documentație
```

## 🎯 Events Agent

### Descriere
Agentul de evenimente generează evenimente economice/sociale realiste care afectează business-urile locale, bazându-se pe:
- Date demografice din Census API
- Context temporal (lună, an, sezon)
- Tipul de business
- Locația geografică

### Input

```typescript
{
  businessType: string,              // ex: "Coffee Shop"
  location: {
    address: string,
    neighborhood: string,
    lat: number,
    lng: number
  },
  censusData: DetailedCensusData,   // Date complete din Census API
  currentMonth: number,              // 1-12
  currentYear: number
}
```

### Output

```typescript
{
  nume_eveniment: string,                    // "Festival Artizanal SoHo"
  impact_clienti_lunar: number,              // ±5% până la ±30%
  relevanta_pentru_business: boolean,        // true/false
  descriere_scurta: string                   // Context eveniment
}
```

### Date Census Utilizate

**Demografie:**
- `B01001_001E` - Populație totală
- `B01002_001E` - Vârstă mediană
- `B19013_001E` - Venit mediu gospodărie

**Forță de muncă (Industrii):**
- `C24050_001E` - Total forță de muncă
- `C24050_007E` - Finanțe/Asigurări/Real Estate
- `C24050_018E` - Artă/Divertisment/HoReCa
- `C24050_029E` - Servicii Profesionale/Științifice

**Educație:**
- `B15003_001E` - Total populație 25+
- `B15003_022E` - Licență
- `B15003_023E` - Master
- `B15003_025E` - Doctorat

**Economic:**
- `B17001_002E` - Sub pragul sărăciei

### Logica de Generare

1. **Analiză Demografică:** Extrage și calculează metrici (rată educație, sărăcie, distribuție ocupații)
2. **Context Temporal:** Determină sezonul și contextul economic
3. **Generare AI:** Folosește GPT-4 pentru a crea evenimente realiste
4. **Validare:** Asigură că impactul este rezonabil (±30% max)

### Exemple de Evenimente Generate

**Pozitive:**
- "Festival Artizanal de Toamnă" (+15% clienți - zonă cu % ridicat artă)
- "Program Guvernamental Stimulente" (+12% clienți - sezon specific)
- "Influx Tineri Profesioniști" (+8% clienți - zonă educație ridicată)

**Negative:**
- "Recesiune Sector Financiar" (-18% clienți - zonă dependentă finanțe)
- "Competiție Majoră Deschisă" (-12% clienți - generic)
- "Creștere Costuri Chirii" (-10% clienți - zonă venit mediu scăzut)

## 🔌 API Endpoint

### POST `/api/simulation/next-month`

Generează un eveniment când utilizatorul apasă "Next Month" în dashboard.

**Request:**
```json
{
  "businessType": "Coffee Shop",
  "location": {
    "address": "123 Broadway, New York, NY",
    "neighborhood": "SoHo",
    "lat": 40.7234,
    "lng": -73.9967
  },
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
