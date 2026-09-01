package com.gotour.catalog.pkg.repository;

import com.gotour.catalog.pkg.domain.PackageAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PackageAvailabilityRepository extends JpaRepository<PackageAvailability, Long> {

    List<PackageAvailability> findByTourPackageIdAndDepartureDateGreaterThanEqualOrderByDepartureDateAsc(
            Long packageId, LocalDate from);

    Optional<PackageAvailability> findByTourPackageIdAndDepartureDate(Long packageId, LocalDate departureDate);

    /**
     * Reserves seats only if enough remain, in a single atomic statement.
     *
     * <p>Doing the check inside the UPDATE means two concurrent bookings cannot
     * both pass a read-then-write check and oversell the departure.
     *
     * @return 1 when the seats were reserved, 0 when they were not available
     */
    @Modifying
    @Query("""
            update PackageAvailability a
               set a.seatsBooked = a.seatsBooked + :seats
             where a.id = :id
               and a.seatsTotal - a.seatsBooked >= :seats
            """)
    int reserveSeats(@Param("id") Long id, @Param("seats") int seats);

    @Modifying
    @Query("""
            update PackageAvailability a
               set a.seatsBooked = case when a.seatsBooked >= :seats then a.seatsBooked - :seats else 0 end
             where a.id = :id
            """)
    int releaseSeats(@Param("id") Long id, @Param("seats") int seats);
}
