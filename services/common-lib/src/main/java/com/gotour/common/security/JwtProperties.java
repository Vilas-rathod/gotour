package com.gotour.common.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * The subset of JWT settings every service needs to <em>validate</em> an access
 * token: the signing secret and the expected issuer. The service that mints
 * tokens (identity-service) reads additional settings (TTLs) from its own
 * properties bound to the same {@code gotour.jwt} prefix.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "gotour.jwt")
public class JwtProperties {

    /** HS512 signing secret. Must match the issuer. Override per environment. */
    private String secret = "gotour-dev-secret-key-please-change-in-production-min-64-chars-long-2026!!";

    private String issuer = "gotour";
}
