# NYC Business Simulator - User Authentication & State Persistence

## Overview

Sistemul de autentificare și persistență a stării permite utilizatorilor să:
- Se înregistreze cu un username simplu
- Să își salveze automat progresul simulării
- Să își reia simularea de unde au rămas la următoarea autentificare

## Arhitectura Sistemului

### 1. **Backend (FastAPI + PostgreSQL)**

#### Tabele în Baza de Date

**`simulation_users`**
- `id` (UUID) - Primary key, generat automat
- `username` (String) - Unic, folosit pentru autentificare
- `created_at` (DateTime)
- `last_login` (DateTime)

**`simulation_sessions`**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key către `simulation_users`
- `business_name`, `business_type`, `industry`
- `location` (JSON) - Coordonate și adresă
- `initial_budget` (Decimal)
- `current_month`, `current_year`
- Un user poate avea doar o sesiune activă (relație one-to-one)

**`simulation_monthly_states`**
- `id` (Integer) - Primary key
- `session_id` (UUID) - Foreign key către `simulation_sessions`
- `month`, `year` - Identificatorul lunii
- `revenue`, `profit`, `customers`, `cash_balance` - Metrici financiare
- `market_context`, `events_data`, `trends_data`, etc. (JSON) - Output-uri complete de la agenți
- `player_decisions` (JSON) - Deciziile jucătorului
- Constraint unic: (session_id, month, year)

#### Endpoints Noi

**Autentificare**
```
POST /api/auth/register
Body: { "username": "john_doe" }
Response: { "success": true, "user_id": "uuid", "username": "john_doe" }

POST /api/auth/login
Body: { "username": "john_doe" }
Response: {
  "success": true,
  "user_id": "uuid",
  "username": "john_doe",
  "session": {
    "session_id": "uuid",
    "business_name": "Coffee Shop",
    "current_month": 3,
    "current_year": 2024,
    "latest_state": {
      "month": 3,
      "revenue": 15000,
      "profit": 3000,
      "customers": 500,
      "cash_balance": 98000
    }
  }
}
```

**Gestiune Sesiuni**
```
POST /api/simulation/create-session
Body: {
  "user_id": "uuid",
  "business_name": "Coffee Shop",
  "business_type": "restaurant",
  "industry": "Food & Beverage",
  "location": { "lat": 40.7128, "lng": -74.0060, "address": "...", ... },
  "initial_budget": 100000
}

POST /api/simulation/save-state
Body: {
  "session_id": "uuid",
  "month": 1,
  "year": 2024,
  "revenue": 12000,
  "profit": 2500,
  "customers": 450,
  "cash_balance": 99500,
  "agent_outputs": { ... },
  "player_decisions": { ... }
}

GET /api/simulation/session/{session_id}/previous-state?month=2&year=2024
Response: {
  "success": true,
  "state": {
    "revenue": 12000,
    "profit": 2500,
    "customers": 450,
    "cashBalance": 99500
  }
}

GET /api/simulation/session/{session_id}/history
Response: {
  "success": true,
  "history": [
    { "month": 1, "year": 2024, "revenue": 12000, ... },
    { "month": 2, "year": 2024, "revenue": 15000, ... }
  ]
}
```

### 2. **Frontend (React + Vite)**

#### Noi Pagini

**`/register`** - Înregistrare
- Step 1: Username
- Step 2: Business Setup (nume, industrie, produse, buget)
- Step 3: Location Selector (hartă interactivă)

**`/login`** - Autentificare
- Input simplu pentru username
- Încarcă automat sesiunea existentă

#### Auth Service (`/lib/auth.ts`)

Funcții principale:
- `register(username)` - Înregistrare user nou
- `login(username)` - Autentificare și încărcare sesiune
- `createSession(...)` - Creare sesiune nouă
- `saveMonthlyState(...)` - Salvare stare lunară
- `getAuthState()` - Obține user și sesiune din localStorage
- `logout()` - Deconectare și ștergere date locale
- `updateSession(...)` - Actualizare sesiune în localStorage

#### Modificări în Dashboard

1. **Încărcare Inițială**
   - Verifică autentificarea
   - Dacă există sesiune salvată → restabilește starea (month, year, cash balance, etc.)
   - Dacă nu → creează sesiune nouă cu datele din registration

2. **După Fiecare Simulare**
   - Salvează automat starea în baza de date
   - Actualizează localStorage cu ultima stare
   - Actualizează `current_month` și `current_year` în sesiune

3. **Logout Button**
   - Adăugat în DashboardHeader
   - Șterge toate datele locale și redirectează la `/login`

### 3. **Agents Orchestrator (Next.js)**

#### Modificări în `run-full/route.ts`

**Funcție Nouă: `fetchPreviousState()`**
```typescript
async function fetchPreviousState(
  sessionId: string | undefined,
  currentMonth: number,
  currentYear: number
): Promise<any>
```

