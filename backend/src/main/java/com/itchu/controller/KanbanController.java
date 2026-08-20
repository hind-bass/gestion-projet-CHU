package com.itchu.controller;

import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.task.TaskResponse;
import com.itchu.exception.UnauthorizedException;
import com.itchu.security.SecurityUtils;
import com.itchu.service.KanbanService;
import com.itchu.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/kanban")
public class KanbanController {

    private final KanbanService kanbanService;
    private final ProjectService projectService;

    public KanbanController(KanbanService kanbanService, ProjectService projectService) {
        this.kanbanService = kanbanService;
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<Map<TaskStatus, List<TaskResponse>>> getBoard(@PathVariable Long projectId) {
        if (!SecurityUtils.isAdmin()
                && !projectService.isMemberOrCreator(projectId, SecurityUtils.getCurrentUserId())) {
            throw new UnauthorizedException("Acces refuse au kanban de ce projet");
        }
        return ResponseEntity.ok(kanbanService.getBoard(projectId));
    }
}
