package com.gotour.engagement.notification.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications",
        indexes = {
                @Index(name = "idx_notifications_user", columnList = "user_id"),
                @Index(name = "idx_notifications_user_read", columnList = "user_id,read_flag")
        })
public class Notification extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 600)
    private String message;

    /** Relative frontend route this notification points at, e.g. /bookings/GT-XXXX. */
    @Column(length = 300)
    private String link;

    /**
     * Named {@code read_flag} because READ is a reserved word in several SQL
     * dialects and quoting it everywhere is worse than renaming it.
     */
    @Builder.Default
    @Column(name = "read_flag", nullable = false)
    private boolean read = false;

    @Column(name = "read_at")
    private Instant readAt;
}
