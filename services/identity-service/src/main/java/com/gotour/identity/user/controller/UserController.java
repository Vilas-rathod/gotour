package com.gotour.identity.user.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.security.SecurityUtils;
import com.gotour.identity.user.dto.UserDtos.AddressRequest;
import com.gotour.identity.user.dto.UserDtos.AddressResponse;
import com.gotour.identity.user.dto.UserDtos.ProfileResponse;
import com.gotour.identity.user.dto.UserDtos.UpdateProfileRequest;
import com.gotour.identity.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "User Profile", description = "Profile and saved addresses for the signed-in traveller")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserProfileService userProfileService;

    @Operation(summary = "Get the signed-in traveller's profile")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success(
                userProfileService.getOrCreateProfile(SecurityUtils.requirePrincipal())));
    }

    @Operation(summary = "Update the signed-in traveller's profile")
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                userProfileService.updateProfile(SecurityUtils.requirePrincipal(), request)));
    }

    @Operation(summary = "List saved addresses")
    @GetMapping("/me/addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> listAddresses() {
        return ResponseEntity.ok(ApiResponse.success(
                userProfileService.listAddresses(SecurityUtils.currentUserId())));
    }

    @Operation(summary = "Add a saved address")
    @PostMapping("/me/addresses")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(@Valid @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Address added",
                userProfileService.addAddress(SecurityUtils.currentUserId(), request)));
    }

    @Operation(summary = "Update a saved address")
    @PutMapping("/me/addresses/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Address updated",
                userProfileService.updateAddress(SecurityUtils.currentUserId(), addressId, request)));
    }

    @Operation(summary = "Delete a saved address")
    @DeleteMapping("/me/addresses/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long addressId) {
        userProfileService.deleteAddress(SecurityUtils.currentUserId(), addressId);
        return ResponseEntity.ok(ApiResponse.message("Address deleted"));
    }
}
