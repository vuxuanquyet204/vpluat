-- ============================================================
-- V8__booking_erp_extend.sql
-- Phase 8: Booking Module — extend schema for booking history,
-- reminder config, and stats endpoints.
-- ============================================================

-- ============================================================
-- 1. Appointment history / audit trail
-- Tracks status changes, reschedules, cancellations, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS appointment_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,  -- create, update, status_change, reschedule, cancel, reminder_sent
    from_value      TEXT,
    to_value        TEXT,
    reason          TEXT,
    actor_id        UUID REFERENCES users(id),
    actor_name      VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_history_appointment_id
    ON appointment_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_history_created_at
    ON appointment_history(created_at DESC);

-- ============================================================
-- 2. Appointment reminder config (JSONB)
-- Stored in appointments.reminders column (added in V7).
-- Add default config if column exists but is null.
-- ============================================================
DO $$
BEGIN
    -- Set default reminder config for existing appointments that have NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'appointments' AND column_name = 'reminders'
    ) THEN
        UPDATE appointments
        SET reminders = '[
            {"type": "24h", "enabled": true, "channel": "email"},
            {"type": "2h", "enabled": true, "channel": "sms"},
            {"type": "30min", "enabled": false, "channel": "in_app"}
        ]'
        WHERE reminders IS NULL;
    END IF;
END $$;

-- ============================================================
-- 3. Indexes for booking stats queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at
    ON appointments(scheduled_at);

-- Index for finding appointments by date range (used by calendar view)
CREATE INDEX IF NOT EXISTS idx_appointments_date_range
    ON appointments(scheduled_at, status);

-- ============================================================
-- 4. Seed default schedules for existing lawyers
-- Only insert if lawyer has no existing schedule.
-- Unique constraint uq_lawyer_schedules_dow already created in V7.
-- ============================================================
INSERT INTO lawyer_schedules (lawyer_id, day_of_week, is_off, slots, created_at, updated_at)
SELECT
    lp.id,
    dow.day_of_week,
    CASE WHEN dow.day_of_week IN (0, 6) THEN TRUE ELSE FALSE END,  -- OFF on Sat/Sun
    CASE
        WHEN dow.day_of_week IN (0, 6) THEN '[]'::jsonb
        ELSE '[
            {"start": "08:00", "end": "12:00"},
            {"start": "13:00", "end": "17:00"}
        ]'::jsonb
    END,
    NOW(),
    NOW()
FROM lawyer_profiles lp
CROSS JOIN (
    SELECT generate_series(0, 6) AS day_of_week
) dow
WHERE NOT EXISTS (
    SELECT 1 FROM lawyer_schedules ls
    WHERE ls.lawyer_id = lp.id AND ls.day_of_week = dow.day_of_week
);

-- ============================================================
-- Done — V8
-- ============================================================
