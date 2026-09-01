package com.gotour.catalog.hotel.repository;

import com.gotour.catalog.hotel.domain.Hotel;
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
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    Optional<Hotel> findBySlugAndActiveTrue(String slug);

    boolean existsBySlug(String slug);

    List<Hotel> findTop8ByActiveTrueAndFeaturedTrueOrderByRatingDesc();

    @Query("""
            select h from Hotel h
            where h.active = true
              and (:search is null or :search = ''
                   or lower(h.name) like lower(concat('%', :search, '%'))
                   or lower(h.city) like lower(concat('%', :search, '%'))
                   or lower(h.country) like lower(concat('%', :search, '%'))
                   or lower(h.destinationName) like lower(concat('%', :search, '%')))
              and (:destinationSlug is null or :destinationSlug = '' or h.destinationSlug = :destinationSlug)
              and (:minPrice is null or h.pricePerNight >= :minPrice)
              and (:maxPrice is null or h.pricePerNight <= :maxPrice)
              and (:starRating is null or h.starRating >= :starRating)
              and (:minRating is null or h.rating >= :minRating)
              and (:amenity is null or :amenity = '' or lower(h.amenities) like lower(concat('%', :amenity, '%')))
            """)
    Page<Hotel> search(@Param("search") String search,
                       @Param("destinationSlug") String destinationSlug,
                       @Param("minPrice") BigDecimal minPrice,
                       @Param("maxPrice") BigDecimal maxPrice,
                       @Param("starRating") Integer starRating,
                       @Param("minRating") BigDecimal minRating,
                       @Param("amenity") String amenity,
                       Pageable pageable);

    @Query("select coalesce(min(h.pricePerNight), 0) from Hotel h where h.active = true")
    BigDecimal findMinPrice();

    @Query("select coalesce(max(h.pricePerNight), 0) from Hotel h where h.active = true")
    BigDecimal findMaxPrice();
}
