package com.itchu.config;

import com.itchu.domain.AuditLog;
import com.itchu.domain.Meeting;
import com.itchu.domain.MeetingAction;
import com.itchu.domain.MeetingDecision;
import com.itchu.domain.Notification;
import com.itchu.domain.Project;
import com.itchu.domain.ProjectMember;
import com.itchu.domain.Task;
import com.itchu.domain.TaskHistory;
import com.itchu.domain.User;
import com.itchu.domain.WorkloadSnapshot;
import com.itchu.domain.enums.MeetingProcessingStatus;
import com.itchu.domain.enums.NotificationType;
import com.itchu.domain.enums.ProjectPriority;
import com.itchu.domain.enums.ProjectStatus;
import com.itchu.domain.enums.Role;
import com.itchu.domain.enums.TaskStatus;
import com.itchu.repository.AuditLogRepository;
import com.itchu.repository.MeetingActionRepository;
import com.itchu.repository.MeetingDecisionRepository;
import com.itchu.repository.MeetingRepository;
import com.itchu.repository.NotificationRepository;
import com.itchu.repository.ProjectMemberRepository;
import com.itchu.repository.ProjectRepository;
import com.itchu.repository.TaskHistoryRepository;
import com.itchu.repository.TaskRepository;
import com.itchu.repository.UserRepository;
import com.itchu.repository.WorkloadSnapshotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
@Profile({"docker", "dev"})
public class DatabaseSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final TaskHistoryRepository taskHistoryRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingActionRepository meetingActionRepository;
    private final MeetingDecisionRepository meetingDecisionRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final WorkloadSnapshotRepository workloadSnapshotRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    public DatabaseSeeder(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            TaskRepository taskRepository,
            TaskHistoryRepository taskHistoryRepository,
            MeetingRepository meetingRepository,
            MeetingActionRepository meetingActionRepository,
            MeetingDecisionRepository meetingDecisionRepository,
            NotificationRepository notificationRepository,
            AuditLogRepository auditLogRepository,
            WorkloadSnapshotRepository workloadSnapshotRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.taskRepository = taskRepository;
        this.taskHistoryRepository = taskHistoryRepository;
        this.meetingRepository = meetingRepository;
        this.meetingActionRepository = meetingActionRepository;
        this.meetingDecisionRepository = meetingDecisionRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.workloadSnapshotRepository = workloadSnapshotRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!seedEnabled) {
            return;
        }

        if (userRepository.count() == 0) {
            log.info("Initialisation des donnees de demonstration IT-CHU Manager...");

            List<User> admins = seedAdmins();
            List<User> members = seedMembers();
            User admin = admins.getFirst();

            List<Project> projects = seedProjects(admin, members);
            seedProjectMembers(projects, admins, members);
            List<Task> tasks = seedTasks(projects, members);
            seedTaskHistory(tasks, admin);
            seedMeetings(projects, members, tasks);
            seedNotifications(members);
            seedAuditLogs(admin, projects.getFirst());
            seedWorkloadSnapshots(members);

            log.info(
                    "Seed termine : {} users, {} projects, {} tasks, {} meetings",
                    userRepository.count(),
                    projectRepository.count(),
                    taskRepository.count(),
                    meetingRepository.count());
        }

        seedAdditiveTestDataset();
    }

    private List<User> seedAdmins() {
        List<User> admins = new ArrayList<>();
        admins.add(createUser("Benali", "Karim", "admin@chu.local", Role.ADMIN, List.of("Gestion", "Java", "Spring")));
        admins.add(createUser("Lamrani", "Sara", "chef.projet@chu.local", Role.ADMIN, List.of("Pilotage", "Agile", "MySQL")));
        return userRepository.saveAll(admins);
    }

    private List<User> seedMembers() {
        List<User> members = new ArrayList<>();
        members.add(createUser("Alaoui", "Youssef", "youssef.alaoui@chu.local", Role.MEMBRE, List.of("Java", "Spring", "MySQL")));
        members.add(createUser("Berrada", "Nadia", "nadia.berrada@chu.local", Role.MEMBRE, List.of("React", "TypeScript", "UI")));
        members.add(createUser("Chakir", "Omar", "omar.chakir@chu.local", Role.MEMBRE, List.of("DevOps", "Docker", "CI/CD")));
        members.add(createUser("Daoudi", "Imane", "imane.daoudi@chu.local", Role.MEMBRE, List.of("Python", "FastAPI", "Securite")));
        members.add(createUser("Fassi", "Mehdi", "mehdi.fassi@chu.local", Role.MEMBRE, List.of("MySQL", "SQL", "Reporting")));
        members.add(createUser("Ghazi", "Leila", "leila.ghazi@chu.local", Role.MEMBRE, List.of("Tests", "QA", "Documentation")));
        return userRepository.saveAll(members);
    }

    private User createUser(String nom, String prenom, String email, Role role, List<String> competences) {
        User user = new User();
        user.setNom(nom);
        user.setPrenom(prenom);
        user.setEmail(email);
        user.setMotDePasse(passwordEncoder.encode(role == Role.ADMIN ? "Admin123!" : "Member123!"));
        user.setRole(role);
        user.setCompetences(competences);
        user.setDateCreation(LocalDateTime.now().minusDays(90));
        user.setActif(true);
        return user;
    }

    private List<Project> seedProjects(User admin, List<User> members) {
        List<Project> projects = new ArrayList<>();

        projects.add(buildProject(
                "Portail Patient Unifie",
                "Refonte du portail patient avec authentification renforcee et suivi des rendez-vous.",
                ProjectStatus.ACTIF,
                ProjectPriority.HAUTE,
                LocalDate.now().minusMonths(2),
                LocalDate.now().plusMonths(4),
                0.42,
                38.0,
                admin));

        projects.add(buildProject(
                "Migration SI Laboratoire",
                "Migration des applications laboratoire vers une architecture conteneurisee.",
                ProjectStatus.ACTIF,
                ProjectPriority.CRITIQUE,
                LocalDate.now().minusMonths(1),
                LocalDate.now().plusMonths(2),
                0.61,
                52.0,
                admin));

        projects.add(buildProject(
                "Dashboard Qualite SI",
                "Tableaux de bord qualite pour le suivi des incidents et SLA internes.",
                ProjectStatus.EN_PAUSE,
                ProjectPriority.MOYENNE,
                LocalDate.now().minusMonths(3),
                LocalDate.now().plusMonths(1),
                0.28,
                71.0,
                admin));

        projects.add(buildProject(
                "Archivage Dossiers Medicaux",
                "Projet d'archivage electronique des dossiers medicaux historiques.",
                ProjectStatus.TERMINE,
                ProjectPriority.BASSE,
                LocalDate.now().minusMonths(8),
                LocalDate.now().minusMonths(1),
                0.12,
                100.0,
                admin));

        return projectRepository.saveAll(projects);
    }

    private Project buildProject(
            String nom,
            String description,
            ProjectStatus statut,
            ProjectPriority priorite,
            LocalDate debut,
            LocalDate fin,
            double risque,
            double avancement,
            User createur) {
        Project project = new Project();
        project.setNom(nom);
        project.setDescription(description);
        project.setStatut(statut);
        project.setPriorite(priorite);
        project.setDateDebut(debut);
        project.setDateFinPrevue(fin);
        project.setScoreRisque(risque);
        project.setTauxAvancement(avancement);
        project.setCreateur(createur);
        return project;
    }

    private void seedProjectMembers(List<Project> projects, List<User> admins, List<User> members) {
        addMembers(projects.get(0), List.of(members.get(0), members.get(1), members.get(2), admins.get(1)));
        addMembers(projects.get(1), List.of(members.get(0), members.get(2), members.get(3), members.get(4)));
        addMembers(projects.get(2), List.of(members.get(1), members.get(5), admins.get(1)));
        addMembers(projects.get(3), List.of(members.get(4), members.get(5)));
    }

    private void addMembers(Project project, List<User> users) {
        for (User user : users) {
            ProjectMember member = new ProjectMember();
            member.setProject(project);
            member.setUser(user);
            projectMemberRepository.save(member);
        }
    }

    private List<Task> seedTasks(List<Project> projects, List<User> members) {
        List<Task> tasks = new ArrayList<>();
        LocalDate today = LocalDate.now();

        tasks.addAll(List.of(
                buildTask(projects.get(0), "Modeliser le schema MySQL patient", "Concevoir le modele relationnel.", TaskStatus.TERMINEE, 0.82, today.minusDays(20), members.get(0), 12.0, List.of("MySQL", "SQL")),
                buildTask(projects.get(0), "Implementer API authentification", "Endpoints login/refresh JWT.", TaskStatus.EN_COURS, 0.91, today.plusDays(3), members.get(0), 16.0, List.of("Java", "Spring")),
                buildTask(projects.get(0), "Developper ecran accueil portail", "UI responsive avec Shadcn.", TaskStatus.EN_COURS, 0.76, today.plusDays(5), members.get(1), 10.0, List.of("React", "UI")),
                buildTask(projects.get(0), "Integrer notifications email", "Envoi SMTP pour rappels RDV.", TaskStatus.A_FAIRE, 0.64, today.plusDays(10), members.get(2), 8.0, List.of("DevOps")),
                buildTask(projects.get(0), "Rediger guide utilisateur", "Documentation fonctionnelle portail.", TaskStatus.EN_REVUE, 0.55, today.plusDays(2), members.get(5), 6.0, List.of("Documentation")),
                buildTask(projects.get(0), "Tests de charge API", "Scenario 500 utilisateurs concurrents.", TaskStatus.A_FAIRE, 0.70, today.plusDays(14), members.get(5), 12.0, List.of("Tests")),
                buildTask(projects.get(0), "Audit securite OWASP", "Revue des failles Top 10.", TaskStatus.A_FAIRE, 0.88, today.plusDays(1), members.get(3), 8.0, List.of("Securite")),
                buildTask(projects.get(0), "Configurer pipeline CI/CD", "GitHub Actions + Docker.", TaskStatus.EN_COURS, 0.73, today.plusDays(4), members.get(2), 10.0, List.of("CI/CD", "Docker"))));

        tasks.addAll(List.of(
                buildTask(projects.get(1), "Inventaire applications legacy", "Cartographie des dependances.", TaskStatus.TERMINEE, 0.79, today.minusDays(15), members.get(4), 14.0, List.of("SQL", "Reporting")),
                buildTask(projects.get(1), "Preparer cluster Kubernetes", "Namespaces et quotas CHU.", TaskStatus.EN_COURS, 0.93, today.minusDays(1), members.get(2), 20.0, List.of("DevOps", "Docker")),
                buildTask(projects.get(1), "Migrer service resultats", "Deploiement conteneur FastAPI.", TaskStatus.EN_COURS, 0.86, today.plusDays(2), members.get(3), 18.0, List.of("Python", "FastAPI")),
                buildTask(projects.get(1), "Adapter connecteurs HL7", "Parser messages ADT/ORU.", TaskStatus.A_FAIRE, 0.84, today.plusDays(6), members.get(0), 16.0, List.of("Java")),
                buildTask(projects.get(1), "Plan de reprise activite", "Documentation PRA laboratoire.", TaskStatus.A_FAIRE, 0.67, today.plusDays(12), members.get(4), 8.0, List.of("Reporting")),
                buildTask(projects.get(1), "Former equipe exploitation", "Sessions handover N2/N3.", TaskStatus.A_FAIRE, 0.58, today.plusDays(20), members.get(5), 6.0, List.of("Documentation")),
                buildTask(projects.get(1), "Valider performance batch", "Tests nocturnes sur 100k messages.", TaskStatus.EN_REVUE, 0.80, today, members.get(3), 12.0, List.of("Tests")),
                buildTask(projects.get(1), "Synchroniser referentiel medecins", "ETL depuis annuaire RH.", TaskStatus.EN_COURS, 0.77, today.plusDays(3), members.get(4), 10.0, List.of("MySQL", "SQL"))));

        tasks.addAll(List.of(
                buildTask(projects.get(2), "Consolider KPI incidents", "Requetes SQL sur ticket tool.", TaskStatus.TERMINEE, 0.71, today.minusDays(30), members.get(4), 8.0, List.of("SQL")),
                buildTask(projects.get(2), "Prototyper dashboard Recharts", "Maquettes graphiques SLA.", TaskStatus.A_FAIRE, 0.62, today.plusDays(15), members.get(1), 10.0, List.of("React")),
                buildTask(projects.get(2), "Aligner metriques avec RSSI", "Atelier cadrage securite.", TaskStatus.A_FAIRE, 0.59, today.plusDays(25), members.get(5), 4.0, List.of("Documentation")),
                buildTask(projects.get(2), "Documenter dictionnaire KPI", "Glossaire partage equipe.", TaskStatus.EN_COURS, 0.54, today.plusDays(8), members.get(5), 6.0, List.of("Documentation")),
                buildTask(projects.get(2), "Automatiser export mensuel", "Job planifie PDF/CSV.", TaskStatus.A_FAIRE, 0.66, today.plusDays(18), members.get(4), 8.0, List.of("Reporting")),
                buildTask(projects.get(2), "Revue charte graphique CHU", "Validation direction communication.", TaskStatus.A_FAIRE, 0.48, today.plusDays(30), members.get(1), 4.0, List.of("UI"))));

        tasks.addAll(List.of(
                buildTask(projects.get(3), "Indexer dossiers papier", "Numerisation batch 2018-2020.", TaskStatus.TERMINEE, 0.45, today.minusDays(60), members.get(4), 40.0, List.of("SQL")),
                buildTask(projects.get(3), "Controler qualite OCR", "Echantillonnage 5% dossiers.", TaskStatus.TERMINEE, 0.50, today.minusDays(45), members.get(5), 20.0, List.of("Tests")),
                buildTask(projects.get(3), "Cloturer contrat prestataire", "PV de recette signe.", TaskStatus.TERMINEE, 0.40, today.minusDays(30), members.get(5), 4.0, List.of("Documentation")),
                buildTask(projects.get(3), "Archiver serveur temporaire", "Decommissionnement VM.", TaskStatus.TERMINEE, 0.42, today.minusDays(20), members.get(4), 6.0, List.of("DevOps")),
                buildTask(projects.get(3), "Restituer bilan projet", "Presentation comite direction.", TaskStatus.TERMINEE, 0.38, today.minusDays(10), members.get(5), 3.0, List.of("Documentation")),
                buildTask(projects.get(3), "Purger donnees intermediaires", "Nettoyage espace stockage.", TaskStatus.TERMINEE, 0.35, today.minusDays(5), members.get(4), 5.0, List.of("SQL")),
                buildTask(projects.get(3), "Mettre a jour CMDB", "Enregistrer actifs finaux.", TaskStatus.TERMINEE, 0.33, today.minusDays(2), members.get(4), 2.0, List.of("Reporting")),
                buildTask(projects.get(3), "Conserver trace audit", "Export logs vers SIEM.", TaskStatus.TERMINEE, 0.36, today.minusDays(1), members.get(4), 2.0, List.of("Securite"))));

        return taskRepository.saveAll(tasks);
    }

    private Task buildTask(
            Project project,
            String titre,
            String description,
            TaskStatus statut,
            double priorite,
            LocalDate echeance,
            User responsable,
            double heures,
            List<String> tags) {
        Task task = new Task();
        task.setProject(project);
        task.setTitre(titre);
        task.setDescription(description);
        task.setStatut(statut);
        task.setPriorite(priorite);
        task.setEcheance(echeance);
        task.setResponsable(responsable);
        task.setHeuresEstimees(heures);
        task.setTagsCompetences(tags);
        return task;
    }

    private void seedTaskHistory(List<Task> tasks, User admin) {
        for (Task task : tasks.stream().filter(t -> t.getStatut() != TaskStatus.A_FAIRE).limit(8).toList()) {
            TaskHistory history = new TaskHistory();
            history.setTask(task);
            history.setAncienStatut(TaskStatus.A_FAIRE);
            history.setNouveauStatut(task.getStatut());
            history.setAuteur(admin);
            history.setDateChangement(LocalDateTime.now().minusDays(5));
            taskHistoryRepository.save(history);
        }
    }

    private void seedMeetings(List<Project> projects, List<User> members, List<Task> tasks) {
        Meeting m1 = buildMeeting(
                projects.get(0),
                "Point hebdo Portail Patient",
                LocalDateTime.now().minusDays(7),
                Set.of(members.get(0), members.get(1), members.get(2)),
                "Avancement sprint, blocages securite, planning recette.",
                """
                Karim : Bonjour a tous, on ouvre le point hebdomadaire portail patient.
                Youssef : L'API authentification est presque terminee, je livre jeudi.
                Nadia : L'ecran d'accueil est en cours, j'aurai besoin des maquettes validees.
                Omar : Je configure le pipeline CI/CD cette semaine.
                Karim : Il est decide que la recette utilisateur demarrera le 25 du mois.
                Youssef : Je m'occupe de preparer le plan de tests de charge.
                """,
                MeetingProcessingStatus.TERMINE);

        Meeting m2 = buildMeeting(
                projects.get(1),
                "Comite migration laboratoire",
                LocalDateTime.now().minusDays(5),
                Set.of(members.get(2), members.get(3), members.get(4)),
                "Risques migration, fenetre de bascule, dependencies HL7.",
                """
                Sara : Nous devons confirmer la fenetre de bascule du service resultats.
                Omar : Le cluster est pret, il reste les quotas reseau a valider.
                Imane : Le connecteur HL7 necessite deux jours de tests supplementaires.
                Mehdi : Le referentiel medecins sera synchronise avant la bascule.
                Sara : Il est acte que la migration aura lieu un week-end du mois prochain.
                Imane : Je prepare la checklist de validation post-bascule.
                """,
                MeetingProcessingStatus.TERMINE);

        Meeting m3 = buildMeeting(
                projects.get(0),
                "Revue securite portail",
                LocalDateTime.now().minusDays(2),
                Set.of(members.get(0), members.get(3)),
                "Audit OWASP, tokens JWT, durcissement headers.",
                """
                Karim : Point securite sur le portail patient.
                Imane : Deux findings medium sur la gestion des refresh tokens.
                Youssef : Je corrige la rotation des tokens avant vendredi.
                Karim : Valide, on lance un audit complet apres correction.
                """,
                MeetingProcessingStatus.EN_ATTENTE);

        Meeting m4 = buildMeeting(
                projects.get(2),
                "Atelier KPI qualite SI",
                LocalDateTime.now().minusDays(10),
                Set.of(members.get(1), members.get(4), members.get(5)),
                "Definition KPI, sources de donnees, calendrier publication.",
                """
                Sara : Atelier KPI pour le dashboard qualite.
                Nadia : Je propose de commencer par le taux de resolution sous 48h.
                Mehdi : Les donnees incidents sont fiables depuis janvier.
                Leila : Je documente le dictionnaire KPI cette semaine.
                """,
                MeetingProcessingStatus.TERMINE);

        Meeting m5 = buildMeeting(
                projects.get(1),
                "Preparation handover exploitation",
                LocalDateTime.now().minusDays(1),
                Set.of(members.get(2), members.get(5)),
                "Transfert connaissance N2/N3, documentation runbook.",
                """
                Omar : Session handover pour l'equipe exploitation.
                Leila : Le runbook couvre deja le demarrage et l'arret des services.
                Omar : Il faut ajouter la procedure de rollback migration.
                Leila : Je mets a jour le runbook avant la prochaine reunion.
                """,
                MeetingProcessingStatus.EN_COURS);

        List<Meeting> meetings = meetingRepository.saveAll(List.of(m1, m2, m3, m4, m5));

        meetingActionRepository.saveAll(List.of(
                action(meetings.get(0), "Preparer le plan de tests de charge", "Youssef", LocalDate.now().plusDays(5), tasks.get(1)),
                action(meetings.get(1), "Finaliser la checklist post-bascule", "Imane", LocalDate.now().plusDays(7), null),
                action(meetings.get(2), "Corriger la rotation des refresh tokens", "Youssef", LocalDate.now().plusDays(2), tasks.get(1))));

        meetingDecisionRepository.saveAll(List.of(
                decision(meetings.get(0), "La recette utilisateur demarre le 25 du mois.", true),
                decision(meetings.get(1), "La migration laboratoire est planifiee un week-end du mois prochain.", true),
                decision(meetings.get(2), "Un audit OWASP complet sera lance apres correction des tokens.", false),
                decision(meetings.get(4), "Le runbook inclura une procedure de rollback.", false)));
    }

    private Meeting buildMeeting(
            Project project,
            String titre,
            LocalDateTime date,
            Set<User> participants,
            String ordreDuJour,
            String transcription,
            MeetingProcessingStatus statut) {
        Meeting meeting = new Meeting();
        meeting.setProject(project);
        meeting.setTitre(titre);
        meeting.setDate(date);
        meeting.setParticipants(new LinkedHashSet<>(participants));
        meeting.setOrdreDuJour(ordreDuJour);
        meeting.setTranscriptionBrute(transcription.strip());
        meeting.setStatutTraitement(statut);
        if (statut == MeetingProcessingStatus.TERMINE) {
            meeting.setResumeGenere("Compte rendu provisoire genere lors du seed — pipeline IA a venir.");
        }
        return meeting;
    }

    private MeetingAction action(Meeting meeting, String texte, String intervenant, LocalDate date, Task task) {
        MeetingAction action = new MeetingAction();
        action.setMeeting(meeting);
        action.setTexteAction(texte);
        action.setIntervenantDetecte(intervenant);
        action.setDateDetectee(date);
        action.setTaskGeneree(task);
        return action;
    }

    private MeetingDecision decision(Meeting meeting, String texte, boolean traite) {
        MeetingDecision decision = new MeetingDecision();
        decision.setMeeting(meeting);
        decision.setTexteDecision(texte);
        decision.setStatutTraite(traite);
        return decision;
    }

    private void seedNotifications(List<User> members) {
        notificationRepository.saveAll(List.of(
                notify(members.get(2), NotificationType.SURCHARGE, "Charge elevee detectee sur le cluster migration.", "/dashboard"),
                notify(members.get(0), NotificationType.RETARD, "La tache API authentification approche de son echeance.", "/tasks"),
                notify(members.get(3), NotificationType.DECISION_NON_TRAITEE, "Decision securite en attente de traitement.", "/meetings"),
                notify(members.get(1), NotificationType.TACHE, "Maquette accueil portail a valider.", "/tasks")));
    }

    private Notification notify(User user, NotificationType type, String message, String lien) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setMessage(message);
        notification.setLienReference(lien);
        notification.setLu(false);
        return notification;
    }

    private void seedAuditLogs(User admin, Project project) {
        AuditLog logEntry = new AuditLog();
        logEntry.setUser(admin);
        logEntry.setTypeAction("SEED_DEMO");
        logEntry.setEntiteCible("Project");
        logEntry.setIdEntiteCible(project.getId());
        logEntry.setDetail("Initialisation du jeu de donnees de demonstration");
        auditLogRepository.save(logEntry);
    }

    private void seedWorkloadSnapshots(List<User> members) {
        LocalDate today = LocalDate.now();
        for (int i = 0; i < members.size(); i++) {
            WorkloadSnapshot snapshot = new WorkloadSnapshot();
            snapshot.setUser(members.get(i));
            snapshot.setDate(today.minusDays(1));
            snapshot.setTauxCharge(55.0 + (i * 8.5));
            workloadSnapshotRepository.save(snapshot);
        }
    }

    /**
     * Jeu de test additif (DSI fictif). Idempotent : ne recree pas les emails / noms deja presents.
     * Ne supprime aucune donnee existante.
     */
    private void seedAdditiveTestDataset() {
        log.info("Verification du jeu de test additif IT-CHU...");

        User amine = findOrCreateUser(
                "El Idrissi", "Amine", "amine.elidrissi@chu.local", Role.ADMIN,
                List.of("Pilotage", "Agile"));
        User youssef = findOrCreateUser(
                "Alami", "Youssef", "youssef.alami@chu.local", Role.MEMBRE,
                List.of("Reseau", "Pare-feu"));
        User sanaa = findOrCreateUser(
                "Chraibi", "Sanaa", "sanaa.chraibi@chu.local", Role.MEMBRE,
                List.of("Java", "API", "Tests"));
        User salma = findOrCreateUser(
                "Bennani", "Salma", "salma.bennani@chu.local", Role.MEMBRE,
                List.of("DevOps", "Linux"));
        User mehdi = findOrCreateUser(
                "Alaoui", "Mehdi", "mehdi.alaoui@chu.local", Role.MEMBRE,
                List.of("MySQL", "Securite"));

        LocalDate today = LocalDate.now();

        Project refonte = findOrCreateProject(
                "Refonte SI Hospitalier",
                "Modernisation du SI interne DSI : API, tests et déploiement (jeu de test fictif).",
                ProjectStatus.ACTIF,
                ProjectPriority.HAUTE,
                today.minusMonths(3),
                today.plusMonths(2),
                0.40,
                45.0,
                amine);
        Project securisation = findOrCreateProject(
                "Sécurisation DSI & Logs",
                "Durcissement des accès administrateurs et centralisation des journaux DSI (jeu de test fictif).",
                ProjectStatus.ACTIF,
                ProjectPriority.CRITIQUE,
                today.minusMonths(1),
                today.plusMonths(1),
                0.55,
                28.0,
                amine);
        Project reseau = findOrCreateProject(
                "Modernisation Infrastructure Réseau",
                "Renouvellement du cœur de réseau DSI et documentation d'exploitation (jeu de test fictif).",
                ProjectStatus.TERMINE,
                ProjectPriority.MOYENNE,
                today.minusMonths(8),
                today.minusMonths(1),
                0.15,
                100.0,
                amine);
        Project migration = findOrCreateProject(
                "Migration des Applications Internes",
                "Conteneurisation des applications internes DSI (jeu de test fictif, projet en retard).",
                ProjectStatus.ACTIF,
                ProjectPriority.HAUTE,
                today.minusMonths(4),
                today.minusDays(10),
                0.48,
                55.0,
                amine);

        ensureMember(refonte, amine);
        ensureMember(refonte, sanaa);
        ensureMember(refonte, salma);
        ensureMember(refonte, mehdi);

        ensureMember(securisation, amine);
        ensureMember(securisation, youssef);
        ensureMember(securisation, mehdi);

        ensureMember(reseau, youssef);
        ensureMember(reseau, salma);

        ensureMember(migration, amine);
        ensureMember(migration, sanaa);
        ensureMember(migration, salma);

        Task analyseExistant = findOrCreateTask(
                refonte, "Analyse de l'existant SI", "Cartographie applicative DSI.",
                TaskStatus.TERMINEE, 2.0, today.minusDays(40), sanaa, 12.0, List.of("Java"));
        Task apiDossier = findOrCreateTask(
                refonte, "Developpement API dossier", "API interne de suivi des tickets DSI.",
                TaskStatus.EN_COURS, 3.0, today.plusDays(5), sanaa, 16.0, List.of("Java", "API"));
        Task revueApi = findOrCreateTask(
                refonte, "Revue technique API", "Revue de code avant recette.",
                TaskStatus.EN_REVUE, 2.0, today.plusDays(3), mehdi, 6.0, List.of("Java"));
        Task testsCharge = findOrCreateTask(
                refonte, "Tests de charge API", "Scenarios de charge avant deploiement.",
                TaskStatus.A_FAIRE, 3.0, today.plusDays(14), sanaa, 10.0, List.of("Tests"));
        findOrCreateTask(
                refonte, "Deploiement preproduction", "Mise en place de l'environnement de preprod DSI.",
                TaskStatus.A_FAIRE, 3.0, today.plusDays(21), salma, 8.0, List.of("DevOps"));
        findOrCreateTask(
                refonte, "Redaction guide utilisateur", "Guide interne pour l'equipe DSI.",
                TaskStatus.A_FAIRE, 1.0, today.plusDays(30), null, 6.0, List.of("Documentation"));

        Task cartoLogs = findOrCreateTask(
                securisation, "Cartographie des journaux", "Inventaire des sources de logs DSI.",
                TaskStatus.TERMINEE, 2.0, today.minusDays(15), mehdi, 8.0, List.of("MySQL"));
        Task durcissement = findOrCreateTask(
                securisation, "Durcissement authentification admin", "Renforcement des acces administrateurs.",
                TaskStatus.EN_COURS, 4.0, today.minusDays(2), mehdi, 12.0, List.of("Securite"));
        findOrCreateTask(
                securisation, "Centralisation logs SIEM", "Collecte centralisee des journaux DSI.",
                TaskStatus.EN_COURS, 4.0, today.plusDays(3), youssef, 14.0, List.of("Securite"));
        findOrCreateTask(
                securisation, "Mise a niveau du pare-feu", "Mise a jour des regles du pare-feu DSI.",
                TaskStatus.EN_COURS, 4.0, today.plusDays(8), youssef, 10.0, List.of("Pare-feu"));
        findOrCreateTask(
                securisation, "Revue des acces BDD", "Controle des comptes d'administration base de donnees.",
                TaskStatus.A_FAIRE, 3.0, today.plusDays(7), null, 8.0, List.of("MySQL", "Securite"));
        findOrCreateTask(
                securisation, "Plan de reponse incident", "Procedure interne de reponse aux incidents DSI.",
                TaskStatus.A_FAIRE, 2.0, today.plusDays(20), null, 6.0, List.of("Documentation"));

        Task switchCoeur = findOrCreateTask(
                reseau, "Remplacement switch coeur", "Remplacement du switch coeur du datacenter DSI.",
                TaskStatus.TERMINEE, 2.0, today.minusDays(60), youssef, 20.0, List.of("Reseau"));
        findOrCreateTask(
                reseau, "Segmentation VLAN", "Decoupage VLAN des reseaux d'administration.",
                TaskStatus.TERMINEE, 2.0, today.minusDays(40), youssef, 12.0, List.of("Reseau"));
        findOrCreateTask(
                reseau, "Tests de bascule reseau", "Tests de bascule et de reprise.",
                TaskStatus.TERMINEE, 2.0, today.minusDays(25), salma, 8.0, List.of("Tests", "Reseau"));
        findOrCreateTask(
                reseau, "Documentation topologie", "Schemas d'exploitation reseau DSI.",
                TaskStatus.TERMINEE, 1.0, today.minusDays(15), salma, 6.0, List.of("Documentation"));

        Task inventaireApps = findOrCreateTask(
                migration, "Inventaire applications internes", "Liste des applications DSI a migrer.",
                TaskStatus.TERMINEE, 2.0, today.minusDays(60), sanaa, 10.0, List.of("Documentation"));
        Task batchRh = findOrCreateTask(
                migration, "Conteneurisation batch RH", "Emballage Docker du batch interne RH.",
                TaskStatus.EN_COURS, 3.0, today.minusDays(5), salma, 16.0, List.of("DevOps", "Linux"));
        Task recetteMetier = findOrCreateTask(
                migration, "Tests recette metier", "Recette fonctionnelle des applications migrees.",
                TaskStatus.EN_REVUE, 3.0, today.plusDays(2), sanaa, 8.0, List.of("Tests"));
        findOrCreateTask(
                migration, "Coupe-over production", "Bascule de production des applications internes.",
                TaskStatus.A_FAIRE, 4.0, today.plusDays(10), salma, 12.0, List.of("DevOps"));
        findOrCreateTask(
                migration, "Documentation migration", "Runbook de bascule pour l'equipe DSI.",
                TaskStatus.A_FAIRE, 1.0, today.plusDays(15), null, 4.0, List.of("Documentation"));

        ensureHistory(analyseExistant, amine, List.of(TaskStatus.A_FAIRE, TaskStatus.EN_COURS, TaskStatus.TERMINEE));
        ensureHistory(apiDossier, amine, List.of(TaskStatus.A_FAIRE, TaskStatus.EN_COURS));
        ensureHistory(revueApi, amine, List.of(TaskStatus.A_FAIRE, TaskStatus.EN_COURS, TaskStatus.EN_REVUE));
        ensureHistory(cartoLogs, amine, List.of(TaskStatus.A_FAIRE, TaskStatus.EN_COURS, TaskStatus.TERMINEE));
        ensureHistory(durcissement, amine, List.of(TaskStatus.A_FAIRE, TaskStatus.EN_COURS));
        ensureHistory(switchCoeur, amine, List.of(TaskStatus.A_FAIRE, TaskStatus.EN_COURS, TaskStatus.EN_REVUE, TaskStatus.TERMINEE));
        ensureHistory(inventaireApps, amine, List.of(TaskStatus.A_FAIRE, TaskStatus.EN_COURS, TaskStatus.TERMINEE));
        ensureHistory(batchRh, amine, List.of(TaskStatus.A_FAIRE, TaskStatus.EN_COURS));
        ensureHistory(recetteMetier, amine, List.of(TaskStatus.A_FAIRE, TaskStatus.EN_COURS, TaskStatus.EN_REVUE));

        Meeting pointRefonte = findOrCreateMeeting(
                refonte,
                "Point d'avancement Refonte SI",
                LocalDateTime.now().minusDays(3).withHour(10).withMinute(0).withSecond(0).withNano(0),
                Set.of(amine, sanaa, salma),
                "Avancement API, planning des tests de charge, deploiement preproduction.",
                """
                Amine : Point d'avancement sur la refonte SI.
                Sanaa : L'API interne avance, il reste les tests de charge.
                Salma : La preproduction peut etre preparee apres les tests.
                Amine : Il est decide de finaliser les tests de charge avant le deploiement.
                Sanaa : Je prepare les scenarios de tests de charge.
                """,
                "Les tests de charge API doivent etre finalises avant le deploiement en preproduction.",
                MeetingProcessingStatus.TERMINE);

        Meeting revueSecurite = findOrCreateMeeting(
                securisation,
                "Revue de sécurité et des accès",
                LocalDateTime.now().minusDays(1).withHour(14).withMinute(30).withSecond(0).withNano(0),
                Set.of(amine, youssef, mehdi),
                "Durcissement des comptes admin, centralisation des journaux, acces bases de donnees.",
                """
                Amine : Revue de securite DSI.
                Mehdi : Le durcissement des comptes admin n'est pas termine.
                Youssef : La centralisation SIEM est en cours.
                Amine : Le durcissement de l'authentification admin est bloquant pour la suite.
                Mehdi : Je clôture le durcissement cette semaine.
                """,
                "Le durcissement de l'authentification admin reste bloquant.",
                MeetingProcessingStatus.TERMINE);

        Meeting bilanReseau = findOrCreateMeeting(
                reseau,
                "Bilan réseau",
                LocalDateTime.now().minusDays(20).withHour(9).withMinute(0).withSecond(0).withNano(0),
                Set.of(youssef, salma),
                "Cloture du renouvellement reseau et archivage de la documentation.",
                """
                Youssef : Le coeur de reseau a ete remplace.
                Salma : La documentation de topologie est a jour.
                Youssef : Le projet de modernisation reseau peut etre cloture.
                """,
                "La modernisation de l'infrastructure reseau est cloturee.",
                MeetingProcessingStatus.TERMINE);

        ensureDecision(pointRefonte, "Finaliser les tests de charge avant le deploiement.", false);
        ensureDecision(revueSecurite, "Le durcissement de l'authentification admin est bloquant pour la suite.", false);
        ensureDecision(bilanReseau, "La modernisation reseau est cloturee.", true);

        ensureAction(pointRefonte, "Preparer les scenarios de tests de charge.", "Sanaa", today.plusDays(10), testsCharge);
        ensureAction(revueSecurite, "Cloturer le durcissement authentification admin.", "Mehdi", today.plusDays(3), durcissement);
        ensureAction(bilanReseau, "Archiver les schemas reseau.", "Salma", today.plusDays(5), null);

        log.info("Jeu de test additif verifie (idempotent).");
    }

    private User findOrCreateUser(String nom, String prenom, String email, Role role, List<String> competences) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User created = createUser(nom, prenom, email, role, competences);
            return userRepository.save(created);
        });
    }

    private Project findOrCreateProject(
            String nom,
            String description,
            ProjectStatus statut,
            ProjectPriority priorite,
            LocalDate debut,
            LocalDate fin,
            double risque,
            double avancement,
            User createur) {
        return projectRepository.findAll().stream()
                .filter(project -> nom.equals(project.getNom()))
                .findFirst()
                .orElseGet(() -> projectRepository.save(buildProject(
                        nom, description, statut, priorite, debut, fin, risque, avancement, createur)));
    }

    private void ensureMember(Project project, User user) {
        if (!projectMemberRepository.existsByProjectIdAndUserId(project.getId(), user.getId())) {
            projectMemberRepository.save(new ProjectMember(project, user));
        }
    }

    private Task findOrCreateTask(
            Project project,
            String titre,
            String description,
            TaskStatus statut,
            double priorite,
            LocalDate echeance,
            User responsable,
            double heures,
            List<String> tags) {
        return taskRepository.findByProjectId(project.getId()).stream()
                .filter(task -> titre.equals(task.getTitre()))
                .findFirst()
                .orElseGet(() -> taskRepository.save(buildTask(
                        project, titre, description, statut, priorite, echeance, responsable, heures, tags)));
    }

    private void ensureHistory(Task task, User auteur, List<TaskStatus> chronologie) {
        if (taskHistoryRepository.findByTaskIdOrderByDateChangementDesc(task.getId()).isEmpty()
                && chronologie.size() >= 2) {
            for (int i = 0; i < chronologie.size() - 1; i++) {
                TaskHistory history = new TaskHistory();
                history.setTask(task);
                history.setAncienStatut(chronologie.get(i));
                history.setNouveauStatut(chronologie.get(i + 1));
                history.setAuteur(auteur);
                history.setDateChangement(LocalDateTime.now().minusDays(chronologie.size() - i));
                taskHistoryRepository.save(history);
            }
        }
    }

    private Meeting findOrCreateMeeting(
            Project project,
            String titre,
            LocalDateTime date,
            Set<User> participants,
            String ordreDuJour,
            String transcription,
            String resume,
            MeetingProcessingStatus statut) {
        return meetingRepository.findByProjectId(project.getId()).stream()
                .filter(meeting -> titre.equals(meeting.getTitre()))
                .findFirst()
                .orElseGet(() -> {
                    Meeting meeting = buildMeeting(project, titre, date, participants, ordreDuJour, transcription, statut);
                    meeting.setResumeGenere(resume);
                    meeting.setNotesManuelles("Compte rendu interne DSI (jeu de test fictif).");
                    return meetingRepository.save(meeting);
                });
    }

    private void ensureDecision(Meeting meeting, String texte, boolean traite) {
        boolean exists = meetingDecisionRepository.findByMeetingId(meeting.getId()).stream()
                .anyMatch(decision -> texte.equals(decision.getTexteDecision()));
        if (!exists) {
            meetingDecisionRepository.save(decision(meeting, texte, traite));
        }
    }

    private void ensureAction(Meeting meeting, String texte, String intervenant, LocalDate date, Task task) {
        boolean exists = meetingActionRepository.findByMeetingId(meeting.getId()).stream()
                .anyMatch(action -> texte.equals(action.getTexteAction()));
        if (!exists) {
            meetingActionRepository.save(action(meeting, texte, intervenant, date, task));
        }
    }
}