**Logica de Încărcare a Stării**
1. Dacă `sessionId` este trimis în request → Face GET la backend pentru starea anterioară
2. Dacă găsește stare → Folosește-o pentru simulare
3. Dacă nu găsește sau nu există `sessionId` → Folosește `initialBudget` și valori default
4. Fallback final: `{ revenue: 0, profit: 0, customers: 0, cashBalance: 100000 }`

**Parametri Noi în Request**
```typescript
{
  // ... parametri existenți
  sessionId?: string,        // Pentru a extrage starea anterioară
  initialBudget?: number,    // Pentru fallback la prima lună
  previousMonthState?: {...} // Fallback manual
}
```

## Flow-ul Complet

### 1. **Utilizator Nou**

```
1. User accesează "/" (Landing) → Click "Enter Proxity"
2. Redirect la "/register"
3. Introduce username → Se creează user în DB (cu UUID)
4. Completează business details (nume, industrie, buget)
5. Selectează locația pe hartă
6. Redirect la "/dashboard"
7. Dashboard creează sesiune nouă în DB
8. User rulează prima simulare:
   - Frontend trimite sessionId + initialBudget la orchestrator
   - Orchestrator încearcă să extragă starea anterioară (nu găsește)
   - Folosește initialBudget pentru cashBalance
   - Rulează simularea cu customers=0, revenue=0
9. După simulare:
   - Frontend salvează starea în DB (month 1)
   - Actualizează localStorage cu session.current_month = 2
```

### 2. **Utilizator Existent (Login)**

```
1. User accesează "/login"
2. Introduce username
3. Backend returnează:
   - user_id
   - session_id
   - business details
   - current_month = 3 (de exemplu)
   - latest_state = { revenue: 15000, customers: 500, ... }
4. Dashboard se încarcă cu:
   - Month 3 afișat
   - Cash balance restaurat
   - Previous state setat
5. User apasă "Run Simulation":
   - Frontend trimite sessionId + currentMonth=3
   - Orchestrator face GET la backend pentru starea lunii 2
   - Găsește: { revenue: 12000, customers: 450, cashBalance: 99500 }
   - Rulează simularea folosind aceste valori ca starting point
6. După simulare:
   - Salvează starea lunii 3
   - Actualizează session.current_month = 4
```

### 3. **Continuare Simulare**

```
User este la Month 5:
1. Apasă "Run Full Month Simulation"
2. Frontend trimite: sessionId + currentMonth=5
3. Orchestrator:
   - Face GET /api/simulation/session/{sessionId}/previous-state?month=5&year=2024
   - Backend calculează: previous month = 4
   - Returnează starea lunii 4
4. Simularea pornește cu:
   - revenue = luna 4 revenue
   - customers = luna 4 customers
   - cashBalance = luna 4 cash balance
5. Agenții AI analizează creșterea/scăderea relativă la luna anterioară
6. După simulare, salvează starea lunii 5
```

## Variabile de Mediu

**Backend (`.env`)**
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nyc_business_sim
```

**Frontend (`.env`)**
```bash
VITE_GOOGLE_MAPS_API_KEY=your_key_here
VITE_API_URL=http://localhost:8000
```

**Agents Orchestrator (`.env.local`)**
```bash
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
BACKEND_API_URL=http://localhost:8000
```

## Avantaje ale Acestei Arhitecturi

1. **Simplicitate** - Username-only, fără parole
2. **Persistență Completă** - Tot state-ul este salvat în PostgreSQL
3. **Continuitate** - User poate ieși și reveni exact unde a rămas
4. **Scalabilitate** - UUID pentru users, relații clare între tabele
5. **Istoric Complet** - Fiecare lună este salvată cu toate output-urile agenților
6. **Fallback Robust** - Sistem de fallback pentru prima lună sau erori
7. **Context pentru AI** - Agenții au acces la starea anterioară pentru analize mai realiste

## Testare

### Test Flow Complet

1. **Start Services**
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Agents Orchestrator
cd agents-orchestrator
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

2. **Test Registration**
- Deschide `http://localhost:5173`
- Click "Enter Proxity"
- Username: "test_user_1"
- Business name: "Test Coffee Shop"
- Industry: "Food & Beverage"
- Select location pe hartă
- Verifică în DB: `SELECT * FROM simulation_users;`

3. **Test First Simulation**
- În Dashboard, click "Run Full Month Simulation"
- Verifică logs în orchestrator: "Using default initial state (first month)"
- Verifică în DB: `SELECT * FROM simulation_monthly_states;`

4. **Test Login & Resume**
- Logout din Dashboard
- Login cu același username
- Verifică că Month și Cash Balance sunt restaurate
- Rulează o nouă simulare
- Verifică că starea anterioară este încărcată corect

## Îmbunătățiri Viitoare

- [ ] Password protection (opțional)
- [ ] Export/Import simulări
- [ ] Multiplayer mode (compare cu alți useri)
- [ ] Achievement system
- [ ] Detailed analytics per month
- [ ] Graph pentru evoluție revenue/profit/customers
