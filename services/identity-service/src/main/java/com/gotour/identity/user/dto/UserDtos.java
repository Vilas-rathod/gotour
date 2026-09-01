package com.gotour.identity.user.dto;

import com.gotour.identity.user.domain.UserProfile;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;

public final class UserDtos {

    private UserDtos() {
    }

    @Schema(name = "UserProfileResponse")
    public record ProfileResponse(
            Long id,
            Long userId,
            String email,
            String fullName,
            String phone,
            String avatarUrl,
            LocalDate dateOfBirth,
            UserProfile.Gender gender,
            String nationality,
            String bio,
            String preferredCurrency,
            boolean marketingOptIn,
            Instant createdAt
    ) {
    }

    @Schema(name = "UpdateProfileRequest")
    public record UpdateProfileRequest(
            @NotBlank(message = "Full name is required")
            @Size(max = 120, message = "Full name must not exceed 120 characters")
            String fullName,

            @Pattern(regexp = "^$|^[0-9+\\-\\s()]{7,20}$", message = "Enter a valid phone number")
            String phone,

            @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
            String avatarUrl,

            @Past(message = "Date of birth must be in the past")
            LocalDate dateOfBirth,

            UserProfile.Gender gender,

            @Size(max = 80, message = "Nationality must not exceed 80 characters")
            String nationality,

            @Size(max = 500, message = "Bio must not exceed 500 characters")
            String bio,

            @Pattern(regexp = "^$|^[A-Z]{3}$", message = "Currency must be a 3-letter ISO code")
            String preferredCurrency,

            boolean marketingOptIn
    ) {
    }

    @Schema(name = "AddressResponse")
    public record AddressResponse(
            Long id,
            String label,
            String line1,
            String line2,
            String city,
            String state,
            String country,
            String postalCode,
            boolean defaultAddress
    ) {
    }

    @Schema(name = "AddressRequest")
    public record AddressRequest(
            @Size(max = 40, message = "Label must not exceed 40 characters")
            String label,

            @NotBlank(message = "Address line 1 is required")
            @Size(max = 180)
            String line1,

            @Size(max = 180)
            String line2,

            @NotBlank(message = "City is required")
            @Size(max = 80)
            String city,

            @Size(max = 80)
            String state,

            @NotBlank(message = "Country is required")
            @Size(max = 80)
            String country,

            @NotBlank(message = "Postal code is required")
            @Size(max = 20)
            String postalCode,

            boolean defaultAddress
    ) {
    }

    @Schema(name = "AdminUserResponse")
    public record AdminUserResponse(
            Long id,
            Long userId,
            String email,
            String fullName,
            String phone,
            String nationality,
            Instant joinedAt
    ) {
    }

    @Schema(name = "CustomerGrowthResponse", description = "Customer counts used by the admin dashboard")
    public record CustomerGrowthResponse(
            long totalCustomers,
            long newLast7Days,
            long newLast30Days
    ) {
    }
}
