-- Persist the customer's issue summary on the appointment itself so admin
-- staff can see what the client wrote in the booking form (the issue
-- summary is collected client-side but never made it into appointments).
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS issue_summary TEXT;