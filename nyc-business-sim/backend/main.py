from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import os

from database import init_db, get_db, AreaOverview
from census_service import analyze_area

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
    Endpoint principal: procesează coordonatele, rulează analiza Census,
    și salvează rezultatele în baza de date.
    """
    
    try:
        lat_str = str(request.latitude)
        lon_str = str(request.longitude)
        
        print(f"Procesare cerere pentru lat={lat_str}, lon={lon_str}")
        
        # Rulează analiza Census (integrare app2.py)
        census_data = analyze_area(lat_str, lon_str)
        
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
        
        print(f"Date salvate cu succes în DB cu ID={area_record.id}")
        
        return LaunchBusinessResponse(
            success=True,
            message="Analiza zonei a fost completată și salvată cu succes",
            area_id=area_record.id,
            data=census_data
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
