package com.itchu.controller;

import com.itchu.dto.task.TaskHistoryResponse;
import com.itchu.dto.task.TaskRequest;
import com.itchu.dto.task.TaskResponse;
import com.itchu.dto.task.TaskStatusUpdateRequest;
import com.itchu.security.SecurityUtils;
import com.itchu.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/api/tasks")
    public ResponseEntity<List<TaskResponse>> list(@RequestParam(required = false) Boolean mine) {
        if (Boolean.TRUE.equals(mine) || !SecurityUtils.isAdmin()) {
            return ResponseEntity.ok(taskService.listMine(SecurityUtils.getCurrentUserId()));
        }
        return ResponseEntity.ok(taskService.list());
    }

    @GetMapping("/api/tasks/{id}")
    public ResponseEntity<TaskResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getById(id));
    }

    @GetMapping("/api/tasks/{id}/history")
    public ResponseEntity<List<TaskHistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getHistory(id));
    }

    @GetMapping("/api/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskResponse>> listByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.listByProject(projectId));
    }

    @PostMapping("/api/tasks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request) {
        TaskResponse created = taskService.create(request, SecurityUtils.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/api/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> update(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.update(id, request, SecurityUtils.getCurrentUserId()));
    }

    @DeleteMapping("/api/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.delete(id, SecurityUtils.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/tasks/{id}/status")
    public ResponseEntity<TaskResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody TaskStatusUpdateRequest request) {
        return ResponseEntity.ok(taskService.updateStatus(
                id, request.statut(), SecurityUtils.getCurrentUserId(), SecurityUtils.isAdmin()));
    }

    @PatchMapping("/api/tasks/{id}/assign/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> assign(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(taskService.assign(id, userId, SecurityUtils.getCurrentUserId()));
    }
}
