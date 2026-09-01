package com.gotour.booking.itinerary.repository;

import com.gotour.booking.itinerary.domain.ItineraryActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItineraryActivityRepository extends JpaRepository<ItineraryActivity, Long> {

    Optional<ItineraryActivity> findByIdAndDayId(Long id, Long dayId);
}
