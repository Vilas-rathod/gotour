package com.gotour.booking.booking.repository;

import com.gotour.booking.booking.domain.Booking;
import com.gotour.booking.booking.domain.BookingStatus;
import com.gotour.booking.booking.domain.BookingType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    Optional<Booking> findByBookingReferenceAndUserId(String bookingReference, Long userId);

    boolean existsByBookingReference(String bookingReference);

    @Query("""
            select b from Booking b
            where b.userId = :userId
              and (:status is null or b.status = :status)
              and (:bookingType is null or b.bookingType = :bookingType)
            """)
    Page<Booking> findForUser(@Param("userId") Long userId,
                              @Param("status") BookingStatus status,
                              @Param("bookingType") BookingType bookingType,
                              Pageable pageable);

    @Query("""
            select b from Booking b
            where (:status is null or b.status = :status)
              and (:bookingType is null or b.bookingType = :bookingType)
              and (:search is null or :search = ''
                   or lower(b.bookingReference) like lower(concat('%', :search, '%'))
                   or lower(b.userEmail) like lower(concat('%', :search, '%'))
                   or lower(b.itemTitle) like lower(concat('%', :search, '%')))
            """)
    Page<Booking> findForAdmin(@Param("search") String search,
                               @Param("status") BookingStatus status,
                               @Param("bookingType") BookingType bookingType,
                               Pageable pageable);

    long countByStatus(BookingStatus status);

    @Query("select coalesce(sum(b.totalAmount), 0) from Booking b where b.status in :statuses")
    BigDecimal sumRevenueByStatuses(@Param("statuses") List<BookingStatus> statuses);

    @Query("select count(b) from Booking b where b.createdAt >= :since")
    long countCreatedSince(@Param("since") Instant since);

    /** Monthly booking count and revenue for the admin dashboard chart. */
    @Query("""
            select function('DATE_FORMAT', b.createdAt, '%Y-%m') as period,
                   count(b) as bookings,
                   coalesce(sum(b.totalAmount), 0) as revenue
            from Booking b
            where b.createdAt >= :since
            group by function('DATE_FORMAT', b.createdAt, '%Y-%m')
            order by period
            """)
    List<Object[]> findMonthlyTrend(@Param("since") Instant since);

    @Query("""
            select b.itemTitle as title, count(b) as bookings, coalesce(sum(b.totalAmount), 0) as revenue
            from Booking b
            where b.status <> com.gotour.booking.booking.domain.BookingStatus.CANCELLED
            group by b.itemTitle
            order by count(b) desc
            """)
    List<Object[]> findTopSellingItems(Pageable pageable);
}
