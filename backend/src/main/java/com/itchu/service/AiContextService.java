package com.itchu.service;

import com.itchu.domain.User;
import com.itchu.domain.enums.ProjectStatus;
import com.itchu.domain.enums.Role;
import com.itchu.domain.enums.TaskStatus;
import com.itchu.dto.ai.AiContextRequest;
import com.itchu.dto.ai.AiContextResponse;
import com.itchu.dto.meeting.MeetingActionResponse;
import com.itchu.dto.meeting.MeetingDecisionResponse;
import com.itchu.dto.meeting.MeetingResponse;
import com.itchu.dto.project.ProjectResponse;
import com.itchu.dto.task.TaskResponse;
import com.itchu.dto.user.UserResponse;
import com.itchu.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Construit un contexte compact pour le chatbot FastAPI.
 * Le champ {@code role} de la requête n'est jamais utilisé : les droits sont
 * toujours recalculés à partir de l'utilisateur chargé via {@code userId}.
 * Limitation : tant que React n'envoie pas le JWT jusqu'à Spring, un appelant
 * peut encore usurper un {@code userId}.
 */
@Service
public class AiContextService {

    private static final Logger log = LoggerFactory.getLogger(AiContextService.class);
    private static final int MAX_LINES = 15;

    private final UserService userService;
    private final ProjectService projectService;
    private final TaskService taskService;
    private final MeetingService meetingService;

    public AiContextService(
            UserService userService,
            ProjectService projectService,
            TaskService taskService,
            MeetingService meetingService) {
        this.userService = userService;
        this.projectService = projectService;
        this.taskService = taskService;
        this.meetingService = meetingService;
    }

    @Transactional(readOnly = true)
    public AiContextResponse build(AiContextRequest request) {
        Instant started = Instant.now();
        try {
            User user;
            try {
                user = userService.findEntity(request.userId());
            } catch (ResourceNotFoundException ex) {
                return timed(AiContextResponse.notFound("Utilisateur introuvable dans le systeme."), started);
            }

            boolean admin = user.getRole() == Role.ADMIN;
            String question = request.question() == null ? "" : request.question();
            String q = normalize(question);
            String intent = request.intent() == null || request.intent().isBlank()
                    ? detectIntent(q)
                    : request.intent().trim().toUpperCase(Locale.ROOT);

            log.info("Contexte IA intent={} admin={} userId={}", intent, admin, user.getId());

            AiContextResponse response = switch (intent) {
                case "ACTIVE_PROJECTS" -> activeProjects(admin, user.getId());
                case "LATE_PROJECTS" -> lateProjects(admin, user.getId());
                case "PROJECT_PROGRESS" -> projectProgress(question, admin, user.getId());
                case "PROJECT_MEMBERS" -> projectMembers(question, admin, user.getId());
                case "CRITICAL_TASKS" -> criticalTasks(admin, user.getId());
                case "OVERDUE_TASKS" -> overdueTasks(admin, user.getId());
                case "UNASSIGNED_TASKS" -> unassignedTasks(admin, user.getId());
                case "TASK_COUNT" -> taskCount(admin, user.getId());
                case "TASK_ASSIGNEE" -> taskAssignee(question, admin, user.getId());
                case "LATEST_MEETING" -> latestMeeting(question, admin, user.getId());
                case "MEETING_DECISIONS" -> meetingDecisions(question, admin, user.getId());
                case "ORPHAN_ACTIONS" -> orphanActions(admin, user.getId());
                default -> AiContextResponse.noIntent();
            };
            return timed(response, started);
        } catch (Exception ex) {
            log.error("Echec construction contexte IA", ex);
            return timed(AiContextResponse.error("Impossible de recuperer le contexte applicatif."), started);
        }
    }

    private AiContextResponse timed(AiContextResponse response, Instant started) {
        long ms = Duration.between(started, Instant.now()).toMillis();
        log.info(
                "Contexte IA status={} sources={} durationMs={}",
                response.status(),
                response.sourcesCount(),
                ms);
        return response;
    }

