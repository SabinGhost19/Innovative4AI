# Integrare Analiză Detaliată (app4.py)

## Ce s-a modificat

### Backend

1. **Fișier nou: `backend/detailed_analysis_service.py`**
   - Conține logica din `app4.py` adaptată pentru integrare backend
   - Funcția principală: `analyze_area_detailed(lat, lon)`
   - Interogări ACS 2021 pentru profil rezidențial detaliat
   - Include date la nivel de Block și Tract
   - Calculează statistici derivate (poverty rate, high income rate, education levels, etc.)

2. **Tabel nou în `backend/database.py`: `DetailedAreaAnalysis`**
   - Tabelă separată pentru a stoca datele detaliate din app4.py
   - Conține toate variabilele ACS 2021 (40+ câmpuri):
     - Location: State, County, Tract, Block, Full IDs
     - Demographics: Population, Age
     - Income: Median, Per Capita, Breakdown pe categorii ($75k-$99k, $100k-$124k, etc.)
     - Education: Bachelor, Master, Doctorate
     - Housing: Total units, Renters, Rent as % of income
     - Transportation: Workers, Public transport, Work from home
     - Poverty: Population, Rate
   - Statistici derivate calculate automat
   - JSON complet pentru backup (raw_demographics_json, raw_derived_stats_json)
   - Foreign key către `area_overview` (area_overview_id)

3. **Modificări în `backend/main.py`**
   - Import nou: `from detailed_analysis_service import analyze_area_detailed`
   - Import: `ThreadPoolExecutor` pentru execuție paralelă
   - Import: `DetailedAreaAnalysis` din database
   - Modificat endpoint `/api/launch-business`:
     - Rulează simultan `analyze_area()` (ACS 2022 standard) și `analyze_area_detailed()` (ACS 2021 detaliat)
     - Folosește `ThreadPoolExecutor` pentru a rula ambele analize în paralel
     - **SALVEAZĂ ambele seturi de date în DB**:
       - Tabel `area_overview`: analiza standard (ACS 2022)
       - Tabel `detailed_area_analysis`: analiza detaliată (ACS 2021) cu link către area_overview
     - Returnează ambele seturi de date în răspuns:
       - `data`: analiza standard (ACS 2022)
       - `detailed_data`: analiza detaliată (ACS 2021)
   - Endpoint nou: `/api/detailed-analysis/{area_id}` - returnează analiza detaliată pentru un area_id
   - Endpoint nou: `/api/all-detailed-analyses` - returnează toate analizele detaliate

### Frontend

1. **Modificări în `frontend/src/pages/AreaAnalysisDebug.tsx`**
   - Interfață extinsă `AnalysisData` cu câmpul `detailed_data`
   - Secțiune nouă pentru "Standard Census Analysis (ACS 2022)"
   - Secțiune nouă pentru "Detailed Residential Profile (ACS 2021)" care afișează:
     - Location Details (State, County, Tract, Block, Full IDs)
     - Key Market Indicators (cards cu statistici derivate)
     - Tabel complet cu toate variabilele demografice detaliate
     - Raw JSON expandabil pentru debugging

## Cum funcționează

### Flow-ul de date:

```
1. User apasă "Launch My Business" în Confirmation.tsx
   ↓
2. Frontend trimite POST /api/launch-business cu lat/lon
   ↓
3. Backend rulează în PARALEL:
   - analyze_area() → Date ACS 2022 standard
   - analyze_area_detailed() → Date ACS 2021 detaliate
   ↓
4. Backend SALVEAZĂ în DB:
   - Tabel area_overview → Date standard
   - Tabel detailed_area_analysis → Date detaliate (cu FK către area_overview)
   ↓
5. Backend returnează ambele seturi de date
   ↓
6. Frontend salvează în localStorage
   ↓
7. AreaAnalysisDebug.tsx afișează:
   - Analiza standard (existentă)
   - Analiza detaliată (nouă) cu:
     * FIPS codes complete (inclusiv Block)
     * Statistici derivate (poverty rate, income, education, etc.)
     * Toate variabilele demografice în format tabelar
```

## Structura bazei de date

### Tabel: `area_overview` (existent, neschimbat)
- Date standard ACS 2022
- ~25 câmpuri demografice

### Tabel: `detailed_area_analysis` (NOU)
- Date detaliate ACS 2021
- ~60 câmpuri:
  - 8 câmpuri location (state, county, tract, block, full IDs)
  - 2 câmpuri demographics basic
  - 8 câmpuri income (breakdown pe categorii)
  - 4 câmpuri education
  - 3 câmpuri housing
  - 3 câmpuri transportation
  - 1 câmp poverty
  - 7 câmpuri statistici derivate calculate
  - 2 câmpuri JSON pentru backup complet
  - 1 câmp foreign key către area_overview

## Endpoints API

### POST `/api/launch-business`
- Input: `{ latitude, longitude, business_name, industry }`
- Output: 
  ```json
  {
    "success": true,
    "message": "...",
    "area_id": 123,
    "data": { /* ACS 2022 standard */ },
    "detailed_data": { /* ACS 2021 detaliat */ }
  }
  ```

### GET `/api/area-overview/{area_id}`
- Returnează datele standard pentru un area_id

### GET `/api/detailed-analysis/{area_id}`
- **NOU**: Returnează analiza detaliată pentru un area_id
- Include toate câmpurile din tabel + JSON-uri complete

### GET `/api/all-detailed-analyses`
- **NOU**: Returnează toate analizele detaliate (paginate)

## Date disponibile în analiza detaliată

### Variabile ACS 2021:
- Populație și vârstă medie
- Venituri pe gospodărie (breakdown pe categorii: $75k-$99k, $100k-$124k, etc.)
- Educație (Licență, Master, Doctorat)
- Locuințe (Total, chirias, proprietar, procent chirie din venit)
- Transport (Mijloace publice, Work from home)
- Sărăcie

### Statistici derivate calculate automat:
- `poverty_rate`: Procentul populației sub pragul sărăciei
- `high_income_households_rate`: % gospodării cu venit >$75k
- `bachelor_plus_rate`: % populație cu Licență sau mai sus
- `renter_rate`: % locuințe ocupate de chiriași
- `work_from_home_rate`: % lucrători care muncesc de acasă

## Avantaje

1. **Paralelism**: Ambele analize rulează simultan → timp de răspuns mai rapid
2. **Date complementare**: 
   - ACS 2022 (standard): date generale, mai recente
   - ACS 2021 (detaliat): date ultra-locale la nivel de Block, breakdown pe categorii
3. **Zero impact pe funcționalitatea existentă**: Datele standard continuă să fie salvate în DB
4. **Flexibilitate**: Datele detaliate sunt opționale - dacă API-ul eșuează, aplicația funcționează normal

## Testare

1. Pornește backend-ul:
```bash
cd backend
uvicorn main:app --reload
```

2. Pornește frontend-ul:
```bash
cd frontend
npm run dev
```

3. Parcurge flow-ul de onboarding până la "Launch My Business"
4. Observă în consolă că ambele analize rulează în paralel
5. În pagina `/area-analysis` vei vedea:
   - Secțiunea "Standard Census Analysis"
   - Secțiunea "Detailed Residential Profile" (dacă analiza a reușit)

## Note tehnice

- `ThreadPoolExecutor(max_workers=2)`: rulează exact 2 task-uri în paralel
- `.submit()` returnează un Future care poate fi așteptat cu `.result()`
- Dacă analiza detaliată eșuează, aplicația continuă cu datele standard
- Toate print-urile din servicii apar în consola backend pentru debugging
