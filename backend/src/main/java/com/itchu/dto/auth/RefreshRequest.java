package com.itchu.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(@NotBlank(message = "Le jeton de rafraichissement est obligatoire") String refreshToken) {
}
