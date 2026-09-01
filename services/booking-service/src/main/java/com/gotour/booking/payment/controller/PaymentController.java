package com.gotour.booking.payment.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.common.security.SecurityUtils;
import com.gotour.booking.payment.dto.PaymentDtos.InitiatePaymentRequest;
import com.gotour.booking.payment.dto.PaymentDtos.InitiatePaymentResponse;
import com.gotour.booking.payment.dto.PaymentDtos.PaymentResponse;
import com.gotour.booking.payment.dto.PaymentDtos.VerifyPaymentRequest;
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

import java.util.List;

@Tag(name = "Payments", description = "Initiate and verify payments for the signed-in traveller")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Create a gateway order for a booking",
            description = "Choose RAZORPAY (online UPI/BHIM) or CASH (pay at hotel). The charge amount is "
                    + "read from the booking, so it cannot be altered by the client")
    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<InitiatePaymentResponse>> initiate(
            @Valid @RequestBody InitiatePaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Payment initiated",
                paymentService.initiate(SecurityUtils.requirePrincipal(), request)));
    }

    @Operation(summary = "Verify a gateway callback and confirm the booking")
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verify(
            @Valid @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Payment successful",
                paymentService.verify(SecurityUtils.requirePrincipal(), request)));
    }

    @Operation(summary = "List the signed-in traveller's payments")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> myPayments(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.myPayments(SecurityUtils.currentUserId(), page, size)));
    }

    @Operation(summary = "Payments recorded against a booking")
    @GetMapping("/booking/{bookingReference}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> forBooking(
            @PathVariable String bookingReference) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.forBooking(SecurityUtils.currentUserId(), bookingReference)));
    }
}
