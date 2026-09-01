package com.gotour.identity.auth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Token settings for the service that mints tokens.
 *
 * <p>Lives here because auth-service is currently the only module that reads
 * them. Once verification exists on the other side, these settings need to be
 * shared — every verifier must agree with the issuer on the secret and the
 * issuer name, so this class belongs in a shared module at that point.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "gotour.jwt")
public class JwtProperties {

    /** HS512 signing secret. Override per environment; never commit a real one. */
    private String secret = "gotour-dev-secret-key-please-change-in-production-min-64-chars-long-2026!!";

    private String issuer = "gotour";

    private long accessTokenTtlMinutes = 60;

    private long refreshTokenTtlDays = 7;
}
