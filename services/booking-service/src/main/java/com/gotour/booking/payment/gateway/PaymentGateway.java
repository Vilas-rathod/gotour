package com.gotour.booking.payment.gateway;

import java.math.BigDecimal;

/**
 * Abstraction over a payment provider.
 *
 * <p>Everything above this interface — the REST API, the persistence model, the
 * booking callback — is provider agnostic. Adding a provider means adding one
 * implementation and switching {@code gotour.payment.provider}; no other code
 * changes.
 */
public interface PaymentGateway {

    /** Provider key matched against {@code gotour.payment.provider}. */
    String provider();

    /**
     * Creates an order with the provider and returns the identifiers the
     * frontend checkout widget needs.
     */
    GatewayOrder createOrder(OrderRequest request);

    /**
     * Confirms that a callback genuinely came from the provider and refers to a
     * completed payment.
     *
     * @return true when the signature is valid
     */
    boolean verifyPayment(VerificationRequest request);

    /** Requests a refund. Implementations may return a pending refund. */
    GatewayRefund refund(RefundRequest request);

    /** What the checkout page needs to open the provider's widget. */
    record GatewayOrder(
            String providerOrderId,
            BigDecimal amount,
            String currency,
            String publicKey,
            String checkoutUrl
    ) {
    }

    record GatewayRefund(String providerRefundId, BigDecimal amount, boolean completed) {
    }

    record OrderRequest(
            String paymentReference,
            String bookingReference,
            BigDecimal amount,
            String currency,
            String customerEmail
    ) {
    }

    record VerificationRequest(
            String providerOrderId,
            String providerPaymentId,
            String signature
    ) {
    }

    record RefundRequest(
            String providerPaymentId,
            BigDecimal amount,
            String reason
    ) {
    }
}
