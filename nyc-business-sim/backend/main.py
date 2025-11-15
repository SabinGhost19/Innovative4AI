from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor

from database import init_db, get_db, AreaOverview, DetailedAreaAnalysis
from census_service import analyze_area
from detailed_analysis_service import analyze_area_detailed

app = FastAPI(title="NYC Business Simulator Backend")

# CORS configuration pentru frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite toate originile în development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Models pentru request/response
class LaunchBusinessRequest(BaseModel):
    latitude: float
    longitude: float
    business_name: Optional[str] = None
    industry: Optional[str] = None

class LaunchBusinessResponse(BaseModel):
    success: bool
    message: str
    area_id: Optional[int] = None
    data: Optional[dict] = None
    detailed_data: Optional[dict] = None

@app.on_event("startup")
def startup_event():
    """Inițializează baza de date la pornirea aplicației"""
    print("Inițializare bază de date...")
    init_db()
    print("Baza de date inițializată cu succes!")

@app.get("/")
def read_root():
    return {"message": "NYC Business Simulator Backend API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/launch-business", response_model=LaunchBusinessResponse)
def launch_business(request: LaunchBusinessRequest, db: Session = Depends(get_db)):
    """
    Endpoint principal: procesează coordonatele, rulează analiza Census standard,
    analiza detaliată (din app4.py) în paralel, și salvează rezultatele în baza de date.
    """
    
    try:
        lat_str = str(request.latitude)
        lon_str = str(request.longitude)
        
        print(f"Procesare cerere pentru lat={lat_str}, lon={lon_str}")
        
        # Rulăm ambele analize în paralel folosind ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=2) as executor:
            # Lansăm ambele analize simultan
            future_standard = executor.submit(analyze_area, lat_str, lon_str)
            future_detailed = executor.submit(analyze_area_detailed, lat_str, lon_str)
            
            # Așteptăm rezultatele
            census_data = future_standard.result()
            detailed_data = future_detailed.result()
        
        if not census_data:
            raise HTTPException(
                status_code=400, 
                detail="Nu s-au putut obține date Census pentru această locație"
            )
        
        # Extragem datele demografice
        demo = census_data.get("demographics", {})
        fips = census_data.get("fips_codes", {})
        
        # Creăm înregistrarea în baza de date
        area_record = AreaOverview(
            latitude=census_data.get("latitude"),
            longitude=census_data.get("longitude"),
            state_fips=fips.get("state"),
            county_fips=fips.get("county"),
            tract_fips=fips.get("tract"),
            area_name=census_data.get("area_name"),
            
            # Demographics
            total_population=int(demo.get("B01001_001E", 0)) if demo.get("B01001_001E") else None,
            median_age=float(demo.get("B01002_001E", 0)) if demo.get("B01002_001E") else None,
            median_household_income=int(demo.get("B19013_001E", 0)) if demo.get("B19013_001E") else None,
            per_capita_income=int(demo.get("B19301_001E", 0)) if demo.get("B19301_001E") else None,
            poverty_population=int(demo.get("B17001_002E", 0)) if demo.get("B17001_002E") else None,
            poverty_rate=demo.get("poverty_rate"),
            
            # Education
            total_population_25_plus=int(demo.get("B15003_001E", 0)) if demo.get("B15003_001E") else None,
            bachelors_degree=int(demo.get("B15003_022E", 0)) if demo.get("B15003_022E") else None,
            masters_degree=int(demo.get("B15003_023E", 0)) if demo.get("B15003_023E") else None,
            doctorate_degree=int(demo.get("B15003_025E", 0)) if demo.get("B15003_025E") else None,
            
            # Housing
            total_housing_units=int(demo.get("B25003_001E", 0)) if demo.get("B25003_001E") else None,
            owner_occupied=int(demo.get("B25003_002E", 0)) if demo.get("B25003_002E") else None,
            renter_occupied=int(demo.get("B25003_003E", 0)) if demo.get("B25003_003E") else None,
            renter_rate=demo.get("renter_rate"),
            median_gross_rent=int(demo.get("B25031_001E", 0)) if demo.get("B25031_001E") else None,
            median_home_value=int(demo.get("B25077_001E", 0)) if demo.get("B25077_001E") else None,
            
            # Employment
            total_workforce=int(demo.get("C24050_001E", 0)) if demo.get("C24050_001E") else None,
            finance_insurance_real_estate=int(demo.get("C24050_007E", 0)) if demo.get("C24050_007E") else None,
            arts_entertainment_hospitality=int(demo.get("C24050_018E", 0)) if demo.get("C24050_018E") else None,
            professional_services=int(demo.get("C24050_029E", 0)) if demo.get("C24050_029E") else None,
        )
        
        # Salvăm în baza de date
        db.add(area_record)
        db.commit()
        db.refresh(area_record)
        
        print(f"Date standard salvate cu succes în DB cu ID={area_record.id}")
        
        # Salvăm datele detaliate dacă există
        detailed_record_id = None
        if detailed_data:
            try:
                detail_demo = detailed_data.get("demographics_detailed", {})
                detail_fips = detailed_data.get("fips_codes", {})
                detail_stats = detailed_data.get("derived_statistics", {})
                
                # Helper function pentru a extrage valoarea dintr-un dict cu structura {value, label}
                def get_value(code):
                    item = detail_demo.get(code, {})
                    if isinstance(item, dict):
                        val = item.get("value")
                        if val and val != "N/A":
                            try:
                                return int(val)
                            except (ValueError, TypeError):
                                try:
                                    return float(val)
                                except (ValueError, TypeError):
                                    return None
                    return None
                
                detailed_record = DetailedAreaAnalysis(
                    area_overview_id=area_record.id,
                    latitude=detailed_data.get("latitude"),
                    longitude=detailed_data.get("longitude"),
                    state_fips=detail_fips.get("state"),
                    county_fips=detail_fips.get("county"),
                    tract_fips=detail_fips.get("tract"),
                    block_fips=detail_fips.get("block"),
                    full_tract_id=detail_fips.get("full_tract_id"),
                    full_block_id=detail_fips.get("full_block_id"),
                    area_name=detailed_data.get("area_name"),
                    analysis_year=detailed_data.get("year", "2021"),
                    
                    # Demographics
                    total_population=get_value("B01003_001E"),
                    median_age=get_value("B01002_001E"),
                    
                    # Income
                    median_household_income=get_value("B19013_001E"),
                    per_capita_income=get_value("B19301_001E"),
                    total_households=get_value("B19001_001E"),
                    households_75k_99k=get_value("B19001_013E"),
                    households_100k_124k=get_value("B19001_014E"),
                    households_125k_149k=get_value("B19001_015E"),
                    households_150k_199k=get_value("B19001_016E"),
                    households_200k_plus=get_value("B19001_017E"),
                    
                    # Education
                    total_population_25_plus=get_value("B15003_001E"),
                    bachelors_degree=get_value("B15003_022E"),
                    masters_degree=get_value("B15003_023E"),
                    doctorate_degree=get_value("B15003_025E"),
                    
                    # Housing
                    total_housing_units=get_value("B25003_001E"),
                    renter_occupied=get_value("B25003_003E"),
                    median_rent_as_percent_income=get_value("B25071_001E"),
                    
                    # Transportation
                    total_workers_16_plus=get_value("B08301_001E"),
                    public_transportation=get_value("B08301_010E"),
                    work_from_home=get_value("B08301_021E"),
                    
                    # Poverty
                    poverty_population=get_value("B17001_002E"),
                    
                    # Derived statistics
                    poverty_rate=detail_stats.get("poverty_rate"),
                    high_income_households_rate=detail_stats.get("high_income_households_rate"),
                    high_income_count=detail_stats.get("high_income_count"),
                    bachelor_plus_rate=detail_stats.get("bachelor_plus_rate"),
                    bachelor_plus_count=detail_stats.get("bachelor_plus_count"),
                    renter_rate=detail_stats.get("renter_rate"),
                    work_from_home_rate=detail_stats.get("work_from_home_rate"),
                    
                    # Raw JSON pentru backup
                    raw_demographics_json=detail_demo,
                    raw_derived_stats_json=detail_stats
                )
                
                db.add(detailed_record)
                db.commit()
                db.refresh(detailed_record)
                detailed_record_id = detailed_record.id
                
                print(f"Date detaliate salvate cu succes în DB cu ID={detailed_record.id}")
            except Exception as e:
                print(f"Eroare la salvarea datelor detaliate: {e}")
                # Nu oprim procesul dacă datele detaliate nu se salvează
                db.rollback()
        
        print(f"Analiza detaliată completă: {detailed_data is not None}")
        
        return LaunchBusinessResponse(
            success=True,
            message="Analiza zonei a fost completată și salvată cu succes",
            area_id=area_record.id,
            data=census_data,
            detailed_data=detailed_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Eroare la procesarea cererii: {e}")
        raise HTTPException(status_code=500, detail=f"Eroare internă: {str(e)}")

@app.get("/api/area-overview/{area_id}")
def get_area_overview(area_id: int, db: Session = Depends(get_db)):
    """Returnează datele unei analize anterioare după ID"""
    
    area = db.query(AreaOverview).filter(AreaOverview.id == area_id).first()
    
    if not area:
        raise HTTPException(status_code=404, detail="Analiza nu a fost găsită")
    
    return area

@app.get("/api/area-overviews")
def get_all_area_overviews(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Returnează toate analizele salvate"""
    
    areas = db.query(AreaOverview).offset(skip).limit(limit).all()
    return areas

@app.get("/api/detailed-analysis/{area_id}")
def get_detailed_analysis(area_id: int, db: Session = Depends(get_db)):
    """Returnează analiza detaliată pentru un area_id specific"""
    
    detailed = db.query(DetailedAreaAnalysis).filter(
        DetailedAreaAnalysis.area_overview_id == area_id
    ).first()
    
    if not detailed:
        raise HTTPException(status_code=404, detail="Analiza detaliată nu a fost găsită")
    
    return detailed

@app.get("/api/all-detailed-analyses")
def get_all_detailed_analyses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Returnează toate analizele detaliate salvate"""
    
    analyses = db.query(DetailedAreaAnalysis).offset(skip).limit(limit).all()
    return analyses

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
