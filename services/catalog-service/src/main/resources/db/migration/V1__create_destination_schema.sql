-- ===========================================================================
-- GoTour :: destination-service schema
-- ===========================================================================

CREATE TABLE destinations (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    name               VARCHAR(120)  NOT NULL,
    slug               VARCHAR(140)  NOT NULL,
    country            VARCHAR(80)   NOT NULL,
    city               VARCHAR(80)   NULL,
    region             VARCHAR(80)   NULL,
    continent          VARCHAR(40)   NULL,
    short_description  VARCHAR(300)  NOT NULL,
    description        TEXT          NOT NULL,
    hero_image_url     VARCHAR(500)  NOT NULL,
    thumbnail_url      VARCHAR(500)  NULL,
    rating             DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    review_count       INT           NOT NULL DEFAULT 0,
    popularity_score   INT           NOT NULL DEFAULT 0,
    best_time_to_visit VARCHAR(120)  NULL,
    average_budget     DECIMAL(12, 2) NULL,
    currency           VARCHAR(3)    NULL,
    latitude           DECIMAL(10, 7) NULL,
    longitude          DECIMAL(10, 7) NULL,
    tags               VARCHAR(300)  NULL,
    featured           BIT(1)        NOT NULL DEFAULT b'0',
    active             BIT(1)        NOT NULL DEFAULT b'1',
    created_at         DATETIME(6)   NOT NULL,
    updated_at         DATETIME(6)   NOT NULL,
    created_by         VARCHAR(100)  NULL,
    updated_by         VARCHAR(100)  NULL,
    version            BIGINT        NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_destinations_slug UNIQUE (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_destinations_slug ON destinations (slug);
CREATE INDEX idx_destinations_country ON destinations (country);
CREATE INDEX idx_destinations_active_featured ON destinations (active, featured);
CREATE INDEX idx_destinations_popularity ON destinations (popularity_score);

CREATE TABLE destination_images (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    destination_id BIGINT       NOT NULL,
    image_url      VARCHAR(500) NOT NULL,
    caption        VARCHAR(200) NULL,
    sort_order     INT          NOT NULL DEFAULT 0,
    created_at     DATETIME(6)  NOT NULL,
    updated_at     DATETIME(6)  NOT NULL,
    created_by     VARCHAR(100) NULL,
    updated_by     VARCHAR(100) NULL,
    version        BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_destination_images_destination FOREIGN KEY (destination_id)
        REFERENCES destinations (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_destination_images_destination ON destination_images (destination_id);

CREATE TABLE attractions (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    destination_id BIGINT        NOT NULL,
    name           VARCHAR(140)  NOT NULL,
    description    VARCHAR(400)  NULL,
    image_url      VARCHAR(500)  NULL,
    category       VARCHAR(60)   NULL,
    distance_km    DECIMAL(6, 2) NULL,
    sort_order     INT           NOT NULL DEFAULT 0,
    created_at     DATETIME(6)   NOT NULL,
    updated_at     DATETIME(6)   NOT NULL,
    created_by     VARCHAR(100)  NULL,
    updated_by     VARCHAR(100)  NULL,
    version        BIGINT        NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_attractions_destination FOREIGN KEY (destination_id)
        REFERENCES destinations (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_attractions_destination ON attractions (destination_id);

CREATE TABLE travel_guides (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    destination_id BIGINT       NOT NULL,
    category       VARCHAR(60)  NOT NULL,
    title          VARCHAR(160) NOT NULL,
    content        TEXT         NOT NULL,
    sort_order     INT          NOT NULL DEFAULT 0,
    created_at     DATETIME(6)  NOT NULL,
    updated_at     DATETIME(6)  NOT NULL,
    created_by     VARCHAR(100) NULL,
    updated_by     VARCHAR(100) NULL,
    version        BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_travel_guides_destination FOREIGN KEY (destination_id)
        REFERENCES destinations (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_travel_guides_destination ON travel_guides (destination_id);
