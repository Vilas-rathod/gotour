package com.gotour.catalog.review.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.catalog.review.domain.ReviewStatus;
import com.gotour.catalog.review.domain.ReviewTargetType;
import com.gotour.catalog.review.dto.ReviewDtos.ModerateReviewRequest;
import com.gotour.catalog.review.dto.ReviewDtos.ModerationStats;
import com.gotour.catalog.review.dto.ReviewDtos.ReviewResponse;
import com.gotour.catalog.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin - Reviews", description = "Review moderation queue")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/reviews")
// TODO(security): ADMIN only. Nothing enforces this yet.
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "List reviews in any status")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ReviewStatus status,
            @RequestParam(required = false) ReviewTargetType targetType,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(
                reviewService.adminList(search, status, targetType, page, size, sortBy, direction)));
    }

    @Operation(summary = "Counts by moderation status")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ModerationStats>> stats() {
        return ResponseEntity.ok(ApiResponse.success(reviewService.moderationStats()));
    }

    @Operation(summary = "Approve or reject a review")
    @PatchMapping("/{reviewId}/moderate")
    public ResponseEntity<ApiResponse<ReviewResponse>> moderate(@PathVariable Long reviewId,
                                                                @Valid @RequestBody ModerateReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Review moderated",
                reviewService.moderate(reviewId, request)));
    }

    @Operation(summary = "Delete a review")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long reviewId) {
        reviewService.deleteAsAdmin(reviewId);
        return ResponseEntity.ok(ApiResponse.message("Review deleted"));
    }
}
