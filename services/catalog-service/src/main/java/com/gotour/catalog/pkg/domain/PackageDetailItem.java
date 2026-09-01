package com.gotour.catalog.pkg.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

/**
 * A bullet point on the package page. One table backs inclusions, exclusions
 * and highlights because they differ only in how they are presented.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "package_detail_items",
        indexes = @Index(name = "idx_package_detail_items_package", columnList = "package_id"))
public class PackageDetailItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "package_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_package_detail_items_package"))
    private TourPackage tourPackage;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private ItemType itemType;

    @Column(nullable = false, length = 300)
    private String text;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    public enum ItemType {
        INCLUSION,
        EXCLUSION,
        HIGHLIGHT
    }
}
