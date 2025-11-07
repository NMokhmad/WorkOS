# Base de données WorkOS

Cette documentation décrit la structure de la base de données pour l'application WorkOS.

## Structure des fichiers

- `schema.sql` - Script de création des tables et vues
- `seeds.sql` - Données de test pour l'initialisation
- `README.md` - Cette documentation

## Installation

### 1. Créer la base de données

```bash
mysql -u root -p -e "CREATE DATABASE workos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Exécuter le script de création des tables

```bash
mysql -u root -p workos < database/schema.sql
```

### 3. Insérer les données de test

```bash
mysql -u root -p workos < database/seeds.sql
```

## Structure de la base de données

### Tables principales

#### 1. **users**
Stocke les informations des utilisateurs de l'application.
- `id` - Identifiant unique
- `username` - Nom d'utilisateur unique
- `email` - Email unique
- `password_hash` - Hash du mot de passe
- `first_name`, `last_name` - Nom et prénom
- `avatar_url` - URL de l'avatar
- `is_active` - Statut du compte
- `last_login` - Dernière connexion

#### 2. **projects**
Gestion des projets de travail.
- `id` - Identifiant unique
- `user_id` - Propriétaire du projet
- `name` - Nom du projet
- `description` - Description
- `color` - Couleur pour l'interface (blue, green, purple, etc.)
- `status` - Statut (active, archived, completed)
- `start_date`, `due_date` - Dates de début et de fin

#### 3. **tasks**
Tâches dans le système Kanban.
- `id` - Identifiant unique
- `user_id` - Assigné à
- `project_id` - Projet associé
- `title` - Titre de la tâche
- `description` - Description détaillée
- `status` - Statut Kanban (todo, inProgress, done)
- `priority` - Priorité (low, medium, high)
- `time_spent` - Temps passé en secondes
- `is_running` - Timer en cours
- `timer_started_at` - Début du timer actuel
- `position` - Position dans la colonne Kanban
- `due_date` - Date d'échéance
- `completed_at` - Date de complétion

#### 4. **events**
Événements du calendrier.
- `id` - Identifiant unique
- `user_id` - Propriétaire
- `project_id` - Projet associé
- `title` - Titre de l'événement
- `description` - Description
- `start_datetime`, `end_datetime` - Dates/heures de début et fin
- `color` - Couleur pour l'affichage
- `location` - Lieu (physique ou virtuel)
- `attendees` - Participants (JSON)
- `reminder_minutes` - Rappel en minutes
- `is_all_day` - Événement sur toute la journée
- `recurrence_rule` - Règle de récurrence (format iCal)

#### 5. **notes**
Notes et documentation.
- `id` - Identifiant unique
- `user_id` - Auteur
- `project_id` - Projet associé
- `title` - Titre de la note
- `content` - Contenu (Markdown supporté)
- `color` - Couleur pour l'interface
- `is_favorite` - Note favorite
- `is_archived` - Note archivée

#### 6. **tags**
Tags pour organiser notes et tâches.
- `id` - Identifiant unique
- `user_id` - Propriétaire
- `name` - Nom du tag
- `color` - Couleur d'affichage

#### 7. **note_tags** et **task_tags**
Relations many-to-many entre les notes/tâches et les tags.

#### 8. **time_entries**
Historique des temps de travail.
- `id` - Identifiant unique
- `user_id` - Utilisateur
- `task_id` - Tâche associée
- `project_id` - Projet associé
- `description` - Description de l'activité
- `duration_seconds` - Durée en secondes
- `started_at`, `ended_at` - Début et fin
- `date` - Date (pour faciliter les requêtes)

### Vues

#### **daily_stats**
Statistiques journalières par utilisateur.
```sql
SELECT * FROM daily_stats WHERE user_id = 1 AND date = '2024-01-15';
```

#### **tasks_with_tags**
Tâches avec leurs tags concaténés.
```sql
SELECT * FROM tasks_with_tags WHERE user_id = 1 AND status = 'inProgress';
```

#### **notes_with_tags**
Notes avec leurs tags concaténés.
```sql
SELECT * FROM notes_with_tags WHERE user_id = 1 ORDER BY updated_at DESC;
```

## Données de test

Les données de seed incluent:
- 3 utilisateurs (Marie, Jean, Sophie)
- 7 projets
- 16 tags
- 9 tâches (réparties sur todo/inProgress/done)
- 7 événements
- 5 notes
- 12 entrées de temps

### Utilisateur de test principal
- **Username**: marie.dupont
- **Email**: marie.dupont@workos.com
- **Password**: password (hash: `$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`)

## Requêtes utiles

### Statistiques utilisateur
```sql
SELECT
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT n.id) as total_notes,
    SUM(te.duration_seconds) as total_time_seconds
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
LEFT JOIN tasks t ON u.id = t.user_id
LEFT JOIN notes n ON u.id = n.user_id
LEFT JOIN time_entries te ON u.id = te.user_id
WHERE u.id = 1;
```

### Temps total par projet
```sql
SELECT
    p.name,
    p.color,
    SEC_TO_TIME(SUM(te.duration_seconds)) as total_time,
    COUNT(te.id) as entries_count
FROM projects p
LEFT JOIN time_entries te ON p.id = te.project_id
WHERE p.user_id = 1
GROUP BY p.id
ORDER BY SUM(te.duration_seconds) DESC;
```

### Tâches en retard
```sql
SELECT
    t.title,
    t.due_date,
    p.name as project,
    t.priority
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
WHERE t.user_id = 1
    AND t.status != 'done'
    AND t.due_date < NOW()
ORDER BY t.due_date ASC;
```

### Événements à venir
```sql
SELECT
    e.title,
    e.start_datetime,
    e.location,
    p.name as project
FROM events e
LEFT JOIN projects p ON e.project_id = p.id
WHERE e.user_id = 1
    AND e.start_datetime > NOW()
ORDER BY e.start_datetime ASC
LIMIT 10;
```

### Recherche dans les notes
```sql
SELECT
    n.title,
    n.color,
    n.updated_at,
    GROUP_CONCAT(tg.name) as tags
FROM notes n
LEFT JOIN note_tags nt ON n.id = nt.note_id
LEFT JOIN tags tg ON nt.tag_id = tg.id
WHERE n.user_id = 1
    AND MATCH(n.title, n.content) AGAINST('react' IN NATURAL LANGUAGE MODE)
GROUP BY n.id;
```

## Maintenance

### Nettoyage des anciennes données
```sql
-- Supprimer les entrées de temps de plus d'un an
DELETE FROM time_entries WHERE date < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Archiver les tâches terminées de plus de 3 mois
UPDATE tasks
SET status = 'archived'
WHERE status = 'done'
    AND completed_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
```

### Backup
```bash
# Créer un backup
mysqldump -u root -p workos > backup_workos_$(date +%Y%m%d).sql

# Restaurer un backup
mysql -u root -p workos < backup_workos_20240115.sql
```

## Migration vers PostgreSQL (optionnel)

Si vous souhaitez utiliser PostgreSQL au lieu de MySQL, voici les principales modifications à apporter:

1. Remplacer `AUTO_INCREMENT` par `SERIAL`
2. Remplacer `ENUM` par `VARCHAR` avec contraintes CHECK
3. Remplacer `LONGTEXT` par `TEXT`
4. Adapter les fonctions de date/heure
5. Utiliser des `CREATE VIEW` au lieu de `CREATE OR REPLACE VIEW`

## Support

Pour toute question sur la structure de la base de données, consultez la documentation du projet ou ouvrez une issue.
