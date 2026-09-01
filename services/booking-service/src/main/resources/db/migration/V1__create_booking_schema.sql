-- ===========================================================================
-- GoTour :: booking-service schema
-- ===========================================================================

CREATE TABLE bookings (
    id                  BIGINT         NOT NULL AUTO_INCREMENT,
    booking_reference   VARCHAR(20)    NOT NULL,
    user_id             BIGINT         NOT NULL,
    user_email          VARCHAR(180)   NOT NULL,
    booking_type        VARCHAR(20)    NOT NULL,
    item_slug           VARCHAR(200)   NOT NULL,
    item_title          VARCHAR(200)   NOT NULL,
    item_image_url      VARCHAR(500)   NULL,
    destination_name    VARCHAR(120)   NULL,
    room_id             BIGINT         NULL,
    room_type           VARCHAR(120)   NULL,
    start_date          DATE           NOT NULL,
    end_date            DATE           NOT NULL,
    traveller_count     INT            NOT NULL,
    room_count          INT            NULL,
    total_amount        DECIMAL(12, 2) NOT NULL,
    currency            VARCHAR(3)     NOT NULL DEFAULT 'INR',
    status              VARCHAR(30)    NOT NULL,
    payment_status      VARCHAR(20)    NOT NULL,
    payment_reference   VARCHAR(40)    NULL,
    special_requests    VARCHAR(1000)  NULL,
    contact_email       VARCHAR(180)   NOT NULL,
    contact_phone       VARCHAR(20)    NULL,
    cancelled_at        DATETIME(6)    NULL,
    cancellation_reason VARCHAR(400)   NULL,
    refund_amount       DECIMAL(12, 2) NULL,
    created_at          DATETIME(6)    NOT NULL,
    updated_at          DATETIME(6)    NOT NULL,
    created_by          VARCHAR(100)   NULL,
    updated_by          VARCHAR(100)   NULL,
    version             BIGINT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_bookings_reference UNIQUE (booking_reference)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_bookings_reference ON bookings (booking_reference);
CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_created ON bookings (created_at);

CREATE TABLE booking_travellers (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    booking_id      BIGINT       NOT NULL,
    full_name       VARCHAR(120) NOT NULL,
    age             INT          NOT NULL,
    gender          VARCHAR(20)  NULL,
    passport_number VARCHAR(40)  NULL,
    nationality     VARCHAR(80)  NULL,
    lead_traveller  BIT(1)       NOT NULL DEFAULT b'0',
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    created_by      VARCHAR(100) NULL,
    updated_by      VARCHAR(100) NULL,
    version         BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_booking_travellers_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_booking_travellers_booking ON booking_travellers (booking_id);

CREATE TABLE booking_items (
    id         BIGINT         NOT NULL AUTO_INCREMENT,
    booking_id BIGINT         NOT NULL,
    label      VARCHAR(160)   NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity   INT            NOT NULL,
    amount     DECIMAL(12, 2) NOT NULL,
    created_at DATETIME(6)    NOT NULL,
    updated_at DATETIME(6)    NOT NULL,
    created_by VARCHAR(100)   NULL,
    updated_by VARCHAR(100)   NULL,
    version    BIGINT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_booking_items_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_booking_items_booking ON booking_items (booking_id);
