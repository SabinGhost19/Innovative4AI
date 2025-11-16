"""
Populate Business Survival data from CSV
Source: ny_bds_aggregate_5_year_survival_2017_2022.csv
"""

import csv
import sys
from sqlalchemy.orm import Session
from database import SessionLocal, BusinessSurvival, init_db


def populate_business_survival():
    """
    Load business survival data from CSV into PostgreSQL.
    """
    csv_file = "/app/ny_bds_aggregate_5_year_survival_2017_2022.csv"
    
    print("🏢 Starting Business Survival data population...")
    
    # Create session
    db: Session = SessionLocal()
    
    try:
        # Check if data already exists
        existing_count = db.query(BusinessSurvival).count()
        if existing_count > 0:
            print(f"⚠️  Business Survival table already contains {existing_count} records")
            response = input("Do you want to clear and reload? (yes/no): ").strip().lower()
            if response != 'yes':
                print("❌ Aborted - keeping existing data")
                return
            
            # Clear existing data
            print("🗑️  Clearing existing records...")
            db.query(BusinessSurvival).delete()
            db.commit()
        
        # Read CSV and insert data
        print(f"📂 Reading CSV file: {csv_file}")
        
        records_inserted = 0
        records_skipped = 0
        
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                try:
                    # Parse data
                    county_name = row['County_Name'].strip()
                    industry_label = row['NAICS_Industry_Label'].strip()
                    naics_code = row['NAICS_Code'].strip()
                    firms_2017 = int(row['Firms_2017_Start_Pool'])
                    survival_pct = float(row['Aggregate_5_Year_Survival_Pct'])
                    
                    # Create record
                    record = BusinessSurvival(
                        county_name=county_name,
                        naics_industry_label=industry_label,
                        naics_code=naics_code,
                        firms_2017_start_pool=firms_2017,
                        aggregate_5_year_survival_pct=survival_pct
                    )
                    
                    db.add(record)
                    records_inserted += 1
                    
                    # Commit in batches
                    if records_inserted % 100 == 0:
                        db.commit()
                        print(f"  ✅ Inserted {records_inserted} records...")
                
                except ValueError as e:
                    print(f"  ⚠️  Skipping row due to parsing error: {e}")
                    print(f"     Row: {row}")
                    records_skipped += 1
                    continue
                except Exception as e:
                    print(f"  ❌ Error processing row: {e}")
                    print(f"     Row: {row}")
                    records_skipped += 1
                    continue
        
        # Final commit
        db.commit()
        
        print("\n" + "="*60)
        print("✅ Business Survival data population completed!")
        print(f"   📊 Records inserted: {records_inserted}")
        if records_skipped > 0:
            print(f"   ⚠️  Records skipped: {records_skipped}")
        
        # Summary statistics
        total_counties = db.query(BusinessSurvival.county_name).distinct().count()
        total_industries = db.query(BusinessSurvival.naics_code).distinct().count()
        
        print(f"\n📈 Database Summary:")
        print(f"   Counties covered: {total_counties}")
        print(f"   Industries tracked: {total_industries}")
        print(f"   Total records: {records_inserted}")
        
        # Sample: Show NYC counties data
        print(f"\n🗽 NYC Counties in database:")
        nyc_counties = ['New York County, New York', 'Kings County, New York', 
                       'Queens County, New York', 'Bronx County, New York',
                       'Richmond County, New York']
        
        for county in nyc_counties:
            count = db.query(BusinessSurvival).filter(
                BusinessSurvival.county_name == county
            ).count()
            if count > 0:
                print(f"   ✓ {county}: {count} industries")
        
        print("="*60)
        
    except FileNotFoundError:
        print(f"❌ CSV file not found: {csv_file}")
        print("   Make sure the file is copied to the backend directory")
        sys.exit(1)
    
    except Exception as e:
        print(f"❌ Error during population: {e}")
        db.rollback()
        sys.exit(1)
    
    finally:
        db.close()


if __name__ == "__main__":
    populate_business_survival()
