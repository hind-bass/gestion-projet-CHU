package com.itchu.dto.dashboard;

import java.util.List;
import java.util.Map;

public record DashboardStatsResponse(
        long totalProjects,
        long activeProjects,
        long totalTasks,
        long overdueTasks,
        long totalUsers,
        long activeUsers,
        long unreadDecisions,
        Map<String, Long> tasksByStatus,
        List<ChartPoint> projectsProgress,
        List<WorkloadItem> workload,
        List<RecentActivity> recentActivities) {
}
