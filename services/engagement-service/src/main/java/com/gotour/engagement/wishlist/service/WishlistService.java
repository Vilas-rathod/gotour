package com.gotour.engagement.wishlist.service;

import com.gotour.common.api.PageRequestFactory;
import com.gotour.common.api.PageResponse;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.engagement.wishlist.domain.WishlistItem;
import com.gotour.engagement.wishlist.domain.WishlistItemType;
import com.gotour.engagement.wishlist.dto.WishlistDtos.SaveWishlistItemRequest;
import com.gotour.engagement.wishlist.dto.WishlistDtos.SlugsResponse;
import com.gotour.engagement.wishlist.dto.WishlistDtos.ToggleResponse;
import com.gotour.engagement.wishlist.dto.WishlistDtos.WishlistItemResponse;
import com.gotour.engagement.wishlist.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private static final Set<String> SORTABLE = Set.of("createdAt", "title", "price");

    private final WishlistItemRepository repository;

    @Transactional(readOnly = true)
    public PageResponse<WishlistItemResponse> list(Long userId, WishlistItemType itemType,
                                                    Integer page, Integer size,
                                                    String sortBy, String direction) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, SORTABLE, "createdAt");
        return PageResponse.from(repository.findForUser(userId, itemType, pageable), this::toResponse);
    }

    /**
     * Adds the item if it is not saved, removes it if it is. One endpoint keeps
     * the heart button on the frontend simple and idempotent under double taps.
     */
    @Transactional
    public ToggleResponse toggle(Long userId, SaveWishlistItemRequest request) {
        return repository
                .findByUserIdAndItemTypeAndItemSlug(userId, request.itemType(), request.itemSlug())
                .map(existing -> {
                    repository.delete(existing);
                    return new ToggleResponse(false, null, repository.countByUserId(userId));
                })
                .orElseGet(() -> {
                    WishlistItem saved = repository.save(WishlistItem.builder()
                            .userId(userId)
                            .itemType(request.itemType())
                            .itemSlug(request.itemSlug().trim())
                            .title(request.title().trim())
                            .subtitle(request.subtitle())
                            .imageUrl(request.imageUrl())
                            .price(request.price())
                            .currency(request.currency() == null || request.currency().isBlank()
                                    ? "INR" : request.currency())
                            .build());
                    return new ToggleResponse(true, toResponse(saved), repository.countByUserId(userId));
                });
    }

    @Transactional
    public void remove(Long userId, Long itemId) {
        WishlistItem item = repository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item", itemId));
        repository.delete(item);
    }

    @Transactional(readOnly = true)
    public boolean contains(Long userId, WishlistItemType itemType, String itemSlug) {
        return repository.existsByUserIdAndItemTypeAndItemSlug(userId, itemType, itemSlug);
    }

    @Transactional(readOnly = true)
    public SlugsResponse savedSlugs(Long userId) {
        return new SlugsResponse(
                repository.findSlugsForUser(userId, WishlistItemType.DESTINATION),
                repository.findSlugsForUser(userId, WishlistItemType.PACKAGE),
                repository.findSlugsForUser(userId, WishlistItemType.HOTEL));
    }

    @Transactional(readOnly = true)
    public long count(Long userId) {
        return repository.countByUserId(userId);
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        return new WishlistItemResponse(item.getId(), item.getItemType(), item.getItemSlug(),
                item.getTitle(), item.getSubtitle(), item.getImageUrl(), item.getPrice(),
                item.getCurrency(), item.getCreatedAt());
    }
}
