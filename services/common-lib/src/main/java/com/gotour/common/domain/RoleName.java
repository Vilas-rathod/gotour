package com.gotour.common.domain;

/**
 * Roles recognised across the platform. Stored without the {@code ROLE_}
 * prefix; the prefix is added when building Spring Security authorities.
 */
public enum RoleName {
    ADMIN,
    CUSTOMER;

    public String authority() {
        return "ROLE_" + name();
    }
}