    private String detectIntent(String q) {
        boolean hasTask = containsAny(q, "tache", "taches");
        boolean hasProject = q.contains("projet");
        boolean hasMeeting = containsAny(q, "reunion", "reunions");
        if (containsAny(q, "action") && (containsWord(q, "sans")
                || containsAny(q, "pas encore", "aucune tache", "pas de tache", "non generee"))) {
            return "ORPHAN_ACTIONS";
        }
        if (containsAny(q, "decision", "decisions")) {
            return "MEETING_DECISIONS";
        }
        if (hasMeeting && containsAny(q, "derniere", "dernier", "recente")) {
            return "LATEST_MEETING";
        }
        if (hasProject && (containsAny(q, "travaille", "membre", "membres", "equipe") || containsWord(q, "qui"))) {
            return "PROJECT_MEMBERS";
        }
        if (hasTask && containsAny(q, "non assigne", "pas assigne", "sans responsable", "non assignee", "pas assignee")) {
            return "UNASSIGNED_TASKS";
        }
        if (hasTask && containsAny(q, "retard", "en retard")) {
            return "OVERDUE_TASKS";
        }
        if (hasTask && containsAny(q, "critique", "critiques", "urgente", "urgentes", "haute priorite", "prioritaires")) {
            return "CRITICAL_TASKS";
        }
        if (containsAny(q, "combien") && hasTask) {
            return "TASK_COUNT";
        }
        if (containsAny(q, "responsable") && hasTask) {
            return "TASK_ASSIGNEE";
        }
        if (hasProject && containsAny(q, "en cours", "actifs", "actif")) {
            return "ACTIVE_PROJECTS";
        }
        if (hasProject && containsAny(q, "retard") && !hasTask) {
            return "LATE_PROJECTS";
        }
        if (hasProject && containsAny(q, "avancement", "taux", "progression")) {
            return "PROJECT_PROGRESS";
        }
        if (hasMeeting) {
            return "LATEST_MEETING";
        }
        if (hasProject) {
            return "PROJECT_PROGRESS";
        }
        return "NO_INTENT";
    }

    private AiContextResponse activeProjects(boolean admin, Long userId) {
        List<ProjectResponse> projects = visibleProjects(admin, userId).stream()
                .filter(project -> project.statut() == ProjectStatus.ACTIF)
                .toList();
        if (projects.isEmpty()) {
            return AiContextResponse.notFound("Aucun projet actif n'est accessible pour cet utilisateur.");
        }
        StringBuilder context = new StringBuilder("Projets actifs :\n");
        int count = 0;
        for (ProjectResponse project : limit(projects)) {
            context.append(formatProject(project)).append('\n');
            count++;
        }
        return AiContextResponse.found(context.toString().trim(), count);
    }

    private AiContextResponse lateProjects(boolean admin, Long userId) {
        LocalDate today = LocalDate.now();
        List<ProjectResponse> projects = visibleProjects(admin, userId).stream()
                .filter(project -> project.statut() == ProjectStatus.ACTIF)
                .filter(project -> project.dateFinPrevue() != null && project.dateFinPrevue().isBefore(today))
                .toList();
        if (projects.isEmpty()) {
            return AiContextResponse.notFound("Aucun projet en retard n'est accessible pour cet utilisateur.");
        }
        StringBuilder context = new StringBuilder("Projets en retard (date de fin prevue depassee, statut ACTIF) :\n");
        int count = 0;
        for (ProjectResponse project : limit(projects)) {
            context.append(formatProject(project)).append('\n');
            count++;
        }
        return AiContextResponse.found(context.toString().trim(), count);
    }

    private AiContextResponse projectProgress(String question, boolean admin, Long userId) {
        Optional<ProjectResponse> match = findProjectInQuestion(question, admin, userId);
        if (match.isEmpty()) {
            String hinted = extractAfter(question, "projet");
            if (hinted.isBlank()) {
                return AiContextResponse.noIntent();
            }
            return AiContextResponse.notFound("Le projet " + hinted + " n'existe pas dans le systeme.");
        }
        ProjectResponse project = match.get();
        return AiContextResponse.found("Projet demande :\n" + formatProject(project), 1);
    }

