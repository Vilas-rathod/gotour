package com.gotour.catalog.review.service;

import com.gotour.common.api.PageRequestFactory;
import com.gotour.common.api.PageResponse;
import com.gotour.common.exception.ConflictException;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.common.security.GoTourPrincipal;
import com.gotour.catalog.review.domain.Review;
import com.gotour.catalog.review.domain.ReviewStatus;
import com.gotour.catalog.review.domain.ReviewTargetType;
import com.gotour.catalog.review.dto.ReviewDtos.CreateReviewRequest;
import com.gotour.catalog.review.dto.ReviewDtos.ModerateReviewRequest;
import com.gotour.catalog.review.dto.ReviewDtos.ModerationStats;
import com.gotour.catalog.review.dto.ReviewDtos.ReviewResponse;
import com.gotour.catalog.review.dto.ReviewDtos.ReviewSummary;
import com.gotour.catalog.review.dto.ReviewDtos.UpdateReviewRequest;
import com.gotour.catalog.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private static final Set<String> SORTABLE = Set.of("createdAt", "rating", "helpfulCount");

    private final ReviewRepository reviewRepository;

    /**
     * Public listing. Only approved reviews are returned, so a pending or
     * rejected review is never visible to other customers.
     */
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> listApproved(ReviewTargetType targetType, String targetSlug,
                                                      Integer page, Integer size,
                                                      String sortBy, String direction) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, SORTABLE, "createdAt");

        return PageResponse.from(
                reviewRepository.findByTargetTypeAndTargetSlugAndStatusOrderByCreatedAtDesc(
                        targetType, targetSlug, ReviewStatus.APPROVED, pageable),
                this::toResponse);
    }

    @Transactional(readOnly = true)
    public ReviewSummary summary(ReviewTargetType targetType, String targetSlug) {
        var aggregate = reviewRepository.findAggregate(targetType, targetSlug);

        double average = aggregate == null || aggregate.getAverage() == null
                ? 0.0
                : BigDecimal.valueOf(aggregate.getAverage())
                        .setScale(1, RoundingMode.HALF_UP).doubleValue();

        long total = aggregate == null || aggregate.getTotal() == null ? 0L : aggregate.getTotal();

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 5; star >= 1; star--) {
            distribution.put(star, 0L);
        }
        reviewRepository.findRatingDistribution(targetType, targetSlug)
                .forEach(row -> distribution.put(
                        ((Number) row[0]).intValue(), ((Number) row[1]).longValue()));

        return new ReviewSummary(average, total, distribution);
    }

    @Transactional
    public ReviewResponse create(GoTourPrincipal principal, CreateReviewRequest request) {
        if (reviewRepository.existsByUserIdAndTargetTypeAndTargetSlug(
                principal.userId(), request.targetType(), request.targetSlug())) {
            throw new ConflictException("You have already reviewed this. Edit your existing review instead.");
        }

        Review review = reviewRepository.save(Review.builder()
                .userId(principal.userId())
                .userName(displayName(principal))
                .targetType(request.targetType())
                .targetSlug(request.targetSlug().trim())
                .bookingReference(request.bookingReference())
                .rating(request.rating())
                .title(request.title().trim())
                .comment(request.comment().trim())
                .status(ReviewStatus.PENDING)
                .helpfulCount(0)
                .build());

        log.info("Review {} submitted by user {} for {} {}",
                review.getId(), principal.userId(), request.targetType(), request.targetSlug());
        return toResponse(review);
    }

    @Transactional
    public ReviewResponse update(Long userId, Long reviewId, UpdateReviewRequest request) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        review.setRating(request.rating());
        review.setTitle(request.title().trim());
        review.setComment(request.comment().trim());
        // An edited review goes back through moderation.
        review.setStatus(ReviewStatus.PENDING);
        review.setModeratedAt(null);
        review.setModerationNote(null);

        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void delete(Long userId, Long reviewId) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> myReviews(Long userId, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(
                page == null || page < 0 ? 0 : page,
                size == null || size < 1 ? 10 : Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        return PageResponse.from(
                reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable), this::toResponse);
    }

    @Transactional
    public void markHelpful(Long reviewId) {
        if (reviewRepository.incrementHelpful(reviewId) == 0) {
            throw new ResourceNotFoundException("Review", reviewId);
        }
    }

    // ------------------------------------------------------------------ admin

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> adminList(String search, ReviewStatus status,
                                                   ReviewTargetType targetType,
                                                   Integer page, Integer size,
                                                   String sortBy, String direction) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, SORTABLE, "createdAt");
        return PageResponse.from(
                reviewRepository.findForAdmin(search == null ? "" : search.trim(), status, targetType, pageable),
                this::toResponse);
    }

    @Transactional
    public ReviewResponse moderate(Long reviewId, ModerateReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        review.setStatus(request.status());
        review.setModeratedAt(Instant.now());
        review.setModerationNote(request.note());

        log.info("Review {} moderated to {}", reviewId, request.status());
        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteAsAdmin(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public ModerationStats moderationStats() {
        return new ModerationStats(
                reviewRepository.countByStatus(ReviewStatus.PENDING),
                reviewRepository.countByStatus(ReviewStatus.APPROVED),
                reviewRepository.countByStatus(ReviewStatus.REJECTED));
    }

    // --------------------------------------------------------------- mapping

    private String displayName(GoTourPrincipal principal) {
        if (principal.email() == null || principal.email().isBlank()) {
            return "GoTour Traveller";
        }
        String local = principal.email().split("@")[0].replaceAll("[._-]+", " ").trim();
        if (local.isEmpty()) {
            return "GoTour Traveller";
        }
        return Character.toUpperCase(local.charAt(0)) + local.substring(1);
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(r.getId(), r.getUserId(), r.getUserName(), r.getUserAvatarUrl(),
                r.getTargetType(), r.getTargetSlug(), r.getRating(), r.getTitle(), r.getComment(),
                r.getStatus(), r.getHelpfulCount(), r.isVerified(), r.getCreatedAt());
    }
}
