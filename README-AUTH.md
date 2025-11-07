# Guide d'authentification WorkOS

## Configuration initiale

### 1. Configuration de la base de données

Copiez `.env.example` vers `.env` et configurez vos paramètres :

```bash
cp .env.example .env
```

Modifiez `.env` avec vos paramètres de base de données :

```env
# Base de données
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=workos

# Backend
NODE_ENV=development
PORT=3001

# Frontend
FRONTEND_URL=http://localhost:5173

# JWT Secret (IMPORTANT: changez en production!)
JWT_SECRET=votre-clé-secrète-jwt-unique
```

### 2. Installation et initialisation

```bash
# Installer les dépendances
npm install

# Initialiser la base de données (crée les tables)
npm run db:init

# Vérifier la connexion
npm run db:check
```

### 3. Démarrage de l'application

**Option 1 : Démarrer frontend et backend ensemble**
```bash
npm run dev:all
```

**Option 2 : Démarrer séparément**
```bash
# Terminal 1 - Backend (API)
npm run server

# Terminal 2 - Frontend (React)
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- Backend API : http://localhost:3001

## Architecture

### Backend (Express + Sequelize)

```
server/
├── index.js                 # Point d'entrée du serveur
├── middleware/
│   └── auth.js             # Middleware JWT d'authentification
└── routes/
    ├── auth.js             # Routes d'authentification
    ├── user.js             # Routes utilisateur
    ├── projects.js         # Routes projets
    ├── tasks.js            # Routes tâches
    ├── notes.js            # Routes notes
    ├── events.js           # Routes événements
    └── time.js             # Routes temps de travail
```

### Frontend (React)

```
src/
├── pages/
│   └── Auth.jsx            # Page de connexion/inscription
├── contexts/
│   └── AuthContext.jsx     # Contexte React pour l'authentification
└── App.jsx                 # Point d'entrée avec protection d'authentification
```

## Fonctionnalités d'authentification

### Routes API disponibles

#### Authentification

**POST /api/auth/register** - Inscription
```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "motdepasse123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**POST /api/auth/login** - Connexion
```json
{
  "username": "john.doe",  // ou email
  "password": "motdepasse123"
}
```

**POST /api/auth/logout** - Déconnexion

**GET /api/auth/me** - Obtenir l'utilisateur connecté (authentification requise)

**PUT /api/auth/password** - Changer le mot de passe (authentification requise)
```json
{
  "currentPassword": "ancien",
  "newPassword": "nouveau"
}
```

#### Ressources protégées

Toutes les routes suivantes nécessitent une authentification :

- **GET /api/projects** - Liste des projets
- **POST /api/projects** - Créer un projet
- **GET /api/tasks** - Liste des tâches
- **POST /api/tasks** - Créer une tâche
- **GET /api/notes** - Liste des notes
- **POST /api/notes** - Créer une note
- **GET /api/events** - Liste des événements
- **POST /api/events** - Créer un événement
- **GET /api/time** - Historique des temps

## Fonctionnement de l'authentification

### JWT (JSON Web Tokens)

L'application utilise JWT pour l'authentification :

1. **Inscription/Connexion** : L'utilisateur s'inscrit ou se connecte
2. **Token JWT** : Le serveur génère un token JWT valide 7 jours
3. **Cookie HTTP** : Le token est stocké dans un cookie httpOnly sécurisé
4. **localStorage** : Le token et les infos utilisateur sont aussi sauvegardés localement
5. **Requêtes API** : Le token est automatiquement envoyé avec chaque requête

### Middleware d'authentification

Le middleware `authenticate` vérifie automatiquement :
- La présence du token JWT
- La validité du token (signature, expiration)
- L'existence et l'état actif de l'utilisateur

### Contexte React

Le `AuthContext` gère l'état d'authentification :
- `user` : Informations de l'utilisateur connecté
- `loading` : État de chargement
- `isAuthenticated` : Booléen de connexion
- `login(userData)` : Fonction de connexion
- `logout()` : Fonction de déconnexion
- `updateUser(userData)` : Mettre à jour le profil

## Utilisation dans le code

### Côté Frontend

```jsx
import { useAuth } from './contexts/AuthContext';

function MonComposant() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }

  return (
    <div>
      <p>Bonjour {user.firstName} !</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### Côté Backend

```javascript
import { authenticate } from '../middleware/auth.js';

// Route protégée
router.get('/protected', authenticate, async (req, res) => {
  // req.user contient l'utilisateur connecté
  // req.userId contient l'ID de l'utilisateur
  res.json({ message: `Bonjour ${req.user.firstName}` });
});
```

## Sécurité

### Bonnes pratiques implémentées

1. **Mots de passe** : Hashés avec bcrypt (10 rounds)
2. **Cookies httpOnly** : Protection contre XSS
3. **CORS** : Configuration stricte des origines
4. **Validation** : Validation des entrées utilisateur
5. **SQL Injection** : Protection via Sequelize ORM
6. **Expiration** : Tokens JWT expirent après 7 jours

### Recommandations pour la production

1. **JWT_SECRET** : Utilisez une clé longue et aléatoire
2. **HTTPS** : Activez SSL/TLS en production
3. **Variables d'environnement** : Ne commitez jamais le fichier `.env`
4. **Rate limiting** : Ajoutez une limitation de taux pour les routes de connexion
5. **Refresh tokens** : Implémentez des refresh tokens pour une meilleure UX
6. **2FA** : Envisagez l'authentification à deux facteurs

## Dépannage

### Erreur : "Authentication required"
- Vérifiez que le token est bien envoyé
- Vérifiez que le token n'est pas expiré
- Vérifiez la configuration CORS

### Erreur : "Invalid credentials"
- Vérifiez le nom d'utilisateur/email
- Vérifiez le mot de passe
- Vérifiez que l'utilisateur existe dans la base de données

### Erreur de connexion à la base de données
- Vérifiez les paramètres dans `.env`
- Vérifiez que MySQL/PostgreSQL est démarré
- Exécutez `npm run db:check` pour diagnostiquer

## Tests

### Tester l'API avec curl

```bash
# Inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'

# Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' \
  -c cookies.txt

# Route protégée
curl http://localhost:3001/api/auth/me \
  -b cookies.txt
```

## Support

Pour toute question ou problème, consultez :
- La documentation Sequelize : https://sequelize.org/
- La documentation Express : https://expressjs.com/
- La documentation JWT : https://jwt.io/