    private AiContextResponse projectMembers(String question, boolean admin, Long userId) {
        Optional<ProjectResponse> match = findProjectInQuestion(question, admin, userId);
        if (match.isEmpty()) {
            String hinted = extractAfter(question, "projet");
            return AiContextResponse.notFound(
                    hinted.isBlank()
                            ? "Aucun projet correspondant n'a ete trouve."
                            : "Le projet " + hinted + " n'existe pas dans le systeme.");
        }
        ProjectResponse project = match.get();
        List<UserResponse> membres = project.membres() == null ? List.of() : project.membres();
        StringBuilder context = new StringBuilder("Membres du projet ")
                .append(project.nom())
                .append(" (createur : ")
                .append(fullName(project.createur()))
                .append(") :\n");
        if (membres.isEmpty()) {
            context.append("- Aucun membre associe.");
            return AiContextResponse.found(context.toString(), 1);
        }
        int count = 0;
        for (UserResponse member : limit(membres)) {
            context.append("- ").append(fullName(member));
            if (member.role() != null) {
                context.append(" (").append(member.role()).append(')');
            }
            context.append('\n');
            count++;
        }
        return AiContextResponse.found(context.toString().trim(), count);
    }

    private AiContextResponse criticalTasks(boolean admin, Long userId) {
        List<TaskResponse> tasks = visibleTasks(admin, userId).stream()
                .filter(task -> displayPriority(task.priorite()) >= 3.0)
                .toList();
        if (tasks.isEmpty()) {
            return AiContextResponse.notFound("Aucune tache critique n'est accessible pour cet utilisateur.");
        }
        return taskList("Taches critiques (priorite HAUTE ou CRITIQUE) :", tasks);
    }

    private AiContextResponse overdueTasks(boolean admin, Long userId) {
        LocalDate today = LocalDate.now();
        List<TaskResponse> tasks = visibleTasks(admin, userId).stream()
                .filter(task -> task.statut() != TaskStatus.TERMINEE)
                .filter(task -> task.echeance() != null && task.echeance().isBefore(today))
                .toList();
        if (tasks.isEmpty()) {
            return AiContextResponse.notFound("Aucune tache en retard n'est accessible pour cet utilisateur.");
        }
        return taskList("Taches en retard (echeance depassee, non terminees) :", tasks);
    }

    private AiContextResponse unassignedTasks(boolean admin, Long userId) {
        List<TaskResponse> tasks = visibleProjectTasks(admin, userId).stream()
                .filter(task -> task.responsable() == null)
                .toList();
        if (tasks.isEmpty()) {
            return AiContextResponse.notFound("Aucune tache non assignee n'est accessible pour cet utilisateur.");
        }
        List<TaskResponse> listed = limit(tasks);
        StringBuilder context = new StringBuilder("Taches non assignees (")
                .append(listed.size())
                .append(") :\n");
        for (TaskResponse task : listed) {
            context.append("- ")
                    .append(task.titre())
                    .append(" | ")
                    .append(task.projectNom())
                    .append(" | ")
                    .append(task.statut())
                    .append(" | ")
                    .append(task.echeance())
                    .append('\n');
        }
        return AiContextResponse.found(context.toString().trim(), listed.size());
    }

    private AiContextResponse taskCount(boolean admin, Long userId) {
        List<TaskResponse> tasks = visibleTasks(admin, userId);
        long open = tasks.stream().filter(task -> task.statut() != TaskStatus.TERMINEE).count();
        long done = tasks.stream().filter(task -> task.statut() == TaskStatus.TERMINEE).count();
        String context = "Nombre de taches accessibles : " + tasks.size()
                + " (non terminees : " + open + ", terminees : " + done + ").";
        return AiContextResponse.found(context, tasks.size());
    }

