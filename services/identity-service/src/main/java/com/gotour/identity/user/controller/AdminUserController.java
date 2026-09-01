package com.gotour.identity.user.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.identity.user.dto.UserDtos.AdminUserResponse;
import com.gotour.identity.user.dto.UserDtos.CustomerGrowthResponse;
import com.gotour.identity.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin - Users", description = "Customer directory and growth metrics")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/users")
// TODO(security): ADMIN only. Nothing enforces this yet.
@RequiredArgsConstructor
public class AdminUserController {

    private final UserProfileService userProfileService;

    @Operation(summary = "List customers with search, sorting and pagination")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(
                userProfileService.listUsers(search, page, size, sortBy, direction)));
    }

    @Operation(summary = "Customer growth counters for the dashboard")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CustomerGrowthResponse>> customerGrowth() {
        return ResponseEntity.ok(ApiResponse.success(userProfileService.customerGrowth()));
    }
}
