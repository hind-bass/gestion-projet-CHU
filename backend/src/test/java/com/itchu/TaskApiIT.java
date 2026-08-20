package com.itchu;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itchu.domain.enums.ProjectPriority;
import com.itchu.domain.enums.ProjectStatus;
import com.itchu.domain.enums.Role;
import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.project.ProjectRequest;
import com.itchu.dto.project.ProjectResponse;
import com.itchu.dto.task.TaskRequest;
import com.itchu.dto.user.CreateUserRequest;
import com.itchu.dto.user.UserResponse;
import com.itchu.service.ProjectService;
import com.itchu.service.TaskService;
import com.itchu.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskApiIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserService userService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TaskService taskService;

    private String adminEmail;
    private Long projectId;

    @BeforeEach
    void seed() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        adminEmail = "admin." + suffix + "@chu.local";
        UserResponse admin = userService.create(
                new CreateUserRequest("Admin", "Api", adminEmail, "Admin123!", Role.ADMIN, List.of("Java", "Spring")),
                null);
        UserResponse member = userService.create(
                new CreateUserRequest("Membre", "Api", "membre." + suffix + "@chu.local", "Member123!", Role.MEMBRE, List.of("React")),
                admin.id());
        ProjectResponse project = projectService.create(
                new ProjectRequest("Portail Patient", "Portail", ProjectStatus.ACTIF, ProjectPriority.HAUTE,
                        LocalDate.now(), LocalDate.now().plusMonths(3)),
                admin.id());
        projectId = project.id();
        taskService.create(
                new TaskRequest(project.id(), "Auth SSO", "Brancher l'annuaire", TaskStatus.A_FAIRE, 3.0,
                        LocalDate.now().plusDays(7), member.id(), List.of("Java", "SSO"), 8.0),
                admin.id());
    }

    @Test
    void listTasksReturnsDetachedCollections() throws Exception {
        String token = login();
        mockMvc.perform(get("/api/tasks").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titre").value("Auth SSO"))
                .andExpect(jsonPath("$[0].tagsCompetences[0]").value("Java"))
                .andExpect(jsonPath("$[0].responsable.competences").isArray());
    }

    @Test
    void kanbanReturnsColumnsWithoutLazyFailure() throws Exception {
        String token = login();
        mockMvc.perform(get("/api/projects/" + projectId + "/kanban").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.A_FAIRE[0].titre").value("Auth SSO"))
                .andExpect(jsonPath("$.A_FAIRE[0].tagsCompetences[1]").value("SSO"));
    }

    private String login() throws Exception {
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","motDePasse":"Admin123!"}
                                """.formatted(adminEmail)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("accessToken").asText();
    }
}
