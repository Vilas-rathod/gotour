package com.gotour.booking.payment.service;

import com.gotour.common.api.PageRequestFactory;
import com.gotour.common.api.PageResponse;
import com.gotour.common.exception.BadRequestException;
import com.gotour.common.exception.ForbiddenException;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.common.security.GoTourPrincipal;
import com.gotour.booking.payment.client.BookingClient;
import com.gotour.booking.payment.domain.Payment;
import com.gotour.booking.payment.domain.PaymentStatus;
import com.gotour.booking.payment.domain.Refund;
import com.gotour.booking.payment.dto.PaymentDtos.InitiatePaymentRequest;
import com.gotour.booking.payment.dto.PaymentDtos.InitiatePaymentResponse;
import com.gotour.booking.payment.dto.PaymentDtos.PaymentResponse;
import com.gotour.booking.payment.dto.PaymentDtos.RefundRequestDto;
import com.gotour.booking.payment.dto.PaymentDtos.RefundResponse;
import com.gotour.booking.payment.dto.PaymentDtos.RevenuePoint;
import com.gotour.booking.payment.dto.PaymentDtos.RevenueStatsResponse;
import com.gotour.booking.payment.dto.PaymentDtos.VerifyPaymentRequest;
import com.gotour.booking.payment.gateway.PaymentGateway;
import com.gotour.booking.payment.gateway.PaymentGatewayResolver;
import com.gotour.booking.payment.repository.PaymentRepository;
import com.gotour.booking.payment.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Payment orchestration.
 *
 * <p>Two rules drive the design: the charge amount always comes from
 * booking-service rather than the client, and a booking is only confirmed after
 * the provider's signature has been verified.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Set<String> SORTABLE = Set.of("createdAt", "amount", "status", "paidAt");

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final PaymentGatewayResolver gatewayResolver;
    private final BookingClient bookingClient;

    @Transactional
    public InitiatePaymentResponse initiate(GoTourPrincipal principal, InitiatePaymentRequest request) {
        BookingClient.BookingView booking = fetchBooking(request.bookingReference());

        if (!booking.userId().equals(principal.userId())) {
            throw new ForbiddenException("This booking belongs to another account");
        }
        if ("CANCELLED".equals(booking.status())) {
            throw new BadRequestException("A cancelled booking cannot be paid for");
        }
        if ("PAID".equals(booking.paymentStatus())) {
            throw new BadRequestException("This booking has already been paid");
        }

        // Method is chosen per transaction at checkout; fall back to the
        // configured default when the client does not name one.
        PaymentGateway gateway = (request.method() == null || request.method().isBlank())
                ? gatewayResolver.active()
                : gatewayResolver.byName(request.method());

        boolean cash = "CASH".equalsIgnoreCase(gateway.provider());
        if (cash && !"HOTEL".equalsIgnoreCase(booking.bookingType())) {
            throw new BadRequestException(
                    "Cash on arrival is only available for hotel stays. Please pay online for this booking.");
        }

        String paymentReference = "PAY-" + UUID.randomUUID().toString().replace("-", "")
                .substring(0, 16).toUpperCase();

        // The amount is read from the booking, so a tampered request body
        // cannot change what the customer is charged.
        PaymentGateway.GatewayOrder order = gateway.createOrder(new PaymentGateway.OrderRequest(
                paymentReference,
                booking.bookingReference(),
                booking.totalAmount(),
                booking.currency(),
                booking.contactEmail() == null ? booking.userEmail() : booking.contactEmail()));

        Payment payment = paymentRepository.save(Payment.builder()
                .paymentReference(paymentReference)
                .bookingReference(booking.bookingReference())
                .userId(principal.userId())
                .userEmail(principal.email())
                .amount(booking.totalAmount())
                .currency(booking.currency())
                .provider(gateway.provider())
                .providerOrderId(order.providerOrderId())
                .status(PaymentStatus.PENDING)
                .method(cash ? "Cash on arrival" : "UPI / Razorpay")
                .refundedAmount(BigDecimal.ZERO)
                .build());

        // Cash on arrival captures nothing online: reserve the room now and let
        // the guest settle the balance in cash at the hotel.
        if (cash) {
            try {
                bookingClient.confirmPayAtHotel(booking.bookingReference(),
                        new BookingClient.MarkPaidRequest(paymentReference));
            } catch (RuntimeException ex) {
                log.error("Could not reserve pay-at-hotel booking {}", booking.bookingReference(), ex);
                throw new BadRequestException("Could not reserve your booking. Please try again.");
            }
        }

        log.info("Initiated payment {} for booking {} via {}",
                paymentReference, booking.bookingReference(), gateway.provider());

        return new InitiatePaymentResponse(
                payment.getPaymentReference(),
                payment.getBookingReference(),
                gateway.provider(),
                order.providerOrderId(),
                order.amount(),
                order.currency(),
                order.publicKey(),
                order.checkoutUrl(),
                payment.getStatus());
    }

    @Transactional
    public PaymentResponse verify(GoTourPrincipal principal, VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findByPaymentReference(request.paymentReference())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", request.paymentReference()));

        if (!payment.getUserId().equals(principal.userId())) {
            throw new ForbiddenException("This payment belongs to another account");
        }
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            // Verification is idempotent: a repeated callback is not an error.
            return toResponse(payment);
        }

        PaymentGateway gateway = gatewayResolver.byName(payment.getProvider());

        boolean valid = gateway.verifyPayment(new PaymentGateway.VerificationRequest(
                payment.getProviderOrderId(), request.providerPaymentId(), request.signature()));

        if (!valid) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Signature verification failed");
            paymentRepository.save(payment);
            log.warn("Rejected payment {}: signature verification failed", payment.getPaymentReference());
            throw new BadRequestException("Payment verification failed. No amount has been captured.");
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setProviderPaymentId(request.providerPaymentId());
        payment.setPaidAt(Instant.now());
        Payment saved = paymentRepository.save(payment);

        // Confirm the booking. A failure here leaves a successful payment with
        // an unconfirmed booking, which is logged loudly for reconciliation
        // rather than silently rolled back.
        try {
            bookingClient.markPaid(payment.getBookingReference(),
                    new BookingClient.MarkPaidRequest(payment.getPaymentReference()));
        } catch (RuntimeException ex) {
            log.error("Payment {} succeeded but booking {} could not be confirmed",
                    payment.getPaymentReference(), payment.getBookingReference(), ex);
        }

        log.info("Payment {} verified for booking {}",
                saved.getPaymentReference(), saved.getBookingReference());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> myPayments(Long userId, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(
                page == null || page < 0 ? 0 : page,
                size == null || size < 1 ? 10 : Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        return PageResponse.from(
                paymentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable), this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> forBooking(Long userId, String bookingReference) {
        return paymentRepository.findByBookingReferenceOrderByCreatedAtDesc(bookingReference).stream()
                .filter(payment -> payment.getUserId().equals(userId))
                .map(this::toResponse)
                .toList();
    }

    // ------------------------------------------------------------------ admin

    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> adminList(String search, PaymentStatus status,
                                                    Integer page, Integer size,
                                                    String sortBy, String direction) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, SORTABLE, "createdAt");
        return PageResponse.from(
                paymentRepository.findForAdmin(search == null ? "" : search.trim(), status, pageable),
                this::toResponse);
    }

    @Transactional
    public RefundResponse refund(String paymentReference, RefundRequestDto request) {
        Payment payment = paymentRepository.findByPaymentReference(paymentReference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentReference));

        if (payment.getStatus() != PaymentStatus.SUCCESS
                && payment.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            throw new BadRequestException("Only a successful payment can be refunded");
        }

        BigDecimal refundable = payment.refundableAmount();
        BigDecimal amount = request.amount() == null ? refundable : request.amount();

        if (amount.compareTo(refundable) > 0) {
            throw new BadRequestException(
                    "Refund of %s exceeds the refundable balance of %s".formatted(amount, refundable));
        }

        PaymentGateway gateway = gatewayResolver.byName(payment.getProvider());
        PaymentGateway.GatewayRefund result = gateway.refund(new PaymentGateway.RefundRequest(
                payment.getProviderPaymentId(), amount, request.reason()));

        Refund refund = refundRepository.save(Refund.builder()
                .payment(payment)
                .amount(amount)
                .providerRefundId(result.providerRefundId())
                .status(result.completed() ? "COMPLETED" : "PENDING")
                .reason(request.reason())
                .build());

        payment.setRefundedAmount(payment.getRefundedAmount().add(amount));
        payment.setStatus(payment.refundableAmount().compareTo(BigDecimal.ZERO) <= 0
                ? PaymentStatus.REFUNDED
                : PaymentStatus.PARTIALLY_REFUNDED);
        paymentRepository.save(payment);

        log.info("Refunded {} against payment {}", amount, paymentReference);

        return new RefundResponse(refund.getId(), payment.getPaymentReference(), refund.getAmount(),
                refund.getProviderRefundId(), refund.getStatus(), refund.getReason(), refund.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public RevenueStatsResponse revenueStats() {
        BigDecimal gross = paymentRepository.sumAmountByStatuses(
                List.of(PaymentStatus.SUCCESS, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED));
        BigDecimal refunded = paymentRepository.sumRefunded();

        List<RevenuePoint> monthly = paymentRepository
                .findMonthlyRevenue(Instant.now().minus(365, ChronoUnit.DAYS))
                .stream()
                .map(row -> new RevenuePoint(
                        (String) row[0],
                        (BigDecimal) row[1],
                        ((Number) row[2]).longValue()))
                .toList();

        return new RevenueStatsResponse(
                gross,
                refunded,
                gross.subtract(refunded),
                paymentRepository.countByStatus(PaymentStatus.SUCCESS),
                paymentRepository.countByStatus(PaymentStatus.FAILED),
                monthly);
    }

    // --------------------------------------------------------------- helpers

    private BookingClient.BookingView fetchBooking(String reference) {
        BookingClient.Envelope<BookingClient.BookingView> envelope;
        try {
            envelope = bookingClient.getBooking(reference);
        } catch (RuntimeException ex) {
            log.error("Could not load booking {} from booking-service", reference, ex);
            throw new BadRequestException("Unable to load the booking. Please try again.");
        }
        if (envelope == null || envelope.data() == null) {
            throw new ResourceNotFoundException("Booking", reference);
        }
        return envelope.data();
    }

    private PaymentResponse toResponse(Payment p) {
        return new PaymentResponse(
                p.getId(), p.getPaymentReference(), p.getBookingReference(), p.getAmount(), p.getCurrency(),
                p.getProvider(), p.getProviderOrderId(), p.getProviderPaymentId(), p.getStatus(),
                p.getMethod(), p.getFailureReason(), p.getPaidAt(), p.getRefundedAmount(), p.getCreatedAt());
    }
}
