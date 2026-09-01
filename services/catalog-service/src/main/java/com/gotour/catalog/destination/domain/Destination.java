package com.gotour.catalog.destination.domain;

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
@Table(name = "destinations",
        uniqueConstraints = @UniqueConstraint(name = "uk_destinations_slug", columnNames = "slug"),
        indexes = {
                @Index(name = "idx_destinations_slug", columnList = "slug"),
                @Index(name = "idx_destinations_country", columnList = "country"),
                @Index(name = "idx_destinations_active_featured", columnList = "active,featured"),
                @Index(name = "idx_destinations_popularity", columnList = "popularity_score")
        })
public class Destination extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    /** URL-friendly identifier used by the frontend instead of the numeric id. */
    @Column(nullable = false, length = 140)
    private String slug;

    @Column(nullable = false, length = 80)
    private String country;

    @Column(length = 80)
    private String city;

    @Column(length = 80)
    private String region;

    @Column(length = 40)
    private String continent;

    @Column(name = "short_description", nullable = false, length = 300)
    private String shortDescription;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "hero_image_url", nullable = false, length = 500)
    private String heroImageUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Builder.Default
    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    /** Editorial ranking used for the "popular destinations" rail. */
    @Builder.Default
    @Column(name = "popularity_score", nullable = false)
    private Integer popularityScore = 0;

    @Column(name = "best_time_to_visit", length = 120)
    private String bestTimeToVisit;

    @Column(name = "average_budget", precision = 12, scale = 2)
    private BigDecimal averageBudget;

    @Column(length = 3)
    private String currency;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    /** Comma-separated travel styles, e.g. "Beach,Luxury,Honeymoon". */
    @Column(length = 300)
    private String tags;

    @Builder.Default
    @Column(nullable = false)
    private boolean featured = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Builder.Default
    @OneToMany(mappedBy = "destination", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<DestinationImage> images = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "destination", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<Attraction> attractions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "destination", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<TravelGuide> guides = new ArrayList<>();
}
