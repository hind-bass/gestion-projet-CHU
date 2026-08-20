package com.itchu.service;

import com.itchu.domain.Task;
import com.itchu.domain.User;
import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.dashboard.MyWorkloadResponse;
import com.itchu.dto.dashboard.WorkloadItem;
import com.itchu.dto.dashboard.WorkloadProjectSlice;
import com.itchu.exception.ResourceNotFoundException;
import com.itchu.repository.TaskRepository;
import com.itchu.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class WorkloadService {

    public static final double WEEKLY_CAPACITY_HOURS = 35.0;

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public WorkloadService(UserRepository userRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    public List<WorkloadItem> computeWorkload() {
        List<User> users = userRepository.findByActif(true);
        return users.stream().map(this::toWorkloadItem).toList();
    }

    public MyWorkloadResponse computeMyWorkload(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", userId));

        List<Task> openTasks = taskRepository.findByResponsableIdAndStatutNot(userId, TaskStatus.TERMINEE);
        double totalPlanned = openTasks.stream().mapToDouble(Task::getHeuresEstimees).sum();

        // Pas de saisie d'heures reelles en Phase 1 : on estime le realise via les taches terminees.
        List<Task> doneTasks = taskRepository.findByResponsableId(userId).stream()
                .filter(task -> task.getStatut() == TaskStatus.TERMINEE)
                .toList();
        double totalLogged = doneTasks.stream().mapToDouble(Task::getHeuresEstimees).sum();

        Map<Long, WorkloadProjectSliceAccumulator> byProject = new LinkedHashMap<>();
        for (Task task : openTasks) {
            Long projectId = task.getProject().getId();
            byProject
                    .computeIfAbsent(projectId, id -> new WorkloadProjectSliceAccumulator(id, task.getProject().getNom()))
                    .heures += task.getHeuresEstimees();
        }

        List<WorkloadProjectSlice> slices = new ArrayList<>();
        for (WorkloadProjectSliceAccumulator acc : byProject.values()) {
            double pct = totalPlanned > 0 ? Math.round((acc.heures / totalPlanned) * 10000.0) / 100.0 : 0.0;
            slices.add(new WorkloadProjectSlice(acc.projectId, acc.projectNom, round2(acc.heures), pct));
        }

        double chargePercent = Math.round((totalPlanned / WEEKLY_CAPACITY_HOURS) * 10000.0) / 100.0;

        return new MyWorkloadResponse(
                user.getId(),
                user.getPrenom() + " " + user.getNom(),
                WEEKLY_CAPACITY_HOURS,
                round2(totalPlanned),
                round2(totalLogged),
                chargePercent,
                openTasks.size(),
                slices);
    }

    private WorkloadItem toWorkloadItem(User user) {
        List<Task> openTasks = taskRepository.findByResponsableIdAndStatutNot(user.getId(), TaskStatus.TERMINEE);
        double heures = openTasks.stream().mapToDouble(Task::getHeuresEstimees).sum();
        double tauxCharge = Math.round((heures / WEEKLY_CAPACITY_HOURS) * 10000.0) / 100.0;
        return new WorkloadItem(
                user.getId(),
                user.getPrenom() + " " + user.getNom(),
                tauxCharge,
                heures,
                openTasks.size());
    }

    private static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static final class WorkloadProjectSliceAccumulator {
        private final Long projectId;
        private final String projectNom;
        private double heures;

        private WorkloadProjectSliceAccumulator(Long projectId, String projectNom) {
            this.projectId = projectId;
            this.projectNom = projectNom;
        }
    }
}
