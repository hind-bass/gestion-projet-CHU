package com.itchu.controller;

import com.itchu.dto.dashboard.DashboardStatsResponse;
import com.itchu.dto.dashboard.MemberDashboardResponse;
import com.itchu.security.SecurityUtils;
import com.itchu.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/me")
    public ResponseEntity<MemberDashboardResponse> getMyStats() {
        return ResponseEntity.ok(dashboardService.getMemberStats(SecurityUtils.getCurrentUserId()));
    }
}
