package com.gotour.catalog.review.domain;

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

import java.time.Instant;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reviews",
        uniqueConstraints = @UniqueConstraint(name = "uk_reviews_user_target",
                columnNames = {"user_id", "target_type", "target_slug"}),
        indexes = {
                @Index(name = "idx_reviews_target", columnList = "target_type,target_slug"),
                @Index(name = "idx_reviews_status", columnList = "status"),
                @Index(name = "idx_reviews_user", columnList = "user_id")
        })
public class Review extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", nullable = false, length = 120)
    private String userName;

    @Column(name = "user_avatar_url", length = 500)
    private String userAvatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private ReviewTargetType targetType;

    @Column(name = "target_slug", nullable = false, length = 200)
    private String targetSlug;

    /**
     * Booking this review relates to. When present the review is badged as a
     * verified stay rather than an anonymous opinion.
     */
    @Column(name = "booking_reference", length = 20)
    private String bookingReference;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 2000)
    private String comment;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status = ReviewStatus.PENDING;

    @Builder.Default
    @Column(name = "helpful_count", nullable = false)
    private Integer helpfulCount = 0;

    @Column(name = "moderated_at")
    private Instant moderatedAt;

    @Column(name = "moderation_note", length = 400)
    private String moderationNote;

    public boolean isVerified() {
        return bookingReference != null && !bookingReference.isBlank();
    }
}
