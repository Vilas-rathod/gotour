package com.gotour.catalog.hotel.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.catalog.hotel.dto.HotelDtos.HotelDetail;
import com.gotour.catalog.hotel.dto.HotelDtos.HotelSummary;
import com.gotour.catalog.hotel.dto.HotelDtos.SaveHotelRequest;
import com.gotour.catalog.hotel.service.HotelService;
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

@Tag(name = "Admin - Hotels", description = "Hotel management")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/hotels")
// TODO(security): ADMIN only. Nothing enforces this yet.
@RequiredArgsConstructor
public class AdminHotelController {

    private final HotelService hotelService;

    @Operation(summary = "List hotels including inactive ones")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<HotelSummary>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(ApiResponse.success(
                hotelService.adminList(search, page, size, sortBy, direction)));
    }

    @Operation(summary = "Create a hotel")
    @PostMapping
    public ResponseEntity<ApiResponse<HotelDetail>> create(@Valid @RequestBody SaveHotelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hotel created", hotelService.create(request)));
    }

    @Operation(summary = "Update a hotel")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelDetail>> update(@PathVariable Long id,
                                                           @Valid @RequestBody SaveHotelRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Hotel updated", hotelService.update(id, request)));
    }

    @Operation(summary = "Activate or deactivate a hotel")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> setActive(@PathVariable Long id, @RequestParam boolean active) {
        hotelService.setActive(id, active);
        return ResponseEntity.ok(ApiResponse.message(active ? "Hotel activated" : "Hotel deactivated"));
    }

    @Operation(summary = "Delete a hotel")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        hotelService.delete(id);
        return ResponseEntity.ok(ApiResponse.message("Hotel deleted"));
    }
}
