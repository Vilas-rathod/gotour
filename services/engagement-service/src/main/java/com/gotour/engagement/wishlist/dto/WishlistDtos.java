package com.gotour.engagement.wishlist.dto;

import com.gotour.engagement.wishlist.domain.WishlistItemType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class WishlistDtos {

    private WishlistDtos() {
    }

    @Schema(name = "SaveWishlistItemRequest")
    public record SaveWishlistItemRequest(
            @NotNull(message = "Item type is required")
            WishlistItemType itemType,

            @NotBlank(message = "Item slug is required")
            @Size(max = 200)
            String itemSlug,

            @NotBlank(message = "Title is required")
            @Size(max = 200)
            String title,

            @Size(max = 200)
            String subtitle,

            @Size(max = 500)
            String imageUrl,

            @PositiveOrZero(message = "Price cannot be negative")
            BigDecimal price,

            @Pattern(regexp = "^$|^[A-Z]{3}$", message = "Currency must be a 3-letter ISO code")
            String currency
    ) {
    }

    @Schema(name = "WishlistItemResponse")
    public record WishlistItemResponse(
            Long id,
            WishlistItemType itemType,
            String itemSlug,
            String title,
            String subtitle,
            String imageUrl,
            BigDecimal price,
            String currency,
            Instant savedAt
    ) {
    }

    @Schema(name = "WishlistToggleResponse")
    public record ToggleResponse(boolean saved, WishlistItemResponse item, long totalSaved) {
    }

    @Schema(name = "WishlistSlugsResponse",
            description = "Slugs the user has saved, so listing pages can show the filled heart without extra calls")
    public record SlugsResponse(List<String> destinations, List<String> packages, List<String> hotels) {
    }
}
