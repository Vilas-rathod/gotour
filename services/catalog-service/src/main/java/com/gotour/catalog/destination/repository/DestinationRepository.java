package com.gotour.catalog.destination.repository;

import com.gotour.catalog.destination.domain.Destination;
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
public interface DestinationRepository extends JpaRepository<Destination, Long> {

    Optional<Destination> findBySlugAndActiveTrue(String slug);

    Optional<Destination> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Destination> findTop8ByActiveTrueAndFeaturedTrueOrderByPopularityScoreDesc();

    List<Destination> findTop8ByActiveTrueOrderByPopularityScoreDesc();

    /**
     * Catalogue search. Every filter is optional; a null or blank value disables
     * that clause so one query serves the whole listing page.
     */
    @Query("""
            select d from Destination d
            where d.active = true
              and (:search is null or :search = ''
                   or lower(d.name) like lower(concat('%', :search, '%'))
                   or lower(d.country) like lower(concat('%', :search, '%'))
                   or lower(d.city) like lower(concat('%', :search, '%'))
                   or lower(d.shortDescription) like lower(concat('%', :search, '%')))
              and (:country is null or :country = '' or lower(d.country) = lower(:country))
              and (:continent is null or :continent = '' or lower(d.continent) = lower(:continent))
              and (:tag is null or :tag = '' or lower(d.tags) like lower(concat('%', :tag, '%')))
              and (:minRating is null or d.rating >= :minRating)
              and (:featured is null or d.featured = :featured)
            """)
    Page<Destination> search(@Param("search") String search,
                             @Param("country") String country,
                             @Param("continent") String continent,
                             @Param("tag") String tag,
                             @Param("minRating") BigDecimal minRating,
                             @Param("featured") Boolean featured,
                             Pageable pageable);

    /** Other active destinations in the same country, excluding the current one. */
    List<Destination> findTop4ByActiveTrueAndCountryAndIdNotOrderByPopularityScoreDesc(String country, Long id);

    @Query("select distinct d.country from Destination d where d.active = true order by d.country")
    List<String> findDistinctCountries();

    @Query("select distinct d.continent from Destination d where d.active = true and d.continent is not null order by d.continent")
    List<String> findDistinctContinents();
}