    private AiContextResponse taskAssignee(String question, boolean admin, Long userId) {
        List<TaskResponse> matches = findTasksInQuestion(question, visibleProjectTasks(admin, userId));
        if (matches.isEmpty()) {
            return AiContextResponse.notFound("Aucune tache correspondante n'a ete trouvee dans le systeme.");
        }
        if (matches.size() == 1) {
            return AiContextResponse.found("Tache demandee :\n" + formatTask(matches.get(0)), 1);
        }
        return taskList("Plusieurs taches correspondent a la question :", matches);
    }

    private AiContextResponse latestMeeting(String question, boolean admin, Long userId) {
        List<MeetingResponse> meetings = visibleMeetings(admin, userId);
        Optional<ProjectResponse> project = findProjectInQuestion(question, admin, userId);
        if (project.isPresent()) {
            Long projectId = project.get().id();
            meetings = meetings.stream().filter(meeting -> projectId.equals(meeting.projectId())).toList();
            if (meetings.isEmpty()) {
                return AiContextResponse.notFound(
                        "Aucune reunion n'est enregistree pour le projet " + project.get().nom() + ".");
            }
        } else if (normalize(question).contains("projet")) {
            String hinted = extractAfter(question, "projet");
            return AiContextResponse.notFound(
                    hinted.isBlank()
                            ? "Aucun projet correspondant n'a ete trouve."
                            : "Le projet " + hinted + " n'existe pas dans le systeme.");
        }
        Optional<MeetingResponse> latest = meetings.stream().max(Comparator.comparing(MeetingResponse::date));
        if (latest.isEmpty()) {
            return AiContextResponse.notFound("Aucune reunion n'est accessible pour cet utilisateur.");
        }
        return AiContextResponse.found("Derniere reunion :\n" + formatMeeting(latest.get()), 1);
    }

    private AiContextResponse meetingDecisions(String question, boolean admin, Long userId) {
        AiContextResponse latest = latestMeeting(question, admin, userId);
        if (!"FOUND".equals(latest.status())) {
            return latest;
        }
        List<MeetingResponse> meetings = visibleMeetings(admin, userId);
        Optional<ProjectResponse> project = findProjectInQuestion(question, admin, userId);
        if (project.isPresent()) {
            Long projectId = project.get().id();
            meetings = meetings.stream().filter(meeting -> projectId.equals(meeting.projectId())).toList();
        }
        MeetingResponse meeting = meetings.stream().max(Comparator.comparing(MeetingResponse::date)).orElse(null);
        if (meeting == null) {
            return AiContextResponse.notFound("Aucune reunion n'est accessible pour cet utilisateur.");
        }
        List<MeetingDecisionResponse> decisions = meeting.decisions() == null ? List.of() : meeting.decisions();
        if (decisions.isEmpty()) {
            return AiContextResponse.notFound("Aucune decision n'est enregistree pour la reunion " + meeting.titre() + ".");
        }
        StringBuilder context = new StringBuilder("Decisions de la reunion ")
                .append(meeting.titre())
                .append(" (")
                .append(meeting.date())
                .append(") :\n");
        int count = 0;
        for (MeetingDecisionResponse decision : limit(decisions)) {
            context.append("- ").append(decision.texteDecision());
            context.append(decision.statutTraite() ? " [traitee]" : " [non traitee]");
            context.append('\n');
            count++;
        }
        return AiContextResponse.found(context.toString().trim(), count);
    }

