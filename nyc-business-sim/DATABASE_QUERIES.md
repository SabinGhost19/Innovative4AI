# Verificare Date în Baza de Date PostgreSQL

## Conectare la baza de date

### Opțiunea 1: Din container Docker
```bash
cd nyc-business-sim
docker-compose exec db psql -U businessuser -d nyc_business_db
```

### Opțiunea 2: Direct cu psql (dacă ai PostgreSQL local)
```bash
psql -h localhost -p 5432 -U businessuser -d nyc_business_db
```

## Comenzi SQL utile

### 1. Vezi toate tabelele
```sql
\dt
```

Ar trebui să vezi:
- `area_overview` (tabel existent)
- `detailed_area_analysis` (tabel NOU)

### 2. Vezi structura tabelului detailed_area_analysis
```sql
\d detailed_area_analysis
```

### 3. Vezi toate înregistrările din area_overview
```sql
SELECT id, area_name, latitude, longitude, total_population, median_household_income 
FROM area_overview 
ORDER BY created_at DESC;
```

### 4. Vezi toate înregistrările din detailed_area_analysis
```sql
SELECT id, area_overview_id, area_name, block_fips, total_population, 
       high_income_households_rate, bachelor_plus_rate, work_from_home_rate
FROM detailed_area_analysis 
ORDER BY created_at DESC;
```

### 5. Vezi datele legate (JOIN)
```sql
SELECT 
    ao.id as area_id,
    ao.area_name,
    ao.total_population as pop_standard,
    dao.total_population as pop_detailed,
    dao.high_income_households_rate,
    dao.bachelor_plus_rate,
    dao.work_from_home_rate,
    dao.block_fips,
    dao.full_block_id
FROM area_overview ao
LEFT JOIN detailed_area_analysis dao ON ao.id = dao.area_overview_id
ORDER BY ao.created_at DESC;
```

### 6. Vezi statisticile derivate pentru ultima analiză
```sql
SELECT 
    area_name,
    poverty_rate,
    high_income_households_rate,
    high_income_count,
    bachelor_plus_rate,
    bachelor_plus_count,
    renter_rate,
    work_from_home_rate
FROM detailed_area_analysis
ORDER BY created_at DESC
LIMIT 1;
```

### 7. Vezi breakdown-ul de venituri
```sql
SELECT 
    area_name,
    total_households,
    households_75k_99k,
    households_100k_124k,
    households_125k_149k,
    households_150k_199k,
    households_200k_plus
FROM detailed_area_analysis
ORDER BY created_at DESC
LIMIT 1;
```

### 8. Vezi JSON-urile complete
```sql
SELECT 
    area_name,
    raw_demographics_json,
    raw_derived_stats_json
FROM detailed_area_analysis
ORDER BY created_at DESC
LIMIT 1;
```

### 9. Numără înregistrările
```sql
SELECT 
    (SELECT COUNT(*) FROM area_overview) as total_area_overview,
    (SELECT COUNT(*) FROM detailed_area_analysis) as total_detailed_analysis;
```

### 10. Șterge toate datele (pentru reset)
```sql
-- ATENȚIE: Șterge toate datele!
TRUNCATE TABLE detailed_area_analysis CASCADE;
TRUNCATE TABLE area_overview CASCADE;
```

## Verificare după test

După ce rulezi aplicația și apeși "Launch My Business", rulează:

```sql
-- Verifică ultima înregistrare standard
SELECT * FROM area_overview ORDER BY created_at DESC LIMIT 1;

-- Verifică ultima înregistrare detaliată
SELECT * FROM detailed_area_analysis ORDER BY created_at DESC LIMIT 1;

-- Verifică link-ul dintre ele
SELECT 
    ao.id as area_id,
    dao.id as detailed_id,
    dao.area_overview_id,
    ao.area_name,
    dao.block_fips,
    dao.high_income_households_rate
FROM area_overview ao
JOIN detailed_area_analysis dao ON ao.id = dao.area_overview_id
ORDER BY ao.created_at DESC
LIMIT 1;
```

## Export date în CSV

```sql
-- Export area_overview
\copy (SELECT * FROM area_overview) TO '/tmp/area_overview.csv' CSV HEADER;

-- Export detailed_area_analysis
\copy (SELECT * FROM detailed_area_analysis) TO '/tmp/detailed_analysis.csv' CSV HEADER;
```

## Ieșire din psql
```
\q
```
