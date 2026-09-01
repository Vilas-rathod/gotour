package com.gotour.booking.booking.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Minimal projections of the catalogue services' responses.
 *
 * <p>Only the fields booking-service actually needs are declared; unknown
 * properties are ignored so the catalogue APIs can evolve independently.
 */
public final class CatalogueDtos {

    private CatalogueDtos() {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Envelope<T>(boolean success, String message, T data) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PackageView(
            String title,
            String slug,
            String destinationName,
            String heroImageUrl,
            BigDecimal effectivePrice,
            String currency,
            Integer durationDays
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record HotelView(
            String name,
            String slug,
            String destinationName,
            String heroImageUrl,
            BigDecimal pricePerNight,
            String currency,
            List<RoomView> rooms
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RoomView(
            Long id,
            String roomType,
            BigDecimal pricePerNight,
            Integer capacity,
            Integer roomsAvailable
    ) {
    }

    public record ReserveSeatsRequest(LocalDate departureDate, int seats) {
    }

    public record ReserveRoomsRequest(Long roomId, int rooms) {
    }
}
