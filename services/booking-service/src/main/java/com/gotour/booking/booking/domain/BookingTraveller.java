package com.gotour.booking.booking.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "booking_travellers",
        indexes = @Index(name = "idx_booking_travellers_booking", columnList = "booking_id"))
public class BookingTraveller extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_booking_travellers_booking"))
    private Booking booking;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false)
    private Integer age;

    @Column(length = 20)
    private String gender;

    @Column(name = "passport_number", length = 40)
    private String passportNumber;

    @Column(length = 80)
    private String nationality;

    /** The traveller the booking correspondence is addressed to. */
    @Builder.Default
    @Column(name = "lead_traveller", nullable = false)
    private boolean leadTraveller = false;
}
