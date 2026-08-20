package com.itchu.controller;

import com.itchu.dto.common.ApiResponse;
import com.itchu.dto.notification.AlertAdminRequest;
import com.itchu.dto.notification.NotificationResponse;
import com.itchu.security.SecurityUtils;
import com.itchu.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> list(@RequestParam(defaultValue = "false") boolean unreadOnly) {
        return ResponseEntity.ok(notificationService.listForUser(SecurityUtils.getCurrentUserId(), unreadOnly));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(SecurityUtils.getCurrentUserId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id, SecurityUtils.getCurrentUserId()));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notificationService.markAllRead(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.message("Toutes les notifications ont ete marquees comme lues"));
    }

    @PostMapping("/alert-admin")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> alertAdmin(@Valid @RequestBody AlertAdminRequest request) {
        int notified = notificationService.alertAdmins(SecurityUtils.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.ok(
                "Alerte envoyee a " + notified + " administrateur(s)",
                Map.of("notifiedAdmins", notified)));
    }
}
