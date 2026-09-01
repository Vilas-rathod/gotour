package com.gotour.booking.booking.service;

import com.gotour.booking.booking.client.CatalogueDtos.HotelView;
import com.gotour.booking.booking.client.CatalogueDtos.PackageView;
import com.gotour.booking.booking.client.CatalogueDtos.ReserveRoomsRequest;
import com.gotour.booking.booking.client.CatalogueDtos.ReserveSeatsRequest;
import com.gotour.booking.booking.client.CatalogueDtos.RoomView;
import com.gotour.booking.booking.client.HotelClient;
import com.gotour.booking.booking.client.PackageClient;
import com.gotour.booking.booking.domain.Booking;
import com.gotour.booking.booking.domain.BookingItem;
import com.gotour.booking.booking.domain.BookingStatus;
import com.gotour.booking.booking.domain.BookingTraveller;
import com.gotour.booking.booking.domain.BookingType;
import com.gotour.booking.booking.domain.PaymentStatus;
import com.gotour.booking.booking.dto.BookingDtos.BookingDetail;
import com.gotour.booking.booking.dto.BookingDtos.BookingItemResponse;
import com.gotour.booking.booking.dto.BookingDtos.BookingStatsResponse;
import com.gotour.booking.booking.dto.BookingDtos.BookingSummary;
import com.gotour.booking.booking.dto.BookingDtos.CancelBookingRequest;
import com.gotour.booking.booking.dto.BookingDtos.CreateBookingRequest;
import com.gotour.booking.booking.dto.BookingDtos.InvoiceResponse;
import com.gotour.booking.booking.dto.BookingDtos.MarkPaidRequest;
import com.gotour.booking.booking.dto.BookingDtos.TopItem;
import com.gotour.booking.booking.dto.BookingDtos.TravellerResponse;
import com.gotour.booking.booking.dto.BookingDtos.TrendPoint;
import com.gotour.booking.booking.repository.BookingRepository;
import com.gotour.common.api.PageRequestFactory;
import com.gotour.common.api.PageResponse;
import com.gotour.common.exception.BadRequestException;
import com.gotour.common.exception.ForbiddenException;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.common.security.GoTourPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Set<String> SORTABLE = Set.of("createdAt", "startDate", "totalAmount", "status");

    private final BookingRepository bookingRepository;
    private final BookingReferenceGenerator referenceGenerator;
    private final PackageClient packageClient;
    private final HotelClient hotelClient;

    @Transactional
    public BookingDetail create(GoTourPrincipal principal, CreateBookingRequest request) {
        validateDates(request);

        Booking booking = request.bookingType() == BookingType.PACKAGE
                ? buildPackageBooking(principal, request)
                : buildHotelBooking(principal, request);

        request.travellers().forEach(traveller -> booking.getTravellers().add(BookingTraveller.builder()
                .booking(booking)
                .fullName(traveller.fullName().trim())
                .age(traveller.age())
                .gender(traveller.gender())
                .passportNumber(traveller.passportNumber())
                .nationality(traveller.nationality())
                .leadTraveller(traveller.leadTraveller())
                .build()));

        // Guarantee exactly one lead traveller even if the client sent none.
        if (booking.getTravellers().stream().noneMatch(BookingTraveller::isLeadTraveller)) {
            booking.getTravellers().getFirst().setLeadTraveller(true);
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Created booking {} for user {}", saved.getBookingReference(), principal.userId());
        return toDetail(saved);
    }

    private void validateDates(CreateBookingRequest request) {
        if (!request.endDate().isAfter(request.startDate())) {
            throw new BadRequestException("End date must be after the start date");
        }
        if (request.travellers().size() != request.travellerCount()) {
            throw new BadRequestException(
                    "Traveller details do not match the traveller count (%d expected, %d provided)"
                            .formatted(request.travellerCount(), request.travellers().size()));
        }
    }

    private Booking buildPackageBooking(GoTourPrincipal principal, CreateBookingRequest request) {
        PackageView view = unwrap(packageClient.getPackage(request.itemSlug()), "Package", request.itemSlug());

        BookingPricing.Quote quote = BookingPricing.forPackage(
                view.title(), view.effectivePrice(), request.travellerCount());

        // Seats are held before the booking row is written; if this throws, the
        // transaction rolls back and nothing is reserved.
        packageClient.reserveSeats(request.itemSlug(),
                new ReserveSeatsRequest(request.startDate(), request.travellerCount()));

        Booking booking = baseBooking(principal, request, quote);
        booking.setBookingType(BookingType.PACKAGE);
        booking.setItemTitle(view.title());
        booking.setItemImageUrl(view.heroImageUrl());
        booking.setDestinationName(view.destinationName());
        booking.setCurrency(view.currency() == null ? "INR" : view.currency());
        attachItems(booking, quote);
        return booking;
    }

    private Booking buildHotelBooking(GoTourPrincipal principal, CreateBookingRequest request) {
        if (request.roomId() == null) {
            throw new BadRequestException("A room must be selected for hotel bookings");
        }

        HotelView view = unwrap(hotelClient.getHotel(request.itemSlug()), "Hotel", request.itemSlug());

        RoomView room = view.rooms().stream()
                .filter(candidate -> candidate.id().equals(request.roomId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Room", request.roomId()));

        int rooms = request.roomCount() == null ? 1 : request.roomCount();
        long nights = ChronoUnit.DAYS.between(request.startDate(), request.endDate());

        int capacity = room.capacity() * rooms;
        if (request.travellerCount() > capacity) {
            throw new BadRequestException(
                    "%d room(s) of type %s accommodate %d guest(s); you selected %d"
                            .formatted(rooms, room.roomType(), capacity, request.travellerCount()));
        }

        BookingPricing.Quote quote = BookingPricing.forHotel(
                room.roomType(), room.pricePerNight(), nights, rooms);

        hotelClient.reserveRooms(request.itemSlug(), new ReserveRoomsRequest(room.id(), rooms));

        Booking booking = baseBooking(principal, request, quote);
        booking.setBookingType(BookingType.HOTEL);
        booking.setItemTitle(view.name());
        booking.setItemImageUrl(view.heroImageUrl());
        booking.setDestinationName(view.destinationName());
        booking.setRoomId(room.id());
        booking.setRoomType(room.roomType());
        booking.setRoomCount(rooms);
        booking.setCurrency(view.currency() == null ? "INR" : view.currency());
        attachItems(booking, quote);
        return booking;
    }

    private Booking baseBooking(GoTourPrincipal principal, CreateBookingRequest request,
                                BookingPricing.Quote quote) {
        return Booking.builder()
                .bookingReference(referenceGenerator.generate())
                .userId(principal.userId())
                .userEmail(principal.email())
                .itemSlug(request.itemSlug())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .travellerCount(request.travellerCount())
                .totalAmount(quote.total())
                .status(BookingStatus.PENDING_PAYMENT)
                .paymentStatus(PaymentStatus.UNPAID)
                .contactEmail(request.contactEmail().trim())
                .contactPhone(request.contactPhone())
                .specialRequests(request.specialRequests())
                .build();
    }

    private void attachItems(Booking booking, BookingPricing.Quote quote) {
        quote.lines().forEach(line -> booking.getItems().add(BookingItem.builder()
                .booking(booking)
                .label(line.label())
                .unitPrice(line.unitPrice())
                .quantity(line.quantity())
                .amount(line.amount())
                .build()));
    }

    private <T> T unwrap(com.gotour.booking.booking.client.CatalogueDtos.Envelope<T> envelope,
                         String resource, Object identifier) {
        if (envelope == null || envelope.data() == null) {
            throw new ResourceNotFoundException(resource, identifier);
        }
        return envelope.data();
    }

    // ------------------------------------------------------------- retrieval

    @Transactional(readOnly = true)
    public PageResponse<BookingSummary> myBookings(Long userId, BookingStatus status, BookingType type,
                                                    Integer page, Integer size, String sortBy, String direction) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, SORTABLE, "createdAt");
        return PageResponse.from(bookingRepository.findForUser(userId, status, type, pageable), this::toSummary);
    }

    @Transactional(readOnly = true)
    public BookingDetail getForUser(Long userId, String reference) {
        return toDetail(bookingRepository.findByBookingReferenceAndUserId(reference, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", reference)));
    }

    @Transactional(readOnly = true)
    public InvoiceResponse invoice(Long userId, String reference) {
        Booking booking = bookingRepository.findByBookingReferenceAndUserId(reference, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", reference));

        if (booking.getPaymentStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("An invoice is only available once the booking has been paid");
        }

        BigDecimal taxes = booking.getItems().stream()
                .filter(item -> item.getLabel().startsWith("Taxes"))
                .map(BookingItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String leadTraveller = booking.getTravellers().stream()
                .filter(BookingTraveller::isLeadTraveller)
                .map(BookingTraveller::getFullName)
                .findFirst()
                .orElse(booking.getUserEmail());

        return new InvoiceResponse(
                "INV-" + booking.getBookingReference().replace("GT-", ""),
                booking.getBookingReference(),
                booking.getCreatedAt(),
                leadTraveller,
                booking.getContactEmail(),
                booking.getItemTitle(),
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getTravellerCount(),
                booking.getItems().stream().map(this::toItem).toList(),
                booking.getTotalAmount().subtract(taxes),
                taxes,
                booking.getTotalAmount(),
                booking.getCurrency(),
                booking.getPaymentStatus());
    }

    // ------------------------------------------------------------ transitions

    @Transactional
    public BookingDetail cancel(Long userId, String reference, CancelBookingRequest request) {
        Booking booking = bookingRepository.findByBookingReferenceAndUserId(reference, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", reference));
        return applyCancellation(booking, request.reason(), "customer");
    }

    @Transactional
    public BookingDetail cancelAsAdmin(String reference, CancelBookingRequest request) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", reference));
        return applyCancellation(booking, request.reason(), "admin");
    }

    private BookingDetail applyCancellation(Booking booking, String reason, String actor) {
        if (!booking.getStatus().isCancellable()) {
            throw new BadRequestException(
                    "A booking with status %s cannot be cancelled".formatted(booking.getStatus()));
        }

        long daysUntilTravel = ChronoUnit.DAYS.between(LocalDate.now(), booking.getStartDate());
        BigDecimal refund = booking.getPaymentStatus() == PaymentStatus.PAID
                ? BookingPricing.refundFor(booking.getTotalAmount(), daysUntilTravel)
                : BigDecimal.ZERO;

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(Instant.now());
        booking.setCancellationReason(reason == null || reason.isBlank()
                ? "Cancelled by " + actor : reason.trim());
        booking.setRefundAmount(refund);

        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        releaseInventory(booking);

        log.info("Cancelled booking {} by {} with refund {}",
                booking.getBookingReference(), actor, refund);
        return toDetail(bookingRepository.save(booking));
    }

    /** Returns held seats or rooms to the catalogue; failures must not block cancellation. */
    private void releaseInventory(Booking booking) {
        try {
            if (booking.getBookingType() == BookingType.PACKAGE) {
                packageClient.releaseSeats(booking.getItemSlug(),
                        new ReserveSeatsRequest(booking.getStartDate(), booking.getTravellerCount()));
            } else if (booking.getRoomId() != null) {
                hotelClient.releaseRooms(booking.getItemSlug(),
                        new ReserveRoomsRequest(booking.getRoomId(),
                                booking.getRoomCount() == null ? 1 : booking.getRoomCount()));
            }
        } catch (RuntimeException ex) {
            log.error("Could not release inventory for booking {}; reconcile manually",
                    booking.getBookingReference(), ex);
        }
    }

    /** Called by payment-service once a payment succeeds. */
    @Transactional
    public BookingDetail markPaid(String reference, MarkPaidRequest request) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", reference));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("A cancelled booking cannot be marked as paid");
        }

        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setPaymentReference(request.paymentReference());
        booking.setStatus(BookingStatus.CONFIRMED);
        return toDetail(bookingRepository.save(booking));
    }

    /**
     * Confirms a hotel booking that will be settled in cash on arrival. The
     * booking becomes {@code CONFIRMED} (the room is held) while its payment
     * status stays {@code UNPAID} — the balance is collected at the property.
     */
    @Transactional
    public BookingDetail confirmPayAtHotel(String reference, String paymentReference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", reference));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("A cancelled booking cannot be reserved for pay-at-hotel");
        }
        if (booking.getBookingType() != BookingType.HOTEL) {
            throw new BadRequestException("Pay-at-hotel (cash on arrival) is only available for hotel bookings");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This booking has already been paid");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPaymentReference(paymentReference);
        return toDetail(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDetail updateStatus(String reference, BookingStatus status) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", reference));

        if (status == BookingStatus.CANCELLED) {
            throw new BadRequestException("Use the cancel endpoint so inventory and refunds are handled");
        }
        booking.setStatus(status);
        return toDetail(bookingRepository.save(booking));
    }

    // ---------------------------------------------------------------- admin

    @Transactional(readOnly = true)
    public PageResponse<BookingSummary> adminList(String search, BookingStatus status, BookingType type,
                                                   Integer page, Integer size, String sortBy, String direction) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, SORTABLE, "createdAt");
        return PageResponse.from(
                bookingRepository.findForAdmin(search == null ? "" : search.trim(), status, type, pageable),
                this::toSummary);
    }

    @Transactional(readOnly = true)
    public BookingDetail adminGet(String reference) {
        return toDetail(bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", reference)));
    }

    @Transactional(readOnly = true)
    public BookingStatsResponse stats() {
        List<TrendPoint> trend = bookingRepository
                .findMonthlyTrend(Instant.now().minus(365, ChronoUnit.DAYS))
                .stream()
                .map(row -> new TrendPoint(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        (BigDecimal) row[2]))
                .toList();

        List<TopItem> topSelling = bookingRepository
                .findTopSellingItems(PageRequest.of(0, 5))
                .stream()
                .map(row -> new TopItem(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        (BigDecimal) row[2]))
                .toList();

        return new BookingStatsResponse(
                bookingRepository.count(),
                bookingRepository.countByStatus(BookingStatus.PENDING_PAYMENT),
                bookingRepository.countByStatus(BookingStatus.CONFIRMED),
                bookingRepository.countByStatus(BookingStatus.COMPLETED),
                bookingRepository.countByStatus(BookingStatus.CANCELLED),
                bookingRepository.countCreatedSince(Instant.now().minus(30, ChronoUnit.DAYS)),
                bookingRepository.sumRevenueByStatuses(
                        List.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED)),
                trend,
                topSelling);
    }

    /** Guards service-to-service callbacks that address a booking by reference. */
    public void assertOwnership(Booking booking, Long userId) {
        if (!booking.getUserId().equals(userId)) {
            throw new ForbiddenException("This booking belongs to another account");
        }
    }

    // --------------------------------------------------------------- mapping

    private BookingSummary toSummary(Booking b) {
        return new BookingSummary(
                b.getId(), b.getBookingReference(), b.getBookingType(), b.getItemSlug(), b.getItemTitle(),
                b.getItemImageUrl(), b.getDestinationName(), b.getStartDate(), b.getEndDate(),
                b.getTravellerCount(), b.getTotalAmount(), b.getCurrency(), b.getStatus(),
                b.getPaymentStatus(), b.getCreatedAt());
    }

    private BookingDetail toDetail(Booking b) {
        return new BookingDetail(
                b.getId(), b.getBookingReference(), b.getUserId(), b.getUserEmail(), b.getBookingType(),
                b.getItemSlug(), b.getItemTitle(), b.getItemImageUrl(), b.getDestinationName(),
                b.getRoomType(), b.getStartDate(), b.getEndDate(), b.nights(), b.getTravellerCount(),
                b.getRoomCount(), b.getTotalAmount(), b.getCurrency(), b.getStatus(), b.getPaymentStatus(),
                b.getPaymentReference(), b.getContactEmail(), b.getContactPhone(), b.getSpecialRequests(),
                b.getCancelledAt(), b.getCancellationReason(), b.getRefundAmount(), b.getCreatedAt(),
                b.getTravellers().stream()
                        .map(t -> new TravellerResponse(t.getId(), t.getFullName(), t.getAge(), t.getGender(),
                                t.getPassportNumber(), t.getNationality(), t.isLeadTraveller()))
                        .toList(),
                b.getItems().stream().map(this::toItem).toList());
    }

    private BookingItemResponse toItem(BookingItem item) {
        return new BookingItemResponse(item.getLabel(), item.getUnitPrice(),
                item.getQuantity(), item.getAmount());
    }
}
