-- ===========================================================================
-- GoTour :: wishlist-service schema
-- ===========================================================================

CREATE TABLE wishlist_items (
    id         BIGINT         NOT NULL AUTO_INCREMENT,
    user_id    BIGINT         NOT NULL,
    item_type  VARCHAR(20)    NOT NULL,
    item_slug  VARCHAR(200)   NOT NULL,
    title      VARCHAR(200)   NOT NULL,
    subtitle   VARCHAR(200)   NULL,
    image_url  VARCHAR(500)   NULL,
    price      DECIMAL(12, 2) NULL,
    currency   VARCHAR(3)     NULL,
    created_at DATETIME(6)    NOT NULL,
    updated_at DATETIME(6)    NOT NULL,
    created_by VARCHAR(100)   NULL,
    updated_by VARCHAR(100)   NULL,
    version    BIGINT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_wishlist_user_item UNIQUE (user_id, item_type, item_slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_wishlist_user ON wishlist_items (user_id);
