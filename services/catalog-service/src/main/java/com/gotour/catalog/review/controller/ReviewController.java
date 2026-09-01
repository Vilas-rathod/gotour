package com.gotour.catalog.review.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.common.security.SecurityUtils;
import com.gotour.catalog.review.domain.ReviewTargetType;
import com.gotour.catalog.review.dto.ReviewDtos.CreateReviewRequest;
import com.gotour.catalog.review.dto.ReviewDtos.ReviewResponse;
import com.gotour.catalog.review.dto.ReviewDtos.ReviewSummary;
import com.gotour.catalog.review.dto.ReviewDtos.UpdateReviewRequest;
import com.gotour.catalog.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Reviews", description = "Ratings and reviews for destinations, packages and hotels")
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "List approved reviews for a target")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> list(
            @RequestParam ReviewTargetType targetType,
            @RequestParam String targetSlug,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(reviewService.listApproved(
                targetType, targetSlug, page, size, sortBy, direction)));
    }

    @Operation(summary = "Average rating and star distribution for a target")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ReviewSummary>> summary(
            @RequestParam ReviewTargetType targetType,
            @RequestParam String targetSlug) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.summary(targetType, targetSlug)));
    }

    @Operation(summary = "Submit a review",
            description = "Reviews are held for moderation before appearing publicly",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> create(@Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thanks! Your review will appear once it has been reviewed.",
                        reviewService.create(SecurityUtils.requirePrincipal(), request)));
    }

    @Operation(summary = "List the signed-in traveller's own reviews",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> myReviews(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return ResponseEntity.ok(ApiResponse.success(
                reviewService.myReviews(SecurityUtils.currentUserId(), page, size)));
    }

    @Operation(summary = "Edit your own review",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(@PathVariable Long reviewId,
                                                              @Valid @RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Review updated and resubmitted for moderation",
                reviewService.update(SecurityUtils.currentUserId(), reviewId, request)));
    }

    @Operation(summary = "Delete your own review",
            security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long reviewId) {
        reviewService.delete(SecurityUtils.currentUserId(), reviewId);
        return ResponseEntity.ok(ApiResponse.message("Review deleted"));
    }

    @Operation(summary = "Mark a review as helpful",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<ApiResponse<Void>> markHelpful(@PathVariable Long reviewId) {
        reviewService.markHelpful(reviewId);
        return ResponseEntity.ok(ApiResponse.message("Thanks for the feedback"));
    }
}
