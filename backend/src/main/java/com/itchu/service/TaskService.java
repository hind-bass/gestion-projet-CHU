package com.itchu.service;

import com.itchu.domain.Task;
import com.itchu.domain.TaskHistory;
import com.itchu.domain.User;
import com.itchu.domain.enums.NotificationType;
import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.task.TaskHistoryResponse;
import com.itchu.dto.task.TaskRequest;
import com.itchu.dto.task.TaskResponse;
import com.itchu.exception.ResourceNotFoundException;
import com.itchu.exception.UnauthorizedException;
import com.itchu.mapper.TaskMapper;
import com.itchu.repository.TaskHistoryRepository;
import com.itchu.repository.TaskRepository;
import com.itchu.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskHistoryRepository taskHistoryRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public TaskService(
            TaskRepository taskRepository,
            TaskHistoryRepository taskHistoryRepository,
            UserRepository userRepository,
            ProjectService projectService,
            NotificationService notificationService,
            AuditLogService auditLogService) {
        this.taskRepository = taskRepository;
        this.taskHistoryRepository = taskHistoryRepository;
        this.userRepository = userRepository;
        this.projectService = projectService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> list() {
        return TaskMapper.toResponseList(taskRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listByProject(Long projectId) {
        return TaskMapper.toResponseList(taskRepository.findByProjectId(projectId));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listMine(Long userId) {
        return TaskMapper.toResponseList(taskRepository.findByResponsableId(userId));
    }

    @Transactional(readOnly = true)
    public TaskResponse getById(Long id) {
        return TaskMapper.toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public Task findEntity(Long id) {
        return taskRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Tache", id));
    }

    @Transactional(readOnly = true)
    public List<TaskHistoryResponse> getHistory(Long taskId) {
        return TaskMapper.toHistoryResponseList(taskHistoryRepository.findByTaskIdOrderByDateChangementDesc(taskId));
    }

    public TaskResponse create(TaskRequest request, Long actorId) {
        Task task = new Task();
        task.setProject(projectService.findEntity(request.projectId()));
        applyRequest(task, request);
        task.setStatut(request.statut() != null ? request.statut() : TaskStatus.A_FAIRE);
        Task saved = taskRepository.save(task);
        projectService.recalculateProgress(saved.getProject().getId());
        auditLogService.record(actorId, "CREATE", "Task", saved.getId(), "Creation de la tache " + saved.getTitre());
        notifyResponsable(saved, "Une nouvelle tache vous a ete assignee : " + saved.getTitre());
        return TaskMapper.toResponse(saved);
    }

    public TaskResponse update(Long id, TaskRequest request, Long actorId) {
        Task task = findEntity(id);
        if (!task.getProject().getId().equals(request.projectId())) {
            task.setProject(projectService.findEntity(request.projectId()));
        }
        applyRequest(task, request);
        if (request.statut() != null) {
            task.setStatut(request.statut());
        }
        Task saved = taskRepository.save(task);
        projectService.recalculateProgress(saved.getProject().getId());
        auditLogService.record(actorId, "UPDATE", "Task", saved.getId(), "Mise a jour de la tache " + saved.getTitre());
        return TaskMapper.toResponse(saved);
    }

    public void delete(Long id, Long actorId) {
        Task task = findEntity(id);
        Long projectId = task.getProject().getId();
        taskRepository.delete(task);
        projectService.recalculateProgress(projectId);
        auditLogService.record(actorId, "DELETE", "Task", id, "Suppression de la tache " + task.getTitre());
    }

    public TaskResponse assign(Long id, Long responsableId, Long actorId) {
        Task task = findEntity(id);
        User responsable = userRepository
                .findById(responsableId)
                .orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", responsableId));
        task.setResponsable(responsable);
        Task saved = taskRepository.save(task);
        auditLogService.record(
                actorId, "ASSIGN", "Task", saved.getId(),
                "Assignation de la tache " + saved.getTitre() + " a " + responsable.getPrenom() + " " + responsable.getNom());
        notifyResponsable(saved, "Vous avez ete assigne a la tache : " + saved.getTitre());
        return TaskMapper.toResponse(saved);
    }

    public TaskResponse updateStatus(Long id, TaskStatus nouveauStatut, Long actorId, boolean actorIsAdmin) {
        Task task = findEntity(id);
        if (!actorIsAdmin) {
            boolean isAssignee = task.getResponsable() != null && task.getResponsable().getId().equals(actorId);
            if (!isAssignee) {
                throw new UnauthorizedException("Vous ne pouvez modifier que le statut de vos propres taches");
            }
        }

        TaskStatus ancienStatut = task.getStatut();
        if (ancienStatut == nouveauStatut) {
            return TaskMapper.toResponse(task);
        }

        task.setStatut(nouveauStatut);
        Task saved = taskRepository.save(task);

        User auteur = userRepository.findById(actorId).orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", actorId));
        TaskHistory history = new TaskHistory();
        history.setTask(saved);
        history.setAncienStatut(ancienStatut);
        history.setNouveauStatut(nouveauStatut);
        history.setAuteur(auteur);
        taskHistoryRepository.save(history);

        projectService.recalculateProgress(saved.getProject().getId());
        auditLogService.record(
                actorId, "STATUS_CHANGE", "Task", saved.getId(),
                "Statut de la tache " + saved.getTitre() + " : " + ancienStatut + " -> " + nouveauStatut);

        return TaskMapper.toResponse(saved);
    }

    private void applyRequest(Task task, TaskRequest request) {
        task.setTitre(request.titre());
        task.setDescription(request.description());
        if (request.priorite() != null) {
            task.setPriorite(request.priorite());
        }
        task.setEcheance(request.echeance());
        if (request.responsableId() != null) {
            User responsable = userRepository
                    .findById(request.responsableId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", request.responsableId()));
            task.setResponsable(responsable);
        } else {
            task.setResponsable(null);
        }
        if (request.tagsCompetences() != null) {
            task.setTagsCompetences(request.tagsCompetences());
        }
        if (request.heuresEstimees() != null) {
            task.setHeuresEstimees(request.heuresEstimees());
        }
    }

    private void notifyResponsable(Task task, String message) {
        if (task.getResponsable() != null) {
            notificationService.create(task.getResponsable().getId(), NotificationType.TACHE, message, "/tasks/" + task.getId());
        }
    }
}
