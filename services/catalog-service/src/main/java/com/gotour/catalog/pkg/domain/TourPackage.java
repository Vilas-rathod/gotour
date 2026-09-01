package com.gotour.catalog.pkg.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tour_packages",
        uniqueConstraints = @UniqueConstraint(name = "uk_tour_packages_slug", columnNames = "slug"),
        indexes = {
                @Index(name = "idx_tour_packages_slug", columnList = "slug"),
                @Index(name = "idx_tour_packages_destination", columnList = "destination_slug"),
                @Index(name = "idx_tour_packages_active", columnList = "active"),
                @Index(name = "idx_tour_packages_price", columnList = "price"),
                @Index(name = "idx_tour_packages_rating", columnList = "rating")
        })
public class TourPackage extends BaseEntity {

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 200)
    private String slug;

    /**
     * Destination is referenced by slug and denormalised name rather than a
     * foreign key: destination-service owns that table, and copying the label
     * keeps listing queries free of cross-service calls.
     */
    @Column(name = "destination_slug", nullable = false, length = 140)
    private String destinationSlug;

    @Column(name = "destination_name", nullable = false, length = 120)
    private String destinationName;

    @Column(name = "destination_country", length = 80)
    private String destinationCountry;

    @Column(nullable = false, length = 300)
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "duration_nights", nullable = false)
    private Integer durationNights;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** Promotional price. When set it must be lower than {@link #price}. */
    @Column(name = "discount_price", precision = 12, scale = 2)
    private BigDecimal discountPrice;

    @Builder.Default
    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(name = "package_type", nullable = false, length = 30)
    private PackageType packageType;

    @Enumerated(EnumType.STRING)
    @Column(name = "travel_style", nullable = false, length = 30)
    private TravelStyle travelStyle;

    @Builder.Default
    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @Builder.Default
    @Column(name = "booking_count", nullable = false)
    private Integer bookingCount = 0;

    @Column(name = "max_group_size")
    private Integer maxGroupSize;

    @Column(name = "hero_image_url", nullable = false, length = 500)
    private String heroImageUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean featured = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean trending = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Builder.Default
    @OneToMany(mappedBy = "tourPackage", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<PackageImage> images = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "tourPackage", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<PackageDetailItem> detailItems = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "tourPackage", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    private List<PackageItineraryDay> itinerary = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "tourPackage", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("departureDate ASC")
    private List<PackageAvailability> availability = new ArrayList<>();

    /** Price a customer actually pays. */
    public BigDecimal effectivePrice() {
        return discountPrice != null ? discountPrice : price;
    }
}
