package com.gotour.catalog.destination.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.catalog.destination.dto.DestinationDtos.DestinationDetail;
import com.gotour.catalog.destination.dto.DestinationDtos.DestinationSummary;
import com.gotour.catalog.destination.dto.DestinationDtos.SaveDestinationRequest;
import com.gotour.catalog.destination.service.DestinationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin - Destinations", description = "Destination management")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/destinations")
// TODO(security): ADMIN only. Nothing enforces this yet.
@RequiredArgsConstructor
public class AdminDestinationController {

    private final DestinationService destinationService;

    @Operation(summary = "List destinations including inactive ones")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DestinationSummary>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(
                destinationService.adminList(search, page, size, sortBy, direction)));
    }

    @Operation(summary = "Create a destination")
    @PostMapping
    public ResponseEntity<ApiResponse<DestinationDetail>> create(
            @Valid @RequestBody SaveDestinationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Destination created", destinationService.create(request)));
    }

    @Operation(summary = "Update a destination")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DestinationDetail>> update(
            @PathVariable Long id,
            @Valid @RequestBody SaveDestinationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Destination updated",
                destinationService.update(id, request)));
    }

    @Operation(summary = "Activate or deactivate a destination")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> setActive(@PathVariable Long id,
                                                       @RequestParam boolean active) {
        destinationService.setActive(id, active);
        return ResponseEntity.ok(ApiResponse.message(
                active ? "Destination activated" : "Destination deactivated"));
    }

    @Operation(summary = "Delete a destination")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        destinationService.delete(id);
        return ResponseEntity.ok(ApiResponse.message("Destination deleted"));
    }
}
