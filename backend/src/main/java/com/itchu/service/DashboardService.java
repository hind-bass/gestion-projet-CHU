package com.itchu.service;

import com.itchu.domain.AuditLog;
import com.itchu.domain.Task;
import com.itchu.domain.enums.ProjectStatus;
import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.dashboard.ChartPoint;
import com.itchu.dto.dashboard.DashboardStatsResponse;
import com.itchu.dto.dashboard.MemberDashboardResponse;
import com.itchu.dto.dashboard.MyWorkloadResponse;
import com.itchu.dto.dashboard.RecentActivity;
import com.itchu.dto.dashboard.UrgentTaskItem;
import com.itchu.repository.AuditLogRepository;
import com.itchu.repository.MeetingDecisionRepository;
import com.itchu.repository.MeetingRepository;
import com.itchu.repository.ProjectMemberRepository;
import com.itchu.repository.ProjectRepository;
import com.itchu.repository.TaskRepository;
import com.itchu.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final MeetingDecisionRepository meetingDecisionRepository;
    private final MeetingRepository meetingRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final AuditLogRepository auditLogRepository;
    private final WorkloadService workloadService;

    public DashboardService(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            MeetingDecisionRepository meetingDecisionRepository,
            MeetingRepository meetingRepository,
            ProjectMemberRepository projectMemberRepository,
            AuditLogRepository auditLogRepository,
            WorkloadService workloadService) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.meetingDecisionRepository = meetingDecisionRepository;
        this.meetingRepository = meetingRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.auditLogRepository = auditLogRepository;
        this.workloadService = workloadService;
    }

    public DashboardStatsResponse getStats() {
        Map<String, Long> tasksByStatus = new LinkedHashMap<>();
        for (TaskStatus status : TaskStatus.values()) {
            tasksByStatus.put(status.name(), taskRepository.countByStatut(status));
        }

        List<ChartPoint> projectsProgress = projectRepository.findAll().stream()
                .map(project -> new ChartPoint(project.getNom(), project.getTauxAvancement()))
                .toList();

        List<RecentActivity> recentActivities = auditLogRepository.findTop10ByOrderByDateActionDesc().stream()
                .map(this::toRecentActivity)
                .toList();

        return new DashboardStatsResponse(
                projectRepository.count(),
                projectRepository.countByStatut(ProjectStatus.ACTIF),
                taskRepository.count(),
                taskRepository.countByEcheanceBeforeAndStatutNot(LocalDate.now(), TaskStatus.TERMINEE),
                userRepository.count(),
                userRepository.countByActif(true),
                meetingDecisionRepository.countByStatutTraiteFalse(),
                tasksByStatus,
                projectsProgress,
                workloadService.computeWorkload(),
                recentActivities);
    }

    /** Tableau de bord personnel pour l'espace membre (MEMBRE). */
    public MemberDashboardResponse getMemberStats(Long userId) {
        long myProjectsCount = projectMemberRepository.findByUserId(userId).size();
        long activeTasksCount = taskRepository.countByResponsableIdAndStatutNot(userId, TaskStatus.TERMINEE);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long todayMeetingsCount = meetingRepository.countByParticipants_IdAndDateBetween(userId, startOfDay, endOfDay);

        MyWorkloadResponse workload = workloadService.computeMyWorkload(userId);

        List<UrgentTaskItem> urgentTasks = taskRepository
                .findByResponsableIdAndStatutNotAndEcheanceLessThanEqualOrderByEcheanceAsc(
                        userId, TaskStatus.TERMINEE, LocalDate.now().plusDays(3))
                .stream()
                .limit(5)
                .map(this::toUrgentTask)
                .toList();

        return new MemberDashboardResponse(
                myProjectsCount,
                activeTasksCount,
                todayMeetingsCount,
                workload.totalPlannedHours(),
                workload.weeklyCapacityHours(),
                workload.chargePercent(),
                urgentTasks);
    }

    private UrgentTaskItem toUrgentTask(Task task) {
        return new UrgentTaskItem(
                task.getId(),
                task.getTitre(),
                task.getProject() != null ? task.getProject().getNom() : null,
                task.getPriorite(),
                task.getStatut(),
                task.getEcheance());
    }

    private RecentActivity toRecentActivity(AuditLog log) {
        String auteur = log.getUser() != null ? log.getUser().getPrenom() + " " + log.getUser().getNom() : "Systeme";
        return new RecentActivity(
                log.getId(),
                log.getTypeAction(),
                log.getEntiteCible(),
                log.getIdEntiteCible(),
                log.getDetail(),
                auteur,
                log.getDateAction());
    }
}
