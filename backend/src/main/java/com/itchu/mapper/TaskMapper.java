package com.itchu.mapper;

import com.itchu.domain.Task;
import com.itchu.domain.TaskHistory;
import com.itchu.dto.task.TaskHistoryResponse;
import com.itchu.dto.task.TaskResponse;

import java.util.List;

public final class TaskMapper {

    private TaskMapper() {
    }

    public static TaskResponse toResponse(Task task) {
        if (task == null) {
            return null;
        }
        return new TaskResponse(
                task.getId(),
                task.getProject() != null ? task.getProject().getId() : null,
                task.getProject() != null ? task.getProject().getNom() : null,
                task.getTitre(),
                task.getDescription(),
                task.getStatut(),
                task.getPriorite(),
                task.getEcheance(),
                UserMapper.toResponse(task.getResponsable()),
                MapperUtils.copyList(task.getTagsCompetences()),
                task.getHeuresEstimees(),
                task.getDateCreation(),
                task.getDateMaj());
    }

    public static List<TaskResponse> toResponseList(List<Task> tasks) {
        return tasks.stream().map(TaskMapper::toResponse).toList();
    }

    public static TaskHistoryResponse toHistoryResponse(TaskHistory history) {
        if (history == null) {
            return null;
        }
        return new TaskHistoryResponse(
                history.getId(),
                history.getAncienStatut(),
                history.getNouveauStatut(),
                UserMapper.toResponse(history.getAuteur()),
                history.getDateChangement());
    }

    public static List<TaskHistoryResponse> toHistoryResponseList(List<TaskHistory> histories) {
        return histories.stream().map(TaskMapper::toHistoryResponse).toList();
    }
}
