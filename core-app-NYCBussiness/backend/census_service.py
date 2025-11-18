import requests
import json
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import SessionLocal, CensusTractData

load_dotenv()

def get_census_tract(lat: str, lon: str) -> Optional[Dict[str, str]]:
    """
    Convertește coordonatele (lat, lon) în FIPS codes (State, County, Tract).
    MODIFICAT: Folosește geocoding API pentru a obține FIPS, apoi verifică în baza de date locală.
    """
    
    print(f"--- Geocoding {lat}, {lon} ---")
    url = (
        f"https://geocoding.geo.census.gov/geocoder/geographies/coordinates"
        f"?x={lon}&y={lat}"
        f"&benchmark=Public_AR_Current"
        f"&vintage=Current_Current"
        f"&format=json"
    )
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        tracts = data.get('result', {}).get('geographies', {}).get('Census Tracts', [])
        
        if not tracts:
            print("Nu s-a găsit niciun Census Tract pentru aceste coordonate.")
            return None
            
        tract_info = tracts[0]
        fips = {
            "state": tract_info.get('STATE'),
            "county": tract_info.get('COUNTY'),
            "tract": tract_info.get('TRACT')
        }
        
        print(f"Zonă găsită: State={fips['state']}, County={fips['county']}, Tract={fips['tract']}")
        return fips
        
    except requests.exceptions.RequestException as e:
        print(f"Eroare la interogarea API-ului Geocoding: {e}")
        return None


def get_census_data_from_db(fips_codes: Dict[str, str]) -> Optional[Dict[str, Any]]:
    """
    Interoghează BAZA DE DATE LOCALĂ pentru datele census în loc de API-ul Census.
    Returnează date în același format ca get_census_data() pentru compatibilitate.
    """
    
    if not fips_codes:
        print("Interogare Census omisă (nu s-au găsit FIPS codes).")
        return None

    print("--- Interogare BAZA DE DATE LOCALĂ pentru date census ---")
    
    # Construim FIPS_Tract_Full pentru căutare
    state = fips_codes['state']
    county = fips_codes['county']
    tract = fips_codes['tract']
    fips_full = f"{state}{county}{tract}"
    
    print(f"Căutare în DB pentru FIPS: {fips_full}")
    
    db = SessionLocal()
    try:
        # Căutăm în baza de date
        census_record = db.query(CensusTractData).filter(
            CensusTractData.fips_tract_full == fips_full
        ).first()
        
        if not census_record:
            print(f"❌ Nu s-au găsit date în DB pentru FIPS: {fips_full}")
            return None
        
        print(f"✅ Date găsite în DB pentru: {census_record.area_name}")
        
        # Convertim datele din DB în formatul compatibil cu API-ul vechi
        result = {
            "fips_codes": fips_codes,
            "area_name": census_record.area_name or "N/A",
            "demographics": {
                "NAME": census_record.area_name,
                "B01001_001E": str(int(census_record.resident_population_total)) if census_record.resident_population_total else None,
                "B01002_001E": str(census_record.resident_median_age) if census_record.resident_median_age else None,
                "B19013_001E": str(int(census_record.resident_median_household_income)) if census_record.resident_median_household_income else None,
                "B19301_001E": None,  # Nu avem acest câmp în CSV
                "B17001_002E": str(int(census_record.resident_population_total * census_record.pct_poverty)) if (census_record.resident_population_total and census_record.pct_poverty) else None,
                "B15003_001E": None,  # Nu avem total population 25+
                "B15003_022E": str(int(census_record.resident_population_total * census_record.pct_bachelors)) if (census_record.resident_population_total and census_record.pct_bachelors) else None,
                "B15003_023E": None,  # Nu avem masters degree separat
                "B15003_025E": None,  # Nu avem doctorate separat
                "B25003_001E": None,  # Nu avem total housing units
                "B25003_002E": None,  # Nu avem owner occupied
                "B25003_003E": None,  # Poate fi calculat din pct_renters dacă avem total
                "B25031_001E": None,  # Nu avem median rent
                "B25077_001E": None,  # Nu avem median home value
                "C24050_001E": str(int(census_record.workforce_total_jobs)) if census_record.workforce_total_jobs else None,
                "C24050_007E": None,  # Nu avem finance/insurance
                "C24050_018E": None,  # Nu avem arts/entertainment
                "C24050_029E": str(int(census_record.workforce_total_jobs * census_record.pct_jobs_prof_services)) if (census_record.workforce_total_jobs and census_record.pct_jobs_prof_services) else None,
                
                # Date calculate
                "poverty_rate": round(census_record.pct_poverty * 100, 2) if census_record.pct_poverty else 0,
                "renter_rate": round(census_record.pct_renters * 100, 2) if census_record.pct_renters else 0,
                
                # Date suplimentare din CSV
                "cluster": census_record.cluster,
                "pct_bachelors": census_record.pct_bachelors,
                "pct_jobs_young": census_record.pct_jobs_young,
                "pct_jobs_high_earn": census_record.pct_jobs_high_earn,
                "pct_jobs_prof_services": census_record.pct_jobs_prof_services,
                "pct_jobs_healthcare": census_record.pct_jobs_healthcare,
            }
        }
        
        return result
        
    except Exception as e:
        print(f"❌ Eroare la interogarea bazei de date: {e}")
        return None
    finally:
        db.close()


def get_census_data(fips_codes: Dict[str, str], api_key: str) -> Optional[Dict[str, Any]]:
    """
    FUNCȚIE DEPRECATED - Păstrată pentru compatibilitate.
    Acum redirecționează către get_census_data_from_db().
    """
    print("⚠️  get_census_data() este deprecated. Se folosește baza de date locală...")
    return get_census_data_from_db(fips_codes)


def analyze_area(lat: str, lon: str) -> Optional[Dict[str, Any]]:
    """
    Funcție principală care face analiza completă a zonei.
    MODIFICAT: Folosește baza de date locală în loc de API-ul Census.
    """
    
    print(f"*** Începere analiză de piață pentru ({lat}, {lon}) ***")
    fips_codes = get_census_tract(lat, lon)
    
    if not fips_codes:
        return None
    
    # Folosim noua funcție care citește din DB
    census_data = get_census_data_from_db(fips_codes)
    
    if census_data:
        # Adăugăm coordonatele originale
        census_data["latitude"] = float(lat)
        census_data["longitude"] = float(lon)
        
    print("*** Analiză finalizată ***")
    return census_data
