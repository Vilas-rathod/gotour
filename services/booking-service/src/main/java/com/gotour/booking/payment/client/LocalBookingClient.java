package com.gotour.booking.payment.client;

import com.gotour.booking.booking.dto.BookingDtos;
import com.gotour.booking.booking.dto.BookingDtos.BookingDetail;
import com.gotour.booking.booking.service.BookingService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * In-process backing for {@link BookingClient}: delegates to the booking module
 * directly instead of crossing the network.
 *
 * <p>{@link #markPaid} runs in its own transaction ({@code REQUIRES_NEW}) so a
 * failure to confirm the booking does not roll back the already-captured
 * payment — preserving the original "log loudly for reconciliation" behaviour
 * that the previous Feign call gave for free by being a separate request.
 */
@Component
public class LocalBookingClient implements BookingClient {

    private final BookingService bookingService;

    public LocalBookingClient(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @Override
    public Envelope<BookingView> getBooking(String reference) {
        return new Envelope<>(true, "ok", toView(bookingService.adminGet(reference)));
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Envelope<BookingView> markPaid(String reference, MarkPaidRequest request) {
        BookingDetail detail = bookingService.markPaid(
                reference, new BookingDtos.MarkPaidRequest(request.paymentReference()));
        return new Envelope<>(true, "ok", toView(detail));
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Envelope<BookingView> confirmPayAtHotel(String reference, MarkPaidRequest request) {
        BookingDetail detail = bookingService.confirmPayAtHotel(reference, request.paymentReference());
        return new Envelope<>(true, "ok", toView(detail));
    }

    private BookingView toView(BookingDetail d) {
        return new BookingView(
                d.bookingReference(),
                d.userId(),
                d.userEmail(),
                d.contactEmail(),
                d.totalAmount(),
                d.currency(),
                d.bookingType() == null ? null : d.bookingType().name(),
                d.status() == null ? null : d.status().name(),
                d.paymentStatus() == null ? null : d.paymentStatus().name());
    }
}
