"""
Script pentru popularea bazei de date cu datele din CSV la startup.
Acest script citește ny_tract_clusters_2022.csv și populează tabelul census_tract_data.
"""

import csv
import os
import sys
from sqlalchemy.orm import Session
from database import engine, SessionLocal, CensusTractData, init_db

def parse_float(value):
    """Convertește o valoare în float, returnează None dacă nu este posibil."""
    try:
        return float(value) if value and value.strip() else None
    except (ValueError, AttributeError):
        return None

def parse_int(value):
    """Convertește o valoare în int, returnează None dacă nu este posibil."""
    try:
        return int(value) if value and value.strip() else None
    except (ValueError, AttributeError):
        return None

def extract_fips_components(fips_full):
    """
    Extrage componentele FIPS din FIPS_Tract_Full.
    Format: SSCCCTTTTTT (11 caractere)
    SS = State (2), CCC = County (3), TTTTTT = Tract (6)
    """
    if not fips_full or len(fips_full) != 11:
        return None, None, None
    
    state = fips_full[0:2]
    county = fips_full[2:5]
    tract = fips_full[5:11]
    
    return state, county, tract

def populate_census_data(csv_path: str, db: Session):
    """Populează baza de date cu datele din CSV."""
    
    if not os.path.exists(csv_path):
        print(f"❌ Fișierul CSV nu există: {csv_path}")
        return False
    
    print(f"📊 Citesc datele din {csv_path}...")
    
    records_added = 0
    records_updated = 0
    records_failed = 0
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                try:
                    fips_full = row['FIPS_Tract_Full']
                    state, county, tract = extract_fips_components(fips_full)
                    
                    if not all([state, county, tract]):
                        print(f"⚠️  FIPS invalid: {fips_full}")
                        records_failed += 1
                        continue
                    
                    # Verificăm dacă recordul există deja
                    existing = db.query(CensusTractData).filter(
                        CensusTractData.fips_tract_full == fips_full
                    ).first()
                    
                    if existing:
                        # Actualizăm recordul existent
                        existing.area_name = row.get('Area_Name')
                        existing.cluster = parse_int(row.get('Cluster'))
                        existing.state_fips = state
                        existing.county_fips = county
                        existing.tract_fips = tract
                        existing.resident_population_total = parse_float(row.get('Resident_Population_Total'))
                        existing.resident_median_age = parse_float(row.get('Resident_Median_Age'))
                        existing.resident_median_household_income = parse_float(row.get('Resident_Median_Household_Income'))
                        existing.pct_bachelors = parse_float(row.get('Pct_Bachelors'))
                        existing.pct_renters = parse_float(row.get('Pct_Renters'))
                        existing.pct_poverty = parse_float(row.get('Pct_Poverty'))
                        existing.workforce_total_jobs = parse_float(row.get('Workforce_Total_Jobs'))
                        existing.pct_jobs_young = parse_float(row.get('Pct_Jobs_Young'))
                        existing.pct_jobs_high_earn = parse_float(row.get('Pct_Jobs_High_Earn'))
                        existing.pct_jobs_prof_services = parse_float(row.get('Pct_Jobs_Prof_Services'))
                        existing.pct_jobs_healthcare = parse_float(row.get('Pct_Jobs_Healthcare'))
                        
                        records_updated += 1
                    else:
                        # Creăm un record nou
                        census_data = CensusTractData(
                            fips_tract_full=fips_full,
                            area_name=row.get('Area_Name'),
                            cluster=parse_int(row.get('Cluster')),
                            state_fips=state,
                            county_fips=county,
                            tract_fips=tract,
                            resident_population_total=parse_float(row.get('Resident_Population_Total')),
                            resident_median_age=parse_float(row.get('Resident_Median_Age')),
                            resident_median_household_income=parse_float(row.get('Resident_Median_Household_Income')),
                            pct_bachelors=parse_float(row.get('Pct_Bachelors')),
                            pct_renters=parse_float(row.get('Pct_Renters')),
                            pct_poverty=parse_float(row.get('Pct_Poverty')),
                            workforce_total_jobs=parse_float(row.get('Workforce_Total_Jobs')),
                            pct_jobs_young=parse_float(row.get('Pct_Jobs_Young')),
                            pct_jobs_high_earn=parse_float(row.get('Pct_Jobs_High_Earn')),
                            pct_jobs_prof_services=parse_float(row.get('Pct_Jobs_Prof_Services')),
                            pct_jobs_healthcare=parse_float(row.get('Pct_Jobs_Healthcare'))
                        )
                        
                        db.add(census_data)
                        records_added += 1
                    
                    # Commit la fiecare 100 de recorduri pentru a evita problemele de memorie
                    if (records_added + records_updated) % 100 == 0:
                        db.commit()
                        print(f"✅ Procesate {records_added + records_updated} recorduri...")
                        
                except Exception as e:
                    print(f"❌ Eroare la procesarea rândului {row.get('FIPS_Tract_Full', 'unknown')}: {e}")
                    records_failed += 1
                    continue
            
            # Commit final
            db.commit()
            
            print(f"\n✅ Populare finalizată cu succes!")
            print(f"   📝 Recorduri adăugate: {records_added}")
            print(f"   🔄 Recorduri actualizate: {records_updated}")
            print(f"   ❌ Recorduri eșuate: {records_failed}")
            print(f"   📊 Total procesate: {records_added + records_updated + records_failed}")
            
            return True
            
    except Exception as e:
        print(f"❌ Eroare critică la citirea CSV: {e}")
        db.rollback()
        return False

def main():
    """Funcția principală care inițializează DB și populează datele."""
    
    print("🚀 Inițializare bază de date...")
    
    # Inițializăm tabelele
    init_db()
    print("✅ Tabele create/verificate")
    
    # Determinăm calea către CSV
    # Asumăm că CSV-ul este în același director cu scriptul sau în directorul părinte
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Încercăm mai multe locații posibile pentru CSV
    possible_paths = [
        os.path.join(script_dir, 'ny_tract_clusters_2022.csv'),
        os.path.join(script_dir, '..', 'ny_tract_clusters_2022.csv'),
        '/app/ny_tract_clusters_2022.csv',  # Path în Docker
        'ny_tract_clusters_2022.csv'  # Path relativ
    ]
    
    csv_path = None
    for path in possible_paths:
        if os.path.exists(path):
            csv_path = path
            break
    
    if not csv_path:
        print("❌ Nu s-a găsit fișierul CSV în locațiile așteptate:")
        for path in possible_paths:
            print(f"   - {path}")
        sys.exit(1)
    
    print(f"📍 CSV găsit la: {csv_path}")
    
    # Creăm sesiunea de DB
    db = SessionLocal()
    
    try:
        # Verificăm dacă baza de date este deja populată
        count = db.query(CensusTractData).count()
        
        if count > 0:
            print(f"ℹ️  Baza de date conține deja {count} recorduri.")
            print("🔄 Se vor actualiza recordurile existente și se vor adăuga cele noi...")
        else:
            print("📝 Baza de date este goală. Se va popula...")
        
        # Populăm datele
        success = populate_census_data(csv_path, db)
        
        if success:
            print("\n✅ Script finalizat cu succes!")
            sys.exit(0)
        else:
            print("\n❌ Script finalizat cu erori!")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Eroare critică: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
