from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
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
