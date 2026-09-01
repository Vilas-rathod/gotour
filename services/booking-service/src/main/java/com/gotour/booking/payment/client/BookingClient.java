package com.gotour.booking.payment.client;

import java.math.BigDecimal;

/**
 * Port the payment module uses to read the authoritative booking amount and to
 * confirm a booking once paid.
 *
 * <p>Booking and payment now live in the same service, so this is backed by an
 * in-process adapter ({@link LocalBookingClient}) rather than a Feign call. The
 * interface is kept so the payment orchestration code is unchanged and the
 * boundary stays explicit.
 */
public interface BookingClient {

    Envelope<BookingView> getBooking(String reference);

    Envelope<BookingView> markPaid(String reference, MarkPaidRequest request);

    /**
     * Reserves a hotel booking to be settled in cash on arrival: the booking is
     * confirmed but its payment status stays UNPAID.
     */
    Envelope<BookingView> confirmPayAtHotel(String reference, MarkPaidRequest request);

    record Envelope<T>(boolean success, String message, T data) {
    }

    record BookingView(
            String bookingReference,
            Long userId,
            String userEmail,
            String contactEmail,
            BigDecimal totalAmount,
            String currency,
            String bookingType,
            String status,
            String paymentStatus
    ) {
    }

    record MarkPaidRequest(String paymentReference) {
    }
}
