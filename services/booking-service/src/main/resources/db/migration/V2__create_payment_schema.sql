-- ===========================================================================
-- GoTour :: payment-service schema
-- ===========================================================================

CREATE TABLE payments (
    id                  BIGINT         NOT NULL AUTO_INCREMENT,
    payment_reference   VARCHAR(40)    NOT NULL,
    booking_reference   VARCHAR(20)    NOT NULL,
    user_id             BIGINT         NOT NULL,
    user_email          VARCHAR(180)   NULL,
    amount              DECIMAL(12, 2) NOT NULL,
    currency            VARCHAR(3)     NOT NULL DEFAULT 'INR',
    provider            VARCHAR(20)    NOT NULL,
    provider_order_id   VARCHAR(120)   NULL,
    provider_payment_id VARCHAR(120)   NULL,
    status              VARCHAR(20)    NOT NULL,
    method              VARCHAR(40)    NULL,
    failure_reason      VARCHAR(400)   NULL,
    paid_at             DATETIME(6)    NULL,
    refunded_amount     DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at          DATETIME(6)    NOT NULL,
    updated_at          DATETIME(6)    NOT NULL,
    created_by          VARCHAR(100)   NULL,
    updated_by          VARCHAR(100)   NULL,
    version             BIGINT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_payments_reference UNIQUE (payment_reference)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_payments_reference ON payments (payment_reference);
CREATE INDEX idx_payments_booking ON payments (booking_reference);
CREATE INDEX idx_payments_user ON payments (user_id);
CREATE INDEX idx_payments_status ON payments (status);

CREATE TABLE refunds (
    id                 BIGINT         NOT NULL AUTO_INCREMENT,
    payment_id         BIGINT         NOT NULL,
    amount             DECIMAL(12, 2) NOT NULL,
    provider_refund_id VARCHAR(120)   NULL,
    status             VARCHAR(20)    NOT NULL,
    reason             VARCHAR(400)   NULL,
    created_at         DATETIME(6)    NOT NULL,
    updated_at         DATETIME(6)    NOT NULL,
    created_by         VARCHAR(100)   NULL,
    updated_by         VARCHAR(100)   NULL,
    version            BIGINT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_refunds_payment ON refunds (payment_id);
