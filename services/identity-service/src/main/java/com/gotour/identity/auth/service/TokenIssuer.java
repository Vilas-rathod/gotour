package com.gotour.identity.auth.service;

import com.gotour.identity.auth.domain.User;
import com.gotour.identity.auth.config.JwtProperties;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;

/**
 * Issues signed access tokens and opaque refresh/reset tokens.
 *
 * <p>Access tokens are short-lived JWTs consumed by every service. Refresh and
 * reset tokens are random opaque strings whose SHA-256 hash is what gets
 * persisted, so the database never holds a usable credential.
 */
@Component
public class TokenIssuer {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();

    private final SecretKey signingKey;
    private final JwtProperties properties;

    public TokenIssuer(JwtProperties properties) {
        this.properties = properties;
        this.signingKey = new SecretKeySpec(
                properties.getSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA512");
    }

    public String createAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(Duration.ofMinutes(properties.getAccessTokenTtlMinutes()));

        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .issuer(properties.getIssuer())
                .claim("email", user.getEmail())
                .claim("name", user.getFullName())
                .claim("roles", user.getRoles().stream().map(Enum::name).toList())
                .claim("type", "ACCESS")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey, Jwts.SIG.HS512)
                .compact();
    }

    /** @return a 256-bit URL-safe random string; only its hash is stored. */
    public String createOpaqueToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return URL_ENCODER.encodeToString(bytes);
    }

    public String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is required but unavailable", ex);
        }
    }

    public Instant refreshTokenExpiry() {
        return Instant.now().plus(Duration.ofDays(properties.getRefreshTokenTtlDays()));
    }

    public long accessTokenTtlSeconds() {
        return Duration.ofMinutes(properties.getAccessTokenTtlMinutes()).toSeconds();
    }
}
