/**
 * Middleware d'authentification JWT
 */

import jwt from 'jsonwebtoken';
import db from '../../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware pour vérifier le token JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token depuis le cookie ou le header Authorization
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Récupérer l'utilisateur
    const user = await db.User.findByPk(decoded.userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Middleware optionnel - ajoute l'utilisateur si connecté mais ne bloque pas
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.User.findByPk(decoded.userId, {
        attributes: { exclude: ['passwordHash'] }
      });

      if (user && user.isActive) {
        req.user = user;
        req.userId = user.id;
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  }

  next();
};

/**
 * Génère un token JWT pour un utilisateur
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
