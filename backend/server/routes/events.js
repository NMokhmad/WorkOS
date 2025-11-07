import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../../models/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const events = await db.Event.findAll({
      where: { userId: req.userId },
      include: [{ model: db.Project, as: 'project', attributes: ['id', 'name', 'color'] }],
      order: [['startDatetime', 'ASC']]
    });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/', async (req, res) => {
  try {
    const event = await db.Event.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const event = await db.Event.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    await event.update(req.body);
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const event = await db.Event.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
