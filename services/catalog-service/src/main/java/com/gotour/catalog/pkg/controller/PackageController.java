package com.gotour.catalog.pkg.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.catalog.pkg.domain.PackageType;
import com.gotour.catalog.pkg.domain.TravelStyle;
import com.gotour.catalog.pkg.dto.PackageDtos.AvailabilityResponse;
import com.gotour.catalog.pkg.dto.PackageDtos.FilterOptions;
import com.gotour.catalog.pkg.dto.PackageDtos.PackageDetail;
import com.gotour.catalog.pkg.dto.PackageDtos.PackageSummary;
import com.gotour.catalog.pkg.dto.PackageDtos.ReserveSeatsRequest;
import com.gotour.catalog.pkg.service.PackageService;
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

@Tag(name = "Tour Packages", description = "Public package catalogue, search and availability")
@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;

    @Operation(summary = "Search packages with filters, sorting and pagination",
            description = "sortBy accepts popularity, price, rating, newest, duration or title")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PackageSummary>>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) PackageType packageType,
            @RequestParam(required = false) TravelStyle travelStyle,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "popularity") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(packageService.search(
                search, destination, packageType, travelStyle, minPrice, maxPrice,
                minDuration, maxDuration, minRating, page, size, sortBy, direction)));
    }

    @Operation(summary = "Featured packages for the homepage")
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<PackageSummary>>> featured() {
        return ResponseEntity.ok(ApiResponse.success(packageService.featured()));
    }

    @Operation(summary = "Trending packages")
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<PackageSummary>>> trending() {
        return ResponseEntity.ok(ApiResponse.success(packageService.trending()));
    }

    @Operation(summary = "Price range and enum values for the filter sidebar")
    @GetMapping("/filters")
    public ResponseEntity<ApiResponse<FilterOptions>> filters() {
        return ResponseEntity.ok(ApiResponse.success(packageService.filterOptions()));
    }

    @Operation(summary = "Full package detail with itinerary, inclusions and departures")
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PackageDetail>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(packageService.getBySlug(slug)));
    }

    @Operation(summary = "Upcoming departure dates and remaining seats")
    @GetMapping("/{slug}/availability")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> availability(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(packageService.availability(slug)));
    }

    @Operation(summary = "Other packages for the same destination")
    @GetMapping("/{slug}/related")
    public ResponseEntity<ApiResponse<List<PackageSummary>>> related(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(packageService.related(slug)));
    }

    @Operation(summary = "Reserve seats on a departure",
            description = "Called by booking-service once a booking is confirmed",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{slug}/reserve")
    public ResponseEntity<ApiResponse<Void>> reserveSeats(
            @PathVariable String slug,
            @Valid @RequestBody ReserveSeatsRequest request) {
        packageService.reserveSeats(slug, request);
        return ResponseEntity.ok(ApiResponse.message("Seats reserved"));
    }

    @Operation(summary = "Release seats held by a cancelled booking",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{slug}/release")
    public ResponseEntity<ApiResponse<Void>> releaseSeats(
            @PathVariable String slug,
            @Valid @RequestBody ReserveSeatsRequest request) {
        packageService.releaseSeats(slug, request);
        return ResponseEntity.ok(ApiResponse.message("Seats released"));
    }
}