    private AiContextResponse orphanActions(boolean admin, Long userId) {
        List<MeetingActionResponse> actions = new ArrayList<>();
        for (MeetingResponse meeting : visibleMeetings(admin, userId)) {
            if (meeting.actions() == null) {
                continue;
            }
            for (MeetingActionResponse action : meeting.actions()) {
                if (action.taskGenereeId() == null) {
                    actions.add(action);
                }
            }
        }
        if (actions.isEmpty()) {
            return AiContextResponse.notFound("Aucune action de reunion sans tache generee n'est accessible.");
        }
        StringBuilder context = new StringBuilder("Actions de reunion sans tache generee :\n");
        int count = 0;
        for (MeetingActionResponse action : limit(actions)) {
            context.append("- ").append(action.texteAction());
            if (action.intervenantDetecte() != null) {
                context.append(" (intervenant : ").append(action.intervenantDetecte()).append(')');
            }
            context.append('\n');
            count++;
        }
        return AiContextResponse.found(context.toString().trim(), count);
    }

    private List<ProjectResponse> visibleProjects(boolean admin, Long userId) {
        return admin ? projectService.list() : projectService.listMine(userId);
    }

    private List<TaskResponse> visibleTasks(boolean admin, Long userId) {
        return admin ? taskService.list() : taskService.listMine(userId);
    }

    private List<TaskResponse> visibleProjectTasks(boolean admin, Long userId) {
        if (admin) {
            return taskService.list();
        }
        List<TaskResponse> tasks = new ArrayList<>();
        for (ProjectResponse project : projectService.listMine(userId)) {
            tasks.addAll(taskService.listByProject(project.id()));
        }
        return tasks;
    }

    private List<MeetingResponse> visibleMeetings(boolean admin, Long userId) {
        return admin ? meetingService.list() : meetingService.listMine(userId);
    }

    private Optional<ProjectResponse> findProjectInQuestion(String question, boolean admin, Long userId) {
        String nq = normalize(question);
        ProjectResponse best = null;
        int bestLength = 0;
        for (ProjectResponse project : visibleProjects(admin, userId)) {
            String name = normalize(project.nom());
            if (name.length() >= 4 && nq.contains(name) && name.length() > bestLength) {
                best = project;
                bestLength = name.length();
            }
        }
        return Optional.ofNullable(best);
    }

    private List<TaskResponse> findTasksInQuestion(String question, List<TaskResponse> tasks) {
        String nq = normalize(question);
        List<TaskResponse> contained = new ArrayList<>();
        int bestLength = 0;
        for (TaskResponse task : tasks) {
            String title = normalize(task.titre());
            if (title.length() < 6 || !nq.contains(title)) {
                continue;
            }
            if (title.length() > bestLength) {
                contained.clear();
                bestLength = title.length();
                contained.add(task);
            } else if (title.length() == bestLength) {
                contained.add(task);
            }
        }
        if (!contained.isEmpty()) {
            return contained;
        }

        List<TaskResponse> fuzzy = new ArrayList<>();
        int bestScore = 0;
        for (TaskResponse task : tasks) {
            int score = tokenOverlap(nq, normalize(task.titre()));
            String project = normalize(task.projectNom());
            if (!project.isBlank() && nq.contains(project)) {
                score += 3;
            }
            if (score < 2) {
                continue;
            }
            if (score > bestScore) {
                fuzzy.clear();
                bestScore = score;
                fuzzy.add(task);
            } else if (score == bestScore) {
                fuzzy.add(task);
            }
        }
        return fuzzy;
    }

    private static int tokenOverlap(String question, String title) {
        int score = 0;
        for (String token : title.split("[^a-z0-9]+")) {
            if (token.length() >= 4 && question.contains(token)) {
                score++;
            }
        }
        return score;
    }

    private AiContextResponse taskList(String header, List<TaskResponse> tasks) {
        StringBuilder context = new StringBuilder(header).append('\n');
        int count = 0;
        for (TaskResponse task : limit(tasks)) {
            context.append(formatTask(task)).append('\n');
            count++;
        }
        return AiContextResponse.found(context.toString().trim(), count);
    }

    private String formatProject(ProjectResponse project) {
        return "- Projet '" + project.nom()
                + "' (statut : " + project.statut()
                + ", priorite : " + project.priorite()
                + ", avancement : " + formatPercent(project.tauxAvancement())
                + ", debut : " + project.dateDebut()
                + ", fin prevue : " + project.dateFinPrevue()
                + ", createur : " + fullName(project.createur())
                + ", taches : " + project.tachesTerminees() + "/" + project.totalTaches()
                + ")";
    }

