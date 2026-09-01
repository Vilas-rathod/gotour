-- ===========================================================================
-- GoTour :: package-service schema
-- ===========================================================================

CREATE TABLE tour_packages (
    id                  BIGINT         NOT NULL AUTO_INCREMENT,
    title               VARCHAR(180)   NOT NULL,
    slug                VARCHAR(200)   NOT NULL,
    destination_slug    VARCHAR(140)   NOT NULL,
    destination_name    VARCHAR(120)   NOT NULL,
    destination_country VARCHAR(80)    NULL,
    summary             VARCHAR(300)   NOT NULL,
    description         TEXT           NOT NULL,
    duration_days       INT            NOT NULL,
    duration_nights     INT            NOT NULL,
    price               DECIMAL(12, 2) NOT NULL,
    discount_price      DECIMAL(12, 2) NULL,
    currency            VARCHAR(3)     NOT NULL DEFAULT 'INR',
    package_type        VARCHAR(30)    NOT NULL,
    travel_style        VARCHAR(30)    NOT NULL,
    rating              DECIMAL(3, 2)  NOT NULL DEFAULT 0.00,
    review_count        INT            NOT NULL DEFAULT 0,
    booking_count       INT            NOT NULL DEFAULT 0,
    max_group_size      INT            NULL,
    hero_image_url      VARCHAR(500)   NOT NULL,
    featured            BIT(1)         NOT NULL DEFAULT b'0',
    trending            BIT(1)         NOT NULL DEFAULT b'0',
    active              BIT(1)         NOT NULL DEFAULT b'1',
    created_at          DATETIME(6)    NOT NULL,
    updated_at          DATETIME(6)    NOT NULL,
    created_by          VARCHAR(100)   NULL,
    updated_by          VARCHAR(100)   NULL,
    version             BIGINT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_tour_packages_slug UNIQUE (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_tour_packages_slug ON tour_packages (slug);
CREATE INDEX idx_tour_packages_destination ON tour_packages (destination_slug);
CREATE INDEX idx_tour_packages_active ON tour_packages (active);
CREATE INDEX idx_tour_packages_price ON tour_packages (price);
CREATE INDEX idx_tour_packages_rating ON tour_packages (rating);

CREATE TABLE package_images (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    package_id BIGINT       NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    caption    VARCHAR(200) NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    version    BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_package_images_package FOREIGN KEY (package_id)
        REFERENCES tour_packages (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_package_images_package ON package_images (package_id);

CREATE TABLE package_detail_items (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    package_id BIGINT       NOT NULL,
    item_type  VARCHAR(20)  NOT NULL,
    text       VARCHAR(300) NOT NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    version    BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_package_detail_items_package FOREIGN KEY (package_id)
        REFERENCES tour_packages (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_package_detail_items_package ON package_detail_items (package_id);

CREATE TABLE package_itinerary_days (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    package_id    BIGINT       NOT NULL,
    day_number    INT          NOT NULL,
    title         VARCHAR(180) NOT NULL,
    description   TEXT         NOT NULL,
    meals         VARCHAR(200) NULL,
    accommodation VARCHAR(200) NULL,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    created_by    VARCHAR(100) NULL,
    updated_by    VARCHAR(100) NULL,
    version       BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_package_itinerary_package FOREIGN KEY (package_id)
        REFERENCES tour_packages (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_package_itinerary_package ON package_itinerary_days (package_id);

CREATE TABLE package_availability (
    id             BIGINT         NOT NULL AUTO_INCREMENT,
    package_id     BIGINT         NOT NULL,
    departure_date DATE           NOT NULL,
    seats_total    INT            NOT NULL,
    seats_booked   INT            NOT NULL DEFAULT 0,
    price_override DECIMAL(12, 2) NULL,
    created_at     DATETIME(6)    NOT NULL,
    updated_at     DATETIME(6)    NOT NULL,
    created_by     VARCHAR(100)   NULL,
    updated_by     VARCHAR(100)   NULL,
    version        BIGINT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_package_availability_date UNIQUE (package_id, departure_date),
    CONSTRAINT fk_package_availability_package FOREIGN KEY (package_id)
        REFERENCES tour_packages (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_package_availability_package ON package_availability (package_id);
