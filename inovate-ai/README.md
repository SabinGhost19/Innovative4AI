# ☕ Sim-Antreprenor - Simulator Business Cafenea

Un simulator sandbox interactiv unde joci rolul unui antreprenor în industria cafelei din România. Folosește date reale scraped din locații reale și agenți AI pentru a simula competiția și comportamentul clienților.

## 🎮 Conceptul

**Sim-Antreprenor** este un joc de strategie business în care:

1. **Setup Bazat pe Date Reale**: Îți creezi cafeneaua într-o locație reală (ex: "Piața Victoriei, București")
2. **Scraping Automat**: Aplicația extrage date despre prețuri, chirii, competitori și trafic pietonal
3. **Simulare Lunară**: Joci "lună de lună" luând decizii strategice
4. **Agenți AI**: Competitorii și clienții sunt simulați prin agenți inteligenți
5. **Rapoarte P&L**: Primești feedback financiar și narativ după fiecare lună

## 🚀 Tehnologii

- **Next.js 16** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Axios + Cheerio** - Web scraping
- **Vercel AI SDK** (pregătit pentru integrare)

## 📦 Instalare

```bash
cd inovate-ai
npm install
```

## 🔧 Configurare

1. Creează fișier `.env.local`:

```bash
cp .env.local.example .env.local
```

2. (Opțional) Adaugă API keys pentru AI în `.env.local`:

```env
OPENAI_API_KEY=your-key-here
# SAU
ANTHROPIC_API_KEY=your-key-here
```

## 🎯 Rulare

```bash
npm run dev
```

Apoi deschide [http://localhost:3000](http://localhost:3000) în browser.

## 📊 Flow-ul Jocului

### 1. Setup (Ecranul Inițial)

- **Nume Business**: Alegi un nume pentru cafeneaua ta
- **Locație Reală**: Introduci o adresă din România (ex: "Piața Victoriei, București")
- **Scraping Automat**: Aplicația extrage:
  - Prețul mediu al cafelei în zonă
  - Chiria estimată pentru spațiu comercial
  - Competitorii direcți (Starbucks, 5 to go, Ted's Coffee, etc.)
  - Traficul pietonal (Low/Medium/High)

### 2. Dashboard-ul Principal

Joci **lună de lună** luând următoarele decizii strategice:

#### Decizii Lunare:

- **👥 Personal**: Câți baristas angajezi? (Cost: 3,500 RON/angajat)
- **☕ Calitate**: Ce calitate a cafelei cumperi?
  - Scăzută: 0.8 RON/cafea
  - Medie: 1.2 RON/cafea  
  - Premium: 2.0 RON/cafea
- **💰 Preț**: La ce preț vinzi cafeaua?
- **📣 Marketing**: Cât aloci pentru promovare?

#### Butonul "RULEAZĂ LUNA":

Când apeși acest buton, aplicația:

1. **Simulează instant 30 de zile**
2. **Agenții AI Competitori** își stabilesc strategii (promoții, prețuri)
3. **Agenții AI Clienți** își aleg cafeneaua preferată bazat pe:
   - Preț
   - Calitate
   - Reputație
   - Marketing
   - Loialitate brand

### 3. Raportul Lunar

După simulare primești:

#### 📈 Raport Financiar (P&L):
- **Venituri**: Câte cafele ai vândut × preț
- **Costuri**:
  - Chirie
  - Salarii
  - Furnizori (cafea)
  - Marketing
  - Utilități
- **Profit Net**: Câți bani ai făcut/pierdut

#### 📬 Evenimente Narrative:
- "Angajații tăi sunt suprasolicitați"
- "Prețurile sunt prea mari - clienții pleacă"
- "Calitate excelentă - reputația crește!"

#### 💬 Feedback Clienți:
- Păreri despre preț, calitate, serviciu
- Număr de clienți nemulțumiți/mulțumiți

#### 🎯 Acțiuni Competitori:
- "Starbucks a lansat o campanie care ți-a furat clienți"
- "5 to go a redus prețurile cu 10%"

## 🤖 Sistemul de Agenți AI

### Agenți Competitori
Fiecare competitor (Starbucks, 5 to go, Ted's Coffee) are:
- Strategie de preț
- Nivel de calitate
- Putere de marketing
- Reputație
- Market share

Competitorii **reacționează la deciziile tale** și încearcă să-ți fure clienții.

### Agenți Clienți
Fiecare client AI are:
- Sensibilitate la preț (0-1)
- Preferință pentru calitate (0-1)
- Loialitate brand pentru fiecare cafenea
- Număr de cafele cumpărate lunar

Clienții **aleg cafeneaua în fiecare lună** bazat pe un scoring complex.

### Agenți Angajați
Fiecare angajat are:
- Skill level
- Satisfacție
- Productivitate
- Salariu

## 📁 Structura Proiectului

```
inovate-ai/
├── app/
│   ├── api/
│   │   ├── scrape-location/    # Endpoint pentru scraping
│   │   ├── business/            # CRUD business
│   │   └── simulate/            # Motorul de simulare
│   ├── page.tsx                 # Pagina principală
│   └── layout.tsx
├── components/
│   ├── SetupScreen.tsx          # Ecranul de setup inițial
│   └── GameDashboard.tsx        # Dashboard-ul principal de joc
├── lib/
│   ├── scraper.ts               # Logica de web scraping
│   ├── agents.ts                # Agenții AI (Competitori, Clienți, etc.)
│   ├── simulation.ts            # Motorul de simulare lunară
│   └── types.ts                 # TypeScript types
└── package.json
```

## 🎓 Strategii de Joc

### Strategie 1: Low-Cost Leader
- Prețuri mici (sub media pieței)
- Calitate medie
- Marketing moderat
- Mulți angajați pentru volum mare

### Strategie 2: Premium Brand
- Prețuri peste medie
- Calitate înaltă
- Marketing intens
- Focus pe reputație

### Strategie 3: Balanced
- Prețuri la media pieței
- Calitate medie-înaltă
- Marketing echilibrat
- Optimizare costuri

## 🔮 Viitoare Features (cu AI SDK)

- **AI Chat Assistant**: Un "consultant business" care îți dă sfaturi
- **Predicții AI**: Model care prezice ce se va întâmpla dacă iei anumite decizii
- **Generare Dinamică Evenimente**: Eventi generați de LLM bazat pe context
- **Analiză Competitori AI**: LLM analizează strategiile competitorilor

## 🐛 Debug Mode

Pentru development, aplicația folosește **mock data** în loc de scraping real (care poate fi blocat de Google).

În `app/api/scrape-location/route.ts`, setează `useMock: true` pentru mock data.

## 📝 Note

- **Capital Inițial**: 50,000 RON
- **Reputație Inițială**: 50/100
- **Durata Simulării**: Instant (30 zile simulate în secunde)
- **Competitori Simulați**: Bazat pe date reale din locație

## 🤝 Contribuții

Acest proiect a fost creat pentru **Innovative4AI Hackathon 2025**.

## 📄 Licență

MIT

---

**Succes în construirea imperiului tău de cafea! ☕🚀**

