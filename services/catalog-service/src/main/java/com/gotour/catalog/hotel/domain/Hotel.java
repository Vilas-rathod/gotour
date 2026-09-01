package com.gotour.catalog.hotel.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "hotels",
        uniqueConstraints = @UniqueConstraint(name = "uk_hotels_slug", columnNames = "slug"),
        indexes = {
                @Index(name = "idx_hotels_slug", columnList = "slug"),
                @Index(name = "idx_hotels_destination", columnList = "destination_slug"),
                @Index(name = "idx_hotels_active", columnList = "active"),
                @Index(name = "idx_hotels_price", columnList = "price_per_night")
        })
public class Hotel extends BaseEntity {

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false, length = 200)
    private String slug;

    @Column(name = "destination_slug", nullable = false, length = 140)
    private String destinationSlug;

    @Column(name = "destination_name", nullable = false, length = 120)
    private String destinationName;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(nullable = false, length = 80)
    private String country;

    @Column(nullable = false, length = 300)
    private String address;

    @Column(name = "short_description", nullable = false, length = 300)
    private String shortDescription;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /** Official star classification, 1-5. */
    @Column(name = "star_rating", nullable = false)
    private Integer starRating;

    @Builder.Default
    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @Column(name = "price_per_night", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerNight;

    @Builder.Default
    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Column(name = "hero_image_url", nullable = false, length = 500)
    private String heroImageUrl;

    /** Comma-separated amenity keys, e.g. "WIFI,POOL,SPA". */
    @Column(length = 500)
    private String amenities;

    @Column(name = "check_in_time", length = 10)
    private String checkInTime;

    @Column(name = "check_out_time", length = 10)
    private String checkOutTime;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Builder.Default
    @Column(nullable = false)
    private boolean featured = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Builder.Default
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<HotelImage> images = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("pricePerNight ASC")
    private List<HotelRoom> rooms = new ArrayList<>();
}
