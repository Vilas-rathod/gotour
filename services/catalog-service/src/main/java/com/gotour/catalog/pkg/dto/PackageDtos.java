package com.gotour.catalog.pkg.dto;

import com.gotour.catalog.pkg.domain.PackageType;
import com.gotour.catalog.pkg.domain.TravelStyle;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class PackageDtos {

    private PackageDtos() {
    }

    @Schema(name = "PackageSummary")
    public record PackageSummary(
            Long id,
            String title,
            String slug,
            String destinationName,
            String destinationSlug,
            String destinationCountry,
            String summary,
            Integer durationDays,
            Integer durationNights,
            BigDecimal price,
            BigDecimal discountPrice,
            BigDecimal effectivePrice,
            Integer discountPercent,
            String currency,
            PackageType packageType,
            TravelStyle travelStyle,
            BigDecimal rating,
            Integer reviewCount,
            String heroImageUrl,
            boolean featured,
            boolean trending
    ) {
    }

    @Schema(name = "PackageDetail")
    public record PackageDetail(
            Long id,
            String title,
            String slug,
            String destinationName,
            String destinationSlug,
            String destinationCountry,
            String summary,
            String description,
            Integer durationDays,
            Integer durationNights,
            BigDecimal price,
            BigDecimal discountPrice,
            BigDecimal effectivePrice,
            Integer discountPercent,
            String currency,
            PackageType packageType,
            TravelStyle travelStyle,
            BigDecimal rating,
            Integer reviewCount,
            Integer maxGroupSize,
            String heroImageUrl,
            boolean featured,
            boolean trending,
            List<String> gallery,
            List<String> highlights,
            List<String> inclusions,
            List<String> exclusions,
            List<ItineraryDayResponse> itinerary,
            List<AvailabilityResponse> availability
    ) {
    }

    @Schema(name = "PackageItineraryDayResponse")
    public record ItineraryDayResponse(
            Integer dayNumber,
            String title,
            String description,
            String meals,
            String accommodation
    ) {
    }

    @Schema(name = "PackageAvailabilityResponse")
    public record AvailabilityResponse(
            Long id,
            LocalDate departureDate,
            Integer seatsTotal,
            Integer seatsBooked,
            Integer seatsAvailable,
            BigDecimal price
    ) {
    }

    @Schema(name = "PackageFilterOptions")
    public record FilterOptions(
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<String> packageTypes,
            List<String> travelStyles,
            long totalPackages
    ) {
    }

    @Schema(name = "ReserveSeatsRequest",
            description = "Called by booking-service when a booking is confirmed")
    public record ReserveSeatsRequest(
            @NotNull(message = "Departure date is required")
            LocalDate departureDate,

            @Min(value = 1, message = "At least one seat must be reserved")
            int seats
    ) {
    }

    @Schema(name = "SavePackageRequest")
    public record SavePackageRequest(
            @NotBlank(message = "Title is required") @Size(max = 180) String title,

            @NotBlank(message = "Slug is required")
            @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                    message = "Slug may only contain lowercase letters, numbers and hyphens")
            @Size(max = 200) String slug,

            @NotBlank(message = "Destination slug is required") @Size(max = 140) String destinationSlug,
            @NotBlank(message = "Destination name is required") @Size(max = 120) String destinationName,
            @Size(max = 80) String destinationCountry,

            @NotBlank(message = "Summary is required") @Size(max = 300) String summary,
            @NotBlank(message = "Description is required") String description,

            @NotNull(message = "Duration in days is required")
            @Positive(message = "Duration must be at least one day") Integer durationDays,

            @NotNull(message = "Duration in nights is required")
            @Min(value = 0, message = "Nights cannot be negative") Integer durationNights,

            @NotNull(message = "Price is required")
            @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
            BigDecimal price,

            @DecimalMin(value = "0.0", inclusive = false, message = "Discount price must be greater than zero")
            BigDecimal discountPrice,

            @Pattern(regexp = "^$|^[A-Z]{3}$", message = "Currency must be a 3-letter ISO code")
            String currency,

            @NotNull(message = "Package type is required") PackageType packageType,
            @NotNull(message = "Travel style is required") TravelStyle travelStyle,

            @Positive(message = "Max group size must be positive") Integer maxGroupSize,

            @NotBlank(message = "Hero image URL is required") @Size(max = 500) String heroImageUrl,

            boolean featured,
            boolean trending,
            boolean active
    ) {
    }
}
