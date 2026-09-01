package com.gotour.catalog.destination.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.catalog.destination.dto.DestinationDtos.DestinationDetail;
import com.gotour.catalog.destination.dto.DestinationDtos.DestinationSummary;
import com.gotour.catalog.destination.dto.DestinationDtos.FacetsResponse;
import com.gotour.catalog.destination.service.DestinationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "Destinations", description = "Public destination catalogue")
@RestController
@RequestMapping("/api/v1/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;

    @Operation(summary = "Search destinations with filters, sorting and pagination")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DestinationSummary>>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String continent,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "popularityScore") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(ApiResponse.success(destinationService.search(
                search, country, continent, tag, minRating, featured, page, size, sortBy, direction)));
    }

    @Operation(summary = "Featured destinations for the homepage")
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<DestinationSummary>>> featured() {
        return ResponseEntity.ok(ApiResponse.success(destinationService.featured()));
    }

    @Operation(summary = "Most popular destinations")
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<DestinationSummary>>> popular() {
        return ResponseEntity.ok(ApiResponse.success(destinationService.popular()));
    }

    @Operation(summary = "Available filter options")
    @GetMapping("/facets")
    public ResponseEntity<ApiResponse<FacetsResponse>> facets() {
        return ResponseEntity.ok(ApiResponse.success(destinationService.facets()));
    }

    @Operation(summary = "Destination detail including gallery, attractions and guides")
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<DestinationDetail>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(destinationService.getBySlug(slug)));
    }

    @Operation(summary = "Other destinations in the same country")
    @GetMapping("/{slug}/related")
    public ResponseEntity<ApiResponse<List<DestinationSummary>>> related(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(destinationService.related(slug)));
    }
}
