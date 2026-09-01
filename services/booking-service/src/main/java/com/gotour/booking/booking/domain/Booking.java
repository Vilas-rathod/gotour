package com.gotour.booking.booking.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * A confirmed or pending reservation.
 *
 * <p>Item details (title, image, destination) are copied in at booking time so
 * a historical booking still renders correctly after the package or hotel is
 * edited or withdrawn from sale.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "bookings",
        uniqueConstraints = @UniqueConstraint(name = "uk_bookings_reference", columnNames = "booking_reference"),
        indexes = {
                @Index(name = "idx_bookings_reference", columnList = "booking_reference"),
                @Index(name = "idx_bookings_user", columnList = "user_id"),
                @Index(name = "idx_bookings_status", columnList = "status"),
                @Index(name = "idx_bookings_created", columnList = "created_at")
        })
public class Booking extends BaseEntity {

    /** Human-friendly identifier shown to customers, e.g. GT-2K7X9A4B. */
    @Column(name = "booking_reference", nullable = false, length = 20)
    private String bookingReference;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_email", nullable = false, length = 180)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type", nullable = false, length = 20)
    private BookingType bookingType;

    /** Slug of the booked package or hotel. */
    @Column(name = "item_slug", nullable = false, length = 200)
    private String itemSlug;

    @Column(name = "item_title", nullable = false, length = 200)
    private String itemTitle;

    @Column(name = "item_image_url", length = 500)
    private String itemImageUrl;

    @Column(name = "destination_name", length = 120)
    private String destinationName;

    /** Room type id for hotel bookings; null for package bookings. */
    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "room_type", length = 120)
    private String roomType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "traveller_count", nullable = false)
    private Integer travellerCount;

    @Column(name = "room_count")
    private Integer roomCount;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Builder.Default
    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BookingStatus status = BookingStatus.PENDING_PAYMENT;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(name = "payment_reference", length = 40)
    private String paymentReference;

    @Column(name = "special_requests", length = 1000)
    private String specialRequests;

    @Column(name = "contact_email", nullable = false, length = 180)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancellation_reason", length = 400)
    private String cancellationReason;

    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Builder.Default
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingTraveller> travellers = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingItem> items = new ArrayList<>();

    public long nights() {
        return java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
    }
}
