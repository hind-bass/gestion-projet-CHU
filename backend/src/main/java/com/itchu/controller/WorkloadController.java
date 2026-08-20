package com.itchu.controller;

import com.itchu.dto.dashboard.MyWorkloadResponse;
import com.itchu.security.SecurityUtils;
import com.itchu.service.WorkloadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workload")
public class WorkloadController {

    private final WorkloadService workloadService;

    public WorkloadController(WorkloadService workloadService) {
        this.workloadService = workloadService;
    }

    @GetMapping("/me")
    public ResponseEntity<MyWorkloadResponse> myWorkload() {
        return ResponseEntity.ok(workloadService.computeMyWorkload(SecurityUtils.getCurrentUserId()));
    }
}
