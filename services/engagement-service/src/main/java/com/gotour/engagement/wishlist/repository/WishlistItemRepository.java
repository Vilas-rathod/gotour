package com.gotour.engagement.wishlist.repository;

import com.gotour.engagement.wishlist.domain.WishlistItem;
import com.gotour.engagement.wishlist.domain.WishlistItemType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    @Query("""
            select w from WishlistItem w
            where w.userId = :userId
              and (:itemType is null or w.itemType = :itemType)
            """)
    Page<WishlistItem> findForUser(@Param("userId") Long userId,
                                   @Param("itemType") WishlistItemType itemType,
                                   Pageable pageable);

    Optional<WishlistItem> findByUserIdAndItemTypeAndItemSlug(
            Long userId, WishlistItemType itemType, String itemSlug);

    Optional<WishlistItem> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndItemTypeAndItemSlug(Long userId, WishlistItemType itemType, String itemSlug);

    long countByUserId(Long userId);

    @Query("select w.itemSlug from WishlistItem w where w.userId = :userId and w.itemType = :itemType")
    List<String> findSlugsForUser(@Param("userId") Long userId, @Param("itemType") WishlistItemType itemType);
}
