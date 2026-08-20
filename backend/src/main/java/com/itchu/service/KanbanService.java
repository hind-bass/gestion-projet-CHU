package com.itchu.service;

import com.itchu.domain.Task;
import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.task.TaskResponse;
import com.itchu.mapper.TaskMapper;
import com.itchu.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class KanbanService {

    private final TaskRepository taskRepository;

    public KanbanService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Map<TaskStatus, List<TaskResponse>> getBoard(Long projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        Map<TaskStatus, List<TaskResponse>> board = new EnumMap<>(TaskStatus.class);
        for (TaskStatus status : TaskStatus.values()) {
            board.put(status, tasks.stream()
                    .filter(task -> task.getStatut() == status)
                    .map(TaskMapper::toResponse)
                    .toList());
        }
        return board;
    }
}
