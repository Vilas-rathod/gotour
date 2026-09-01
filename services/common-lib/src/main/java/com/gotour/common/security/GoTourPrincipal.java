package com.gotour.common.security;

import java.util.Set;

/**
 * The authenticated caller, as seen by business code.
 *
 * <p>This is the seam between authentication and everything that depends on
 * knowing who is calling. Whatever mechanism populates the
 * {@link org.springframework.security.core.context.SecurityContext} — a JWT
 * filter, a session, anything else — must end up placing one of these in it as
 * the authentication principal. Controllers and services reach it through
 * {@link SecurityUtils} and never parse a token themselves.
 *
 * @param userId unique user id
 * @param email  caller's email address
 * @param roles  granted roles, prefixed with {@code ROLE_}
 */
public record GoTourPrincipal(Long userId, String email, Set<String> roles) {

    public boolean isAdmin() {
        return roles.contains("ROLE_ADMIN");
    }
}
