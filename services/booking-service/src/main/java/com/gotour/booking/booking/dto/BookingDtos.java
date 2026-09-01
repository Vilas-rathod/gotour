package com.gotour.booking.booking.dto;

import com.gotour.booking.booking.domain.BookingStatus;
import com.gotour.booking.booking.domain.BookingType;
import com.gotour.booking.booking.domain.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class BookingDtos {

    private BookingDtos() {
    }

    @Schema(name = "CreateBookingRequest")
    public record CreateBookingRequest(
            @NotNull(message = "Booking type is required")
            BookingType bookingType,

            @NotBlank(message = "Item slug is required")
            @Size(max = 200)
            String itemSlug,

            @Schema(description = "Required for hotel bookings")
            Long roomId,

            @NotNull(message = "Start date is required")
            @Future(message = "Start date must be in the future")
            LocalDate startDate,

            @NotNull(message = "End date is required")
            @Future(message = "End date must be in the future")
            LocalDate endDate,

            @NotNull(message = "Traveller count is required")
            @Min(value = 1, message = "At least one traveller is required")
            @Max(value = 30, message = "Contact us directly for groups larger than 30")
            Integer travellerCount,

            @Min(value = 1, message = "At least one room is required")
            Integer roomCount,

            @NotEmpty(message = "Traveller details are required")
            @Valid
            List<TravellerRequest> travellers,

            @NotBlank(message = "Contact email is required")
            @Email(message = "Enter a valid email address")
            String contactEmail,

            @Pattern(regexp = "^$|^[0-9+\\-\\s()]{7,20}$", message = "Enter a valid phone number")
            String contactPhone,

            @Size(max = 1000, message = "Special requests must not exceed 1000 characters")
            String specialRequests
    ) {
    }

    @Schema(name = "TravellerRequest")
    public record TravellerRequest(
            @NotBlank(message = "Traveller name is required")
            @Size(max = 120)
            String fullName,

            @NotNull(message = "Age is required")
            @Min(value = 0, message = "Age cannot be negative")
            @Max(value = 120, message = "Enter a valid age")
            Integer age,

            @Size(max = 20)
            String gender,

            @Size(max = 40)
            String passportNumber,

            @Size(max = 80)
            String nationality,

            boolean leadTraveller
    ) {
    }

    @Schema(name = "TravellerResponse")
    public record TravellerResponse(
            Long id,
            String fullName,
            Integer age,
            String gender,
            String passportNumber,
            String nationality,
            boolean leadTraveller
    ) {
    }

    @Schema(name = "BookingItemResponse")
    public record BookingItemResponse(String label, BigDecimal unitPrice, Integer quantity, BigDecimal amount) {
    }

    @Schema(name = "BookingSummary")
    public record BookingSummary(
            Long id,
            String bookingReference,
            BookingType bookingType,
            String itemSlug,
            String itemTitle,
            String itemImageUrl,
            String destinationName,
            LocalDate startDate,
            LocalDate endDate,
            Integer travellerCount,
            BigDecimal totalAmount,
            String currency,
            BookingStatus status,
            PaymentStatus paymentStatus,
            Instant createdAt
    ) {
    }

    @Schema(name = "BookingDetail")
    public record BookingDetail(
            Long id,
            String bookingReference,
            Long userId,
            String userEmail,
            BookingType bookingType,
            String itemSlug,
            String itemTitle,
            String itemImageUrl,
            String destinationName,
            String roomType,
            LocalDate startDate,
            LocalDate endDate,
            long nights,
            Integer travellerCount,
            Integer roomCount,
            BigDecimal totalAmount,
            String currency,
            BookingStatus status,
            PaymentStatus paymentStatus,
            String paymentReference,
            String contactEmail,
            String contactPhone,
            String specialRequests,
            Instant cancelledAt,
            String cancellationReason,
            BigDecimal refundAmount,
            Instant createdAt,
            List<TravellerResponse> travellers,
            List<BookingItemResponse> items
    ) {
    }

    @Schema(name = "CancelBookingRequest")
    public record CancelBookingRequest(
            @Size(max = 400, message = "Reason must not exceed 400 characters")
            String reason
    ) {
    }

    @Schema(name = "MarkPaidRequest", description = "Called by payment-service after a successful payment")
    public record MarkPaidRequest(
            @NotBlank(message = "Payment reference is required")
            @Size(max = 40)
            String paymentReference
    ) {
    }

    @Schema(name = "BookingStatsResponse", description = "Admin dashboard KPIs")
    public record BookingStatsResponse(
            long totalBookings,
            long pendingBookings,
            long confirmedBookings,
            long completedBookings,
            long cancelledBookings,
            long bookingsLast30Days,
            BigDecimal totalRevenue,
            List<TrendPoint> monthlyTrend,
            List<TopItem> topSelling
    ) {
    }

    @Schema(name = "BookingTrendPoint")
    public record TrendPoint(String period, long bookings, BigDecimal revenue) {
    }

    @Schema(name = "TopSellingItem")
    public record TopItem(String title, long bookings, BigDecimal revenue) {
    }

    @Schema(name = "InvoiceResponse")
    public record InvoiceResponse(
            String invoiceNumber,
            String bookingReference,
            Instant issuedAt,
            String customerName,
            String customerEmail,
            String itemTitle,
            LocalDate startDate,
            LocalDate endDate,
            Integer travellerCount,
            List<BookingItemResponse> lineItems,
            BigDecimal subtotal,
            BigDecimal taxes,
            BigDecimal total,
            String currency,
            PaymentStatus paymentStatus
    ) {
    }
}
