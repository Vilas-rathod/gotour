package com.gotour.identity.user.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
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
@Table(name = "addresses", indexes = @Index(name = "idx_addresses_user", columnList = "user_id"))
public class Address extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** Free-form label such as "Home" or "Office". */
    @Column(length = 40)
    private String label;

    @Column(name = "line1", nullable = false, length = 180)
    private String line1;

    @Column(name = "line2", length = 180)
    private String line2;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(length = 80)
    private String state;

    @Column(nullable = false, length = 80)
    private String country;

    @Column(name = "postal_code", nullable = false, length = 20)
    private String postalCode;

    @Builder.Default
    @Column(name = "is_default", nullable = false)
    private boolean defaultAddress = false;
}
