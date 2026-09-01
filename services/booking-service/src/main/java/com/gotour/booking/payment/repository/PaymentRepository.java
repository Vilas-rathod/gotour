package com.gotour.booking.payment.repository;

import com.gotour.booking.payment.domain.Payment;
import com.gotour.booking.payment.domain.PaymentStatus;
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
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentReference(String paymentReference);

    Optional<Payment> findByProviderOrderId(String providerOrderId);

    List<Payment> findByBookingReferenceOrderByCreatedAtDesc(String bookingReference);

    Page<Payment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("""
            select p from Payment p
            where (:status is null or p.status = :status)
              and (:search is null or :search = ''
                   or lower(p.paymentReference) like lower(concat('%', :search, '%'))
                   or lower(p.bookingReference) like lower(concat('%', :search, '%'))
                   or lower(p.userEmail) like lower(concat('%', :search, '%')))
            """)
    Page<Payment> findForAdmin(@Param("search") String search,
                               @Param("status") PaymentStatus status,
                               Pageable pageable);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.status in :statuses")
    BigDecimal sumAmountByStatuses(@Param("statuses") List<PaymentStatus> statuses);

    @Query("select coalesce(sum(p.refundedAmount), 0) from Payment p")
    BigDecimal sumRefunded();

    long countByStatus(PaymentStatus status);

    @Query("""
            select function('DATE_FORMAT', p.paidAt, '%Y-%m') as period,
                   coalesce(sum(p.amount), 0) as revenue,
                   count(p) as transactions
            from Payment p
            where p.status in (com.gotour.booking.payment.domain.PaymentStatus.SUCCESS,
                               com.gotour.booking.payment.domain.PaymentStatus.PARTIALLY_REFUNDED)
              and p.paidAt >= :since
            group by function('DATE_FORMAT', p.paidAt, '%Y-%m')
            order by period
            """)
    List<Object[]> findMonthlyRevenue(@Param("since") Instant since);
}
