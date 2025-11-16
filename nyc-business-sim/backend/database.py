from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class AreaOverview(Base):
    __tablename__ = "area_overview"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Location Info
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    state_fips = Column(String(2))
    county_fips = Column(String(3))
    tract_fips = Column(String(6))
    area_name = Column(String(255))
    
    # Demographic Data
    total_population = Column(Integer)
    median_age = Column(Float)
    median_household_income = Column(Integer)
    per_capita_income = Column(Integer)
    poverty_population = Column(Integer)
    poverty_rate = Column(Float)
    
    # Education
    total_population_25_plus = Column(Integer)
    bachelors_degree = Column(Integer)
    masters_degree = Column(Integer)
    doctorate_degree = Column(Integer)
    
    # Housing
    total_housing_units = Column(Integer)
    owner_occupied = Column(Integer)
    renter_occupied = Column(Integer)
    renter_rate = Column(Float)
    median_gross_rent = Column(Integer)
    median_home_value = Column(Integer)
    
    # Employment/Industry
    total_workforce = Column(Integer)
    finance_insurance_real_estate = Column(Integer)
    arts_entertainment_hospitality = Column(Integer)
    professional_services = Column(Integer)


class DetailedAreaAnalysis(Base):
    """Tabelă pentru analiza detaliată (din app4.py) - ACS 2021"""
    __tablename__ = "detailed_area_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Link către analiza principală (optional)
    area_overview_id = Column(Integer, ForeignKey('area_overview.id'), nullable=True)
    
    # Location Info (mai detaliat - include Block)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    state_fips = Column(String(2))
    county_fips = Column(String(3))
    tract_fips = Column(String(6))
    block_fips = Column(String(4))
    full_tract_id = Column(String(11))  # State+County+Tract
    full_block_id = Column(String(15))  # State+County+Tract+Block
    area_name = Column(String(255))
    analysis_year = Column(String(4))  # "2021"
    
    # Demographic Data - Basic
    total_population = Column(Integer)  # B01003_001E
    median_age = Column(Float)  # B01002_001E
    
    # Income Data - Detailed
    median_household_income = Column(Integer)  # B19013_001E
    per_capita_income = Column(Integer)  # B19301_001E
    total_households = Column(Integer)  # B19001_001E
    households_75k_99k = Column(Integer)  # B19001_013E
    households_100k_124k = Column(Integer)  # B19001_014E
    households_125k_149k = Column(Integer)  # B19001_015E
    households_150k_199k = Column(Integer)  # B19001_016E
    households_200k_plus = Column(Integer)  # B19001_017E
    
    # Education Data
    total_population_25_plus = Column(Integer)  # B15003_001E
    bachelors_degree = Column(Integer)  # B15003_022E
    masters_degree = Column(Integer)  # B15003_023E
    doctorate_degree = Column(Integer)  # B15003_025E
    
    # Housing Data
    total_housing_units = Column(Integer)  # B25003_001E
    renter_occupied = Column(Integer)  # B25003_003E
    median_rent_as_percent_income = Column(Float)  # B25071_001E
    
    # Transportation/Work Data
    total_workers_16_plus = Column(Integer)  # B08301_001E
    public_transportation = Column(Integer)  # B08301_010E
    work_from_home = Column(Integer)  # B08301_021E
    
    # Poverty Data
    poverty_population = Column(Integer)  # B17001_002E
    
    # Derived Statistics (calculated)
    poverty_rate = Column(Float)
    high_income_households_rate = Column(Float)
    high_income_count = Column(Integer)
    bachelor_plus_rate = Column(Float)
    bachelor_plus_count = Column(Integer)
    renter_rate = Column(Float)
    work_from_home_rate = Column(Float)
    
    # Raw JSON data pentru backup complet
    raw_demographics_json = Column(JSON)
    raw_derived_stats_json = Column(JSON)


class CensusTractData(Base):
    """Tabelă pentru datele pre-încărcate din CSV (ny_tract_clusters_2022.csv)"""
    __tablename__ = "census_tract_data"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # FIPS Tract Full ID (cheie unică)
    fips_tract_full = Column(String(11), unique=True, nullable=False, index=True)
    
    # Location Info
    area_name = Column(String(255))
    cluster = Column(Integer)
    state_fips = Column(String(2), index=True)
    county_fips = Column(String(3), index=True)
    tract_fips = Column(String(6), index=True)
    
    # Resident Demographics
    resident_population_total = Column(Float)
    resident_median_age = Column(Float)
    resident_median_household_income = Column(Float)
    pct_bachelors = Column(Float)
    pct_renters = Column(Float)
    pct_poverty = Column(Float)
    
    # Workforce/Jobs Data
    workforce_total_jobs = Column(Float)
    pct_jobs_young = Column(Float)
    pct_jobs_high_earn = Column(Float)
    pct_jobs_prof_services = Column(Float)
    pct_jobs_healthcare = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency for FastAPI to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
