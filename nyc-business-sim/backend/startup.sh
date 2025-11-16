#!/bin/bash
set -e

echo "🚀 Starting backend initialization..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is up and running!"

# Initialize database tables
echo "📊 Initializing database tables..."
python -c "from database import init_db; init_db(); print('✅ Tables initialized')"

# Populate census data from CSV
echo "📥 Populating census data from CSV..."
python populate_census_data.py

# Populate business survival data from CSV
echo "📥 Populating business survival data from CSV..."
python populate_business_survival.py

# Start the application
echo "🚀 Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
