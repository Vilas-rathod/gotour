-- ===========================================================================
-- GoTour :: notification-service schema
-- read_flag is used instead of "read", which is reserved in several dialects.
-- ===========================================================================

CREATE TABLE notifications (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    type       VARCHAR(30)  NOT NULL,
    title      VARCHAR(160) NOT NULL,
    message    VARCHAR(600) NOT NULL,
    link       VARCHAR(300) NULL,
    read_flag  BIT(1)       NOT NULL DEFAULT b'0',
    read_at    DATETIME(6)  NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    version    BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_user_read ON notifications (user_id, read_flag);
