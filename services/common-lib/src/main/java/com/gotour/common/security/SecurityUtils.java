package com.gotour.common.security;

import com.gotour.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Convenience access to the authenticated caller inside service classes.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<GoTourPrincipal> currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        if (authentication.getPrincipal() instanceof GoTourPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    /** @throws UnauthorizedException when there is no authenticated caller. */
    public static GoTourPrincipal requirePrincipal() {
        return currentPrincipal()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
    }

    public static Long currentUserId() {
        return requirePrincipal().userId();
    }
}
