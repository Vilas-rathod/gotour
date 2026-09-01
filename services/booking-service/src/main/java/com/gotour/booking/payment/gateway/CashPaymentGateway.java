package com.gotour.booking.payment.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * "Pay at hotel" — cash collected on arrival.
 *
 * <p>No money moves online: the booking is reserved immediately and the balance
 * is settled in cash at the property. Offered only for hotel stays; that rule is
 * enforced in {@code PaymentService} where the booking type is known.
 *
 * <p>Because nothing is captured through a provider there is no hosted page, no
 * public key and no callback to verify.
 */
@Slf4j
@Component
public class CashPaymentGateway implements PaymentGateway {

    @Override
    public String provider() {
        return "CASH";
    }

    @Override
    public GatewayOrder createOrder(OrderRequest request) {
        String orderId = "cash_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        log.info("Cash-on-arrival reservation {} for booking {}", orderId, request.bookingReference());
        // No checkout URL and no public key: the guest pays at the hotel.
        return new GatewayOrder(orderId, request.amount(), request.currency(), null, null);
    }

    @Override
    public boolean verifyPayment(VerificationRequest request) {
        // Cash is settled in person, so there is no online callback to verify.
        return true;
    }

    @Override
    public GatewayRefund refund(RefundRequest request) {
        // A cash-on-arrival balance is collected at the property, so any refund
        // is handled there too — there is nothing to reverse through a gateway.
        throw new UnsupportedOperationException("Cash-on-arrival payments are refunded at the hotel");
    }
}
