/**
 * Routes d'authentification
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../../models/index.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Username or email already exists'
      });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await db.User.create({
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      isActive: true
    });

    // Générer le token
    const token = generateToken(user.id);

    // Définir le cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    // Retourner l'utilisateur (sans le mot de passe)
    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    // Trouver l'utilisateur (par username ou email)
    const user = await db.User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account is inactive'
      });
    }

    // Mettre à jour le lastLogin
    await user.update({ lastLogin: new Date() });

    // Générer le token
    const token = generateToken(user.id);

    // Définir le cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    // Retourner l'utilisateur (sans le mot de passe)
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Déconnexion de l'utilisateur
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * PUT /api/auth/password
 * Changer le mot de passe
 */
router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters'
      });
    }

    // Récupérer l'utilisateur avec le hash du mot de passe
    const user = await db.User.findByPk(req.userId);

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Current password is incorrect'
      });
    }

    // Hasher et enregistrer le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await user.update({ passwordHash });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;
