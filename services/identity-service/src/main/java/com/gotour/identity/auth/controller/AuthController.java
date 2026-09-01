package com.gotour.identity.auth.controller;

import com.gotour.identity.auth.dto.AuthDtos.AuthResponse;
import com.gotour.identity.auth.dto.AuthDtos.ChangePasswordRequest;
import com.gotour.identity.auth.dto.AuthDtos.ForgotPasswordRequest;
import com.gotour.identity.auth.dto.AuthDtos.LoginRequest;
import com.gotour.identity.auth.dto.AuthDtos.RefreshTokenRequest;
import com.gotour.identity.auth.dto.AuthDtos.RegisterRequest;
import com.gotour.identity.auth.dto.AuthDtos.ResetPasswordRequest;
import com.gotour.identity.auth.dto.AuthDtos.UserSummary;
import com.gotour.identity.auth.service.AuthService;
import com.gotour.common.api.ApiResponse;
import com.gotour.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "Authentication", description = "Registration, login, token lifecycle and password management")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Local development aid. When true the reset token is returned in the
     * response instead of being emailed. Never enable outside development.
     */
    @Value("${gotour.auth.expose-reset-token:false}")
    private boolean exposeResetToken;

    @Operation(summary = "Register a new customer account")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    @Operation(summary = "Authenticate and receive an access/refresh token pair")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    @Operation(summary = "Exchange a refresh token for a new token pair")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", authService.refresh(request)));
    }

    @Operation(summary = "Revoke the supplied refresh token")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.message("Logged out successfully"));
    }

    @Operation(summary = "Revoke every active session for the current user",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<Void>> logoutAll() {
        authService.logoutAllSessions(SecurityUtils.currentUserId());
        return ResponseEntity.ok(ApiResponse.message("All sessions revoked"));
    }

    @Operation(summary = "Request a password reset link",
            description = "Always reports success so the endpoint cannot reveal which emails are registered")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        var token = authService.forgotPassword(request);

        Map<String, String> payload = new LinkedHashMap<>();
        if (exposeResetToken) {
            token.ifPresent(value -> payload.put("resetToken", value));
        }

        return ResponseEntity.ok(ApiResponse.success(
                "If an account exists for that email, a reset link has been sent",
                payload));
    }

    @Operation(summary = "Complete a password reset using the emailed token")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.message("Password reset successfully. Please sign in again."));
    }

    @Operation(summary = "Change the signed-in user's password",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(SecurityUtils.currentUserId(), request);
        return ResponseEntity.ok(ApiResponse.message("Password changed successfully. Please sign in again."));
    }

    @Operation(summary = "Return the signed-in user's profile",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummary>> me() {
        return ResponseEntity.ok(ApiResponse.success(authService.currentUser(SecurityUtils.currentUserId())));
    }
}
