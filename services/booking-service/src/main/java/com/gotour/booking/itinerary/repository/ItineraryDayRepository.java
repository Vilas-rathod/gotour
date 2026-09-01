package com.gotour.booking.itinerary.repository;

import com.gotour.booking.itinerary.domain.ItineraryDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, Long> {

    Optional<ItineraryDay> findByIdAndItineraryId(Long id, Long itineraryId);
}
