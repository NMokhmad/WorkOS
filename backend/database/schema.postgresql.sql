-- ===========================================
-- WorkOS - Base de données SQL (PostgreSQL)
-- Script de création des tables
-- ===========================================

-- Suppression des tables existantes (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS "time_entries" CASCADE;
DROP TABLE IF EXISTS "task_tags" CASCADE;
DROP TABLE IF EXISTS "note_tags" CASCADE;
DROP TABLE IF EXISTS "tasks" CASCADE;
DROP TABLE IF EXISTS "events" CASCADE;
DROP TABLE IF EXISTS "notes" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "tags" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- ===========================================
-- Table: users
-- Description: Utilisateurs de l'application
-- ===========================================
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(100) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "avatar_url" VARCHAR(500),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP NULL,
    "is_active" BOOLEAN DEFAULT true
);

-- Index pour users
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_username" ON "users"("username");

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Table: projects
-- Description: Projets de travail
-- ===========================================
CREATE TABLE "projects" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(50) DEFAULT 'blue',
    "status" VARCHAR(20) DEFAULT 'active' CHECK ("status" IN ('active', 'archived', 'completed')),
    "start_date" DATE,
    "due_date" DATE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Index pour projects
CREATE INDEX "idx_projects_user_id" ON "projects"("user_id");
CREATE INDEX "idx_projects_status" ON "projects"("status");

-- Trigger pour updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON "projects"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Table: tasks
-- Description: Tâches dans le système Kanban
-- ===========================================
CREATE TABLE "tasks" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL,
    "project_id" INT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(20) DEFAULT 'todo' CHECK ("status" IN ('todo', 'inProgress', 'done')),
    "priority" VARCHAR(10) DEFAULT 'medium' CHECK ("priority" IN ('low', 'medium', 'high')),
    "time_spent" INT DEFAULT 0, -- en secondes
    "is_running" BOOLEAN DEFAULT false,
    "timer_started_at" TIMESTAMP NULL,
    "position" INT DEFAULT 0, -- pour l'ordre dans le Kanban
    "due_date" TIMESTAMP,
    "completed_at" TIMESTAMP NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL
);

-- Index pour tasks
CREATE INDEX "idx_tasks_user_id" ON "tasks"("user_id");
CREATE INDEX "idx_tasks_project_id" ON "tasks"("project_id");
CREATE INDEX "idx_tasks_status" ON "tasks"("status");
CREATE INDEX "idx_tasks_priority" ON "tasks"("priority");

-- Trigger pour updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON "tasks"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Table: events
-- Description: Événements du calendrier
-- ===========================================
CREATE TABLE "events" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL,
    "project_id" INT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_datetime" TIMESTAMP NOT NULL,
    "end_datetime" TIMESTAMP,
    "color" VARCHAR(50) DEFAULT 'blue',
    "location" VARCHAR(255),
    "attendees" TEXT, -- JSON array des participants
    "reminder_minutes" INT DEFAULT 15,
    "is_all_day" BOOLEAN DEFAULT false,
    "recurrence_rule" VARCHAR(255), -- Pour les événements récurrents (format iCal RRULE)
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL
);

-- Index pour events
CREATE INDEX "idx_events_user_id" ON "events"("user_id");
CREATE INDEX "idx_events_start_datetime" ON "events"("start_datetime");
CREATE INDEX "idx_events_project_id" ON "events"("project_id");

-- Trigger pour updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON "events"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Table: notes
-- Description: Notes et documentation
-- ===========================================
CREATE TABLE "notes" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL,
    "project_id" INT,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "color" VARCHAR(50) DEFAULT 'blue',
    "is_favorite" BOOLEAN DEFAULT false,
    "is_archived" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL
);

-- Index pour notes
CREATE INDEX "idx_notes_user_id" ON "notes"("user_id");
CREATE INDEX "idx_notes_project_id" ON "notes"("project_id");
CREATE INDEX "idx_notes_created_at" ON "notes"("created_at");

-- Index de recherche fulltext pour PostgreSQL
CREATE INDEX "idx_notes_search" ON "notes" USING gin(to_tsvector('french', "title" || ' ' || COALESCE("content", '')));

-- Trigger pour updated_at
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON "notes"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Table: tags
-- Description: Tags pour organiser les notes et tâches
-- ===========================================
CREATE TABLE "tags" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(50) DEFAULT 'gray',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    UNIQUE ("user_id", "name")
);

-- Index pour tags
CREATE INDEX "idx_tags_user_id" ON "tags"("user_id");

