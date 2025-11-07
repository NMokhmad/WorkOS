/**
 * Serveur Backend WorkOS
 * API REST avec Express et authentification JWT
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import db from '../models/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import noteRoutes from './routes/notes.js';
import eventRoutes from './routes/events.js';
import timeRoutes from './routes/time.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===========================================
// Middlewares
// ===========================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===========================================
// Routes
// ===========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'WorkOS API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/time', timeRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===========================================
// Démarrage du serveur
// ===========================================

async function startServer() {
  try {
    // Test de la connexion à la base de données
    console.log('🔍 Connexion à la base de données...');
    await db.sequelize.authenticate();
    console.log('✅ Base de données connectée');

    // Synchronisation des modèles (en développement)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: false });
      console.log('✅ Modèles synchronisés');
    }

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
    process.exit(1);
  }
}

startServer();
