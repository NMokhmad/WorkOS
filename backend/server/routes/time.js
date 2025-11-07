import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../../models/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const where = { userId: req.userId };

    if (date) {
      where.date = date;
    }

    const timeEntries = await db.TimeEntry.findAll({
      where,
      include: [
        { model: db.Project, as: 'project', attributes: ['id', 'name', 'color'] },
        { model: db.Task, as: 'task', attributes: ['id', 'title'] }
      ],
      order: [['startedAt', 'DESC']]
    });
    res.json({ timeEntries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time entries' });
  }
});

router.post('/', async (req, res) => {
  try {
    const timeEntry = await db.TimeEntry.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json({ timeEntry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create time entry' });
  }
});

export default router;
