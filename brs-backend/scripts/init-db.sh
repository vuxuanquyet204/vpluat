#!/bin/bash
# ============================================================
# BRS Backend Database Init Script
# ============================================================

set -e

echo "=========================================="
echo "  BRS Backend - Database Init"
echo "=========================================="

# Variables
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Database connection settings
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-brs_dev}"
DB_USER="${DB_USER:-brs_dev}"
DB_PASSWORD="${DB_PASSWORD:-brs_dev_password}"

echo "Database: $DB_HOST:$DB_PORT/$DB_NAME"

# Wait for database
echo "Waiting for database to be ready..."
for i in {1..30}; do
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" > /dev/null 2>&1; then
        echo "Database is ready!"
        break
    fi
    echo "Attempt $i/30 - waiting..."
    sleep 2
done

# Check if database exists
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    echo "Database '$DB_NAME' already exists."
else
    echo "Creating database '$DB_NAME'..."
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME"
    echo "Database created!"
fi

# Run Flyway migrations
echo "Running Flyway migrations..."
if [ -f target/brs-backend-*.jar ]; then
    java -jar target/brs-backend-*.jar \
        --spring.datasource.url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" \
        --spring.datasource.username="$DB_USER" \
        --spring.datasource.password="$DB_PASSWORD" \
        --spring.flyway.enabled=true \
        --spring.jpa.show-sql=false
else
    echo "Warning: JAR file not found. Run build.sh first."
fi

echo "=========================================="
echo "  Database initialization complete!"
echo "=========================================="
