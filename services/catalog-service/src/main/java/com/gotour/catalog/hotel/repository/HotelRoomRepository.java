package com.gotour.catalog.hotel.repository;

import com.gotour.catalog.hotel.domain.HotelRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRoomRepository extends JpaRepository<HotelRoom, Long> {

    List<HotelRoom> findByHotelIdOrderByPricePerNightAsc(Long hotelId);

    Optional<HotelRoom> findByIdAndHotelId(Long id, Long hotelId);

    /**
     * Holds rooms only when enough are free, checked and applied atomically so
     * two simultaneous bookings cannot overbook the same room type.
     *
     * @return 1 when the rooms were held, 0 when they were not available
     */
    @Modifying
    @Query("""
            update HotelRoom r
               set r.roomsBooked = r.roomsBooked + :rooms
             where r.id = :id
               and r.totalRooms - r.roomsBooked >= :rooms
            """)
    int reserveRooms(@Param("id") Long id, @Param("rooms") int rooms);

    @Modifying
    @Query("""
            update HotelRoom r
               set r.roomsBooked = case when r.roomsBooked >= :rooms then r.roomsBooked - :rooms else 0 end
             where r.id = :id
            """)
    int releaseRooms(@Param("id") Long id, @Param("rooms") int rooms);
}
