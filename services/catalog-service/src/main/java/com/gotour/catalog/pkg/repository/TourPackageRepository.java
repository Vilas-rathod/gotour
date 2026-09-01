package com.gotour.catalog.pkg.repository;

import com.gotour.catalog.pkg.domain.PackageType;
import com.gotour.catalog.pkg.domain.TourPackage;
import com.gotour.catalog.pkg.domain.TravelStyle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TourPackageRepository extends JpaRepository<TourPackage, Long> {

    Optional<TourPackage> findBySlugAndActiveTrue(String slug);

    boolean existsBySlug(String slug);

    List<TourPackage> findTop8ByActiveTrueAndFeaturedTrueOrderByBookingCountDesc();

    List<TourPackage> findTop8ByActiveTrueAndTrendingTrueOrderByBookingCountDesc();

    List<TourPackage> findTop4ByActiveTrueAndDestinationSlugAndIdNotOrderByBookingCountDesc(
            String destinationSlug, Long id);

    /**
     * Catalogue search across every filter offered on the packages page.
     *
     * <p>Price comparisons use {@code coalesce(discountPrice, price)} so a
     * discounted package is filtered by what the customer actually pays.
     */
    @Query("""
            select p from TourPackage p
            where p.active = true
              and (:search is null or :search = ''
                   or lower(p.title) like lower(concat('%', :search, '%'))
                   or lower(p.summary) like lower(concat('%', :search, '%'))
                   or lower(p.destinationName) like lower(concat('%', :search, '%'))
                   or lower(p.destinationCountry) like lower(concat('%', :search, '%')))
              and (:destinationSlug is null or :destinationSlug = '' or p.destinationSlug = :destinationSlug)
              and (:packageType is null or p.packageType = :packageType)
              and (:travelStyle is null or p.travelStyle = :travelStyle)
              and (:minPrice is null or coalesce(p.discountPrice, p.price) >= :minPrice)
              and (:maxPrice is null or coalesce(p.discountPrice, p.price) <= :maxPrice)
              and (:minDuration is null or p.durationDays >= :minDuration)
              and (:maxDuration is null or p.durationDays <= :maxDuration)
              and (:minRating is null or p.rating >= :minRating)
            """)
    Page<TourPackage> search(@Param("search") String search,
                             @Param("destinationSlug") String destinationSlug,
                             @Param("packageType") PackageType packageType,
                             @Param("travelStyle") TravelStyle travelStyle,
                             @Param("minPrice") BigDecimal minPrice,
                             @Param("maxPrice") BigDecimal maxPrice,
                             @Param("minDuration") Integer minDuration,
                             @Param("maxDuration") Integer maxDuration,
                             @Param("minRating") BigDecimal minRating,
                             Pageable pageable);

    @Query("select coalesce(min(coalesce(p.discountPrice, p.price)), 0) from TourPackage p where p.active = true")
    BigDecimal findMinPrice();

    @Query("select coalesce(max(coalesce(p.discountPrice, p.price)), 0) from TourPackage p where p.active = true")
    BigDecimal findMaxPrice();

    @Query("select count(p) from TourPackage p where p.active = true")
    long countActive();
}
