package com.gotour.catalog.review.repository;

import com.gotour.catalog.review.domain.Review;
import com.gotour.catalog.review.domain.ReviewStatus;
import com.gotour.catalog.review.domain.ReviewTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByTargetTypeAndTargetSlugAndStatusOrderByCreatedAtDesc(
            ReviewTargetType targetType, String targetSlug, ReviewStatus status, Pageable pageable);

    Optional<Review> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndTargetTypeAndTargetSlug(
            Long userId, ReviewTargetType targetType, String targetSlug);

    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("""
            select r from Review r
            where (:status is null or r.status = :status)
              and (:targetType is null or r.targetType = :targetType)
              and (:search is null or :search = ''
                   or lower(r.title) like lower(concat('%', :search, '%'))
                   or lower(r.comment) like lower(concat('%', :search, '%'))
                   or lower(r.userName) like lower(concat('%', :search, '%'))
                   or lower(r.targetSlug) like lower(concat('%', :search, '%')))
            """)
    Page<Review> findForAdmin(@Param("search") String search,
                              @Param("status") ReviewStatus status,
                              @Param("targetType") ReviewTargetType targetType,
                              Pageable pageable);

    /** Average rating and review count for a target, over approved reviews only. */
    @Query("""
            select coalesce(avg(r.rating), 0) as average, count(r) as total
            from Review r
            where r.targetType = :targetType and r.targetSlug = :targetSlug
              and r.status = com.gotour.catalog.review.domain.ReviewStatus.APPROVED
            """)
    RatingAggregate findAggregate(@Param("targetType") ReviewTargetType targetType,
                                  @Param("targetSlug") String targetSlug);

    interface RatingAggregate {
        Double getAverage();

        Long getTotal();
    }

    /** Star distribution for the rating breakdown bars. */
    @Query("""
            select r.rating, count(r)
            from Review r
            where r.targetType = :targetType and r.targetSlug = :targetSlug
              and r.status = com.gotour.catalog.review.domain.ReviewStatus.APPROVED
            group by r.rating
            """)
    List<Object[]> findRatingDistribution(@Param("targetType") ReviewTargetType targetType,
                                          @Param("targetSlug") String targetSlug);

    long countByStatus(ReviewStatus status);

    @Modifying
    @Query("update Review r set r.helpfulCount = r.helpfulCount + 1 where r.id = :id")
    int incrementHelpful(@Param("id") Long id);
}
