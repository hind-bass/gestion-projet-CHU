package com.itchu.dto.dashboard;

public record WorkloadProjectSlice(
        Long projectId,
        String projectNom,
        double heures,
        double percentage) {
}
