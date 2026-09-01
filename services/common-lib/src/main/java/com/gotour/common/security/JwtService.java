package com.gotour.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Validates the HS512 access tokens minted by identity-service and turns a valid
 * token into a {@link GoTourPrincipal}.
 *
 * <p>Every service shares this so verification agrees with the issuer on the
 * secret, the issuer name, and the claim layout ({@code sub}=user id, plus
 * {@code email}, {@code roles}, {@code type}).
 */
public class JwtService {

    private final SecretKey signingKey;
    private final String expectedIssuer;

    public JwtService(JwtProperties properties) {
        this.signingKey = new SecretKeySpec(
                properties.getSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        this.expectedIssuer = properties.getIssuer();
    }

    /**
     * @return the authenticated principal if the token is a valid, unexpired
     *         access token signed by the expected issuer; otherwise empty.
     */
    public Optional<GoTourPrincipal> parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(expectedIssuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Only access tokens authenticate API calls.
            if (!"ACCESS".equals(claims.get("type", String.class))) {
                return Optional.empty();
            }

            Long userId = Long.valueOf(claims.getSubject());
            String email = claims.get("email", String.class);
            Set<String> roles = extractRoles(claims);

            return Optional.of(new GoTourPrincipal(userId, email, roles));
        } catch (JwtException | IllegalArgumentException ex) {
            // Malformed, expired, wrong issuer or bad signature — treat as anonymous.
            return Optional.empty();
        }
    }

    @SuppressWarnings("unchecked")
    private Set<String> extractRoles(Claims claims) {
        Object raw = claims.get("roles");
        if (!(raw instanceof List<?> list)) {
            return Set.of();
        }
        // Tokens carry bare role names (CUSTOMER, ADMIN); the principal and Spring
        // authorities use the ROLE_ prefix.
        return ((List<Object>) list).stream()
                .map(String::valueOf)
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
