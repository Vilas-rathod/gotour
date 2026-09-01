package com.gotour.booking.itinerary.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.common.security.SecurityUtils;
import com.gotour.booking.itinerary.dto.ItineraryDtos.ItineraryDetail;
import com.gotour.booking.itinerary.dto.ItineraryDtos.ItinerarySummary;
import com.gotour.booking.itinerary.dto.ItineraryDtos.SaveActivityRequest;
import com.gotour.booking.itinerary.dto.ItineraryDtos.SaveDayRequest;
import com.gotour.booking.itinerary.dto.ItineraryDtos.SaveItineraryRequest;
import com.gotour.booking.itinerary.service.ItineraryService;
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

import java.util.List;

@Tag(name = "Itineraries", description = "Day-by-day trip planning for the signed-in traveller")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/itineraries")
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    @Operation(summary = "List the traveller's itineraries")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ItinerarySummary>>> list(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return ResponseEntity.ok(ApiResponse.success(
                itineraryService.list(SecurityUtils.currentUserId(), page, size)));
    }

    @Operation(summary = "Trips that have not finished yet")
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<ItinerarySummary>>> upcoming() {
        return ResponseEntity.ok(ApiResponse.success(
                itineraryService.upcoming(SecurityUtils.currentUserId())));
    }

    @Operation(summary = "Full itinerary with days and activities")
    @GetMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<ItineraryDetail>> get(@PathVariable Long itineraryId) {
        return ResponseEntity.ok(ApiResponse.success(
                itineraryService.get(SecurityUtils.currentUserId(), itineraryId)));
    }

    @Operation(summary = "Create an itinerary")
    @PostMapping
    public ResponseEntity<ApiResponse<ItineraryDetail>> create(
            @Valid @RequestBody SaveItineraryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Itinerary created",
                        itineraryService.create(SecurityUtils.currentUserId(), request)));
    }

    @Operation(summary = "Update an itinerary")
    @PutMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<ItineraryDetail>> update(
            @PathVariable Long itineraryId,
            @Valid @RequestBody SaveItineraryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Itinerary updated",
                itineraryService.update(SecurityUtils.currentUserId(), itineraryId, request)));
    }

    @Operation(summary = "Delete an itinerary")
    @DeleteMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long itineraryId) {
        itineraryService.delete(SecurityUtils.currentUserId(), itineraryId);
        return ResponseEntity.ok(ApiResponse.message("Itinerary deleted"));
    }

    // ------------------------------------------------------------------ days

    @Operation(summary = "Add a day")
    @PostMapping("/{itineraryId}/days")
    public ResponseEntity<ApiResponse<ItineraryDetail>> addDay(@PathVariable Long itineraryId,
                                                               @Valid @RequestBody SaveDayRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Day added",
                itineraryService.addDay(SecurityUtils.currentUserId(), itineraryId, request)));
    }

    @Operation(summary = "Update a day")
    @PutMapping("/{itineraryId}/days/{dayId}")
    public ResponseEntity<ApiResponse<ItineraryDetail>> updateDay(@PathVariable Long itineraryId,
                                                                  @PathVariable Long dayId,
                                                                  @Valid @RequestBody SaveDayRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Day updated",
                itineraryService.updateDay(SecurityUtils.currentUserId(), itineraryId, dayId, request)));
    }

    @Operation(summary = "Delete a day")
    @DeleteMapping("/{itineraryId}/days/{dayId}")
    public ResponseEntity<ApiResponse<ItineraryDetail>> deleteDay(@PathVariable Long itineraryId,
                                                                  @PathVariable Long dayId) {
        return ResponseEntity.ok(ApiResponse.success("Day removed",
                itineraryService.deleteDay(SecurityUtils.currentUserId(), itineraryId, dayId)));
    }

    // ------------------------------------------------------------ activities

    @Operation(summary = "Add an activity to a day")
    @PostMapping("/{itineraryId}/days/{dayId}/activities")
    public ResponseEntity<ApiResponse<ItineraryDetail>> addActivity(
            @PathVariable Long itineraryId,
            @PathVariable Long dayId,
            @Valid @RequestBody SaveActivityRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Activity added",
                itineraryService.addActivity(SecurityUtils.currentUserId(), itineraryId, dayId, request)));
    }

    @Operation(summary = "Update an activity")
    @PutMapping("/{itineraryId}/days/{dayId}/activities/{activityId}")
    public ResponseEntity<ApiResponse<ItineraryDetail>> updateActivity(
            @PathVariable Long itineraryId,
            @PathVariable Long dayId,
            @PathVariable Long activityId,
            @Valid @RequestBody SaveActivityRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Activity updated",
                itineraryService.updateActivity(SecurityUtils.currentUserId(),
                        itineraryId, dayId, activityId, request)));
    }

    @Operation(summary = "Toggle an activity between done and not done")
    @PatchMapping("/{itineraryId}/days/{dayId}/activities/{activityId}/toggle")
    public ResponseEntity<ApiResponse<ItineraryDetail>> toggleActivity(
            @PathVariable Long itineraryId,
            @PathVariable Long dayId,
            @PathVariable Long activityId) {
        return ResponseEntity.ok(ApiResponse.success("Activity updated",
                itineraryService.toggleActivity(SecurityUtils.currentUserId(),
                        itineraryId, dayId, activityId)));
    }

    @Operation(summary = "Delete an activity")
    @DeleteMapping("/{itineraryId}/days/{dayId}/activities/{activityId}")
    public ResponseEntity<ApiResponse<ItineraryDetail>> deleteActivity(
            @PathVariable Long itineraryId,
            @PathVariable Long dayId,
            @PathVariable Long activityId) {
        return ResponseEntity.ok(ApiResponse.success("Activity removed",
                itineraryService.deleteActivity(SecurityUtils.currentUserId(),
                        itineraryId, dayId, activityId)));
    }
}
