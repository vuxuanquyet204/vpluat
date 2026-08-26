-- Seed lifecycle marker. Data seeding is performed by the application only when explicitly enabled.
CREATE TABLE seed_runs (
    seed_key VARCHAR(100) PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    CONSTRAINT chk_seed_runs_status CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED'))
);
