package com.itchu.controller;

import com.itchu.dto.project.ProjectMemberRequest;
import com.itchu.dto.project.ProjectRequest;
import com.itchu.dto.project.ProjectResponse;
import com.itchu.exception.UnauthorizedException;
import com.itchu.security.SecurityUtils;
import com.itchu.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> list() {
        if (SecurityUtils.isAdmin()) {
            return ResponseEntity.ok(projectService.list());
        }
        return ResponseEntity.ok(projectService.listMine(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ProjectResponse>> listMine() {
        return ResponseEntity.ok(projectService.listMine(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Long id) {
        if (!SecurityUtils.isAdmin()
                && !projectService.isMemberOrCreator(id, SecurityUtils.getCurrentUserId())) {
            throw new UnauthorizedException("Acces refuse a ce projet");
        }
        return ResponseEntity.ok(projectService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse created = projectService.create(request, SecurityUtils.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.update(id, request, SecurityUtils.getCurrentUserId()));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> archive(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.archive(id, SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> addMember(@PathVariable Long id, @Valid @RequestBody ProjectMemberRequest request) {
        return ResponseEntity.ok(projectService.addMember(id, request.userId(), SecurityUtils.getCurrentUserId()));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.removeMember(id, userId, SecurityUtils.getCurrentUserId()));
    }
}
