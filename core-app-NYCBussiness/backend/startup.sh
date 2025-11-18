#!/bin/bash
set -e

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

python -c "from database import init_db; init_db(); print('Tables initialized')"

python populate_census_data.py

python populate_business_survival.py

exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
