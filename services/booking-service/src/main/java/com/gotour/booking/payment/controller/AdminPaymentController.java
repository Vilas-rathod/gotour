package com.gotour.booking.payment.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.booking.payment.domain.PaymentStatus;
import com.gotour.booking.payment.dto.PaymentDtos.PaymentResponse;
import com.gotour.booking.payment.dto.PaymentDtos.RefundRequestDto;
import com.gotour.booking.payment.dto.PaymentDtos.RefundResponse;
import com.gotour.booking.payment.dto.PaymentDtos.RevenueStatsResponse;
import com.gotour.booking.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin - Payments", description = "Transaction oversight, refunds and revenue analytics")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/payments")
// TODO(security): ADMIN only. Nothing enforces this yet.
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "List transactions with search and status filter")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(
                paymentService.adminList(search, status, page, size, sortBy, direction)));
    }

    @Operation(summary = "Revenue totals and the monthly revenue series")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<RevenueStatsResponse>> stats() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.revenueStats()));
    }

    @Operation(summary = "Refund a payment in full or in part",
            description = "Omit the amount to refund the whole remaining balance")
    @PostMapping("/{paymentReference}/refund")
    public ResponseEntity<ApiResponse<RefundResponse>> refund(@PathVariable String paymentReference,
                                                              @Valid @RequestBody RefundRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success("Refund processed",
                paymentService.refund(paymentReference, request)));
    }
}
