package com.itchu.dto.project;

import jakarta.validation.constraints.NotNull;

public record ProjectMemberRequest(@NotNull(message = "L'identifiant utilisateur est obligatoire") Long userId) {
}
