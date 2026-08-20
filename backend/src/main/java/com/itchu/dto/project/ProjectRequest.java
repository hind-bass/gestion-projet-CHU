package com.itchu.dto.project;

import com.itchu.domain.enums.ProjectPriority;
import com.itchu.domain.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ProjectRequest(
        @NotBlank(message = "Le nom du projet est obligatoire") String nom,
        String description,
        @NotNull(message = "Le statut est obligatoire") ProjectStatus statut,
        @NotNull(message = "La priorite est obligatoire") ProjectPriority priorite,
        LocalDate dateDebut,
        LocalDate dateFinPrevue) {
}
