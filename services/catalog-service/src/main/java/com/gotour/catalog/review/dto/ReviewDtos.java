package com.gotour.catalog.review.dto;

import com.gotour.catalog.review.domain.ReviewStatus;
import com.gotour.catalog.review.domain.ReviewTargetType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Map;

public final class ReviewDtos {

    private ReviewDtos() {
    }

    @Schema(name = "CreateReviewRequest")
    public record CreateReviewRequest(
            @NotNull(message = "Target type is required")
            ReviewTargetType targetType,

            @NotBlank(message = "Target slug is required")
            @Size(max = 200)
            String targetSlug,

            @Size(max = 20)
            String bookingReference,

            @NotNull(message = "Rating is required")
            @Min(value = 1, message = "Rating must be between 1 and 5")
            @Max(value = 5, message = "Rating must be between 1 and 5")
            Integer rating,

            @NotBlank(message = "Title is required")
            @Size(max = 160)
            String title,

            @NotBlank(message = "Review text is required")
            @Size(min = 10, max = 2000, message = "Review must be between 10 and 2000 characters")
            String comment
    ) {
    }

    @Schema(name = "UpdateReviewRequest")
    public record UpdateReviewRequest(
            @NotNull(message = "Rating is required")
            @Min(value = 1, message = "Rating must be between 1 and 5")
            @Max(value = 5, message = "Rating must be between 1 and 5")
            Integer rating,

            @NotBlank(message = "Title is required")
            @Size(max = 160)
            String title,

            @NotBlank(message = "Review text is required")
            @Size(min = 10, max = 2000, message = "Review must be between 10 and 2000 characters")
            String comment
    ) {
    }

    @Schema(name = "ReviewResponse")
    public record ReviewResponse(
            Long id,
            Long userId,
            String userName,
            String userAvatarUrl,
            ReviewTargetType targetType,
            String targetSlug,
            Integer rating,
            String title,
            String comment,
            ReviewStatus status,
            Integer helpfulCount,
            boolean verified,
            Instant createdAt
    ) {
    }

    @Schema(name = "ReviewSummaryResponse", description = "Aggregate rating shown above the review list")
    public record ReviewSummary(
            double averageRating,
            long totalReviews,
            Map<Integer, Long> distribution
    ) {
    }

    @Schema(name = "ModerateReviewRequest")
    public record ModerateReviewRequest(
            @NotNull(message = "Status is required")
            ReviewStatus status,

            @Size(max = 400)
            String note
    ) {
    }

    @Schema(name = "ReviewModerationStats")
    public record ModerationStats(long pending, long approved, long rejected) {
    }
}
