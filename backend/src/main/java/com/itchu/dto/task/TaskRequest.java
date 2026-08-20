package com.itchu.dto.task;

import com.itchu.domain.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record TaskRequest(
        @NotNull(message = "Le projet est obligatoire") Long projectId,
        @NotBlank(message = "Le titre est obligatoire") String titre,
        String description,
        TaskStatus statut,
        Double priorite,
        LocalDate echeance,
        Long responsableId,
        List<String> tagsCompetences,
        Double heuresEstimees) {
}
