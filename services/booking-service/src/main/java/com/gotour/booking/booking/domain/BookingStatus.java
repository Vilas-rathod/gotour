package com.gotour.booking.booking.domain;

/**
 * Lifecycle of a booking.
 *
 * <pre>
 *   PENDING_PAYMENT --> CONFIRMED --> COMPLETED
 *          |                 |
 *          +------> CANCELLED <-------+
 * </pre>
 */
public enum BookingStatus {
    PENDING_PAYMENT,
    CONFIRMED,
    COMPLETED,
    CANCELLED;

    public boolean isCancellable() {
        return this == PENDING_PAYMENT || this == CONFIRMED;
    }
}
