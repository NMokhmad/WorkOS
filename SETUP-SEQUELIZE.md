# Configuration Sequelize - WorkOS

Guide complet pour démarrer avec Sequelize sur le projet WorkOS.

## 📦 Installation

### 1. Installer les dépendances

```bash
npm install
```

Les dépendances suivantes seront installées:
- `sequelize` - ORM pour Node.js
- `mysql2` - Driver MySQL
- `dotenv` - Gestion des variables d'environnement

Pour PostgreSQL, installez plutôt:
```bash
npm install sequelize pg pg-hstore dotenv
```

### 2. Configuration de l'environnement

Créez un fichier `.env` à la racine:

```bash
cp .env.example .env
```

Modifiez les paramètres selon votre configuration:

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=workos
```

### 3. Créer la base de données

#### MySQL
```bash
mysql -u root -p -e "CREATE DATABASE workos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p workos < database/schema.sql
mysql -u root -p workos < database/seeds.sql
```

#### PostgreSQL
```bash
createdb workos
psql workos < database/schema.postgresql.sql
psql workos < database/seeds.postgresql.sql
```

### 4. Tester la connexion

```bash
npm run db:init
```

Vous devriez voir:
```
🔍 Test de la connexion à la base de données...
✅ Connexion établie avec succès!
📦 Synchronisation des modèles...
✅ Modèles synchronisés!
```

## 📁 Structure des fichiers créés

```
WorkOS/
├── .env.example                    # Template de configuration
├── src/
│   ├── config/
│   │   └── database.js            # Configuration Sequelize (dev/test/prod)
│   ├── models/
│   │   ├── index.js              # Point d'entrée + associations
│   │   ├── User.js               # Modèle utilisateurs
│   │   ├── Project.js            # Modèle projets
│   │   ├── Task.js               # Modèle tâches (Kanban)
│   │   ├── Event.js              # Modèle événements (calendrier)
│   │   ├── Note.js               # Modèle notes
│   │   ├── Tag.js                # Modèle tags
│   │   └── TimeEntry.js          # Modèle entrées de temps
│   ├── db/
│   │   └── init.js               # Script d'initialisation
│   └── examples/
│       └── usage.js              # Exemples d'utilisation
├── database/
│   └── README-SEQUELIZE.md       # Documentation complète
└── SETUP-SEQUELIZE.md            # Ce fichier
```

## 🚀 Utilisation rapide

### Importer les modèles

```javascript
const db = require('./src/models');
const { User, Project, Task, Event, Note, Tag, TimeEntry } = db;
```

### Exemple simple

```javascript
// Créer un utilisateur
const user = await User.create({
  username: 'john.doe',
  email: 'john.doe@example.com',
  passwordHash: 'hashed_password',
  firstName: 'John',
  lastName: 'Doe'
});

// Trouver un utilisateur
const user = await User.findOne({
  where: { email: 'marie.dupont@workos.com' }
});

// Utilisateur avec ses projets
const userWithProjects = await User.findByPk(1, {
  include: [{ model: Project, as: 'projects' }]
});

// Tâches Kanban
const tasks = await Task.findAll({
  where: { userId: 1 },
  include: [
    { model: Project, as: 'project' },
    { model: Tag, as: 'tags', through: { attributes: [] } }
  ],
  order: [['position', 'ASC']]
});
```

## 🔧 Scripts NPM disponibles

```bash
# Vérifier la connexion et afficher les stats
npm run db:check

# Initialiser la base de données
npm run db:init

# Exécuter les exemples complets
npm run db:example
```

## 📖 Modèles disponibles

### User
- Gestion des utilisateurs
- Méthodes: `getFullName()`, `toJSON()` (exclut passwordHash)

### Project
- Gestion des projets
- Méthodes: `isOverdue()`, `getDaysRemaining()`
- Relations: tasks, events, notes, timeEntries

### Task
- Tâches Kanban (todo/inProgress/done)
- Méthodes: `startTimer()`, `stopTimer()`, `markAsCompleted()`, `isOverdue()`, `getFormattedTimeSpent()`
- Relations: project, tags, timeEntries

### Event
- Événements du calendrier
- Méthodes: `getDuration()`, `isUpcoming()`, `isPast()`, `isToday()`
- Support JSON pour les participants
- Relations: project

### Note
- Notes et documentation (Markdown)
- Méthodes: `getExcerpt()`, `toggleFavorite()`, `archive()`, `unarchive()`
- Relations: project, tags

### Tag
- Tags pour organiser notes et tâches
- Relations: tasks (many-to-many), notes (many-to-many)

### TimeEntry
- Historique des temps de travail
- Méthodes: `getFormattedDuration()`, `getTotalByDate()`, `getTotalByWeek()`
- Relations: user, task, project

## 🎯 Cas d'usage courants

### 1. Board Kanban

```javascript
const tasks = await Task.findAll({
  where: { userId: 1 },
  include: [
    { model: Project, as: 'project', attributes: ['name', 'color'] },
    { model: Tag, as: 'tags', through: { attributes: [] } }
  ],
  order: [['position', 'ASC']]
});

