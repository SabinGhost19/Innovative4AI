from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, DECIMAL, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
import uuid
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


class BusinessSurvival(Base):
    """
    Tabelă pentru Business Survival Rates - NY BDS 2017-2022
    Conține 5-year survival rates pentru companii pe industrie și county
    """
    __tablename__ = "business_survival"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Location
    county_name = Column(String(100), nullable=False, index=True)
    
    # Industry Classification
    naics_industry_label = Column(String(255), nullable=False)
    naics_code = Column(String(10), nullable=False, index=True)
    
    # Survival Data
    firms_2017_start_pool = Column(Integer, nullable=False)  # Number of firms started in 2017
    aggregate_5_year_survival_pct = Column(Float, nullable=False)  # % still operating after 5 years
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Composite index pentru căutări rapide
    __table_args__ = (
        {'comment': 'Business survival rates by industry and county (2017-2022)'},
    )


# ============================================================================
# SIMULATION USER SYSTEM - Username-based authentication
# ============================================================================

class SimulationUser(Base):
    """
    Simple username-only users for simulation
    """
    __tablename__ = "simulation_users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    session = relationship("SimulationSession", back_populates="user", uselist=False, cascade="all, delete-orphan")


class SimulationSession(Base):
    """
    Active simulation session (one per user)
    """
    __tablename__ = "simulation_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('simulation_users.id', ondelete='CASCADE'), unique=True, nullable=False)
    
    # Business Details
    business_name = Column(String(255), nullable=False)
    business_type = Column(String(100), nullable=False)
    industry = Column(String(100))
    location = Column(JSON, nullable=False)  # {address, neighborhood, county, lat, lng}
    initial_budget = Column(DECIMAL(12, 2), nullable=False)
    
    # Current State
    current_month = Column(Integer, default=1)
    current_year = Column(Integer, default=2024)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("SimulationUser", back_populates="session")
    monthly_states = relationship("SimulationMonthlyState", back_populates="session", cascade="all, delete-orphan", order_by="SimulationMonthlyState.month")


class SimulationMonthlyState(Base):
    """
    Historical state for each simulated month
    """
    __tablename__ = "simulation_monthly_states"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey('simulation_sessions.id', ondelete='CASCADE'), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    
    # Financial State
    revenue = Column(DECIMAL(12, 2), default=0)
    profit = Column(DECIMAL(12, 2), default=0)
    customers = Column(Integer, default=0)
    cash_balance = Column(DECIMAL(12, 2), default=0)
    
    # Full Agent Outputs (for replay/analysis)
    market_context = Column(JSON)
    events_data = Column(JSON)
    trends_data = Column(JSON)
    supplier_data = Column(JSON)
    competition_data = Column(JSON)
    employee_data = Column(JSON)
    customer_data = Column(JSON)
    financial_data = Column(JSON)
    
    # Player Decisions
    player_decisions = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("SimulationSession", back_populates="monthly_states")
    
    # Unique constraint: one state per month per session
    __table_args__ = (
        UniqueConstraint('session_id', 'month', 'year', name='uix_session_month_year'),
    )


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
