# Guide Sequelize pour WorkOS

Ce guide explique comment utiliser Sequelize avec le projet WorkOS.

## Installation

### 1. Installer les dépendances

```bash
npm install sequelize mysql2 dotenv
# ou pour PostgreSQL
npm install sequelize pg pg-hstore dotenv
```

### 2. Configuration

Créez un fichier `.env` à la racine du projet:

```bash
cp .env.example .env
```

Modifiez les paramètres de connexion dans `.env`:

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=workos
```

### 3. Créer la base de données

```bash
# MySQL
mysql -u root -p -e "CREATE DATABASE workos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# PostgreSQL
createdb workos
```

### 4. Importer le schema

```bash
# MySQL
mysql -u root -p workos < database/schema.sql
mysql -u root -p workos < database/seeds.sql

# PostgreSQL
psql workos < database/schema.postgresql.sql
psql workos < database/seeds.postgresql.sql
```

### 5. Tester la connexion

```bash
node src/db/init.js
```

## Structure des fichiers

```
src/
├── config/
│   └── database.js          # Configuration Sequelize
├── models/
│   ├── index.js            # Point d'entrée et associations
│   ├── User.js             # Modèle User
│   ├── Project.js          # Modèle Project
│   ├── Task.js             # Modèle Task
│   ├── Event.js            # Modèle Event
│   ├── Note.js             # Modèle Note
│   ├── Tag.js              # Modèle Tag
│   └── TimeEntry.js        # Modèle TimeEntry
├── db/
│   └── init.js             # Script d'initialisation
└── examples/
    └── usage.js            # Exemples d'utilisation
```

## Utilisation de base

### Importer les modèles

```javascript
const db = require('./src/models');
const { User, Project, Task, Event, Note, Tag, TimeEntry } = db;
```

### CRUD Operations

#### Créer un utilisateur

```javascript
const user = await User.create({
  username: 'john.doe',
  email: 'john.doe@example.com',
  passwordHash: 'hashed_password',
  firstName: 'John',
  lastName: 'Doe'
});
```

#### Trouver un utilisateur

```javascript
// Par ID
const user = await User.findByPk(1);

// Par email
const user = await User.findOne({
  where: { email: 'john.doe@example.com' }
});

// Tous les utilisateurs actifs
const users = await User.findAll({
  where: { isActive: true }
});
```

#### Mettre à jour

```javascript
await User.update(
  { firstName: 'Jane' },
  { where: { id: 1 } }
);

// Ou sur une instance
const user = await User.findByPk(1);
user.firstName = 'Jane';
await user.save();
```

#### Supprimer

```javascript
await User.destroy({ where: { id: 1 } });

// Ou sur une instance
const user = await User.findByPk(1);
await user.destroy();
```

## Relations et Associations

### Charger les relations

```javascript
// Utilisateur avec ses projets
const user = await User.findByPk(1, {
  include: [{ model: Project, as: 'projects' }]
});

