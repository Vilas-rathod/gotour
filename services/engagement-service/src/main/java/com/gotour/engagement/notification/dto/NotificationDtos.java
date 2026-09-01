package com.gotour.engagement.notification.dto;

import com.gotour.engagement.notification.domain.NotificationType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class NotificationDtos {

    private NotificationDtos() {
    }

    @Schema(name = "CreateNotificationRequest",
            description = "Used by other GoTour services to notify a traveller")
    public record CreateNotificationRequest(
            @NotNull(message = "User id is required")
            Long userId,

            @NotNull(message = "Type is required")
            NotificationType type,

            @NotBlank(message = "Title is required")
            @Size(max = 160)
            String title,

            @NotBlank(message = "Message is required")
            @Size(max = 600)
            String message,

            @Size(max = 300)
            String link
    ) {
    }

    @Schema(name = "NotificationResponse")
    public record NotificationResponse(
            Long id,
            NotificationType type,
            String title,
            String message,
            String link,
            boolean read,
            Instant readAt,
            Instant createdAt
    ) {
    }
}
