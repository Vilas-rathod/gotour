-- ===========================================================================
-- GoTour :: itinerary-service schema
-- ===========================================================================

CREATE TABLE itineraries (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    user_id           BIGINT        NOT NULL,
    booking_reference VARCHAR(20)   NULL,
    title             VARCHAR(180)  NOT NULL,
    destination_name  VARCHAR(120)  NULL,
    cover_image_url   VARCHAR(500)  NULL,
    start_date        DATE          NOT NULL,
    end_date          DATE          NOT NULL,
    notes             VARCHAR(1000) NULL,
    created_at        DATETIME(6)   NOT NULL,
    updated_at        DATETIME(6)   NOT NULL,
    created_by        VARCHAR(100)  NULL,
    updated_by        VARCHAR(100)  NULL,
    version           BIGINT        NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_itineraries_user ON itineraries (user_id);
CREATE INDEX idx_itineraries_booking ON itineraries (booking_reference);

CREATE TABLE itinerary_days (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    itinerary_id BIGINT        NOT NULL,
    day_number   INT           NOT NULL,
    day_date     DATE          NULL,
    title        VARCHAR(180)  NOT NULL,
    description  VARCHAR(1000) NULL,
    created_at   DATETIME(6)   NOT NULL,
    updated_at   DATETIME(6)   NOT NULL,
    created_by   VARCHAR(100)  NULL,
    updated_by   VARCHAR(100)  NULL,
    version      BIGINT        NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_itinerary_days_itinerary FOREIGN KEY (itinerary_id)
        REFERENCES itineraries (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_itinerary_days_itinerary ON itinerary_days (itinerary_id);

CREATE TABLE itinerary_activities (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    day_id      BIGINT       NOT NULL,
    start_time  TIME(6)      NULL,
    title       VARCHAR(180) NOT NULL,
    description VARCHAR(600) NULL,
    location    VARCHAR(200) NULL,
    category    VARCHAR(30)  NULL,
    completed   BIT(1)       NOT NULL DEFAULT b'0',
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    created_by  VARCHAR(100) NULL,
    updated_by  VARCHAR(100) NULL,
    version     BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_itinerary_activities_day FOREIGN KEY (day_id)
        REFERENCES itinerary_days (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_itinerary_activities_day ON itinerary_activities (day_id);
