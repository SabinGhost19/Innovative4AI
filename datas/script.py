import requests
import json
import sys

# --- 1. CONFIGURARE ---
LAT = "40.72218503159535" 
LON = "-74.05022260410692"
CENSUS_API_KEY = "1ed1e83e431ff7989d572d0c2c3e44d1bf444a64" # Cheia ta API

ACS_YEAR = "2021"  
LODES_YEAR = "2021" # Cel mai recent an LODES (folosește geografia 2020)

# --- Variabile ACS (Profil REZIDENȚIAL) ---
# (Rămâne neschimbat)
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

# --- Variabile LODES WAC (Profil LOCURI DE MUNCĂ) ---
# (Rămâne neschimbat)
LODES_WAC_VARIABLES = {
    "C000": "Total Locuri de Muncă",
    "CA01": "  -> Vârstă Angajați < 29",
    "CA02": "  -> Vârstă Angajați 30-54",
    "CA03": "  -> Vârstă Angajați > 55",
    "CE01": "  -> Salarii Angajați < $1250/lună",
    "CE02": "  -> Salarii Angajați $1251-$3333/lună",
    "CE03": "  -> Salarii Angajați > $3333/lună",
    "CNS07": "Industrie: Retail (Comerț)",
    "CNS08": "Industrie: Transport & Depozitare",
    "CNS11": "Industrie: Finanțe & Asigurări",
    "CNS13": "Industrie: Serv. Profesionale/Științifice",
    "CNS18": "Industrie: HoReCa (Cazare & Mâncare)",
    "CNS19": "Industrie: Sănătate & Asistență Socială",
}

