package com.itchu.dto.task;

import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.user.UserResponse;

import java.time.LocalDateTime;

public record TaskHistoryResponse(
        Long id,
        TaskStatus ancienStatut,
        TaskStatus nouveauStatut,
        UserResponse auteur,
        LocalDateTime dateChangement) {
}
