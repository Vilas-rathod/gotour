package com.gotour.booking.itinerary.dto;

import com.gotour.booking.itinerary.domain.ItineraryActivity.ActivityCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public final class ItineraryDtos {

    private ItineraryDtos() {
    }

    @Schema(name = "SaveItineraryRequest")
    public record SaveItineraryRequest(
            @Size(max = 20) String bookingReference,
            @NotBlank(message = "Title is required") @Size(max = 180) String title,
            @Size(max = 120) String destinationName,
            @Size(max = 500) String coverImageUrl,
            @NotNull(message = "Start date is required") LocalDate startDate,
            @NotNull(message = "End date is required") LocalDate endDate,
            @Size(max = 1000) String notes
    ) {
    }

    @Schema(name = "SaveDayRequest")
    public record SaveDayRequest(
            @NotNull(message = "Day number is required")
            @Positive(message = "Day number must be positive")
            Integer dayNumber,

            LocalDate date,

            @NotBlank(message = "Title is required") @Size(max = 180) String title,
            @Size(max = 1000) String description
    ) {
    }

    @Schema(name = "SaveActivityRequest")
    public record SaveActivityRequest(
            LocalTime startTime,
            @NotBlank(message = "Title is required") @Size(max = 180) String title,
            @Size(max = 600) String description,
            @Size(max = 200) String location,
            ActivityCategory category
    ) {
    }

    @Schema(name = "ItinerarySummary")
    public record ItinerarySummary(
            Long id,
            String bookingReference,
            String title,
            String destinationName,
            String coverImageUrl,
            LocalDate startDate,
            LocalDate endDate,
            long durationDays,
            int dayCount
    ) {
    }

    @Schema(name = "ItineraryDetail")
    public record ItineraryDetail(
            Long id,
            String bookingReference,
            String title,
            String destinationName,
            String coverImageUrl,
            LocalDate startDate,
            LocalDate endDate,
            long durationDays,
            String notes,
            List<DayResponse> days
    ) {
    }

    @Schema(name = "ItineraryDayResponse")
    public record DayResponse(
            Long id,
            Integer dayNumber,
            LocalDate date,
            String title,
            String description,
            List<ActivityResponse> activities
    ) {
    }

    @Schema(name = "ItineraryActivityResponse")
    public record ActivityResponse(
            Long id,
            LocalTime startTime,
            String title,
            String description,
            String location,
            ActivityCategory category,
            boolean completed
    ) {
    }
}
