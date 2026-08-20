package com.itchu.dto.dashboard;

import com.itchu.domain.enums.TaskStatus;

import java.time.LocalDate;

public record UrgentTaskItem(
        Long id,
        String titre,
        String projectNom,
        Double priorite,
        TaskStatus statut,
        LocalDate echeance) {
}
