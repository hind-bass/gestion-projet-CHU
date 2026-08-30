package com.itchu.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AiContextRequest(
        @NotNull(message = "userId est obligatoire") Long userId,
        String role,
        @NotBlank(message = "La question est obligatoire") String question,
        String intent) {
}