-- ===========================================
-- Table: note_tags
-- Description: Relation many-to-many entre notes et tags
-- ===========================================
CREATE TABLE "note_tags" (
    "note_id" INT NOT NULL,
    "tag_id" INT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("note_id", "tag_id"),
    FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
);

-- Index pour note_tags
CREATE INDEX "idx_note_tags_note_id" ON "note_tags"("note_id");
CREATE INDEX "idx_note_tags_tag_id" ON "note_tags"("tag_id");

-- ===========================================
-- Table: task_tags
-- Description: Relation many-to-many entre tâches et tags
-- ===========================================
CREATE TABLE "task_tags" (
    "task_id" INT NOT NULL,
    "tag_id" INT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("task_id", "tag_id"),
    FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
);

-- Index pour task_tags
CREATE INDEX "idx_task_tags_task_id" ON "task_tags"("task_id");
CREATE INDEX "idx_task_tags_tag_id" ON "task_tags"("tag_id");

-- ===========================================
-- Table: time_entries
-- Description: Historique des temps de travail
-- ===========================================
CREATE TABLE "time_entries" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL,
    "task_id" INT,
    "project_id" INT,
    "description" VARCHAR(500),
    "duration_seconds" INT NOT NULL, -- durée en secondes
    "started_at" TIMESTAMP NOT NULL,
    "ended_at" TIMESTAMP NOT NULL,
    "date" DATE NOT NULL, -- date pour faciliter les requêtes
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL,
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL
);

-- Index pour time_entries
CREATE INDEX "idx_time_entries_user_id" ON "time_entries"("user_id");
CREATE INDEX "idx_time_entries_task_id" ON "time_entries"("task_id");
CREATE INDEX "idx_time_entries_project_id" ON "time_entries"("project_id");
CREATE INDEX "idx_time_entries_date" ON "time_entries"("date");
CREATE INDEX "idx_time_entries_started_at" ON "time_entries"("started_at");

-- Trigger pour updated_at
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON "time_entries"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Vues utiles
-- ===========================================

-- Vue pour obtenir les statistiques journalières par utilisateur
CREATE OR REPLACE VIEW "daily_stats" AS
SELECT
    "user_id",
    "date",
    COUNT(DISTINCT "project_id") as "projects_count",
    COUNT("id") as "entries_count",
    SUM("duration_seconds") as "total_seconds",
    TO_CHAR(INTERVAL '1 second' * SUM("duration_seconds"), 'HH24:MI:SS') as "total_time"
FROM "time_entries"
GROUP BY "user_id", "date";

-- Vue pour les tâches avec leurs tags
CREATE OR REPLACE VIEW "tasks_with_tags" AS
SELECT
    t.*,
    STRING_AGG(tg."name", ', ') as "tags"
FROM "tasks" t
LEFT JOIN "task_tags" tt ON t."id" = tt."task_id"
LEFT JOIN "tags" tg ON tt."tag_id" = tg."id"
GROUP BY t."id";

-- Vue pour les notes avec leurs tags
CREATE OR REPLACE VIEW "notes_with_tags" AS
SELECT
    n.*,
    STRING_AGG(tg."name", ', ') as "tags"
FROM "notes" n
LEFT JOIN "note_tags" nt ON n."id" = nt."note_id"
LEFT JOIN "tags" tg ON nt."tag_id" = tg."id"
GROUP BY n."id";

-- ===========================================
-- Commentaires sur les tables (Documentation PostgreSQL)
-- ===========================================
COMMENT ON TABLE "users" IS 'Utilisateurs de l''application';
COMMENT ON TABLE "projects" IS 'Projets de travail';
COMMENT ON TABLE "tasks" IS 'Tâches dans le système Kanban';
COMMENT ON TABLE "events" IS 'Événements du calendrier';
COMMENT ON TABLE "notes" IS 'Notes et documentation';
COMMENT ON TABLE "tags" IS 'Tags pour organiser les notes et tâches';
COMMENT ON TABLE "note_tags" IS 'Relation many-to-many entre notes et tags';
COMMENT ON TABLE "task_tags" IS 'Relation many-to-many entre tâches et tags';
COMMENT ON TABLE "time_entries" IS 'Historique des temps de travail';

-- Commentaires sur les colonnes importantes
COMMENT ON COLUMN "tasks"."time_spent" IS 'Temps passé en secondes';
COMMENT ON COLUMN "tasks"."position" IS 'Position dans la colonne Kanban';
COMMENT ON COLUMN "events"."attendees" IS 'JSON array des participants';
COMMENT ON COLUMN "events"."recurrence_rule" IS 'Règle de récurrence au format iCal RRULE';
COMMENT ON COLUMN "time_entries"."duration_seconds" IS 'Durée en secondes';
