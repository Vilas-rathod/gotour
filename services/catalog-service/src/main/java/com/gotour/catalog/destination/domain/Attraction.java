package com.gotour.catalog.destination.domain;

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

import java.math.BigDecimal;

/** A nearby point of interest shown on the destination detail page. */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "attractions",
        indexes = @Index(name = "idx_attractions_destination", columnList = "destination_id"))
public class Attraction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attractions_destination"))
    private Destination destination;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(length = 400)
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(length = 60)
    private String category;

    @Column(name = "distance_km", precision = 6, scale = 2)
    private BigDecimal distanceKm;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
