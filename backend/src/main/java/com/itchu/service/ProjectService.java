package com.itchu.service;

import com.itchu.domain.Project;
import com.itchu.domain.ProjectMember;
import com.itchu.domain.User;
import com.itchu.domain.enums.ProjectStatus;
import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.project.ProjectRequest;
import com.itchu.dto.project.ProjectResponse;
import com.itchu.exception.ConflictException;
import com.itchu.exception.ResourceNotFoundException;
import com.itchu.mapper.ProjectMapper;
import com.itchu.repository.ProjectMemberRepository;
import com.itchu.repository.ProjectRepository;
import com.itchu.repository.TaskRepository;
import com.itchu.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final AuditLogService auditLogService;

    public ProjectService(
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository,
            TaskRepository taskRepository,
            AuditLogService auditLogService) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> list() {
        return projectRepository.findAll().stream().map(this::toResponse).toList();
    }

    /** Projets dont l'utilisateur est createur ou membre. */
    @Transactional(readOnly = true)
    public List<ProjectResponse> listMine(Long userId) {
        java.util.LinkedHashMap<Long, Project> projects = new java.util.LinkedHashMap<>();
        for (ProjectMember membership : projectMemberRepository.findByUserId(userId)) {
            Project project = membership.getProject();
            projects.put(project.getId(), project);
        }
        for (Project project : projectRepository.findAll()) {
            if (project.getCreateur() != null && project.getCreateur().getId().equals(userId)) {
                projects.putIfAbsent(project.getId(), project);
            }
        }
        return projects.values().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public boolean isMemberOrCreator(Long projectId, Long userId) {
        Project project = findEntity(projectId);
        if (project.getCreateur() != null && project.getCreateur().getId().equals(userId)) {
            return true;
        }
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public Project findEntity(Long id) {
        return projectRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Projet", id));
    }

    public ProjectResponse create(ProjectRequest request, Long creatorId) {
        User createur = userRepository
                .findById(creatorId)
                .orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", creatorId));

        Project project = new Project();
        applyRequest(project, request);
        project.setCreateur(createur);
        Project saved = projectRepository.save(project);
        auditLogService.record(creatorId, "CREATE", "Project", saved.getId(), "Creation du projet " + saved.getNom());
        return toResponse(saved);
    }

    public ProjectResponse update(Long id, ProjectRequest request, Long actorId) {
        Project project = findEntity(id);
        applyRequest(project, request);
        Project saved = projectRepository.save(project);
        auditLogService.record(actorId, "UPDATE", "Project", saved.getId(), "Mise a jour du projet " + saved.getNom());
        return toResponse(saved);
    }

    public ProjectResponse archive(Long id, Long actorId) {
        Project project = findEntity(id);
        project.setStatut(ProjectStatus.ARCHIVE);
        Project saved = projectRepository.save(project);
        auditLogService.record(actorId, "ARCHIVE", "Project", saved.getId(), "Archivage du projet " + saved.getNom());
        return toResponse(saved);
    }

    public ProjectResponse addMember(Long projectId, Long userId, Long actorId) {
        Project project = findEntity(projectId);
        User user = userRepository.findById(userId).orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", userId));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ConflictException("L'utilisateur fait deja partie du projet");
        }

        projectMemberRepository.save(new ProjectMember(project, user));
        auditLogService.record(
                actorId, "ADD_MEMBER", "Project", projectId,
                "Ajout de " + user.getPrenom() + " " + user.getNom() + " au projet " + project.getNom());
        return toResponse(project);
    }

    public ProjectResponse removeMember(Long projectId, Long userId, Long actorId) {
        Project project = findEntity(projectId);
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ResourceNotFoundException("L'utilisateur ne fait pas partie de ce projet");
        }
        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
        auditLogService.record(actorId, "REMOVE_MEMBER", "Project", projectId, "Retrait d'un membre du projet " + project.getNom());
        return toResponse(project);
    }

    public void recalculateProgress(Long projectId) {
        Project project = findEntity(projectId);
        long total = taskRepository.findByProjectId(projectId).size();
        if (total == 0) {
            project.setTauxAvancement(0.0);
        } else {
            long done = taskRepository.countByProjectIdAndStatut(projectId, TaskStatus.TERMINEE);
            project.setTauxAvancement(Math.round((done * 10000.0) / total) / 100.0);
        }
        projectRepository.save(project);
    }

    private void applyRequest(Project project, ProjectRequest request) {
        project.setNom(request.nom());
        project.setDescription(request.description());
        project.setStatut(request.statut());
        project.setPriorite(request.priorite());
        project.setDateDebut(request.dateDebut());
        project.setDateFinPrevue(request.dateFinPrevue());
    }

    private ProjectResponse toResponse(Project project) {
        List<User> membres = projectMemberRepository.findByProjectId(project.getId()).stream()
                .map(ProjectMember::getUser)
                .toList();
        long total = taskRepository.findByProjectId(project.getId()).size();
        long done = taskRepository.countByProjectIdAndStatut(project.getId(), TaskStatus.TERMINEE);
        return ProjectMapper.toResponse(project, membres, total, done);
    }
}
