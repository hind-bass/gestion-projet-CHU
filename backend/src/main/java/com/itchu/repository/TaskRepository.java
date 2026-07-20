package com.itchu.repository;

import com.itchu.domain.Task;
import com.itchu.domain.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByResponsableId(Long responsableId);

    long countByProjectIdAndStatut(Long projectId, TaskStatus statut);
}
