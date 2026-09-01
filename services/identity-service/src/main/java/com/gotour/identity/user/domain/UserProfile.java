package com.gotour.identity.user.domain;

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

import java.time.LocalDate;

/**
 * Travel profile for a user.
 *
 * <p>{@code userId} mirrors the id issued by auth-service; the two services
 * share no tables, so the id is the only link between them.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_profiles",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_profiles_user", columnNames = "user_id"),
        indexes = @Index(name = "idx_user_profiles_user", columnList = "user_id"))
public class UserProfile extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 180)
    private String email;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(length = 80)
    private String nationality;

    @Column(length = 500)
    private String bio;

    @Column(name = "preferred_currency", length = 3)
    private String preferredCurrency;

    @Builder.Default
    @Column(name = "marketing_opt_in", nullable = false)
    private boolean marketingOptIn = false;

    public enum Gender {
        MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
    }
}