    private String formatTask(TaskResponse task) {
        String assignee = task.responsable() == null ? "non assigne" : fullName(task.responsable());
        return "- Tache '" + task.titre()
                + "' (projet : " + task.projectNom()
                + ", statut : " + task.statut()
                + ", priorite : " + priorityLabel(task.priorite())
                + ", echeance : " + task.echeance()
                + ", responsable : " + assignee
                + ")";
    }

    private String formatMeeting(MeetingResponse meeting) {
        StringBuilder builder = new StringBuilder("- Reunion '")
                .append(meeting.titre())
                .append("' (projet : ")
                .append(meeting.projectNom())
                .append(", date : ")
                .append(meeting.date())
                .append(")");
        if (meeting.resumeGenere() != null && !meeting.resumeGenere().isBlank()) {
            builder.append("\n  Resume : ").append(truncate(meeting.resumeGenere(), 280));
        }
        if (meeting.decisions() != null && !meeting.decisions().isEmpty()) {
            builder.append("\n  Decisions :");
            for (MeetingDecisionResponse decision : limit(meeting.decisions())) {
                builder.append("\n  - ").append(decision.texteDecision());
            }
        }
        return builder.toString();
    }

    private static String formatPercent(Double value) {
        if (value == null) {
            return "n/a";
        }
        if (Math.abs(value - Math.rint(value)) < 0.001) {
            return ((int) Math.rint(value)) + "%";
        }
        return value + "%";
    }

    private static String truncate(String value, int max) {
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max).trim() + "...";
    }

    private static String fullName(UserResponse user) {
        if (user == null) {
            return "inconnu";
        }
        return (user.prenom() + " " + user.nom()).trim();
    }

    private static double displayPriority(Double priorite) {
        if (priorite == null) {
            return 0;
        }
        if (priorite > 0 && priorite < 1) {
            return priorite * 4;
        }
        return priorite;
    }

    private static String priorityLabel(Double priorite) {
        double value = displayPriority(priorite);
        if (value >= 4) {
            return "CRITIQUE";
        }
        if (value >= 3) {
            return "HAUTE";
        }
        if (value >= 2) {
            return "MOYENNE";
        }
        if (value > 0) {
            return "BASSE";
        }
        return "NON_DEFINIE";
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        String normalized = Normalizer.normalize(value.toLowerCase(Locale.FRENCH), Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}+", "");
    }

    private static boolean containsAny(String haystack, String... needles) {
        for (String needle : needles) {
            if (haystack.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private static boolean containsWord(String haystack, String word) {
        int from = 0;
        while (true) {
            int index = haystack.indexOf(word, from);
            if (index < 0) {
                return false;
            }
            boolean beforeOk = index == 0 || !Character.isLetterOrDigit(haystack.charAt(index - 1));
            int end = index + word.length();
            boolean afterOk = end >= haystack.length() || !Character.isLetterOrDigit(haystack.charAt(end));
            if (beforeOk && afterOk) {
                return true;
            }
            from = index + 1;
        }
    }

    private static String extractAfter(String question, String marker) {
        String normalizedQuestion = normalize(question);
        String normalizedMarker = normalize(marker);
        int index = normalizedQuestion.indexOf(normalizedMarker);
        if (index < 0) {
            return question.trim();
        }
        String rest = question.substring(Math.min(question.length(), index + marker.length())).trim();
        rest = rest.replaceAll("^[?.,:;]+", "").trim();
        rest = rest.replaceAll("[?.,:;]+$", "").trim();
        if (rest.length() > 80) {
            rest = rest.substring(0, 80).trim();
        }
        return rest.isBlank() ? question.trim() : rest;
    }

    private static <T> List<T> limit(List<T> source) {
        if (source.size() <= MAX_LINES) {
            return source;
        }
        return source.subList(0, MAX_LINES);
    }
}
