package com.itchu.dto.dashboard;

public record WorkloadItem(
        Long userId,
        String nomComplet,
        double tauxCharge,
        double heuresAssignees,
        long tachesEnCours) {
}
