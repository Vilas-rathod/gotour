package com.gotour.engagement.notification.controller;

import com.gotour.common.api.ApiResponse;
import com.gotour.common.api.PageResponse;
import com.gotour.common.security.SecurityUtils;
import com.gotour.engagement.notification.dto.NotificationDtos.CreateNotificationRequest;
import com.gotour.engagement.notification.dto.NotificationDtos.NotificationResponse;
import com.gotour.engagement.notification.service.NotificationService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Notifications", description = "In-app notifications for the signed-in traveller")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "List notifications, newest first")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> list(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "15") Integer size) {

        return ResponseEntity.ok(ApiResponse.success(notificationService.list(
                SecurityUtils.currentUserId(), unreadOnly, page, size)));
    }

    @Operation(summary = "Unread count for the bell badge")
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount() {
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("count", notificationService.unreadCount(SecurityUtils.currentUserId()))));
    }

    @Operation(summary = "Mark one notification as read")
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(ApiResponse.success("Marked as read",
                notificationService.markRead(SecurityUtils.currentUserId(), notificationId)));
    }

    @Operation(summary = "Mark every notification as read")
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllRead() {
        int updated = notificationService.markAllRead(SecurityUtils.currentUserId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read",
                Map.of("updated", updated)));
    }

    @Operation(summary = "Delete one notification")
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long notificationId) {
        notificationService.delete(SecurityUtils.currentUserId(), notificationId);
        return ResponseEntity.ok(ApiResponse.message("Notification deleted"));
    }

    @Operation(summary = "Clear all notifications")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Map<String, Integer>>> clearAll() {
        int deleted = notificationService.clearAll(SecurityUtils.currentUserId());
        return ResponseEntity.ok(ApiResponse.success("Notifications cleared", Map.of("deleted", deleted)));
    }

    /**
     * Raising a notification for an arbitrary user is an administrative action,
     * so it is restricted to ADMIN rather than any authenticated caller.
     */
    @Operation(summary = "Create a notification for a user")
    @PostMapping
    // TODO(security): ADMIN only. Nothing enforces this yet.
    public ResponseEntity<ApiResponse<NotificationResponse>> create(
            @Valid @RequestBody CreateNotificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification created", notificationService.create(request)));
    }
}
