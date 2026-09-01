package com.gotour.catalog.pkg.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.catalog.pkg.dto.PackageDtos.PackageDetail;
import com.gotour.catalog.pkg.dto.PackageDtos.PackageSummary;
import com.gotour.catalog.pkg.dto.PackageDtos.SavePackageRequest;
import com.gotour.catalog.pkg.service.PackageService;
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

@Tag(name = "Admin - Packages", description = "Tour package management")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/packages")
// TODO(security): ADMIN only. Nothing enforces this yet.
@RequiredArgsConstructor
public class AdminPackageController {

    private final PackageService packageService;

    @Operation(summary = "List packages including inactive ones")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PackageSummary>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(ApiResponse.success(
                packageService.adminList(search, page, size, sortBy, direction)));
    }

    @Operation(summary = "Create a package")
    @PostMapping
    public ResponseEntity<ApiResponse<PackageDetail>> create(@Valid @RequestBody SavePackageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Package created", packageService.create(request)));
    }

    @Operation(summary = "Update a package")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PackageDetail>> update(@PathVariable Long id,
                                                             @Valid @RequestBody SavePackageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Package updated", packageService.update(id, request)));
    }

    @Operation(summary = "Activate or deactivate a package")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> setActive(@PathVariable Long id, @RequestParam boolean active) {
        packageService.setActive(id, active);
        return ResponseEntity.ok(ApiResponse.message(active ? "Package activated" : "Package deactivated"));
    }

    @Operation(summary = "Delete a package")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        packageService.delete(id);
        return ResponseEntity.ok(ApiResponse.message("Package deleted"));
    }
}
