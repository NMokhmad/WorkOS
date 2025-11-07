-- ===========================================
-- WorkOS - Données de seed (PostgreSQL)
-- Script d'insertion de données de test
-- ===========================================

-- Désactiver les contraintes temporairement pour l'insertion
SET session_replication_role = 'replica';

-- ===========================================
-- Insertion: users
-- ===========================================
INSERT INTO "users" ("id", "username", "email", "password_hash", "first_name", "last_name", "avatar_url", "is_active", "last_login") VALUES
(1, 'marie.dupont', 'marie.dupont@workos.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie', 'Dupont', 'https://i.pravatar.cc/150?img=1', true, CURRENT_TIMESTAMP),
(2, 'jean.martin', 'jean.martin@workos.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean', 'Martin', 'https://i.pravatar.cc/150?img=2', true, CURRENT_TIMESTAMP),
(3, 'sophie.bernard', 'sophie.bernard@workos.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sophie', 'Bernard', 'https://i.pravatar.cc/150?img=3', true, CURRENT_TIMESTAMP);

-- Réinitialiser la séquence
SELECT setval(pg_get_serial_sequence('"users"', 'id'), (SELECT MAX("id") FROM "users"));

-- ===========================================
-- Insertion: projects
-- ===========================================
INSERT INTO "projects" ("id", "user_id", "name", "description", "color", "status", "start_date", "due_date") VALUES
(1, 1, 'Design', 'Refonte du système de design', 'blue', 'active', '2024-01-01', '2024-03-31'),
(2, 1, 'Backend', 'Développement API et services', 'green', 'active', '2024-01-01', '2024-04-30'),
(3, 1, 'Frontend', 'Développement interface utilisateur', 'purple', 'active', '2024-01-15', '2024-05-15'),
(4, 1, 'Management', 'Gestion d''équipe et coordination', 'orange', 'active', '2024-01-01', NULL),
(5, 1, 'UX Research', 'Recherche utilisateur et tests', 'pink', 'active', '2024-01-10', '2024-06-30'),
(6, 2, 'Marketing', 'Stratégie marketing digital', 'red', 'active', '2024-01-01', NULL),
(7, 3, 'Tests', 'Tests et qualité', 'yellow', 'active', '2024-01-01', NULL);

-- Réinitialiser la séquence
SELECT setval(pg_get_serial_sequence('"projects"', 'id'), (SELECT MAX("id") FROM "projects"));

-- ===========================================
-- Insertion: tags
-- ===========================================
INSERT INTO "tags" ("id", "user_id", "name", "color") VALUES
-- Tags pour Marie (user 1)
(1, 1, 'design', 'blue'),
(2, 1, 'backend', 'green'),
(3, 1, 'frontend', 'purple'),
(4, 1, 'urgent', 'red'),
(5, 1, 'brainstorming', 'orange'),
(6, 1, 'réunion', 'yellow'),
(7, 1, 'équipe', 'pink'),
(8, 1, 'formation', 'indigo'),
(9, 1, 'react', 'cyan'),
(10, 1, 'ux', 'teal'),
(11, 1, 'feedback', 'amber'),
(12, 1, 'produit', 'lime'),
-- Tags pour Jean (user 2)
(13, 2, 'marketing', 'red'),
(14, 2, 'social', 'blue'),
-- Tags pour Sophie (user 3)
(15, 3, 'tests', 'yellow'),
(16, 3, 'qa', 'orange');

-- Réinitialiser la séquence
SELECT setval(pg_get_serial_sequence('"tags"', 'id'), (SELECT MAX("id") FROM "tags"));

-- ===========================================
-- Insertion: tasks
-- ===========================================
INSERT INTO "tasks" ("id", "user_id", "project_id", "title", "description", "status", "priority", "time_spent", "is_running", "position", "due_date") VALUES
-- Tâches TODO
(1, 1, 1, 'Mise à jour du design système', 'Réviser les composants UI selon les nouvelles guidelines', 'todo', 'high', 1800, false, 1, '2024-02-15 17:00:00'),
(2, 1, 2, 'Rédaction documentation API', 'Documenter les nouveaux endpoints REST', 'todo', 'medium', 0, false, 2, '2024-02-20 17:00:00'),
(3, 1, 3, 'Optimisation performance', 'Améliorer les temps de chargement des pages', 'todo', 'low', 0, false, 3, NULL),

