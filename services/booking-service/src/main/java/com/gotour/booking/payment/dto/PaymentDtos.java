package com.gotour.booking.payment.dto;

import com.gotour.booking.payment.domain.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class PaymentDtos {

    private PaymentDtos() {
    }

    @Schema(name = "InitiatePaymentRequest",
            description = "The amount is taken from the booking, never from the client")
    public record InitiatePaymentRequest(
            @NotBlank(message = "Booking reference is required")
            @Size(max = 20)
            String bookingReference,

            @Schema(description = "Payment method: RAZORPAY (online UPI/BHIM) or CASH (pay at hotel). "
                    + "Defaults to the configured provider when omitted.")
            @Size(max = 20)
            String method
    ) {
    }

    @Schema(name = "InitiatePaymentResponse")
    public record InitiatePaymentResponse(
            String paymentReference,
            String bookingReference,
            String provider,
            String providerOrderId,
            BigDecimal amount,
            String currency,
            String publicKey,
            String checkoutUrl,
            PaymentStatus status
    ) {
    }

    @Schema(name = "VerifyPaymentRequest")
    public record VerifyPaymentRequest(
            @NotBlank(message = "Payment reference is required")
            @Size(max = 40)
            String paymentReference,

            @NotBlank(message = "Provider payment id is required")
            @Size(max = 120)
            String providerPaymentId,

            @NotBlank(message = "Signature is required")
            @Size(max = 500)
            String signature
    ) {
    }

    @Schema(name = "PaymentResponse")
    public record PaymentResponse(
            Long id,
            String paymentReference,
            String bookingReference,
            BigDecimal amount,
            String currency,
            String provider,
            String providerOrderId,
            String providerPaymentId,
            PaymentStatus status,
            String method,
            String failureReason,
            Instant paidAt,
            BigDecimal refundedAmount,
            Instant createdAt
    ) {
    }

    @Schema(name = "RefundRequest")
    public record RefundRequestDto(
            @DecimalMin(value = "0.0", inclusive = false, message = "Refund amount must be greater than zero")
            BigDecimal amount,

            @Size(max = 400)
            String reason
    ) {
    }

    @Schema(name = "RefundResponse")
    public record RefundResponse(
            Long id,
            String paymentReference,
            BigDecimal amount,
            String providerRefundId,
            String status,
            String reason,
            Instant createdAt
    ) {
    }

    @Schema(name = "RevenueStatsResponse")
    public record RevenueStatsResponse(
            BigDecimal grossRevenue,
            BigDecimal refunded,
            BigDecimal netRevenue,
            long successfulPayments,
            long failedPayments,
            List<RevenuePoint> monthlyRevenue
    ) {
    }

    @Schema(name = "RevenuePoint")
    public record RevenuePoint(String period, BigDecimal revenue, long transactions) {
    }
}
