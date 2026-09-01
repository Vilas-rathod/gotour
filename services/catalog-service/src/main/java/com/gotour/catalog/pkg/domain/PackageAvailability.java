package com.gotour.catalog.pkg.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/** A bookable departure date with its own seat count and optional price. */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "package_availability",
        uniqueConstraints = @UniqueConstraint(name = "uk_package_availability_date",
                columnNames = {"package_id", "departure_date"}),
        indexes = @Index(name = "idx_package_availability_package", columnList = "package_id"))
public class PackageAvailability extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "package_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_package_availability_package"))
    private TourPackage tourPackage;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Column(name = "seats_total", nullable = false)
    private Integer seatsTotal;

    @Builder.Default
    @Column(name = "seats_booked", nullable = false)
    private Integer seatsBooked = 0;

    /** Overrides the package price for this departure when set. */
    @Column(name = "price_override", precision = 12, scale = 2)
    private BigDecimal priceOverride;

    public int seatsAvailable() {
        return Math.max(0, seatsTotal - seatsBooked);
    }
}
