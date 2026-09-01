package com.gotour.booking.payment.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payments",
        uniqueConstraints = @UniqueConstraint(name = "uk_payments_reference", columnNames = "payment_reference"),
        indexes = {
                @Index(name = "idx_payments_reference", columnList = "payment_reference"),
                @Index(name = "idx_payments_booking", columnList = "booking_reference"),
                @Index(name = "idx_payments_user", columnList = "user_id"),
                @Index(name = "idx_payments_status", columnList = "status")
        })
public class Payment extends BaseEntity {

    @Column(name = "payment_reference", nullable = false, length = 40)
    private String paymentReference;

    @Column(name = "booking_reference", nullable = false, length = 20)
    private String bookingReference;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_email", length = 180)
    private String userEmail;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(nullable = false, length = 3)
    private String currency = "INR";

    /** Which gateway handled this payment, so refunds route back correctly. */
    @Column(nullable = false, length = 20)
    private String provider;

    @Column(name = "provider_order_id", length = 120)
    private String providerOrderId;

    @Column(name = "provider_payment_id", length = 120)
    private String providerPaymentId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.CREATED;

    @Column(length = 40)
    private String method;

    @Column(name = "failure_reason", length = 400)
    private String failureReason;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Builder.Default
    @Column(name = "refunded_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundedAmount = BigDecimal.ZERO;

    public BigDecimal refundableAmount() {
        return amount.subtract(refundedAmount).max(BigDecimal.ZERO);
    }
}
