package com.gotour.engagement.wishlist.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.common.security.SecurityUtils;
import com.gotour.engagement.wishlist.domain.WishlistItemType;
import com.gotour.engagement.wishlist.dto.WishlistDtos.SaveWishlistItemRequest;
import com.gotour.engagement.wishlist.dto.WishlistDtos.SlugsResponse;
import com.gotour.engagement.wishlist.dto.WishlistDtos.ToggleResponse;
import com.gotour.engagement.wishlist.dto.WishlistDtos.WishlistItemResponse;
import com.gotour.engagement.wishlist.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Wishlist", description = "Saved destinations, packages and hotels")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @Operation(summary = "List saved items, optionally filtered by type")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<WishlistItemResponse>>> list(
            @RequestParam(required = false) WishlistItemType type,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(wishlistService.list(
                SecurityUtils.currentUserId(), type, page, size, sortBy, direction)));
    }

    @Operation(summary = "Save an item, or remove it if already saved")
    @PostMapping("/toggle")
    public ResponseEntity<ApiResponse<ToggleResponse>> toggle(
            @Valid @RequestBody SaveWishlistItemRequest request) {

        ToggleResponse response = wishlistService.toggle(SecurityUtils.currentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success(
                response.saved() ? "Added to wishlist" : "Removed from wishlist", response));
    }

    @Operation(summary = "Remove a saved item by id")
    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long itemId) {
        wishlistService.remove(SecurityUtils.currentUserId(), itemId);
        return ResponseEntity.ok(ApiResponse.message("Removed from wishlist"));
    }

    @Operation(summary = "Check whether one item is saved")
    @GetMapping("/contains")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> contains(
            @RequestParam WishlistItemType type,
            @RequestParam String slug) {

        boolean saved = wishlistService.contains(SecurityUtils.currentUserId(), type, slug);
        return ResponseEntity.ok(ApiResponse.success(Map.of("saved", saved)));
    }

    @Operation(summary = "All saved slugs grouped by type, for rendering listing pages")
    @GetMapping("/slugs")
    public ResponseEntity<ApiResponse<SlugsResponse>> slugs() {
        return ResponseEntity.ok(ApiResponse.success(
                wishlistService.savedSlugs(SecurityUtils.currentUserId())));
    }

    @Operation(summary = "Total number of saved items, for the header badge")
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> count() {
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("count", wishlistService.count(SecurityUtils.currentUserId()))));
    }
}
