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

// Start timer for a task
router.post('/:id/start', async (req, res) => {
  try {
    const task = await db.Task.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Stop all other running tasks
    await db.Task.update(
      { isRunning: false, timerStartedAt: null },
      { where: { userId: req.userId, isRunning: true } }
    );

    // Start this task
    task.isRunning = true;
    task.timerStartedAt = new Date();
    await task.save();

    res.json({ task });
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ error: 'Failed to start timer' });
  }
});

// Stop timer for a task and create TimeEntry
router.post('/:id/stop', async (req, res) => {
  try {
    const task = await db.Task.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!task.isRunning || !task.timerStartedAt) {
      return res.status(400).json({ error: 'Timer is not running' });
    }

    // Calculate elapsed time
    const endedAt = new Date();
    const startedAt = new Date(task.timerStartedAt);
    // Use getTime() to get milliseconds since epoch to avoid timezone issues
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

    // Create TimeEntry
    const timeEntry = await db.TimeEntry.create({
      userId: req.userId,
      taskId: task.id,
      projectId: task.projectId,
      description: `Travail sur: ${task.title}`,
      durationSeconds,
      startedAt,
      endedAt,
      date: startedAt.toISOString().split('T')[0]
    });

    // Update task
    task.timeSpent = (task.timeSpent || 0) + durationSeconds;
    task.isRunning = false;
    task.timerStartedAt = null;
    await task.save();

    res.json({ task, timeEntry });
  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(500).json({ error: 'Failed to stop timer' });
  }
});

export default router;
