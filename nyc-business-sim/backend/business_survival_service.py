"""
Business Survival Rate Service

Provides data on 5-year survival rates for businesses by industry and county in NY.
Source: NY BDS (Business Dynamics Statistics) 2017-2022
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from database import BusinessSurvival
from typing import List, Dict, Optional


def get_survival_rate_by_industry(
    db: Session,
    county_name: str,
    naics_code: str = None,
    industry_label: str = None
) -> Optional[Dict]:
    """
    Get survival rate for specific industry in a county.
    
    Args:
        county_name: County name (e.g., "New York County, New York")
        naics_code: NAICS industry code (e.g., "72" for Accommodation/Food)
        industry_label: Industry label (alternative to NAICS code)
    
    Returns:
        Dict with survival rate and firm statistics
    """
    query = db.query(BusinessSurvival).filter(
        BusinessSurvival.county_name == county_name
    )
    
    if naics_code:
        query = query.filter(BusinessSurvival.naics_code == naics_code)
    elif industry_label:
        query = query.filter(
            BusinessSurvival.naics_industry_label.ilike(f"%{industry_label}%")
        )
    
    result = query.first()
    
    if not result:
        return None
    
    return {
        "county_name": result.county_name,
        "industry": result.naics_industry_label,
        "naics_code": result.naics_code,
        "firms_2017_start_pool": result.firms_2017_start_pool,
        "survival_rate_5_year": result.aggregate_5_year_survival_pct,
        "interpretation": get_survival_interpretation(result.aggregate_5_year_survival_pct)
    }


def get_all_industries_for_county(
    db: Session,
    county_name: str,
    exclude_total: bool = True
) -> List[Dict]:
    """
    Get survival rates for all industries in a county.
    
    Args:
        county_name: County name
        exclude_total: Exclude "Total for all sectors" entry
    
    Returns:
        List of industries with survival rates
    """
    query = db.query(BusinessSurvival).filter(
        BusinessSurvival.county_name == county_name
    )
    
    if exclude_total:
        query = query.filter(
            BusinessSurvival.naics_code != "00"
        )
    
    results = query.order_by(
        BusinessSurvival.aggregate_5_year_survival_pct.desc()
    ).all()
    
    return [
        {
            "industry": r.naics_industry_label,
            "naics_code": r.naics_code,
            "survival_rate": r.aggregate_5_year_survival_pct,
            "firms_count": r.firms_2017_start_pool,
            "risk_level": get_risk_level(r.aggregate_5_year_survival_pct)
        }
        for r in results
    ]


def get_county_total_survival(db: Session, county_name: str) -> Optional[Dict]:
    """
    Get overall survival rate for all sectors in a county.
    """
    result = db.query(BusinessSurvival).filter(
        BusinessSurvival.county_name == county_name,
        BusinessSurvival.naics_code == "00"
    ).first()
    
    if not result:
        return None
    
    return {
        "county_name": result.county_name,
        "overall_survival_rate": result.aggregate_5_year_survival_pct,
        "total_firms_2017": result.firms_2017_start_pool,
        "interpretation": get_survival_interpretation(result.aggregate_5_year_survival_pct)
    }


def get_industry_comparison_across_counties(
    db: Session,
    naics_code: str = None,
    industry_label: str = None,
    limit: int = 10
) -> List[Dict]:
    """
    Compare survival rates for same industry across different counties.
    """
    query = db.query(BusinessSurvival)
    
    if naics_code:
        query = query.filter(BusinessSurvival.naics_code == naics_code)
    elif industry_label:
        query = query.filter(
            BusinessSurvival.naics_industry_label.ilike(f"%{industry_label}%")
        )
    
    results = query.order_by(
        BusinessSurvival.aggregate_5_year_survival_pct.desc()
    ).limit(limit).all()
    
    return [
        {
            "county": r.county_name,
            "industry": r.naics_industry_label,
            "survival_rate": r.aggregate_5_year_survival_pct,
            "firms_count": r.firms_2017_start_pool
        }
        for r in results
    ]


def get_highest_survival_industries(
    db: Session,
    county_name: str,
    limit: int = 5
) -> List[Dict]:
    """
    Get industries with highest survival rates in a county.
    """
    results = db.query(BusinessSurvival).filter(
        BusinessSurvival.county_name == county_name,
        BusinessSurvival.naics_code != "00"  # Exclude total
    ).order_by(
        BusinessSurvival.aggregate_5_year_survival_pct.desc()
    ).limit(limit).all()
    
    return [
        {
            "industry": r.naics_industry_label,
            "naics_code": r.naics_code,
            "survival_rate": r.aggregate_5_year_survival_pct,
            "firms_count": r.firms_2017_start_pool
        }
        for r in results
    ]


def get_lowest_survival_industries(
    db: Session,
    county_name: str,
    limit: int = 5
) -> List[Dict]:
    """
    Get industries with lowest survival rates in a county (highest risk).
    """
    results = db.query(BusinessSurvival).filter(
        BusinessSurvival.county_name == county_name,
        BusinessSurvival.naics_code != "00",
        BusinessSurvival.firms_2017_start_pool >= 10  # Only industries with enough data
    ).order_by(
        BusinessSurvival.aggregate_5_year_survival_pct.asc()
    ).limit(limit).all()
    
    return [
        {
            "industry": r.naics_industry_label,
            "naics_code": r.naics_code,
            "survival_rate": r.aggregate_5_year_survival_pct,
            "firms_count": r.firms_2017_start_pool,
            "risk_level": "HIGH"
        }
        for r in results
    ]


def get_survival_statistics(db: Session, county_name: str) -> Dict:
    """
    Get comprehensive survival statistics for a county.
    """
    industries = db.query(BusinessSurvival).filter(
        BusinessSurvival.county_name == county_name,
        BusinessSurvival.naics_code != "00"
    ).all()
    
    if not industries:
        return None
    
    survival_rates = [i.aggregate_5_year_survival_pct for i in industries]
    
    return {
        "county": county_name,
        "total_industries": len(industries),
        "average_survival_rate": round(sum(survival_rates) / len(survival_rates), 2),
        "highest_survival": max(survival_rates),
        "lowest_survival": min(survival_rates),
        "industries_above_70pct": len([r for r in survival_rates if r >= 70]),
        "industries_below_60pct": len([r for r in survival_rates if r < 60]),
        "high_risk_industries": get_lowest_survival_industries(db, county_name, 3),
        "safest_industries": get_highest_survival_industries(db, county_name, 3)
    }


def find_business_type_survival(
    db: Session,
    business_type: str,
    county_name: str
) -> Optional[Dict]:
    """
    Find survival rate by business type keywords.
    
    Maps common business types to NAICS industries:
    - coffee shop, cafe, restaurant -> Accommodation and food services (72)
    - retail, store, shop -> Retail trade (44-45)
    - tech, software, IT -> Professional, scientific, and technical services (54)
    - etc.
    """
    # Business type to NAICS mapping
    type_mapping = {
        "coffee": "Accommodation and food services",
        "cafe": "Accommodation and food services",
        "restaurant": "Accommodation and food services",
        "food": "Accommodation and food services",
        "bar": "Accommodation and food services",
        "retail": "Retail trade",
        "store": "Retail trade",
        "shop": "Retail trade",
        "boutique": "Retail trade",
        "tech": "Professional, scientific, and technical services",
        "software": "Professional, scientific, and technical services",
        "consulting": "Professional, scientific, and technical services",
        "it": "Professional, scientific, and technical services",
        "health": "Health care and social assistance",
        "medical": "Health care and social assistance",
        "clinic": "Health care and social assistance",
        "fitness": "Arts, entertainment, and recreation",
        "gym": "Arts, entertainment, and recreation",
        "salon": "Other services (except public administration)",
        "repair": "Other services (except public administration)",
        "construction": "Construction",
        "contractor": "Construction",
    }
    
    # Find matching industry
    business_lower = business_type.lower()
    industry_label = None
    
    for keyword, industry in type_mapping.items():
        if keyword in business_lower:
            industry_label = industry
            break
    
    if not industry_label:
        # Try direct search in industry labels
        result = db.query(BusinessSurvival).filter(
            BusinessSurvival.county_name == county_name,
            BusinessSurvival.naics_industry_label.ilike(f"%{business_type}%")
        ).first()
        
        if result:
            return get_survival_rate_by_industry(
                db, county_name, 
                industry_label=result.naics_industry_label
            )
        return None
    
    return get_survival_rate_by_industry(db, county_name, industry_label=industry_label)


# Helper functions
def get_survival_interpretation(rate: float) -> str:
    """Interpret survival rate."""
    if rate >= 80:
        return "Excellent - Very high survival rate"
    elif rate >= 70:
        return "Good - Above average survival rate"
    elif rate >= 60:
        return "Moderate - Average survival rate"
    elif rate >= 50:
        return "Challenging - Below average survival rate"
    else:
        return "High Risk - Low survival rate"


def get_risk_level(rate: float) -> str:
    """Get risk level based on survival rate."""
    if rate >= 75:
        return "LOW"
    elif rate >= 65:
        return "MEDIUM"
    elif rate >= 55:
        return "MEDIUM-HIGH"
    else:
        return "HIGH"
