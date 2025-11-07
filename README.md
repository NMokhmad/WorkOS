# WorkOS - Workspace Organization System

Application de gestion de productivité avec authentification, gestion de projets, tâches, notes, calendrier et suivi du temps.

## 🏗️ Structure du projet

```
WorkOS/
├── backend/              # API Backend (Express + Sequelize)
│   ├── server/          # Code serveur
│   │   ├── index.js     # Point d'entrée
│   │   ├── routes/      # Routes API
│   │   └── middleware/  # Middlewares (auth, etc.)
│   ├── models/          # Modèles Sequelize
│   ├── config/          # Configuration DB
│   ├── database/        # Scripts SQL
│   ├── db/              # Initialisation DB
│   └── package.json
│
├── frontend/            # Application React
│   ├── src/
│   │   ├── Components/  # Composants React
│   │   ├── pages/       # Pages (Auth, etc.)
│   │   ├── contexts/    # Contextes React (AuthContext)
│   │   ├── services/    # Services API
│   │   └── App.jsx      # Point d'entrée
│   ├── public/
│   └── package.json
│
└── package.json         # Scripts racine
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Installation

```bash
# Cloner le projet
git clone <url>
cd WorkOS

# Installer toutes les dépendances (frontend + backend)
npm run install:all
```

### 2. Configuration Backend

```bash
cd backend

# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos paramètres
nano .env
```

Configuration PostgreSQL dans `.env`:
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=workos

PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=votre-secret-jwt-unique
```

### 3. Initialiser la base de données

```bash
# Depuis la racine du projet
npm run db:init
```

Ou manuellement avec PostgreSQL:
```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE workos;
\q

# Depuis le dossier backend
cd backend
npm run db:init
```

### 4. Lancer l'application

**Option 1 : Tout démarrer ensemble (recommandé)**
```bash
# Depuis la racine du projet
npm run dev
```

**Option 2 : Démarrer séparément**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

L'application sera accessible sur:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 📚 Scripts disponibles

### Scripts racine (depuis `/`)

```bash
npm run install:all    # Installer toutes les dépendances
npm run dev            # Lancer frontend + backend ensemble
npm run dev:backend    # Lancer uniquement le backend
npm run dev:frontend   # Lancer uniquement le frontend
npm run build          # Build le frontend
npm run db:init        # Initialiser la base de données
```

### Scripts Backend (depuis `/backend`)

```bash
npm start              # Démarrer le serveur
npm run dev            # Démarrer avec watch mode
npm run db:init        # Initialiser la DB
npm run db:check       # Vérifier la connexion DB
npm run db:example     # Exemples d'utilisation Sequelize
```

### Scripts Frontend (depuis `/frontend`)

```bash
npm run dev            # Démarrer le serveur dev
npm run build          # Build pour production
npm run preview        # Prévisualiser le build
npm run lint           # Linter le code
```

## 🔐 Authentification

L'application utilise JWT pour l'authentification:

1. **Inscription**: Créez un compte sur la page d'accueil
2. **Connexion**: Utilisez votre username/email et mot de passe
3. **Token**: Stocké dans localStorage et cookie httpOnly
4. **Expiration**: 7 jours

### API Endpoints

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur connecté

#### Ressources (authentification requise)
- `GET/POST /api/projects` - Projets
- `GET/POST /api/tasks` - Tâches
- `GET/POST /api/notes` - Notes
- `GET/POST /api/events` - Événements
- `GET/POST /api/time` - Suivi du temps

## 🛠️ Technologies

### Backend
- **Express** 5.x - Framework web
- **Sequelize** 6.x - ORM
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe

### Frontend
- **React** 19.x - Library UI
- **Vite** - Build tool
- **TailwindCSS** 4.x - Styling
- **Lucide React** - Icônes

## 📁 Structure des données

### Modèles principaux

- **User** - Utilisateurs
- **Project** - Projets
- **Task** - Tâches (Kanban)
- **Note** - Notes avec tags
- **Event** - Événements calendrier
- **Tag** - Tags pour notes/tâches
- **TimeEntry** - Suivi du temps

Voir `backend/models/` pour les définitions complètes.

## 🔧 Développement

### Ajouter une nouvelle route API

1. Créer le fichier de route dans `backend/server/routes/`
2. L'importer dans `backend/server/index.js`
3. Créer la fonction API correspondante dans `frontend/src/services/api.js`

### Ajouter un nouveau composant

1. Créer le composant dans `frontend/src/Components/`
2. Utiliser le hook `useAuth()` pour l'authentification
3. Utiliser les services API de `frontend/src/services/api.js`

## 📝 Documentation

- [Schéma de base de données](backend/database/)

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
cd backend
npm run db:check  # Vérifier la connexion DB
```

### Erreur CORS
Vérifiez que `FRONTEND_URL` dans `backend/.env` correspond à l'URL du frontend.

### Erreur d'authentification
Vérifiez que le token est bien stocké dans localStorage et que `JWT_SECRET` est configuré.

## 📄 Licence

ISC