-- Tâches IN PROGRESS
(4, 1, 2, 'Développement authentification', 'Implémenter le système de login OAuth 2.0', 'inProgress', 'high', 8100, true, 1, '2024-02-10 17:00:00'),
(5, 1, 3, 'Intégration API frontend', 'Connecter les composants React aux endpoints', 'inProgress', 'medium', 3600, false, 2, NULL),

-- Tâches DONE
(6, 1, 7, 'Tests unitaires composants', 'Écriture des tests pour les nouveaux composants', 'done', 'medium', 6300, false, 1, NULL),
(7, 1, 1, 'Révision du design système', 'Validation des nouvelles couleurs et typographies', 'done', 'high', 9000, false, 2, NULL),
(8, 1, 4, 'Réunion équipe produit', 'Sprint planning et retro', 'done', 'medium', 3600, false, 3, NULL),
(9, 1, 5, 'Tests utilisateurs', 'Session de tests avec 5 utilisateurs', 'done', 'high', 2700, false, 4, NULL);

-- Réinitialiser la séquence
SELECT setval(pg_get_serial_sequence('"tasks"', 'id'), (SELECT MAX("id") FROM "tasks"));

-- ===========================================
-- Insertion: task_tags (association tâches-tags)
-- ===========================================
INSERT INTO "task_tags" ("task_id", "tag_id") VALUES
(1, 1),  -- Mise à jour design système -> design
(2, 2),  -- Documentation API -> backend
(3, 3),  -- Optimisation -> frontend
(4, 2),  -- Auth -> backend
(4, 4),  -- Auth -> urgent
(5, 3),  -- Intégration -> frontend
(6, 15), -- Tests unitaires -> tests (Sophie)
(7, 1),  -- Révision design -> design
(8, 6),  -- Réunion -> réunion
(8, 7),  -- Réunion -> équipe
(9, 10), -- Tests utilisateurs -> ux
(9, 11); -- Tests utilisateurs -> feedback

-- ===========================================
-- Insertion: events (événements calendrier)
-- ===========================================
INSERT INTO "events" ("id", "user_id", "project_id", "title", "description", "start_datetime", "end_datetime", "color", "location", "attendees", "reminder_minutes", "is_all_day") VALUES
(1, 1, 4, 'Réunion équipe', 'Daily standup avec l''équipe de développement', '2024-01-15 09:00:00', '2024-01-15 09:30:00', 'blue', 'Salle Conf A', '["marie.dupont@workos.com", "jean.martin@workos.com", "sophie.bernard@workos.com"]', 15, false),
(2, 1, 1, 'Présentation client', 'Présentation du nouveau design au client', '2024-01-18 14:00:00', '2024-01-18 15:30:00', 'green', 'Visio', '["marie.dupont@workos.com", "client@example.com"]', 30, false),
(3, 1, 4, 'Sprint planning', 'Planification du prochain sprint', '2024-01-22 10:30:00', '2024-01-22 12:00:00', 'purple', 'Salle Conf B', '["marie.dupont@workos.com", "jean.martin@workos.com"]', 15, false),
(4, 1, 8, 'Formation', 'Formation React avancé', '2024-01-25 13:00:00', '2024-01-25 17:00:00', 'orange', 'Salle Formation', '["marie.dupont@workos.com", "sophie.bernard@workos.com"]', 60, false),
(5, 1, 4, 'Réunion client', 'Point d''avancement hebdomadaire', '2024-01-15 14:00:00', '2024-01-15 15:00:00', 'blue', 'Visio', '["marie.dupont@workos.com"]', 15, false),
(6, 1, 4, 'Présentation sprint', 'Demo des fonctionnalités développées', '2024-01-16 10:00:00', '2024-01-16 11:00:00', 'green', 'Salle Conf A', '["marie.dupont@workos.com", "jean.martin@workos.com", "sophie.bernard@workos.com"]', 15, false),
(7, 1, 4, 'Formation équipe', 'Formation sur les nouveaux outils', '2024-01-19 09:00:00', '2024-01-19 12:00:00', 'purple', 'Salle Formation', '["marie.dupont@workos.com", "jean.martin@workos.com", "sophie.bernard@workos.com"]', 30, false);

