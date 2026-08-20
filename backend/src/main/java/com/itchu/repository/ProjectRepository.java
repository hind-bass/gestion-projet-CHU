package com.itchu.repository;

import com.itchu.domain.Project;
import com.itchu.domain.enums.ProjectStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @EntityGraph(attributePaths = "createur")
    @Override
    List<Project> findAll();

    @EntityGraph(attributePaths = "createur")
    @Override
    Optional<Project> findById(Long id);

    List<Project> findByStatutNot(ProjectStatus statut);

    long countByStatut(ProjectStatus statut);

    long countByStatutIn(List<ProjectStatus> statuts);
}
