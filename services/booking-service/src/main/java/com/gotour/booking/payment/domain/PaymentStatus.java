package com.gotour.booking.payment.domain;

/**
 * <pre>
 *   CREATED --> PENDING --> SUCCESS --> REFUNDED / PARTIALLY_REFUNDED
 *                   \
 *                    --> FAILED
 * </pre>
 */
public enum PaymentStatus {
    CREATED,
    PENDING,
    SUCCESS,
    FAILED,
    PARTIALLY_REFUNDED,
    REFUNDED
}
