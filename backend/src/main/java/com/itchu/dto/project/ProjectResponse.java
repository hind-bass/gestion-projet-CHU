package com.itchu.dto.project;

import com.itchu.domain.enums.ProjectPriority;
import com.itchu.domain.enums.ProjectStatus;
import com.itchu.dto.user.UserResponse;

import java.time.LocalDate;
import java.util.List;

public record ProjectResponse(
        Long id,
        String nom,
        String description,
        ProjectStatus statut,
        ProjectPriority priorite,
        LocalDate dateDebut,
        LocalDate dateFinPrevue,
        Double scoreRisque,
        Double tauxAvancement,
        UserResponse createur,
        List<UserResponse> membres,
        long totalTaches,
        long tachesTerminees) {
}
