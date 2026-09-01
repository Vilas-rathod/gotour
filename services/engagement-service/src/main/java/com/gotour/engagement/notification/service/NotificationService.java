package com.gotour.engagement.notification.service;

import com.gotour.common.api.PageResponse;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.engagement.notification.domain.Notification;
import com.gotour.engagement.notification.dto.NotificationDtos.CreateNotificationRequest;
import com.gotour.engagement.notification.dto.NotificationDtos.NotificationResponse;
import com.gotour.engagement.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> list(Long userId, boolean unreadOnly,
                                                    Integer page, Integer size) {
        Pageable pageable = pageable(page, size);

        return PageResponse.from(unreadOnly
                        ? repository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId, pageable)
                        : repository.findByUserIdOrderByCreatedAtDesc(userId, pageable),
                this::toResponse);
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markRead(Long userId, Long notificationId) {
        Notification notification = repository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            repository.save(notification);
        }
        return toResponse(notification);
    }

    @Transactional
    public int markAllRead(Long userId) {
        return repository.markAllRead(userId, Instant.now());
    }

    @Transactional
    public void delete(Long userId, Long notificationId) {
        Notification notification = repository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        repository.delete(notification);
    }

    @Transactional
    public int clearAll(Long userId) {
        return repository.deleteAllForUser(userId);
    }

    /** Entry point for other services raising a notification. */
    @Transactional
    public NotificationResponse create(CreateNotificationRequest request) {
        Notification notification = repository.save(Notification.builder()
                .userId(request.userId())
                .type(request.type())
                .title(request.title().trim())
                .message(request.message().trim())
                .link(request.link())
                .read(false)
                .build());

        return toResponse(notification);
    }

    private Pageable pageable(Integer page, Integer size) {
        return PageRequest.of(
                page == null || page < 0 ? 0 : page,
                size == null || size < 1 ? 15 : Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getLink(), n.isRead(), n.getReadAt(), n.getCreatedAt());
    }
}
