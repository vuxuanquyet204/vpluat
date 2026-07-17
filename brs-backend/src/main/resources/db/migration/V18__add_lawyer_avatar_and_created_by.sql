-- Sync lawyer_profiles table with LawyerProfile entity
-- Add avatar_url (exists in entity but missing from V1 init schema)
-- Add created_by (FK to users, used to track who created the lawyer profile)

ALTER TABLE lawyer_profiles
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

ALTER TABLE lawyer_profiles
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Index for created_by lookups (e.g. populate createdByName)
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_created_by ON lawyer_profiles(created_by);