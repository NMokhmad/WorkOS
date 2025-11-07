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
    const { tagIds, ...noteData } = req.body;
    const note = await db.Note.create({
      ...noteData,
      userId: req.userId
    });

    // Associer les tags si fournis
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await note.setTags(tagIds);
    }

    // Recharger la note avec les tags
    const noteWithTags = await db.Note.findByPk(note.id, {
      include: [{ model: db.Tag, as: 'tags', through: { attributes: [] } }]
    });

    res.status(201).json({ note: noteWithTags });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { tagIds, ...noteData } = req.body;
    const note = await db.Note.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await note.update(noteData);

    // Mettre à jour les tags si fournis
    if (tagIds !== undefined) {
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        await note.setTags(tagIds);
      } else {
        await note.setTags([]);
      }
    }

    // Recharger la note avec les tags
    const noteWithTags = await db.Note.findByPk(note.id, {
      include: [{ model: db.Tag, as: 'tags', through: { attributes: [] } }]
    });

    res.json({ note: noteWithTags });
  } catch (error) {
    console.error('Error updating note:', error);
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
