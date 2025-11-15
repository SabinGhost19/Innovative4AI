# Ghid de Testare - Integrare Coordonate din Hartă

## Ce s-a modificat

### Frontend - Confirmation.tsx

1. **Validare obligatorie a locației**:
   - Verifică dacă `businessData.location` există și are `lat` și `lng`
   - Afișează eroare clară dacă utilizatorul nu a selectat o locație

2. **Afișare coordonate**:
   - Afișează coordonatele exacte selectate (lat, lng) în pagina de confirmare
   - Indicator vizual dacă locația lipsește (card roșu)

3. **Buton dezactivat**:
   - Butonul "Launch My Business" este dezactivat dacă nu există locație
   - Mesaj de avertizare vizibil

4. **Console logging**:
   - Log-uri în consolă pentru coordonatele trimise la backend
   - Ușor de urmărit în Developer Tools

### Flow-ul complet

```
1. User selectează business name, industry, products, budget
   ↓
2. User merge la pagina de Location
   ↓
3. User TREBUIE să CLICK pe hartă pentru a selecta o locație
   ↓
4. InteractiveMap captează coordonatele (lat, lng)
   ↓
5. Google Maps Geocoding returnează address + neighborhood
   ↓
6. LocationSelector salvează locația în businessData.location
   ↓
7. User merge la Confirmation
   ↓
8. Confirmation afișează:
   - Neighborhood
   - Address
   - Coordonate exacte (lat, lng)
   ↓
9. User apasă "Launch My Business"
   ↓
10. Confirmation trimite la backend:
    - latitude: businessData.location.lat
    - longitude: businessData.location.lng
    - business_name
    - industry
   ↓
11. Backend rulează analizele cu EXACT aceste coordonate
```

## Cum să testezi

### 1. Pornește aplicațiile

**Backend:**
```bash
cd nyc-business-sim/backend
uvicorn main:app --reload
```

**Frontend:**
```bash
cd nyc-business-sim/frontend
npm run dev
```

### 2. Parcurge flow-ul de onboarding

1. **Step 1 - Business Setup**:
   - Introdu un business name
   - Selectează industry (ex: Coffee Shop)
   - Selectează produse (min. 1)
   - Click "Continue to Location"

2. **Step 2 - Location Selector**:
   - **IMPORTANT**: Click UNDEVA pe hartă în NYC
   - Observă marker-ul albastru care apare
   - Verifică că apare card-ul verde "Selected Location"
   - Verifică adresa și coordonatele afișate
   - Click "Continue to Review"

3. **Step 3 - Confirmation**:
   - Verifică că secțiunea Location afișează:
     - ✅ Neighborhood (ex: "Manhattan")
     - ✅ Address (ex: "123 Main St, New York, NY")
     - ✅ Coordinates (ex: "40.758396, -73.985130")
   - Deschide **Browser Console** (F12)
   - Click "Launch My Business"
   - Observă în consolă:
     ```
     Launching business with coordinates: { latitude: 40.758396, longitude: -73.985130 }
     Location details: { lat: 40.758396, lng: -73.985130, address: "...", neighborhood: "..." }
     ```

### 3. Verifică în Backend

În consola backend, ar trebui să vezi:
```
Procesare cerere pentru lat=40.758396, lon=-73.985130
--- DETAILED ANALYSIS: Geocoding 40.758396, -73.985130 ---
--- Geocoding 40.758396, -73.985130 ---
Zonă Găsită (FIPS):
  State:  36
  County: 061
  Tract:  012300
  Block:  1001
```

### 4. Verifică în Database

```bash
docker-compose exec db psql -U businessuser -d nyc_business_db
```

```sql
-- Vezi ultima înregistrare cu coordonatele exacte
SELECT 
    id,
    area_name,
    latitude,
    longitude,
    state_fips,
    county_fips,
    tract_fips,
    total_population,
    median_household_income
FROM area_overview 
ORDER BY created_at DESC 
LIMIT 1;

-- Vezi analiza detaliată cu Block
SELECT 
    id,
    area_name,
    latitude,
    longitude,
    block_fips,
    full_block_id,
    high_income_households_rate,
    bachelor_plus_rate
FROM detailed_area_analysis 
ORDER BY created_at DESC 
LIMIT 1;
```

### 5. Verifică în Frontend - Debug Page

După "Launch", vei fi redirectat la `/area-analysis`:

- **Standard Census Analysis**: Date ACS 2022 pentru coordonatele selectate
- **Detailed Residential Profile**: Date ACS 2021 cu Block-level pentru aceleași coordonate

## Scenarii de testare

### ✅ Scenariul 1: Flow normal (SUCCESS)
1. Completează toate pasurile
2. **CLICK pe hartă** pentru a selecta locație
3. Coordonatele din frontend == coordonatele trimise la backend
4. Backend returnează date Census pentru acea locație exactă

### ❌ Scenariul 2: Fără locație selectată (VALIDATION)
1. Completează Step 1
2. La Step 2, **NU face click pe hartă**
3. Click "Continue to Review"
4. În Confirmation vei vedea:
   - Card roșu "No Location Selected"
   - Buton "Launch My Business" DISABLED
   - Mesaj de avertizare
5. Nu poți lansa business-ul până nu te întorci și selectezi o locație

### ✅ Scenariul 3: Locații diferite (VERIFICATION)
1. **Test 1**: Click în Manhattan (ex: Times Square - 40.758, -73.985)
2. Verifică în backend logs: `lat=40.758...`
3. **Test 2**: Click în Brooklyn (ex: 40.650, -73.950)
4. Verifică în backend logs: `lat=40.650...`
5. Compară datele Census - ar trebui să fie diferite pentru cele două locații

## Troubleshooting

### Problema: "No Location Selected" deși am dat click pe hartă

**Cauze posibile:**
1. Click-ul a fost în afara NYC bounds
2. API Key Google Maps lipsește sau invalid
3. Nu s-a apelat `updateBusinessData` în LocationSelector

**Soluție:**
- Verifică că ai `.env` în frontend cu `VITE_GOOGLE_MAPS_API_KEY`
- Click doar în zona NYC (hartă restricționată)
- Verifică în console dacă apare eroare de geocoding

### Problema: Coordonate greșite în backend

**Verificare:**
1. Deschide Console în browser (F12)
2. Caută log-ul: `Launching business with coordinates:`
3. Compară cu coordonatele afișate în Confirmation page
4. Dacă sunt diferite → bug în cod (raportează)
5. Dacă sunt identice → verifică backend logs

### Problema: "Failed to launch business"

**Verificare:**
1. Backend pornit? (http://localhost:8000/health)
2. Database pornit? (`docker-compose ps`)
3. CENSUS_API_KEY valid în `backend/.env`?
4. Verifică backend logs pentru erori

## Exemple de coordonate NYC valide

Pentru testare rapidă, poți folosi aceste locații:

| Locație | Latitude | Longitude |
|---------|----------|-----------|
| Times Square | 40.758896 | -73.985130 |
| Brooklyn Bridge | 40.706086 | -73.996864 |
| Central Park | 40.785091 | -73.968285 |
| Financial District | 40.707810 | -74.011240 |
| Williamsburg | 40.714086 | -73.961334 |

## Rezultate așteptate

După un test reușit:

1. ✅ Frontend afișează coordonatele selectate
2. ✅ Backend logs arată aceleași coordonate
3. ✅ Database conține 2 înregistrări:
   - 1x în `area_overview`
   - 1x în `detailed_area_analysis`
4. ✅ Ambele înregistrări au EXACT aceleași coordonate (lat, lng)
5. ✅ Debug page afișează date Census pentru locația selectată
