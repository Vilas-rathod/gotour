-- ===========================================================================
-- GoTour :: hotel-service schema
-- ===========================================================================

CREATE TABLE hotels (
    id                BIGINT         NOT NULL AUTO_INCREMENT,
    name              VARCHAR(180)   NOT NULL,
    slug              VARCHAR(200)   NOT NULL,
    destination_slug  VARCHAR(140)   NOT NULL,
    destination_name  VARCHAR(120)   NOT NULL,
    city              VARCHAR(80)    NOT NULL,
    country           VARCHAR(80)    NOT NULL,
    address           VARCHAR(300)   NOT NULL,
    short_description VARCHAR(300)   NOT NULL,
    description       TEXT           NOT NULL,
    star_rating       INT            NOT NULL,
    rating            DECIMAL(3, 2)  NOT NULL DEFAULT 0.00,
    review_count      INT            NOT NULL DEFAULT 0,
    price_per_night   DECIMAL(12, 2) NOT NULL,
    currency          VARCHAR(3)     NOT NULL DEFAULT 'INR',
    hero_image_url    VARCHAR(500)   NOT NULL,
    amenities         VARCHAR(500)   NULL,
    check_in_time     VARCHAR(10)    NULL,
    check_out_time    VARCHAR(10)    NULL,
    latitude          DECIMAL(10, 7) NULL,
    longitude         DECIMAL(10, 7) NULL,
    featured          BIT(1)         NOT NULL DEFAULT b'0',
    active            BIT(1)         NOT NULL DEFAULT b'1',
    created_at        DATETIME(6)    NOT NULL,
    updated_at        DATETIME(6)    NOT NULL,
    created_by        VARCHAR(100)   NULL,
    updated_by        VARCHAR(100)   NULL,
    version           BIGINT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_hotels_slug UNIQUE (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_hotels_slug ON hotels (slug);
CREATE INDEX idx_hotels_destination ON hotels (destination_slug);
CREATE INDEX idx_hotels_active ON hotels (active);
CREATE INDEX idx_hotels_price ON hotels (price_per_night);

CREATE TABLE hotel_images (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    hotel_id   BIGINT       NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    caption    VARCHAR(200) NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    version    BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_hotel_images_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_hotel_images_hotel ON hotel_images (hotel_id);

CREATE TABLE hotel_rooms (
    id              BIGINT         NOT NULL AUTO_INCREMENT,
    hotel_id        BIGINT         NOT NULL,
    room_type       VARCHAR(120)   NOT NULL,
    description     VARCHAR(400)   NOT NULL,
    price_per_night DECIMAL(12, 2) NOT NULL,
    capacity        INT            NOT NULL,
    bed_type        VARCHAR(60)    NULL,
    size_sqm        INT            NULL,
    total_rooms     INT            NOT NULL,
    rooms_booked    INT            NOT NULL DEFAULT 0,
    image_url       VARCHAR(500)   NULL,
    created_at      DATETIME(6)    NOT NULL,
    updated_at      DATETIME(6)    NOT NULL,
    created_by      VARCHAR(100)   NULL,
    updated_by      VARCHAR(100)   NULL,
    version         BIGINT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_hotel_rooms_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_hotel_rooms_hotel ON hotel_rooms (hotel_id);
