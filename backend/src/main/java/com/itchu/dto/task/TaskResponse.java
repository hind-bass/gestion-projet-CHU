package com.itchu.dto.task;

import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.user.UserResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TaskResponse(
        Long id,
        Long projectId,
        String projectNom,
        String titre,
        String description,
        TaskStatus statut,
        Double priorite,
        LocalDate echeance,
        UserResponse responsable,
        List<String> tagsCompetences,
        Double heuresEstimees,
        LocalDateTime dateCreation,
        LocalDateTime dateMaj) {
}
