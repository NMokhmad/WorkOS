import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../../models/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const tasks = await db.Task.findAll({
      where: { userId: req.userId },
      include: [
        { model: db.Project, as: 'project', attributes: ['id', 'name', 'color'] },
        { model: db.Tag, as: 'tags', through: { attributes: [] } }
      ],
      order: [['status', 'ASC'], ['position', 'ASC']]
    });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const task = await db.Task.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await db.Task.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await task.update(req.body);
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await db.Task.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
