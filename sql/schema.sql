-- IT-CHU Manager — schema MySQL (reference)
-- Source of truth: Flyway migrations under backend/src/main/resources/db/migration/

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    date_creation DATETIME(6) NOT NULL,
    actif BIT(1) NOT NULL DEFAULT 1,
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE user_competences (
    user_id BIGINT NOT NULL,
    competence VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, competence),
    CONSTRAINT fk_user_competences_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    statut VARCHAR(30) NOT NULL,
    priorite VARCHAR(20) NOT NULL,
    date_debut DATE,
    date_fin_prevue DATE,
    score_risque DOUBLE DEFAULT 0,
    taux_avancement DOUBLE DEFAULT 0,
    createur_id BIGINT NOT NULL,
    CONSTRAINT fk_projects_createur FOREIGN KEY (createur_id) REFERENCES users (id)
);

CREATE TABLE project_members (
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    statut VARCHAR(20) NOT NULL,
    priorite DOUBLE NOT NULL DEFAULT 0,
    echeance DATE,
    responsable_id BIGINT,
    heures_estimees DOUBLE NOT NULL DEFAULT 8,
    date_creation DATETIME(6) NOT NULL,
    date_maj DATETIME(6) NOT NULL,
    CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_tasks_responsable FOREIGN KEY (responsable_id) REFERENCES users (id)
);

CREATE TABLE task_tags (
    task_id BIGINT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (task_id, tag),
    CONSTRAINT fk_task_tags_task FOREIGN KEY (task_id) REFERENCES tasks (id)
);

CREATE TABLE task_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    ancien_statut VARCHAR(20) NOT NULL,
    nouveau_statut VARCHAR(20) NOT NULL,
    auteur_id BIGINT NOT NULL,
    date_changement DATETIME(6) NOT NULL,
    CONSTRAINT fk_task_history_task FOREIGN KEY (task_id) REFERENCES tasks (id),
    CONSTRAINT fk_task_history_auteur FOREIGN KEY (auteur_id) REFERENCES users (id)
);

CREATE TABLE meetings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    date DATETIME(6) NOT NULL,
    ordre_du_jour TEXT,
    notes_manuelles TEXT,
    transcription_brute LONGTEXT,
    resume_genere LONGTEXT,
    statut_traitement VARCHAR(20) NOT NULL,
    CONSTRAINT fk_meetings_project FOREIGN KEY (project_id) REFERENCES projects (id)
);

CREATE TABLE meeting_participants (
    meeting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (meeting_id, user_id),
    CONSTRAINT fk_meeting_participants_meeting FOREIGN KEY (meeting_id) REFERENCES meetings (id),
    CONSTRAINT fk_meeting_participants_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE meeting_actions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT NOT NULL,
    texte_action TEXT NOT NULL,
    intervenant_detecte VARCHAR(150),
    date_detectee DATE,
    task_generee_id BIGINT,
    CONSTRAINT fk_meeting_actions_meeting FOREIGN KEY (meeting_id) REFERENCES meetings (id),
    CONSTRAINT fk_meeting_actions_task FOREIGN KEY (task_generee_id) REFERENCES tasks (id)
);

CREATE TABLE meeting_decisions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT NOT NULL,
    texte_decision TEXT NOT NULL,
    statut_traite BIT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_meeting_decisions_meeting FOREIGN KEY (meeting_id) REFERENCES meetings (id)
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    lien_reference VARCHAR(255),
    lu BIT(1) NOT NULL DEFAULT 0,
    date_creation DATETIME(6) NOT NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    type_action VARCHAR(100) NOT NULL,
    entite_cible VARCHAR(100) NOT NULL,
    id_entite_cible BIGINT,
    detail TEXT,
    date_action DATETIME(6) NOT NULL,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE workload_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    snapshot_date DATE NOT NULL,
    taux_charge DOUBLE NOT NULL,
    CONSTRAINT uk_workload_snapshots_user_date UNIQUE (user_id, snapshot_date),
    CONSTRAINT fk_workload_snapshots_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    revoked BIT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT uk_refresh_tokens_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_tasks_project ON tasks (project_id);
CREATE INDEX idx_tasks_responsable ON tasks (responsable_id);
CREATE INDEX idx_tasks_echeance ON tasks (echeance);
CREATE INDEX idx_meetings_project ON meetings (project_id);
CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
