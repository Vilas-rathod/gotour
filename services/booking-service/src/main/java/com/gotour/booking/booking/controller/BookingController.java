package com.gotour.booking.booking.controller;

import com.gotour.booking.booking.domain.BookingStatus;
import com.gotour.booking.booking.domain.BookingType;
import com.gotour.booking.booking.dto.BookingDtos.BookingDetail;
import com.gotour.booking.booking.dto.BookingDtos.BookingSummary;
import com.gotour.booking.booking.dto.BookingDtos.CancelBookingRequest;
import com.gotour.booking.booking.dto.BookingDtos.CreateBookingRequest;
import com.gotour.booking.booking.dto.BookingDtos.InvoiceResponse;
import com.gotour.booking.booking.dto.BookingDtos.MarkPaidRequest;
import com.gotour.booking.booking.service.BookingService;
import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Bookings", description = "Create and manage the signed-in traveller's bookings")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @Operation(summary = "Create a booking",
            description = "The total is calculated server-side from the catalogue price; clients never send an amount")
    @PostMapping
    public ResponseEntity<ApiResponse<BookingDetail>> create(@Valid @RequestBody CreateBookingRequest request) {
        BookingDetail detail = bookingService.create(SecurityUtils.requirePrincipal(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created. Complete payment to confirm it.", detail));
    }

    @Operation(summary = "List the signed-in traveller's bookings")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BookingSummary>>> myBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) BookingType type,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(bookingService.myBookings(
                SecurityUtils.currentUserId(), status, type, page, size, sortBy, direction)));
    }

    @Operation(summary = "Get one of the signed-in traveller's bookings")
    @GetMapping("/{reference}")
    public ResponseEntity<ApiResponse<BookingDetail>> get(@PathVariable String reference) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getForUser(SecurityUtils.currentUserId(), reference)));
    }

    @Operation(summary = "Download invoice data for a paid booking")
    @GetMapping("/{reference}/invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>> invoice(@PathVariable String reference) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.invoice(SecurityUtils.currentUserId(), reference)));
    }

    @Operation(summary = "Cancel a booking",
            description = "Refund follows the cancellation policy: full over 15 days out, 50% from 7 to 15 days, none inside 7 days")
    @PostMapping("/{reference}/cancel")
    public ResponseEntity<ApiResponse<BookingDetail>> cancel(@PathVariable String reference,
                                                             @Valid @RequestBody CancelBookingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled",
                bookingService.cancel(SecurityUtils.currentUserId(), reference, request)));
    }

    @Operation(summary = "Confirm a booking after successful payment",
            description = "Called by payment-service once the gateway confirms the transaction")
    @PostMapping("/{reference}/mark-paid")
    public ResponseEntity<ApiResponse<BookingDetail>> markPaid(@PathVariable String reference,
                                                               @Valid @RequestBody MarkPaidRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Booking confirmed",
                bookingService.markPaid(reference, request)));
    }
}
