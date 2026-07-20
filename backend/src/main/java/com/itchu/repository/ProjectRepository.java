package com.itchu.repository;

import com.itchu.domain.Project;
import com.itchu.domain.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStatutNot(ProjectStatus statut);
}
