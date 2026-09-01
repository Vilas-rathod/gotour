package com.gotour.booking.itinerary.repository;

import com.gotour.booking.itinerary.domain.Itinerary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    Page<Itinerary> findByUserIdOrderByStartDateDesc(Long userId, Pageable pageable);

    Optional<Itinerary> findByIdAndUserId(Long id, Long userId);

    Optional<Itinerary> findByBookingReferenceAndUserId(String bookingReference, Long userId);

    /** Trips that have not finished yet, for the "upcoming trips" rail. */
    List<Itinerary> findTop5ByUserIdAndEndDateGreaterThanEqualOrderByStartDateAsc(Long userId, LocalDate today);
}
