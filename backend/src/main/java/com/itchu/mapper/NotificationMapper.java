package com.itchu.mapper;

import com.itchu.domain.Notification;
import com.itchu.dto.notification.NotificationResponse;

import java.util.List;

public final class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getLienReference(),
                notification.isLu(),
                notification.getDateCreation());
    }

    public static List<NotificationResponse> toResponseList(List<Notification> notifications) {
        return notifications.stream().map(NotificationMapper::toResponse).toList();
    }
}
