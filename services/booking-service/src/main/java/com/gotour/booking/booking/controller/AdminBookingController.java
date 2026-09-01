package com.gotour.booking.booking.controller;

import com.gotour.booking.booking.domain.BookingStatus;
import com.gotour.booking.booking.domain.BookingType;
import com.gotour.booking.booking.dto.BookingDtos.BookingDetail;
import com.gotour.booking.booking.dto.BookingDtos.BookingStatsResponse;
import com.gotour.booking.booking.dto.BookingDtos.BookingSummary;
import com.gotour.booking.booking.dto.BookingDtos.CancelBookingRequest;
import com.gotour.booking.booking.service.BookingService;
import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin - Bookings", description = "Booking oversight, status changes and dashboard KPIs")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/bookings")
// TODO(security): ADMIN only. Nothing enforces this yet.
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    @Operation(summary = "List all bookings with search and filters")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BookingSummary>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) BookingType type,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(
                bookingService.adminList(search, status, type, page, size, sortBy, direction)));
    }

    @Operation(summary = "Dashboard KPIs, monthly trend and best sellers")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<BookingStatsResponse>> stats() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.stats()));
    }

    @Operation(summary = "Get any booking by reference")
    @GetMapping("/{reference}")
    public ResponseEntity<ApiResponse<BookingDetail>> get(@PathVariable String reference) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.adminGet(reference)));
    }

    @Operation(summary = "Move a booking to CONFIRMED or COMPLETED")
    @PatchMapping("/{reference}/status")
    public ResponseEntity<ApiResponse<BookingDetail>> updateStatus(@PathVariable String reference,
                                                                   @RequestParam BookingStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Booking status updated",
                bookingService.updateStatus(reference, status)));
    }

    @Operation(summary = "Cancel a booking on the customer's behalf")
    @PostMapping("/{reference}/cancel")
    public ResponseEntity<ApiResponse<BookingDetail>> cancel(@PathVariable String reference,
                                                             @Valid @RequestBody CancelBookingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled",
                bookingService.cancelAsAdmin(reference, request)));
    }
}
