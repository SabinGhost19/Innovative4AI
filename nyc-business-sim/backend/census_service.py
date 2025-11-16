import requests
import json
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

CENSUS_VARIABLES_MARKET_ANALYSIS = {
    "NAME": "Numele Zonei",
    "B01001_001E": "Populație Totală (Rezidenți)",
    "B01002_001E": "Vârsta Medie (Rezidenți)",
    "B19013_001E": "Venit Mediu pe Gospodărie ($)",
    "B19301_001E": "Venit pe Cap de Locuitor ($)",
    "B17001_002E": "Număr Persoane sub Pragul Sărăciei",
    "B15003_001E": "Total Populație 25+ (pt Educație)",
    "B15003_022E": "Educație: Nivel Licență",
    "B15003_023E": "Educație: Nivel Master",
    "B15003_025E": "Educație: Nivel Doctorat",
    "B25003_001E": "Total Unități Locative",
    "B25003_002E": "Locuințe Ocupate de Proprietar",
    "B25003_003E": "Locuințe Ocupate de Chiriaș",
    "B25031_001E": "Chiria Medie Brută ($)",
    "B25077_001E": "Valoarea Medie a Locuinței ($)",
    "C24050_001E": "Total Forță de Muncă (Civili 16+)",
    "C24050_007E": "Industrie: Finanțe, Asigurări, Real Estate",
    "C24050_018E": "Industrie: Artă, Divertisment, HoReCa",
    "C24050_029E": "Industrie: Servicii Profesionale, Științifice, Management",
}

def get_census_tract(lat: str, lon: str) -> Optional[Dict[str, str]]:
    """Convertește coordonatele (lat, lon) în FIPS codes (State, County, Tract)."""
    
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

def get_census_data(fips_codes: Dict[str, str], api_key: str) -> Optional[Dict[str, Any]]:
    """Interoghează API-ul Census (ACS) pentru date de market analysis și returnează rezultatele."""
    
    if not fips_codes:
        print("Interogare Census omisă (nu s-au găsit FIPS codes).")
        return None

    if not api_key or api_key == "CHEIA_TA_CENSUS_AICI":
        print("Cheie API Census invalidă.")
        return None

    print("--- Interogare Census API pentru date agregate ---")
    
    variables_to_get = ",".join(CENSUS_VARIABLES_MARKET_ANALYSIS.keys())
    
    url = (
        f"https://api.census.gov/data/2022/acs/acs5" 
        f"?get={variables_to_get}"
        f"&for=tract:{fips_codes['tract']}"
        f"&in=state:{fips_codes['state']}+county:{fips_codes['county']}"
        f"&key={api_key}"
    )
    
    response = None
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        data = response.json()
        
        if data and len(data) > 1:
            headers = data[0]
            values = data[1]
            raw_results = dict(zip(headers, values))
            
            # Convertim rezultatele într-un format structurat
            result = {
                "fips_codes": fips_codes,
                "area_name": raw_results.get("NAME", "N/A"),
                "demographics": {}
            }
            
            # Procesăm fiecare variabilă
            for code, name in CENSUS_VARIABLES_MARKET_ANALYSIS.items():
                value = raw_results.get(code, None)
                result["demographics"][code] = value
            
            # Calculăm procente utile
            try:
                total_pop = int(raw_results.get('B01001_001E', 0))
                poverty_pop = int(raw_results.get('B17001_002E', 0))
                poverty_rate = (poverty_pop / total_pop * 100) if total_pop > 0 else 0
                result["demographics"]["poverty_rate"] = round(poverty_rate, 2)
                
                total_housing = int(raw_results.get('B25003_001E', 0))
                renter_housing = int(raw_results.get('B25003_003E', 0))
                renter_rate = (renter_housing / total_housing * 100) if total_housing > 0 else 0
                result["demographics"]["renter_rate"] = round(renter_rate, 2)
                
            except Exception as e:
                print(f"Eroare la calcularea procentelor: {e}")
                result["demographics"]["poverty_rate"] = 0
                result["demographics"]["renter_rate"] = 0
            
            return result
                
        else:
            print("Nu s-au găsit date demografice pentru acest tract.")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Eroare HTTP la interogarea Census API: {e}")
        if response:
            print(f"Răspuns Server (Text): {response.text}")
        return None
            
    except json.JSONDecodeError:
        print("Eroare: Răspunsul API nu este JSON valid.")
        if response:
            print(f"Răspuns: {response.text}")
        return None
    
    except (IndexError, TypeError) as e:
        print(f"Eroare la parsarea răspunsului Census API: {e}")
        return None

def analyze_area(lat: str, lon: str) -> Optional[Dict[str, Any]]:
    """Funcție principală care face analiza completă a zonei."""
    
    api_key = os.getenv('CENSUS_API_KEY')
    
    print(f"*** Începere analiză de piață pentru ({lat}, {lon}) ***")
    fips_codes = get_census_tract(lat, lon)
    
    if not fips_codes:
        return None
    
    census_data = get_census_data(fips_codes, api_key)
    
    if census_data:
        # Adăugăm coordonatele originale
        census_data["latitude"] = float(lat)
        census_data["longitude"] = float(lon)
        
    print("*** Analiză finalizată ***")
    return census_data
