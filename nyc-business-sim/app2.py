import requests
import json # Asigură-te că ai importat json

# --- 1. CONFIGURARE ---
LAT = "40.72218503159535"
LON = "-74.05022260410692"
CENSUS_API_KEY = "1ed1e83e431ff7989d572d0c2c3e44d1bf444a64" # VERIFICĂ ACEASTĂ CHEIE!

# ... (Dicționarul CENSUS_VARIABLES_MARKET_ANALYSIS rămâne neschimbat) ...
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

# --- 2. FUNCȚIE PENTRU GEOCODING (Coords -> Census Tract) ---
# ... (Funcția get_census_tract rămâne neschimbată) ...
def get_census_tract(lat, lon):
    """Convertește coordonatele (lat, lon) în FIPS codes (State, County, Tract)."""
    
    print(f"--- PASUL 1: Geocoding {lat}, {lon} ---")
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
            print("Eroare: Nu s-a găsit niciun Census Tract pentru aceste coordonate.")
            return None
            
        tract_info = tracts[0]
        fips = {
            "state": tract_info.get('STATE'),
            "county": tract_info.get('COUNTY'),
            "tract": tract_info.get('TRACT')
        }
        
        print(f"Zonă găsită: State={fips['state']}, County={fips['county']}, Tract={fips['tract']}\n")
        return fips
        
    except requests.exceptions.RequestException as e:
        print(f"Eroare la interogarea API-ului Geocoding: {e}")
        return None

# --- 3. FUNCȚIE PENTRU DATE CENSUS (MODIFICATĂ) ---
def get_census_data(fips_codes, api_key):
    """Interoghează API-ul Census (ACS) pentru un set extins de date de market analysis."""
    
    if not fips_codes:
        print("Interogare Census omisă (nu s-au găsit FIPS codes).")
        return

    if api_key == "CHEIA_TA_CENSUS_AICI":
        print("--- PASUL 2: Interogare Census (OMIS) ---")
        print("Te rog introdu o cheie API validă de la Census în variabila CENSUS_API_KEY.\n")
        return

    print("--- PASUL 2: Interogare Census API pentru date agregate (Rezidenți) ---")
    
    variables_to_get = ",".join(CENSUS_VARIABLES_MARKET_ANALYSIS.keys())
    
    url = (
        f"https://api.census.gov/data/2022/acs/acs5" 
        f"?get={variables_to_get}"
        f"&for=tract:{fips_codes['tract']}"
        f"&in=state:{fips_codes['state']}+county:{fips_codes['county']}"
        f"&key={api_key}"
    )
    
    response = None # Inițializăm response
    try:
        response = requests.get(url)
        response.raise_for_status() # Verifică erori HTTP (4xx, 5xx)
        
        # Aici este decodificarea JSON
        data = response.json() 
        
        if data and len(data) > 1:
            headers = data[0]
            values = data[1]
            raw_results = dict(zip(headers, values))
            
            print("--- Profil Detaliat al REZIDENȚILOR (Date Agregate) ---")
            
            for code, name in CENSUS_VARIABLES_MARKET_ANALYSIS.items():
                value = raw_results.get(code, "N/A")
                try:
                    value_str = f"{int(value):,}" if value.isdigit() else value
                except:
                    value_str = value
                if "($)" in name:
                    value_str = f"${value_str}"
                print(f"  {name}: {value_str}")
            
            # Calculăm câteva procente utile
            try:
                total_pop = int(raw_results['B01001_001E'])
                poverty_pop = int(raw_results['B17001_002E'])
                poverty_rate = (poverty_pop / total_pop) * 100
                print(f"  **Rata Sărăciei (Calculat): {poverty_rate:.1f}%**")
                
                total_housing = int(raw_results['B25003_001E'])
                renter_housing = int(raw_results['B25003_003E'])
                renter_rate = (renter_housing / total_housing) * 100
                print(f"  **Rata Ocupare Chiriași (Calculat): {renter_rate:.1f}%**")

            except Exception as e:
                print(f"  (Eroare la calcularea procentelor: {e})")
                
        else:
            print("Nu s-au găsit date demografice pentru acest tract.")
            
    except requests.exceptions.RequestException as e:
        print(f"Eroare HTTP la interogarea Census API: {e}")
        if response:
            print(f"Răspuns Server (Text): {response.text}")
            
    except json.JSONDecodeError:
        # AICI ESTE EROAREA TA!
        print("\n--- EROARE FATALĂ: Răspunsul API nu este JSON valid. ---")
        print("Motivul cel mai probabil: Cheia API (CENSUS_API_KEY) este invalidă sau expirată.")
        print("Serverul Census a returnat următorul mesaj (care nu este JSON):")
        print("---------------------------------------------------------")
        if response:
            print(response.text)
        else:
            print("(Nu s-a primit niciun răspuns)")
        print("---------------------------------------------------------\n")
    
    except (IndexError, TypeError):
        print("Eroare: Răspunsul Census API nu a putut fi parsat. (Posibil zonă fără rezidenți)")

# --- 4. RULARE SCRIPT ---
if __name__ == "__main__":
    print(f"*** Începere analiză de piață (Census-Only) pentru ({LAT}, {LON}) ***\n")
    fips_codes = get_census_tract(LAT, LON)
    
    # Verificăm dacă fips_codes a fost obținut înainte de a continua
    if fips_codes:
        get_census_data(fips_codes, CENSUS_API_KEY)
    
    print("\n") 
    print("--- AVERTISMENT INTERPRETARE ---")
    print("Analiza de mai sus se bazează EXCLUSIV pe populația REZIDENTĂ.")
    print("Pentru o zonă cu trafic turistic/comercial intens (Times Square), aceste date NU reflectă traficul pietonal zilnic.")
    
    print("\n*** Analiză finalizată ***")