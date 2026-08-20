package com.itchu.repository;

import com.itchu.domain.Task;
import com.itchu.domain.enums.TaskStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @EntityGraph(attributePaths = {"project", "responsable", "tagsCompetences"})
    @Override
    List<Task> findAll();

    @EntityGraph(attributePaths = {"project", "responsable", "tagsCompetences"})
    @Override
    Optional<Task> findById(Long id);

    @EntityGraph(attributePaths = {"project", "responsable", "tagsCompetences"})
    List<Task> findByProjectId(Long projectId);

    @EntityGraph(attributePaths = {"project", "responsable", "tagsCompetences"})
    List<Task> findByResponsableId(Long responsableId);

    long countByProjectIdAndStatut(Long projectId, TaskStatus statut);

    long countByStatut(TaskStatus statut);

    long countByEcheanceBeforeAndStatutNot(LocalDate date, TaskStatus statut);

    List<Task> findByResponsableIdAndStatutNot(Long responsableId, TaskStatus statut);

    List<Task> findByStatutNot(TaskStatus statut);

    long countByResponsableIdAndStatutNot(Long responsableId, TaskStatus statut);

    long countByProjectIdAndResponsableId(Long projectId, Long responsableId);

    long countByProjectIdAndResponsableIdAndStatut(Long projectId, Long responsableId, TaskStatus statut);

    List<Task> findByResponsableIdAndStatutNotAndEcheanceLessThanEqualOrderByEcheanceAsc(
            Long responsableId, TaskStatus statut, LocalDate echeanceMax);
}
