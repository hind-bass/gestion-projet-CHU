package com.itchu.service;

import com.itchu.domain.Notification;
import com.itchu.domain.User;
import com.itchu.domain.enums.NotificationType;
import com.itchu.domain.enums.Role;
import com.itchu.dto.notification.AlertAdminRequest;
import com.itchu.dto.notification.NotificationResponse;
import com.itchu.exception.ResourceNotFoundException;
import com.itchu.mapper.NotificationMapper;
import com.itchu.repository.NotificationRepository;
import com.itchu.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void create(Long userId, NotificationType type, String message, String lienReference) {
        User user = userRepository.findById(userId).orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", userId));
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setMessage(message);
        notification.setLienReference(lienReference);
        notification.setLu(false);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listForUser(Long userId, boolean unreadOnly) {
        List<Notification> notifications = unreadOnly
                ? notificationRepository.findByUserIdAndLuFalseOrderByDateCreationDesc(userId)
                : notificationRepository.findByUserIdOrderByDateCreationDesc(userId);
        return NotificationMapper.toResponseList(notifications);
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndLuFalse(userId);
    }

    public NotificationResponse markRead(Long id, Long userId) {
        Notification notification = notificationRepository
                .findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Notification", id));
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification introuvable pour cet utilisateur");
        }
        notification.setLu(true);
        return NotificationMapper.toResponse(notificationRepository.save(notification));
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    /** Un membre alerte tous les administrateurs actifs. */
    public int alertAdmins(Long senderId, AlertAdminRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", senderId));

        String priority = request.priority() == null || request.priority().isBlank()
                ? "INFO"
                : request.priority().trim().toUpperCase();
        String message = "[" + priority + "] " + request.subject()
                + " — " + request.message()
                + " (de " + sender.getPrenom() + " " + sender.getNom() + ")";

        List<User> admins = userRepository.findByRoleAndActifTrue(Role.ADMIN);
        for (User admin : admins) {
            create(admin.getId(), NotificationType.SYSTEME, message, "/notifications");
        }
        return admins.size();
    }
}
