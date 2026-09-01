package com.gotour.booking.booking.domain;

/** Payment state as reported back by payment-service. */
public enum PaymentStatus {
    UNPAID,
    PAID,
    REFUNDED,
    FAILED
}
