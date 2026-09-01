package com.gotour.catalog.destination.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public final class DestinationDtos {

    private DestinationDtos() {
    }

    @Schema(name = "DestinationSummary", description = "Card representation used in listings and rails")
    public record DestinationSummary(
            Long id,
            String name,
            String slug,
            String country,
            String city,
            String continent,
            String shortDescription,
            String heroImageUrl,
            String thumbnailUrl,
            BigDecimal rating,
            Integer reviewCount,
            BigDecimal averageBudget,
            String currency,
            List<String> tags,
            boolean featured
    ) {
    }

    @Schema(name = "DestinationDetail")
    public record DestinationDetail(
            Long id,
            String name,
            String slug,
            String country,
            String city,
            String region,
            String continent,
            String shortDescription,
            String description,
            String heroImageUrl,
            BigDecimal rating,
            Integer reviewCount,
            String bestTimeToVisit,
            BigDecimal averageBudget,
            String currency,
            BigDecimal latitude,
            BigDecimal longitude,
            List<String> tags,
            boolean featured,
            List<ImageResponse> gallery,
            List<AttractionResponse> attractions,
            List<GuideResponse> guides
    ) {
    }

    @Schema(name = "DestinationImageResponse")
    public record ImageResponse(Long id, String imageUrl, String caption, Integer sortOrder) {
    }

    @Schema(name = "AttractionResponse")
    public record AttractionResponse(
            Long id,
            String name,
            String description,
            String imageUrl,
            String category,
            BigDecimal distanceKm
    ) {
    }

    @Schema(name = "TravelGuideResponse")
    public record GuideResponse(Long id, String category, String title, String content) {
    }

    @Schema(name = "DestinationFacets", description = "Filter options for the destinations listing page")
    public record FacetsResponse(List<String> countries, List<String> continents, List<String> tags) {
    }

    @Schema(name = "SaveDestinationRequest")
    public record SaveDestinationRequest(
            @NotBlank(message = "Name is required")
            @Size(max = 120)
            String name,

            @NotBlank(message = "Slug is required")
            @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                    message = "Slug may only contain lowercase letters, numbers and hyphens")
            @Size(max = 140)
            String slug,

            @NotBlank(message = "Country is required")
            @Size(max = 80)
            String country,

            @Size(max = 80)
            String city,

            @Size(max = 80)
            String region,

            @Size(max = 40)
            String continent,

            @NotBlank(message = "Short description is required")
            @Size(max = 300)
            String shortDescription,

            @NotBlank(message = "Description is required")
            String description,

            @NotBlank(message = "Hero image URL is required")
            @Size(max = 500)
            String heroImageUrl,

            @Size(max = 500)
            String thumbnailUrl,

            @DecimalMin(value = "0.0", message = "Rating cannot be negative")
            @DecimalMax(value = "5.0", message = "Rating cannot exceed 5")
            BigDecimal rating,

            @PositiveOrZero(message = "Popularity score cannot be negative")
            Integer popularityScore,

            @Size(max = 120)
            String bestTimeToVisit,

            @DecimalMin(value = "0.0", message = "Budget cannot be negative")
            BigDecimal averageBudget,

            @Pattern(regexp = "^$|^[A-Z]{3}$", message = "Currency must be a 3-letter ISO code")
            String currency,

            BigDecimal latitude,
            BigDecimal longitude,

            @Size(max = 300)
            String tags,

            boolean featured,
            boolean active
    ) {
    }
}
