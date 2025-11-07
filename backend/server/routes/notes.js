import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../../models/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const notes = await db.Note.findAll({
      where: { userId: req.userId, isArchived: false },
      include: [{ model: db.Tag, as: 'tags', through: { attributes: [] } }],
      order: [['updatedAt', 'DESC']]
    });
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const note = await db.Note.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const note = await db.Note.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await note.update(req.body);
    res.json({ note });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await db.Note.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await note.destroy();
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