// Projet avec ses tâches et tags
const project = await Project.findByPk(1, {
  include: [
    {
      model: Task,
      as: 'tasks',
      include: [
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    }
  ]
});
```

### Relations Many-to-Many (Tags)

```javascript
// Ajouter des tags à une tâche
const task = await Task.findByPk(1);
const tags = await Tag.findAll({ where: { id: [1, 2, 3] } });
await task.setTags(tags);

// Ou avec add
await task.addTag(tag);
await task.addTags([tag1, tag2]);

// Récupérer les tags d'une tâche
const taskWithTags = await Task.findByPk(1, {
  include: [{ model: Tag, as: 'tags' }]
});
```

## Requêtes avancées

### Opérateurs de recherche

```javascript
const { Op } = require('sequelize');

// Recherche avec LIKE
const notes = await Note.findAll({
  where: {
    title: { [Op.like]: '%react%' }
  }
});

// Recherche entre deux dates
const events = await Event.findAll({
  where: {
    startDatetime: {
      [Op.between]: [startDate, endDate]
    }
  }
});

// Recherche avec OR
const tasks = await Task.findAll({
  where: {
    [Op.or]: [
      { status: 'todo' },
      { status: 'inProgress' }
    ]
  }
});

// Recherche avec IN
const tasks = await Task.findAll({
  where: {
    priority: { [Op.in]: ['high', 'medium'] }
  }
});
```

### Agrégations

```javascript
// Compter
const taskCount = await Task.count({ where: { userId: 1 } });

// Somme
const totalTime = await TimeEntry.sum('durationSeconds', {
  where: { userId: 1, date: '2024-01-15' }
});

// Moyenne
const avgDuration = await TimeEntry.findAll({
  attributes: [
    [sequelize.fn('AVG', sequelize.col('durationSeconds')), 'average']
  ],
  where: { userId: 1 }
});
```

### Groupement

```javascript
// Temps par projet
const timeByProject = await TimeEntry.findAll({
  attributes: [
    'projectId',
    [sequelize.fn('SUM', sequelize.col('durationSeconds')), 'totalTime']
  ],
  group: ['projectId'],
  include: [{ model: Project, as: 'project', attributes: ['name'] }]
});
```

## Méthodes personnalisées

### User

```javascript
const user = await User.findByPk(1);
const fullName = user.getFullName(); // "John Doe"
```

### Task

```javascript
const task = await Task.findByPk(1);

// Démarrer le timer
await task.startTimer();

// Arrêter le timer
await task.stopTimer();

// Marquer comme complété
await task.markAsCompleted();

// Vérifier si en retard
const isOverdue = task.isOverdue();

// Formater le temps
const timeSpent = task.getFormattedTimeSpent(); // "2h 30m"
```

### Project

```javascript
const project = await Project.findByPk(1);

// Vérifier si en retard
const isOverdue = project.isOverdue();

// Jours restants
const daysRemaining = project.getDaysRemaining(); // 15
```

### Note

```javascript
const note = await Note.findByPk(1);

// Extrait
const excerpt = note.getExcerpt(100); // Premier 100 caractères

// Toggle favori
await note.toggleFavorite();

// Archiver/Désarchiver
await note.archive();
await note.unarchive();
```

## Transactions

```javascript
const t = await sequelize.transaction();

try {
  // Créer un projet
  const project = await Project.create({
    userId: 1,
    name: 'Nouveau projet'
  }, { transaction: t });

  // Créer des tâches associées
  await Task.create({
    userId: 1,
    projectId: project.id,
    title: 'Première tâche'
  }, { transaction: t });

  // Commit si tout est OK
  await t.commit();
} catch (error) {
  // Rollback en cas d'erreur
  await t.rollback();
  throw error;
}
```

## Gestion du Timer (Exemple complet)

```javascript
async function startWork(taskId) {
  const task = await Task.findByPk(taskId);

  // Arrêter tous les autres timers
  await Task.update(
    { isRunning: false, timerStartedAt: null },
    { where: { userId: task.userId, isRunning: true } }
  );

  // Démarrer ce timer
  await task.startTimer();
}

async function stopWork(taskId) {
  const task = await Task.findByPk(taskId);

  if (!task.isRunning) return;

  // Calculer la durée
  const elapsed = Math.floor((new Date() - new Date(task.timerStartedAt)) / 1000);

  // Créer une entrée de temps
  await TimeEntry.create({
    userId: task.userId,
    taskId: task.id,
    projectId: task.projectId,
    description: task.title,
    durationSeconds: elapsed,
    startedAt: task.timerStartedAt,
    endedAt: new Date(),
    date: new Date().toISOString().split('T')[0]
  });

  // Arrêter le timer
  await task.stopTimer();
}
```

## Board Kanban

```javascript
async function getKanbanBoard(userId) {
  const tasks = await Task.findAll({
    where: { userId },
    include: [
      { model: Project, as: 'project', attributes: ['name', 'color'] },
      { model: Tag, as: 'tags', through: { attributes: [] } }
    ],
    order: [['position', 'ASC']]
  });

  return {
    todo: tasks.filter(t => t.status === 'todo'),
    inProgress: tasks.filter(t => t.status === 'inProgress'),
    done: tasks.filter(t => t.status === 'done')
  };
}

// Déplacer une tâche
async function moveTask(taskId, newStatus, newPosition) {
  const task = await Task.findByPk(taskId);
  task.status = newStatus;
  task.position = newPosition;
  await task.save();
}
```

## Dashboard Stats

```javascript
async function getDashboardStats(userId) {
  const today = new Date().toISOString().split('T')[0];

  const [
    tasksInProgress,
    totalTimeToday,
    activeProjects,
    completedTasks
  ] = await Promise.all([
    Task.count({ where: { userId, status: 'inProgress' } }),
    TimeEntry.sum('durationSeconds', { where: { userId, date: today } }),
    Project.count({ where: { userId, status: 'active' } }),
    Task.count({ where: { userId, status: 'done' } })
  ]);

  return {
    tasksInProgress,
    totalTimeToday: formatSeconds(totalTimeToday || 0),
    activeProjects,
    completedTasks
  };
}

function formatSeconds(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
```

## Bonnes pratiques

### 1. Toujours fermer la connexion

```javascript
// À la fin de votre script
await db.sequelize.close();
```

### 2. Utiliser des transactions pour les opérations critiques

```javascript
await sequelize.transaction(async (t) => {
  // Vos opérations ici
});
```

### 3. Sélectionner uniquement les champs nécessaires

```javascript
const users = await User.findAll({
  attributes: ['id', 'username', 'email']
});
```

### 4. Exclure les données sensibles

```javascript
const user = await User.findOne({
  where: { id: 1 },
  attributes: { exclude: ['passwordHash'] }
});
```

### 5. Utiliser include avec required

```javascript
// INNER JOIN (seulement les users avec des projets)
const users = await User.findAll({
  include: [{ model: Project, as: 'projects', required: true }]
});

// LEFT JOIN (tous les users, même sans projets)
const users = await User.findAll({
  include: [{ model: Project, as: 'projects', required: false }]
});
```

## Debugging

### Activer les logs SQL

Dans `src/config/database.js`, activer les logs:

```javascript
logging: console.log
```

### Voir la requête SQL générée

```javascript
const tasks = await Task.findAll({ where: { userId: 1 } });
console.log(tasks.toSQL()); // Affiche la requête SQL
```

## Exemples complets

Consultez `src/examples/usage.js` pour des exemples complets et un workflow fonctionnel.

```bash
# Exécuter l'exemple
node src/examples/usage.js
```

## Ressources

- [Documentation Sequelize](https://sequelize.org/docs/v6/)
- [Guide des associations](https://sequelize.org/docs/v6/core-concepts/assocs/)
- [Opérateurs de requête](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#operators)
