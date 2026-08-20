package com.itchu.dto.dashboard;

import java.util.List;

public record MemberDashboardResponse(
        long myProjectsCount,
        long activeTasksCount,
        long todayMeetingsCount,
        double weeklyPlannedHours,
        double weeklyCapacityHours,
        double weeklyChargePercent,
        List<UrgentTaskItem> urgentTasks) {
}
