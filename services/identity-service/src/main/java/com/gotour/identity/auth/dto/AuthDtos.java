package com.gotour.identity.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Set;

/**
 * Request and response payloads for the authentication API.
 */
public final class AuthDtos {

    private AuthDtos() {
    }

    /**
     * Password policy: at least 8 characters with an upper case letter, a lower
     * case letter, a digit and a symbol.
     */
    private static final String PASSWORD_PATTERN =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,72}$";

    private static final String PASSWORD_MESSAGE =
            "Password must be 8-72 characters and include an uppercase letter, a lowercase letter, a number and a symbol";

    @Schema(name = "RegisterRequest")
    public record RegisterRequest(
            @NotBlank(message = "Full name is required")
            @Size(max = 120, message = "Full name must not exceed 120 characters")
            String fullName,

            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            @Size(max = 180, message = "Email must not exceed 180 characters")
            String email,

            @NotBlank(message = "Password is required")
            @Pattern(regexp = PASSWORD_PATTERN, message = PASSWORD_MESSAGE)
            String password,

            @Pattern(regexp = "^$|^[0-9+\\-\\s()]{7,20}$", message = "Enter a valid phone number")
            String phone
    ) {
    }

    @Schema(name = "LoginRequest")
    public record LoginRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email,

            @NotBlank(message = "Password is required")
            String password
    ) {
    }

    @Schema(name = "RefreshTokenRequest")
    public record RefreshTokenRequest(
            @NotBlank(message = "Refresh token is required")
            String refreshToken
    ) {
    }

    @Schema(name = "ForgotPasswordRequest")
    public record ForgotPasswordRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email
    ) {
    }

    @Schema(name = "ResetPasswordRequest")
    public record ResetPasswordRequest(
            @NotBlank(message = "Reset token is required")
            String token,

            @NotBlank(message = "New password is required")
            @Pattern(regexp = PASSWORD_PATTERN, message = PASSWORD_MESSAGE)
            String newPassword
    ) {
    }

    @Schema(name = "ChangePasswordRequest")
    public record ChangePasswordRequest(
            @NotBlank(message = "Current password is required")
            String currentPassword,

            @NotBlank(message = "New password is required")
            @Pattern(regexp = PASSWORD_PATTERN, message = PASSWORD_MESSAGE)
            String newPassword
    ) {
    }

    @Schema(name = "AuthResponse")
    public record AuthResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            long expiresInSeconds,
            UserSummary user
    ) {
    }

    @Schema(name = "UserSummary")
    public record UserSummary(
            Long id,
            String email,
            String fullName,
            String phone,
            Set<String> roles,
            Instant createdAt
    ) {
    }
}
