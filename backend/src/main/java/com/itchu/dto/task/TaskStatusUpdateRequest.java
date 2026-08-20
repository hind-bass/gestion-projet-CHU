package com.itchu.dto.task;

import com.itchu.domain.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(@NotNull(message = "Le statut est obligatoire") TaskStatus statut) {
}
