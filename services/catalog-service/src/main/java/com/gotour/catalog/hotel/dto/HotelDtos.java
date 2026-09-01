package com.gotour.catalog.hotel.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public final class HotelDtos {

    private HotelDtos() {
    }

    @Schema(name = "HotelSummary")
    public record HotelSummary(
            Long id,
            String name,
            String slug,
            String destinationName,
            String destinationSlug,
            String city,
            String country,
            String shortDescription,
            Integer starRating,
            BigDecimal rating,
            Integer reviewCount,
            BigDecimal pricePerNight,
            String currency,
            String heroImageUrl,
            List<String> amenities,
            boolean featured
    ) {
    }

    @Schema(name = "HotelDetail")
    public record HotelDetail(
            Long id,
            String name,
            String slug,
            String destinationName,
            String destinationSlug,
            String city,
            String country,
            String address,
            String shortDescription,
            String description,
            Integer starRating,
            BigDecimal rating,
            Integer reviewCount,
            BigDecimal pricePerNight,
            String currency,
            String heroImageUrl,
            List<String> amenities,
            String checkInTime,
            String checkOutTime,
            BigDecimal latitude,
            BigDecimal longitude,
            boolean featured,
            List<String> gallery,
            List<RoomResponse> rooms
    ) {
    }

    @Schema(name = "HotelRoomResponse")
    public record RoomResponse(
            Long id,
            String roomType,
            String description,
            BigDecimal pricePerNight,
            Integer capacity,
            String bedType,
            Integer sizeSqm,
            Integer roomsAvailable,
            String imageUrl
    ) {
    }

    @Schema(name = "HotelFilterOptions")
    public record FilterOptions(BigDecimal minPrice, BigDecimal maxPrice, List<String> amenities) {
    }

    @Schema(name = "ReserveRoomsRequest")
    public record ReserveRoomsRequest(
            @NotNull(message = "Room id is required") Long roomId,
            @Min(value = 1, message = "At least one room must be reserved") int rooms
    ) {
    }

    @Schema(name = "SaveHotelRequest")
    public record SaveHotelRequest(
            @NotBlank(message = "Name is required") @Size(max = 180) String name,

            @NotBlank(message = "Slug is required")
            @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                    message = "Slug may only contain lowercase letters, numbers and hyphens")
            @Size(max = 200) String slug,

            @NotBlank(message = "Destination slug is required") @Size(max = 140) String destinationSlug,
            @NotBlank(message = "Destination name is required") @Size(max = 120) String destinationName,
            @NotBlank(message = "City is required") @Size(max = 80) String city,
            @NotBlank(message = "Country is required") @Size(max = 80) String country,
            @NotBlank(message = "Address is required") @Size(max = 300) String address,
            @NotBlank(message = "Short description is required") @Size(max = 300) String shortDescription,
            @NotBlank(message = "Description is required") String description,

            @NotNull(message = "Star rating is required")
            @Min(value = 1, message = "Star rating must be between 1 and 5")
            @Max(value = 5, message = "Star rating must be between 1 and 5")
            Integer starRating,

            @NotNull(message = "Price per night is required")
            @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
            BigDecimal pricePerNight,

            @Pattern(regexp = "^$|^[A-Z]{3}$", message = "Currency must be a 3-letter ISO code")
            String currency,

            @NotBlank(message = "Hero image URL is required") @Size(max = 500) String heroImageUrl,

            @Size(max = 500) String amenities,
            @Size(max = 10) String checkInTime,
            @Size(max = 10) String checkOutTime,
            BigDecimal latitude,
            BigDecimal longitude,
            boolean featured,
            boolean active
    ) {
    }
}