-- Réinitialiser la séquence
SELECT setval(pg_get_serial_sequence('"events"', 'id'), (SELECT MAX("id") FROM "events"));

-- ===========================================
-- Insertion: notes
-- ===========================================
INSERT INTO "notes" ("id", "user_id", "project_id", "title", "content", "color", "is_favorite", "is_archived") VALUES
(1, 1, 12, 'Idées pour le nouveau produit', 'Brainstorming sur les fonctionnalités prioritaires pour le prochain trimestre:

## Fonctionnalités principales
- Intégration avec Slack
- Export de données en CSV
- Dashboard personnalisable
- Mode sombre

## Points à discuter
- Budget nécessaire
- Ressources requises
- Timeline de développement', 'blue', true, false),

(2, 1, 4, 'Notes réunion équipe', 'Points abordés lors de la réunion du 15 janvier:

**Planning Sprint**
- Sprint 12 démarre le 18 janvier
- 8 tickets prioritaires identifiés
- Focus sur l''authentification

**Objectifs Q1**
- Finir le système d''auth
- Lancer la beta publique
- Atteindre 1000 utilisateurs actifs

**Décisions**
- Stand-up quotidien à 9h
- Retro tous les vendredis', 'green', false, false),

(3, 1, 8, 'Formation React avancée', 'Notes de la formation React avancée:

## Hooks personnalisés
- Création de useLocalStorage
- Pattern de composition
- Gestion de l''état complexe

## Patterns avancés
- Compound components
- Render props vs hooks
- Higher-order components

## Performance
- useMemo et useCallback
- React.memo
- Code splitting avec lazy/Suspense
- Virtualisation des listes

## À approfondir
- Concurrent mode
- Server components', 'purple', true, false),

(4, 1, 5, 'Feedback utilisateurs', 'Retours des tests utilisateurs sur la nouvelle interface:

**Points positifs**
✓ Design moderne et épuré
✓ Navigation intuitive
✓ Rapidité de l''application

**Points d''amélioration**
- Améliorer la visibilité des boutons d''action
- Ajouter des tooltips sur les icônes
- Revoir le contraste de certains textes
- Simplifier le formulaire de création de tâche

**Demandes de fonctionnalités**
- Raccourcis clavier
- Mode hors ligne
- Notifications push', 'orange', false, false),

(5, 1, 2, 'Architecture API', 'Documentation de l''architecture de l''API:

## Endpoints principaux
- /api/auth - Authentification
- /api/users - Gestion utilisateurs
- /api/tasks - Gestion des tâches
- /api/projects - Gestion des projets

## Sécurité
- JWT tokens
- Refresh tokens
- Rate limiting
- CORS configuration

## Performance
- Cache Redis
- Pagination
- Lazy loading', 'indigo', false, false);

-- Réinitialiser la séquence
SELECT setval(pg_get_serial_sequence('"notes"', 'id'), (SELECT MAX("id") FROM "notes"));

-- ===========================================
-- Insertion: note_tags (association notes-tags)
-- ===========================================
INSERT INTO "note_tags" ("note_id", "tag_id") VALUES
(1, 12), -- Idées produit -> produit
(1, 5),  -- Idées produit -> brainstorming
(2, 6),  -- Notes réunion -> réunion
(2, 7),  -- Notes réunion -> équipe
(3, 8),  -- Formation React -> formation
(3, 9),  -- Formation React -> react
(4, 10), -- Feedback -> ux
(4, 11), -- Feedback -> feedback
(5, 2);  -- Architecture API -> backend

-- ===========================================
-- Insertion: time_entries (historique temps)
-- ===========================================
INSERT INTO "time_entries" ("id", "user_id", "task_id", "project_id", "description", "duration_seconds", "started_at", "ended_at", "date") VALUES
-- Entrées pour aujourd'hui (15 janvier 2024)
(1, 1, 4, 2, 'Développement API auth', 9000, '2024-01-15 09:00:00', '2024-01-15 11:30:00', '2024-01-15'),
(2, 1, 7, 1, 'Design interface', 6300, '2024-01-15 13:00:00', '2024-01-15 14:45:00', '2024-01-15'),
(3, 1, NULL, 3, 'Code review', 3600, '2024-01-15 15:00:00', '2024-01-15 16:00:00', '2024-01-15'),

-- Entrées pour hier (14 janvier 2024)
(4, 1, 4, 2, 'Développement API auth', 11700, '2024-01-14 09:00:00', '2024-01-14 12:15:00', '2024-01-14'),
(5, 1, 8, 4, 'Réunion équipe', 3600, '2024-01-14 14:00:00', '2024-01-14 15:00:00', '2024-01-14'),
(6, 1, 9, 5, 'Tests utilisateurs', 2700, '2024-01-14 15:30:00', '2024-01-14 16:15:00', '2024-01-14'),

-- Entrées de la semaine dernière
(7, 1, 6, 7, 'Tests unitaires', 7200, '2024-01-12 10:00:00', '2024-01-12 12:00:00', '2024-01-12'),
(8, 1, 5, 3, 'Intégration API frontend', 5400, '2024-01-12 14:00:00', '2024-01-12 15:30:00', '2024-01-12'),
(9, 1, NULL, 2, 'Documentation technique', 3600, '2024-01-11 09:00:00', '2024-01-11 10:00:00', '2024-01-11'),
(10, 1, 1, 1, 'Mise à jour design système', 1800, '2024-01-11 11:00:00', '2024-01-11 11:30:00', '2024-01-11'),

-- Entrées pour les autres utilisateurs
(11, 2, NULL, 6, 'Stratégie marketing', 7200, '2024-01-15 09:00:00', '2024-01-15 11:00:00', '2024-01-15'),
(12, 3, 6, 7, 'Tests automatisés', 10800, '2024-01-15 09:00:00', '2024-01-15 12:00:00', '2024-01-15');

-- Réinitialiser la séquence
SELECT setval(pg_get_serial_sequence('"time_entries"', 'id'), (SELECT MAX("id") FROM "time_entries"));

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- ===========================================
-- Afficher quelques statistiques
-- ===========================================
SELECT 'Base de données initialisée avec succès!' as "Status";

SELECT
    (SELECT COUNT(*) FROM "users") as "Utilisateurs",
    (SELECT COUNT(*) FROM "projects") as "Projets",
    (SELECT COUNT(*) FROM "tasks") as "Tâches",
    (SELECT COUNT(*) FROM "events") as "Événements",
    (SELECT COUNT(*) FROM "notes") as "Notes",
    (SELECT COUNT(*) FROM "tags") as "Tags",
    (SELECT COUNT(*) FROM "time_entries") as "Entrées de temps";

-- Statistiques par utilisateur
SELECT
    "u"."username",
    "u"."first_name",
    "u"."last_name",
    COUNT(DISTINCT "p"."id") as "projets",
    COUNT(DISTINCT "t"."id") as "taches",
    COUNT(DISTINCT "n"."id") as "notes",
    COUNT(DISTINCT "te"."id") as "temps_enregistres"
FROM "users" "u"
LEFT JOIN "projects" "p" ON "u"."id" = "p"."user_id"
LEFT JOIN "tasks" "t" ON "u"."id" = "t"."user_id"
LEFT JOIN "notes" "n" ON "u"."id" = "n"."user_id"
LEFT JOIN "time_entries" "te" ON "u"."id" = "te"."user_id"
GROUP BY "u"."id", "u"."username", "u"."first_name", "u"."last_name";
