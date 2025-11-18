import requests
import json
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

ACS_VARIABLES = {
    "NAME": "Numele Zonei",
    "B01003_001E": "Populație Totală (Rezidenți)",
    "B01002_001E": "Vârsta Medie (Rezidenți)",
    "B19013_001E": "Venit Mediu pe Gospodărie ($)",
    "B19301_001E": "Venit pe Cap de Locuitor ($)",
    "B19001_001E": "Total Gospodării (pt Venit)",
    "B19001_013E": "  -> Gospodării cu Venit $75k-$99k",
    "B19001_014E": "  -> Gospodării cu Venit $100k-$124k",
    "B19001_015E": "  -> Gospodării cu Venit $125k-$149k",
    "B19001_016E": "  -> Gospodării cu Venit $150k-$199k",
    "B19001_017E": "  -> Gospodării cu Venit $200k+",
    "B15003_001E": "Total Populație 25+ (pt Educație)",
    "B15003_022E": "  -> Educație: Nivel Licență",
    "B15003_023E": "  -> Educație: Nivel Master",
    "B15003_025E": "  -> Educație: Nivel Doctorat",
    "B25003_001E": "Total Unități Locative",
    "B25003_003E": "  -> Locuințe Ocupate de Chiriaș",
    "B25071_001E": "Chirie Medie ca % din Venit",
    "B08301_001E": "Total Muncitori Rezidenți 16+",
    "B08301_010E": "  -> Transport: Mijloace Publice",
    "B08301_021E": "  -> Transport: Muncă de Acasă",
    "B17001_002E": "Număr Persoane sub Pragul Sărăciei",
}

ACS_YEAR = "2021"


def get_full_geocoding(lat: str, lon: str) -> Optional[Dict[str, str]]:
    """Convertește coordonatele în FIPS codes (State, County, Tract, Block)."""
    
    print(f"--- DETAILED ANALYSIS: Geocoding {lat}, {lon} ---")
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
        
        geographies = data.get('result', {}).get('geographies', {})
        tracts = geographies.get('Census Tracts', []) 
        blocks = geographies.get('2020 Census Blocks', []) 
        
        if not tracts or not blocks:
            print("Eroare: Nu s-au găsit Census Tract sau Block pentru aceste coordonate.")
            return None
            
        tract_info = tracts[0]
        block_info = blocks[0]
        
        fips = {
            "state": tract_info.get('STATE'),
            "county": tract_info.get('COUNTY'),
            "tract": tract_info.get('TRACT'),
            "block": block_info.get('BLOCK'),
            "full_tract_id": f"{tract_info.get('STATE')}{tract_info.get('COUNTY')}{tract_info.get('TRACT')}",
            "full_block_id": f"{block_info.get('STATE')}{block_info.get('COUNTY')}{block_info.get('TRACT')}{block_info.get('BLOCK')}",
        }
        
        print(f"Zonă Găsită (FIPS):")
        print(f"  State:  {fips['state']}")
        print(f"  County: {fips['county']}")
        print(f"  Tract:  {fips['tract']}")
        print(f"  Block:  {fips['block']}\n")
        return fips
        
    except requests.exceptions.RequestException as e:
        print(f"Eroare la interogarea API-ului Geocoding: {e}")
        return None


