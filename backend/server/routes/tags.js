import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../../models/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const tags = await db.Tag.findAll({
      where: { userId: req.userId },
      order: [['name', 'ASC']]
    });
    res.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

router.post('/', async (req, res) => {
  try {
    const tag = await db.Tag.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json({ tag });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tag = await db.Tag.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    await tag.update(req.body);
    res.json({ tag });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tag = await db.Tag.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    await tag.destroy();
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

export default router;
