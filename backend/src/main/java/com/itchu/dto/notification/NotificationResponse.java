package com.itchu.dto.notification;

import com.itchu.domain.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String message,
        String lienReference,
        boolean lu,
        LocalDateTime dateCreation) {
}
