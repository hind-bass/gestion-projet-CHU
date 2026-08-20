package com.itchu.mapper;

import com.itchu.domain.Project;
import com.itchu.domain.User;
import com.itchu.dto.project.ProjectResponse;

import java.util.List;

public final class ProjectMapper {

    private ProjectMapper() {
    }

    public static ProjectResponse toResponse(
            Project project, List<User> membres, long totalTaches, long tachesTerminees) {
        if (project == null) {
            return null;
        }
        return new ProjectResponse(
                project.getId(),
                project.getNom(),
                project.getDescription(),
                project.getStatut(),
                project.getPriorite(),
                project.getDateDebut(),
                project.getDateFinPrevue(),
                project.getScoreRisque(),
                project.getTauxAvancement(),
                UserMapper.toResponse(project.getCreateur()),
                UserMapper.toResponseList(membres),
                totalTaches,
                tachesTerminees);
    }
}