const kanban = {
  todo: tasks.filter(t => t.status === 'todo'),
  inProgress: tasks.filter(t => t.status === 'inProgress'),
  done: tasks.filter(t => t.status === 'done')
};
```

### 2. Timer de tâche

```javascript
const task = await Task.findByPk(1);

// Démarrer
await task.startTimer();

// Arrêter (crée automatiquement une TimeEntry)
const elapsed = Math.floor((new Date() - new Date(task.timerStartedAt)) / 1000);
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
await task.stopTimer();
```

### 3. Statistiques du Dashboard

```javascript
const today = new Date().toISOString().split('T')[0];

const stats = {
  tasksInProgress: await Task.count({
    where: { userId: 1, status: 'inProgress' }
  }),
  totalTimeToday: await TimeEntry.sum('durationSeconds', {
    where: { userId: 1, date: today }
  }),
  activeProjects: await Project.count({
    where: { userId: 1, status: 'active' }
  })
};
```

### 4. Recherche dans les notes

```javascript
const { Op } = require('sequelize');

const notes = await Note.findAll({
  where: {
    userId: 1,
    [Op.or]: [
      { title: { [Op.like]: '%react%' } },
      { content: { [Op.like]: '%react%' } }
    ],
    isArchived: false
  },
  include: [{ model: Tag, as: 'tags', through: { attributes: [] } }],
  order: [['updatedAt', 'DESC']]
});
```

### 5. Événements à venir

```javascript
const { Op } = require('sequelize');

const now = new Date();
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);

const events = await Event.findAll({
  where: {
    userId: 1,
    startDatetime: { [Op.between]: [now, nextWeek] }
  },
  include: [{ model: Project, as: 'project' }],
  order: [['startDatetime', 'ASC']]
});
```

## 🔗 Associations importantes

```javascript
// User → Projects (1:N)
User.hasMany(Project, { foreignKey: 'userId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Project → Tasks (1:N)
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Task ↔ Tag (N:M)
Task.belongsToMany(Tag, { through: 'task_tags', as: 'tags' });
Tag.belongsToMany(Task, { through: 'task_tags', as: 'tasks' });

// Note ↔ Tag (N:M)
Note.belongsToMany(Tag, { through: 'note_tags', as: 'tags' });
Tag.belongsToMany(Note, { through: 'note_tags', as: 'notes' });
```

## ⚠️ Points d'attention

### 1. Type de module
Le projet utilise `"type": "module"` dans package.json, mais les fichiers Sequelize utilisent CommonJS (`require`). Cela fonctionne car Node.js permet le mix des deux.

### 2. Mots de passe
Les modèles excluent automatiquement `passwordHash` dans `toJSON()`. Utilisez toujours:
```javascript
const user = await User.findOne({
  where: { id: 1 },
  attributes: { exclude: ['passwordHash'] }
});
```

### 3. Fermeture de connexion
N'oubliez pas de fermer la connexion:
```javascript
await db.sequelize.close();
```

### 4. Synchronisation
**ATTENTION**: `sync({ force: true })` supprime toutes les données!
```javascript
// Safe: vérifie et crée les tables manquantes
await sequelize.sync({ alter: false });

// DANGER: supprime et recrée tout
await sequelize.sync({ force: true });
```

## 📚 Documentation complète

Consultez [database/README-SEQUELIZE.md](database/README-SEQUELIZE.md) pour:
- Exemples détaillés
- Guide des opérateurs
- Transactions
- Bonnes pratiques
- Debugging

## 🧪 Tester l'installation

```bash
# Test basique
npm run db:init

# Test avec exemples
npm run db:example
```

Le script d'exemple va:
1. ✅ Créer un utilisateur
2. ✅ Créer un projet
3. ✅ Créer une tâche
4. ✅ Ajouter des tags
5. ✅ Démarrer/arrêter le timer
6. ✅ Créer une entrée de temps
7. ✅ Récupérer les statistiques

## 🐛 Problèmes courants

### "Access denied for user"
Vérifiez vos identifiants dans `.env`:
```env
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

### "Unknown database 'workos'"
Créez d'abord la base de données:
```bash
mysql -u root -p -e "CREATE DATABASE workos;"
```

### "Table doesn't exist"
Importez le schema:
```bash
mysql -u root -p workos < database/schema.sql
```

### "Cannot find module 'sequelize'"
Installez les dépendances:
```bash
npm install
```

## 📞 Support

- [Documentation Sequelize officielle](https://sequelize.org)
- [Guide des associations](https://sequelize.org/docs/v6/core-concepts/assocs/)
- Exemples: `src/examples/usage.js`

Bon développement! 🚀
