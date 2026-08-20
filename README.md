# IT-CHU Manager

Plateforme de gestion de projets IT pour le departement informatique d'un CHU (Centre Hospitalier Universitaire).

**Phase 1** — application classique de project management (sans IA).  
Les points d'extension pour la Phase 2 (FastAPI, Meeting AI Pipeline, RAG, LLM) sont prepares mais desactives.

## Stack

| Couche | Technologies |
|--------|--------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios, React Hook Form, Zod, Dnd Kit, Recharts |
| Backend | Spring Boot 3, Java 21, Spring Security + JWT, Spring Data JPA, MySQL, Flyway, Maven, Swagger OpenAPI |
| Infra | Docker, Docker Compose |

## Roles

- `ADMIN` — administration complete (utilisateurs, audit, projets)
- `MEMBRE` — membre d'equipe (projects, tasks, kanban, meetings)

## Modules

1. Dashboard (KPIs, graphiques, charge, activites recentes)
2. Gestion des utilisateurs (CRUD, roles, activation)
3. Gestion des projets (CRUD, membres, archive, avancement)
4. Gestion des taches (CRUD, assignation, labels, historique)
5. Kanban (Drag & Drop : A faire / En cours / Revue / Terminee)
6. Reunions (CRUD, agenda, participants, notes manuelles)
7. Notifications (lu / non lu)
8. Analytics dashboard
9. Journal d'audit

## Structure du depot

```
Gestion Projet CHU/
├── backend/                 # API Spring Boot
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/itchu/
│       ├── controller/
│       ├── service/         # + service/ai (stubs Phase 2)
│       ├── repository/
│       ├── domain/
│       ├── dto/
│       ├── mapper/
│       ├── security/
│       ├── exception/
│       └── config/
├── frontend/                # SPA React
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── types/
│       └── lib/
├── sql/                     # Schema de reference + notes seed
├── docker-compose.yml
└── .env.example
```

## Demarrage rapide (Docker)

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/swagger-ui.html |
| Service IA (Phase 2) | http://localhost:8000/health |
| MySQL | localhost:3306 |

### Comptes de demonstration

| Role | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@chu.local` | `Admin123!` |
| Membre | `youssef.alaoui@chu.local` | `Member123!` |

Le seeder Docker cree 8 utilisateurs, 4 projets, ~30 taches, reunions, notifications et snapshots de charge.

## Developpement local

### Backend

Pre-requis : Java 21, Maven 3.9+, MySQL 8.

```bash
# Creer la base itchu_manager et un utilisateur MySQL
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Profil `dev` : voir `application-dev.yml` (MySQL local).  
Pour activer le seed hors Docker : `APP_SEED_ENABLED=true` avec le profil `docker`, ou lancer via Compose.

### Frontend

Pre-requis : Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

Le proxy Vite redirige `/api` vers `http://localhost:3000`.

## API REST

Authentification JWT :

- `POST /api/auth/login` — body `{ "email", "motDePasse" }`
- `POST /api/auth/refresh` — body `{ "refreshToken" }`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Ressources principales : `/api/users`, `/api/projects`, `/api/tasks`, `/api/meetings`, `/api/notifications`, `/api/dashboard`, `/api/audit-logs`.

Documentation interactive : Swagger UI.

## Base de donnees

Schema normalise MySQL gere par Flyway :

- `V1__init_schema.sql` — tables principales
- `V2__user_actif_and_refresh_tokens.sql` — `users.actif`, `refresh_tokens`, `meetings.notes_manuelles`

Entites : User, Project, ProjectMember, Task, TaskHistory, Meeting, MeetingAction, MeetingDecision, Notification, AuditLog, WorkloadSnapshot, RefreshToken.

## Extension Phase 2 (IA)

Sans logique IA en Phase 1. Points d'extension deja en place :

- Interface `MeetingAiPipeline` + `NoOpMeetingAiPipeline`
- Champs reunion : `transcriptionBrute`, `resumeGenere`, `statutTraitement`
- Tables `meeting_actions` / `meeting_decisions`
- Config `app.ai.*` et variables `IA_SERVICE_*` dans `.env`

## Licence

Usage interne CHU / projet academique.
