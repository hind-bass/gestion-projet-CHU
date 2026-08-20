package com.itchu.service;

import com.itchu.domain.enums.ProjectPriority;
import com.itchu.domain.enums.ProjectStatus;
import com.itchu.domain.enums.Role;
import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.auth.LoginRequest;
import com.itchu.dto.meeting.MeetingRequest;
import com.itchu.dto.project.ProjectRequest;
import com.itchu.dto.project.ProjectResponse;
import com.itchu.dto.task.TaskRequest;
import com.itchu.dto.task.TaskResponse;
import com.itchu.dto.user.CreateUserRequest;
import com.itchu.dto.user.UserResponse;
import com.itchu.exception.ConflictException;
import com.itchu.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DomainServicesTest {

    @Autowired
    private UserService userService;
    @Autowired
    private ProjectService projectService;
    @Autowired
    private TaskService taskService;
    @Autowired
    private MeetingService meetingService;
    @Autowired
    private AuthService authService;

    private UserResponse admin;
    private UserResponse member;

    @BeforeEach
    void seedUsers() {
        admin = userService.create(
                new CreateUserRequest("Admin", "Karim", "karim.admin@chu.local", "Admin123!", Role.ADMIN, List.of("Gestion")),
                null);
        member = userService.create(
                new CreateUserRequest("Alaoui", "Youssef", "youssef.member@chu.local", "Member123!", Role.MEMBRE, List.of("Réseau")),
                admin.id());
    }

    @Test
    void createUserRejectsDuplicateEmail() {
        assertThatThrownBy(() -> userService.create(
                new CreateUserRequest("Autre", "User", "karim.admin@chu.local", "Admin123!", Role.MEMBRE, List.of()),
                admin.id()))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void loginIssuesTokens() {
        var response = authService.login(new LoginRequest("karim.admin@chu.local", "Admin123!"));
        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.user().id()).isEqualTo(admin.id());
    }

    @Test
    void projectLifecycleAndMembership() {
        ProjectResponse created = projectService.create(
                new ProjectRequest("Refonte SI", "Migration", ProjectStatus.ACTIF, ProjectPriority.HAUTE,
                        LocalDate.now(), LocalDate.now().plusMonths(6)),
                admin.id());

        assertThat(created.nom()).isEqualTo("Refonte SI");
        assertThat(created.createur().id()).isEqualTo(admin.id());

        ProjectResponse withMember = projectService.addMember(created.id(), member.id(), admin.id());
        assertThat(withMember.membres()).extracting(UserResponse::id).contains(member.id());

        ProjectResponse archived = projectService.archive(created.id(), admin.id());
        assertThat(archived.statut()).isEqualTo(ProjectStatus.ARCHIVE);
    }

    @Test
    void taskCreateAndStatusChangeByAssignee() {
        ProjectResponse project = projectService.create(
                new ProjectRequest("Dossier Patient", null, ProjectStatus.ACTIF, ProjectPriority.MOYENNE,
                        LocalDate.now(), LocalDate.now().plusMonths(3)),
                admin.id());

        TaskResponse task = taskService.create(
                new TaskRequest(project.id(), "Configurer le pare-feu", null, TaskStatus.A_FAIRE, 3.0,
                        LocalDate.now().plusDays(5), member.id(), List.of("Réseau"), 4.0),
                admin.id());

        assertThat(task.responsable().id()).isEqualTo(member.id());
        assertThat(task.statut()).isEqualTo(TaskStatus.A_FAIRE);

        TaskResponse moved = taskService.updateStatus(task.id(), TaskStatus.EN_COURS, member.id(), false);
        assertThat(moved.statut()).isEqualTo(TaskStatus.EN_COURS);
        assertThat(taskService.getHistory(task.id())).isNotEmpty();
    }

    @Test
    void memberCannotChangeStatusOfUnassignedTask() {
        ProjectResponse project = projectService.create(
                new ProjectRequest("Wifi Bloc", null, ProjectStatus.ACTIF, ProjectPriority.BASSE,
                        LocalDate.now(), LocalDate.now().plusMonths(2)),
                admin.id());
        TaskResponse task = taskService.create(
                new TaskRequest(project.id(), "Audit wifi", null, TaskStatus.A_FAIRE, 2.0,
                        null, null, List.of(), null),
                admin.id());

        assertThatThrownBy(() -> taskService.updateStatus(task.id(), TaskStatus.EN_COURS, member.id(), false))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void meetingCreateListsForParticipant() {
        ProjectResponse project = projectService.create(
                new ProjectRequest("Téléphonie", null, ProjectStatus.ACTIF, ProjectPriority.MOYENNE,
                        LocalDate.now(), LocalDate.now().plusMonths(1)),
                admin.id());

        var meeting = meetingService.create(
                new MeetingRequest(
                        project.id(),
                        "Point hebdo",
                        LocalDateTime.now().plusDays(1),
                        List.of(member.id(), admin.id()),
                        "Avancement sprint",
                        null,
                        null),
                admin.id());

        assertThat(meeting.titre()).isEqualTo("Point hebdo");
        assertThat(meetingService.listMine(member.id())).extracting(item -> item.id()).contains(meeting.id());
    }
}
