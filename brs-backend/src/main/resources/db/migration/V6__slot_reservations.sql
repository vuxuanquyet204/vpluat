-- ============================================================
-- V6__slot_reservations.sql
-- BRS v2.0 - Slot reservation table for booking flow
-- ============================================================
-- A reservation holds a slot for 5 minutes while the user
-- fills out the customer form. The slot is *not* marked
-- unavailable during this window; instead, we keep an
-- authoritative list of active reservations and reject any
-- subsequent reservation attempt for the same slot.

CREATE TABLE slot_reservations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id           UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    availability_slot_id UUID NOT NULL REFERENCES availability_slots(id) ON DELETE CASCADE,
    slot_date           DATE NOT NULL,
    start_time          TIME NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at          TIMESTAMP NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    released_at         TIMESTAMP,
    CONSTRAINT chk_slot_reservations_status
        CHECK (status IN ('ACTIVE', 'EXPIRED', 'RELEASED', 'CONVERTED'))
);

CREATE INDEX idx_slot_reservations_lookup
    ON slot_reservations(lawyer_id, slot_date, start_time);
CREATE INDEX idx_slot_reservations_active
    ON slot_reservations(status, expires_at)
    WHERE status = 'ACTIVE';
CREATE INDEX idx_slot_reservations_slot
    ON slot_reservations(availability_slot_id);