# --- 2. FUNCȚIE GEOCODING (Coords -> State/County/Tract/Block) ---
# (Rămâne neschimbată)
def get_full_geocoding(lat, lon):
    """Convertește coordonatele în FIPS codes (State, County, Tract, Block)."""
    
    print(f"--- PASUL 1: Geocoding {lat}, {lon} ---")
    url = (
        f"https://geocoding.geo.census.gov/geocoder/geographies/coordinates"
        f"?x={lon}&y={lat}"
        f"&benchmark=Public_AR_Current"
        f"&vintage=Current_Current" # Folosește cea mai recentă geografie (2020+)
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
        print(f"  Block:  {fips['block']} (Geografie 2020)\n")
        return fips
        
    except requests.exceptions.RequestException as e:
        print(f"Eroare la interogarea API-ului Geocoding: {e}")
        return None

# --- 3. FUNCȚIE PROFIL REZIDENȚIAL (ACS) ---
# (Rămâne neschimbată)
def get_acs_profile(fips, api_key, year):
    """Interoghează API-ul Census (ACS) pentru profilul rezidențial al TRACT-ului."""
    
    print(f"--- PASUL 2: Profil REZIDENȚIAL (Cine Locuiește Aici?) ---")
    print(f"Sursa: ACS 5-Year {year} | Nivel: Census Tract ({fips['full_tract_id']})\n")

    if not api_key or api_key == "CHEIA_TA_CENSUS_AICI":
        print("Interogare ACS omisă (API Key lipsește).\n")
        return

    variables_to_get = ",".join(ACS_VARIABLES.keys())
    
    url = (
        f"https://api.census.gov/data/{year}/acs/acs5" 
        f"?get={variables_to_get}"
        f"&for=tract:{fips['tract']}"
        f"&in=state:{fips['state']}+county:{fips['county']}"
        f"&key={api_key}"
    )
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if not data or len(data) < 2:
            print("Nu s-au găsit date ACS pentru acest tract.")
            return

        headers = data[0]
        values = data[1]
        raw = dict(zip(headers, values))

        # Funcție helper pentru formatare
        def pp(key, is_percent_of=None, label_override=None):
            val_str = raw.get(key, "N/A")
            label = label_override if label_override else ACS_VARIABLES.get(key, key)
            
            try:
                val = int(val_str)
                val_fmt = f"{val:,}"
                if "($)" in label:
                    val_fmt = f"${val_fmt}"
                
                percent_str = ""
                if is_percent_of and int(raw.get(is_percent_of, 0)) > 0:
                    total = int(raw.get(is_percent_of))
                    percent = (val / total) * 100
                    percent_str = f" ({percent:.1f}%)"

                print(f"  {label}: {val_fmt}{percent_str}")
            except (ValueError, TypeError):
                print(f"  {label}: {val_str}")
        
        # Afișare date parsate
        pp("B01003_001E")
        pp("B01002_001E")
        print("--- Venituri (Gospodării Rezidente) ---")
        pp("B19013_001E")
        pp("B19301_001E")
        pp("B19001_013E", "B19001_001E")
        pp("B19001_014E", "B19001_001E")
        pp("B19001_015E", "B19001_001E")
        pp("B19001_016E", "B19001_001E")
        pp("B19001_017E", "B19001_001E")
        
        print("--- Educație (Rezidenți 25+) ---")
        total_edu = "B15003_001E"
        licenta = int(raw.get("B15003_022E", 0))
        master = int(raw.get("B15003_023E", 0))
        doctorat = int(raw.get("B15003_025E", 0))
        total_lic_plus = licenta + master + doctorat
        pp(total_edu)
        print(f"  -> Total Licență sau Mai Sus: {total_lic_plus:,}")
        pp("B15003_022E", total_edu, label_override="    -> Nivel Licență")
        pp("B15003_023E", total_edu, label_override="    -> Nivel Master")
        pp("B15003_025E", total_edu, label_override="    -> Nivel Doctorat")
        
        print("--- Locuințe & Costuri ---")
        pp("B25003_003E", "B25003_001E")
        pp("B25071_001E")
        
        print("--- Sărăcie & Muncă ---")
        pp("B17001_002E", "B01003_001E")
        pp("B08301_021E", "B08301_001E")

    except requests.exceptions.RequestException as e:
        print(f"Eroare HTTP la interogarea ACS API: {e}")
        if response:
            print(f"Răspuns Server (Text): {response.text}")
    except Exception as e:
        print(f"Eroare la parsarea datelor ACS: {e}")

# --- 4. FUNCȚIE PROFIL FORȚĂ DE MUNCĂ (LODES WAC) ---

# # (Rămâne neschimbată)
# def print_lodes_results(data, year, level_name):
#     """Funcție helper pentru a afișa datele LODES WAC (un singur an)."""
    
#     print(f"\n  --- Detaliu Nivel: {level_name} (An: {year}) ---")
    
#     # Header tabel
#     print(f"  {'Indicator':<40} | {'Valoare':>15}")
#     print(f"  {'-'*40:<40} | {'-'*15:>15}")

#     for key, label in LODES_WAC_VARIABLES.items():
#         try:
#             val_str = data.get(f"{key}_{year}")
#             val = int(val_str) if val_str else 0
            
#             print(f"  {label:<40} | {val:>15,}")

#         except Exception as e:
#             print(f"  Eroare la parsarea {label}: {e}")

# # MODIFICAT: Doar URL-ul de bază a fost schimbat
# def get_lodes_profile(fips, year):
#     """Interoghează API-ul OnTheMap (LODES) pentru profilul locurilor de muncă (WAC)."""
    
#     print(f"\n--- PASUL 3: Profil FORȚĂ DE MUNCĂ (Cine Lucrează Aici?) ---")
#     print(f"Sursa: LODES WAC | Nivel: Block & Tract | An: {year}")

#     # ===== AICI ESTE MODIFICAREA CRITICĂ =====
#     # /proxy/geojson a fost înlocuit cu /v3/geojson
#     base_url = "https://onthemap.ces.census.gov/onthemap/v3/geojson"
#     # ==========================================
    
#     variables_str = ",".join(LODES_WAC_VARIABLES.keys())
    
#     queries = {
#         "Block Specific": {
#             "q": f"blocks:{fips['full_block_id']}",
#             "type": "blocks"
#         },
#         "Cartier (Tract)": {
#             "q": f"tracts:{fips['full_tract_id']}",
#             "type": "tracts"
#         }
#     }
    
#     for level_name, query_details in queries.items():
#         params = {
#             "layer": "wac",
#             "type": "find",
#             "q": query_details["q"],
#             "base_year": year, 
#             "vars": variables_str,
#             "geography": query_details["type"]
#         }
        
#         response = None # Inițializăm response
#         try:
#             response = requests.get(base_url, params=params)
#             response.raise_for_status() # Va prinde 404 dacă eșuează din nou
#             data = response.json()
            
#             if not data.get('features'):
#                 print(f"\n  --- Detaliu Nivel: {level_name} ---")
#                 print(f"  (Nu s-au găsit date LODES pentru această locație în {year}.)")
#                 continue
                
#             wac_data = data['features'][0]['properties']['wac']
#             print_lodes_results(wac_data, year, level_name)
            
#         except requests.exceptions.RequestException as e:
#             print(f"Eroare HTTP la interogarea LODES API pentru {level_name}: {e}")
#             if response is not None:
#                 print(f"Răspuns Server (Text): {response.text}")
#         except (json.JSONDecodeError, IndexError, KeyError) as e:
#             print(f"Eroare la parsarea răspunsului LODES pentru {level_name}: {e}")
#             if response is not None:
#                 print(f"Răspuns primit: {response.text[:200]}...")


# --- 5. RULARE SCRIPT ---
# (Rămâne neschimbat)
if __name__ == "__main__":
    print(f"*** Începere analiză ultra-locală pentru ({LAT}, {LON}) ***\n")
    
    if CENSUS_API_KEY == "CHEIA_TA_CENSUS_AICI":
        print("EROARE: Te rog introdu o cheie CENSUS_API_KEY validă în script.")
        sys.exit(1)
        
    fips_codes = get_full_geocoding(LAT, LON)
    
    if fips_codes:
        # 1. Profilul REZIDENȚILOR (Cine locuiește aici?)
        get_acs_profile(fips_codes, CENSUS_API_KEY, ACS_YEAR)
        
        # 2. Profilul LOCURILOR DE MUNCĂ (Cine lucrează aici?)
        # get_lodes_profile(fips_codes, LODES_YEAR)
    
    print("\n") 
    print("--- INTERPRETARE ȘI PAȘI URMTORI ---")
    print("1. Analizează PROFILUL ACS (Rezidențial):")
    print("   -> Veniturile ($100k+), Educația (Licență+) și Costul Locuinței (% Chirie) îți arată puterea de cumpărare a REZIDENȚILOR.")
    print("   -> O rată mare de 'Muncă de Acasă' indică o populație rezidențială prezentă în cartier în timpul zilei.")
    
    print("\n2. Analizează PROFILUL LODES (Forța de Muncă):")
    print("   -> 'Total Locuri de Muncă' (Block vs Tract) îți arată densitatea angajaților. O valoare mare la nivel de Block = trafic pietonal intens.")
    print("   -> 'Salariile' angajaților îți arată puterea de cumpărare a celor care LUCREAZĂ aici (ex. clienți la prânz).")
    print("   -> 'Industriile' (HoReCa, Retail, Finanțe) îți arată tipul de trafic (ex. birouri vs. shopping) și competiția/sinergiile.")
    print("   -> (Analiza tendințelor necesită o logică suplimentară pentru a reconcilia geografiile 2010 vs 2020, dar datele din 2021 arată starea curentă).")
    
    print("\n*** Analiză finalizată ***")