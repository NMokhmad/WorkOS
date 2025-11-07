import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../../models/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, avatarUrl } = req.body;
    await req.user.update({ firstName, lastName, avatarUrl });
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
