package com.gotour.catalog.hotel.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.catalog.hotel.dto.HotelDtos.FilterOptions;
import com.gotour.catalog.hotel.dto.HotelDtos.HotelDetail;
import com.gotour.catalog.hotel.dto.HotelDtos.HotelSummary;
import com.gotour.catalog.hotel.dto.HotelDtos.ReserveRoomsRequest;
import com.gotour.catalog.hotel.dto.HotelDtos.RoomResponse;
import com.gotour.catalog.hotel.service.HotelService;
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

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "Hotels", description = "Public hotel catalogue and room availability")
@RestController
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @Operation(summary = "Search hotels with filters, sorting and pagination")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<HotelSummary>>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer starRating,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) String amenity,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "rating") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(hotelService.search(
                search, destination, minPrice, maxPrice, starRating, minRating, amenity,
                page, size, sortBy, direction)));
    }

    @Operation(summary = "Featured hotels for the homepage")
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<HotelSummary>>> featured() {
        return ResponseEntity.ok(ApiResponse.success(hotelService.featured()));
    }

    @Operation(summary = "Price range and amenity list for the filter sidebar")
    @GetMapping("/filters")
    public ResponseEntity<ApiResponse<FilterOptions>> filters() {
        return ResponseEntity.ok(ApiResponse.success(hotelService.filterOptions()));
    }

    @Operation(summary = "Hotel detail with gallery and room types")
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<HotelDetail>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(hotelService.getBySlug(slug)));
    }

    @Operation(summary = "Room types with live availability")
    @GetMapping("/{slug}/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> rooms(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(hotelService.rooms(slug)));
    }

    @Operation(summary = "Hold rooms for a confirmed booking",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{slug}/reserve")
    public ResponseEntity<ApiResponse<Void>> reserve(@PathVariable String slug,
                                                     @Valid @RequestBody ReserveRoomsRequest request) {
        hotelService.reserveRooms(slug, request);
        return ResponseEntity.ok(ApiResponse.message("Rooms reserved"));
    }

    @Operation(summary = "Release rooms held by a cancelled booking",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{slug}/release")
    public ResponseEntity<ApiResponse<Void>> release(@PathVariable String slug,
                                                     @Valid @RequestBody ReserveRoomsRequest request) {
        hotelService.releaseRooms(slug, request);
        return ResponseEntity.ok(ApiResponse.message("Rooms released"));
    }
}
