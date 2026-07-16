-- Add service_ids JSONB column to lawyer_profiles for assignment tracking
ALTER TABLE lawyer_profiles ADD COLUMN service_ids JSONB DEFAULT '[]'::jsonb;

-- Backfill existing lawyers (no services assigned initially)
UPDATE lawyer_profiles SET service_ids = '[]'::jsonb WHERE service_ids IS NULL;

-- Add index for querying lawyers by service
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_service_ids ON lawyer_profiles USING gin (service_ids);
