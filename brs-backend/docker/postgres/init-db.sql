-- ============================================================
-- PostgreSQL Initialization Script
-- ============================================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create application user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'brs_dev') THEN
        CREATE USER brs_dev WITH PASSWORD 'brs_dev_password';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE brs_dev TO brs_dev;
GRANT ALL PRIVILEGES ON SCHEMA public TO brs_dev;

-- Grant schema privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO brs_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO brs_dev;

-- Create additional schemas for extensions
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO brs_dev;
