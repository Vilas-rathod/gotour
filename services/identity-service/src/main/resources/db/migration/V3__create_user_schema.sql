-- ===========================================================================
-- GoTour :: user-service schema
-- Traveller profiles and saved addresses. user_id mirrors auth-service ids.
-- ===========================================================================

CREATE TABLE user_profiles (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    user_id            BIGINT       NOT NULL,
    email              VARCHAR(180) NOT NULL,
    full_name          VARCHAR(120) NOT NULL,
    phone              VARCHAR(20)  NULL,
    avatar_url         VARCHAR(500) NULL,
    date_of_birth      DATE         NULL,
    gender             VARCHAR(20)  NULL,
    nationality        VARCHAR(80)  NULL,
    bio                VARCHAR(500) NULL,
    preferred_currency VARCHAR(3)   NULL,
    marketing_opt_in   BIT(1)       NOT NULL DEFAULT b'0',
    created_at         DATETIME(6)  NOT NULL,
    updated_at         DATETIME(6)  NOT NULL,
    created_by         VARCHAR(100) NULL,
    updated_by         VARCHAR(100) NULL,
    version            BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_user_profiles_user UNIQUE (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_user_profiles_user ON user_profiles (user_id);

CREATE TABLE addresses (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    label       VARCHAR(40)  NULL,
    line1       VARCHAR(180) NOT NULL,
    line2       VARCHAR(180) NULL,
    city        VARCHAR(80)  NOT NULL,
    state       VARCHAR(80)  NULL,
    country     VARCHAR(80)  NOT NULL,
    postal_code VARCHAR(20)  NOT NULL,
    is_default  BIT(1)       NOT NULL DEFAULT b'0',
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    created_by  VARCHAR(100) NULL,
    updated_by  VARCHAR(100) NULL,
    version     BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_addresses_user ON addresses (user_id);
