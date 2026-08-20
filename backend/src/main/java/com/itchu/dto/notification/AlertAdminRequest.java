package com.itchu.dto.notification;

import jakarta.validation.constraints.NotBlank;

public record AlertAdminRequest(
        @NotBlank(message = "Le sujet est obligatoire") String subject,
        @NotBlank(message = "Le message est obligatoire") String message,
        String priority) {
}
