-- In-app notifications table (referenced by com.lawfirm.brs.entity.Notification).
-- Was missing from V1__init_schema.sql, causing 500 on booking creation
-- when InAppNotificationService tried to insert into a non-existent table.
CREATE TABLE IF NOT EXISTS notifications (
    id           UUID         PRIMARY KEY,
    user_id      UUID         NULL,
    type         VARCHAR(40)  NOT NULL,
    title        VARCHAR(200) NOT NULL,
    message      VARCHAR(1000) NULL,
    link         VARCHAR(500) NULL,
    entity_type  VARCHAR(40)  NULL,
    entity_id    UUID         NULL,
    is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created_at ON notifications(created_at DESC);