package com.itchu.controller;

import com.itchu.dto.meeting.MeetingRequest;
import com.itchu.dto.meeting.MeetingResponse;
import com.itchu.security.SecurityUtils;
import com.itchu.service.MeetingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @GetMapping
    public ResponseEntity<List<MeetingResponse>> list(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Boolean mine) {
        if (Boolean.TRUE.equals(mine) || !SecurityUtils.isAdmin()) {
            return ResponseEntity.ok(meetingService.listMine(SecurityUtils.getCurrentUserId()));
        }
        if (projectId != null) {
            return ResponseEntity.ok(meetingService.listByProject(projectId));
        }
        return ResponseEntity.ok(meetingService.list());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<MeetingResponse>> listMine() {
        return ResponseEntity.ok(meetingService.listMine(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(meetingService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MeetingResponse> create(@Valid @RequestBody MeetingRequest request) {
        MeetingResponse created = meetingService.create(request, SecurityUtils.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MeetingResponse> update(@PathVariable Long id, @Valid @RequestBody MeetingRequest request) {
        return ResponseEntity.ok(meetingService.update(id, request, SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/{id}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MeetingResponse> process(@PathVariable Long id) {
        return ResponseEntity.ok(meetingService.process(id, SecurityUtils.getCurrentUserId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        meetingService.delete(id, SecurityUtils.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
