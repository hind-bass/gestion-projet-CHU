package com.itchu.dto.dashboard;

import java.util.List;

public record MyWorkloadResponse(
        Long userId,
        String nomComplet,
        double weeklyCapacityHours,
        double totalPlannedHours,
        double totalLoggedHours,
        double chargePercent,
        long tachesEnCours,
        List<WorkloadProjectSlice> projects) {
}
