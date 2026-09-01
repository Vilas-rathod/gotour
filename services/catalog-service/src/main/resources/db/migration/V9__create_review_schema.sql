-- ===========================================================================
-- GoTour :: review-service schema
-- ===========================================================================

CREATE TABLE reviews (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    user_id           BIGINT        NOT NULL,
    user_name         VARCHAR(120)  NOT NULL,
    user_avatar_url   VARCHAR(500)  NULL,
    target_type       VARCHAR(20)   NOT NULL,
    target_slug       VARCHAR(200)  NOT NULL,
    booking_reference VARCHAR(20)   NULL,
    rating            INT           NOT NULL,
    title             VARCHAR(160)  NOT NULL,
    comment           VARCHAR(2000) NOT NULL,
    status            VARCHAR(20)   NOT NULL,
    helpful_count     INT           NOT NULL DEFAULT 0,
    moderated_at      DATETIME(6)   NULL,
    moderation_note   VARCHAR(400)  NULL,
    created_at        DATETIME(6)   NOT NULL,
    updated_at        DATETIME(6)   NOT NULL,
    created_by        VARCHAR(100)  NULL,
    updated_by        VARCHAR(100)  NULL,
    version           BIGINT        NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_reviews_user_target UNIQUE (user_id, target_type, target_slug),
    CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_reviews_target ON reviews (target_type, target_slug);
CREATE INDEX idx_reviews_status ON reviews (status);
CREATE INDEX idx_reviews_user ON reviews (user_id);