def get_acs_detailed_profile(fips: Dict[str, str], api_key: str, year: str = ACS_YEAR) -> Optional[Dict[str, Any]]:
    """Interoghează API-ul Census (ACS) pentru profilul rezidențial detaliat al TRACT-ului."""
    
    print(f"--- Profil REZIDENȚIAL DETALIAT (ACS {year}) ---")
    print(f"Nivel: Census Tract ({fips['full_tract_id']})\n")

    if not api_key or api_key == "CHEIA_TA_CENSUS_AICI":
        print("Interogare ACS omisă (API Key lipsește).")
        return None

    variables_to_get = ",".join(ACS_VARIABLES.keys())
    
    url = (
        f"https://api.census.gov/data/{year}/acs/acs5" 
        f"?get={variables_to_get}"
        f"&for=tract:{fips['tract']}"
        f"&in=state:{fips['state']}+county:{fips['county']}"
        f"&key={api_key}"
    )
    
    response = None
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if not data or len(data) < 2:
            print("Nu s-au găsit date ACS pentru acest tract.")
            return None

        headers = data[0]
        values = data[1]
        raw = dict(zip(headers, values))

        # Convertim rezultatele într-un format structurat
        result = {
            "fips_codes": fips,
            "area_name": raw.get("NAME", "N/A"),
            "year": year,
            "demographics_detailed": {}
        }
        
        # Procesăm fiecare variabilă
        for code, name in ACS_VARIABLES.items():
            value = raw.get(code, None)
            result["demographics_detailed"][code] = {
                "value": value,
                "label": name
            }
        
        # Calculăm procente și statistici derivate
        try:
            total_pop = int(raw.get('B01003_001E', 0))
            poverty_pop = int(raw.get('B17001_002E', 0))
            poverty_rate = (poverty_pop / total_pop * 100) if total_pop > 0 else 0
            
            total_households = int(raw.get('B19001_001E', 0))
            high_income_hh = (
                int(raw.get('B19001_013E', 0)) +
                int(raw.get('B19001_014E', 0)) +
                int(raw.get('B19001_015E', 0)) +
                int(raw.get('B19001_016E', 0)) +
                int(raw.get('B19001_017E', 0))
            )
            high_income_rate = (high_income_hh / total_households * 100) if total_households > 0 else 0
            
            total_edu = int(raw.get('B15003_001E', 0))
            bachelor_plus = (
                int(raw.get('B15003_022E', 0)) +
                int(raw.get('B15003_023E', 0)) +
                int(raw.get('B15003_025E', 0))
            )
            bachelor_plus_rate = (bachelor_plus / total_edu * 100) if total_edu > 0 else 0
            
            total_housing = int(raw.get('B25003_001E', 0))
            renter_housing = int(raw.get('B25003_003E', 0))
            renter_rate = (renter_housing / total_housing * 100) if total_housing > 0 else 0
            
            total_workers = int(raw.get('B08301_001E', 0))
            work_from_home = int(raw.get('B08301_021E', 0))
            wfh_rate = (work_from_home / total_workers * 100) if total_workers > 0 else 0
            
            result["derived_statistics"] = {
                "poverty_rate": round(poverty_rate, 2),
                "high_income_households_rate": round(high_income_rate, 2),
                "bachelor_plus_rate": round(bachelor_plus_rate, 2),
                "renter_rate": round(renter_rate, 2),
                "work_from_home_rate": round(wfh_rate, 2),
                "high_income_count": high_income_hh,
                "bachelor_plus_count": bachelor_plus
            }
            
        except Exception as e:
            print(f"Eroare la calcularea statisticilor derivate: {e}")
            result["derived_statistics"] = {}
        
        print("✓ Date ACS detaliate obținute cu succes")
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"Eroare HTTP la interogarea ACS API: {e}")
        if response:
            print(f"Răspuns Server (Text): {response.text}")
        return None
    except Exception as e:
        print(f"Eroare la parsarea datelor ACS: {e}")
        return None


def analyze_area_detailed(lat: str, lon: str) -> Optional[Dict[str, Any]]:
    """Funcție principală care face analiza detaliată a zonei (similar cu app4.py)."""
    
    api_key = os.getenv('CENSUS_API_KEY')
    
    print(f"*** Începere analiză ultra-locală pentru ({lat}, {lon}) ***")
    
    if not api_key or api_key == "CHEIA_TA_CENSUS_AICI":
        print("EROARE: Cheie CENSUS_API_KEY lipsește.")
        return None
    
    fips_codes = get_full_geocoding(lat, lon)
    
    if not fips_codes:
        return None
    
    acs_data = get_acs_detailed_profile(fips_codes, api_key, ACS_YEAR)
    
    if acs_data:
        # Adăugăm coordonatele originale
        acs_data["latitude"] = float(lat)
        acs_data["longitude"] = float(lon)
        acs_data["analysis_type"] = "detailed_residential_profile"
        
    print("*** Analiză detaliată finalizată ***\n")
    return acs_data
