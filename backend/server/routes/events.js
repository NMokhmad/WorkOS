import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../../models/index.js';

const router = express.Router();

router.use(authenticate);

// Mapper les champs frontend -> backend
const mapToBackend = (data) => ({
  title: data.title,
  description: data.description,
  startDatetime: data.startDate,
  endDatetime: data.endDate,
  projectId: data.projectId,
  location: data.location,
  isAllDay: data.isAllDay
});

// Mapper les champs backend -> frontend
const mapToFrontend = (event) => ({
  ...event.toJSON(),
  startDate: event.startDatetime,
  endDate: event.endDatetime
});

router.get('/', async (req, res) => {
  try {
    const events = await db.Event.findAll({
      where: { userId: req.userId },
      include: [{ model: db.Project, as: 'project', attributes: ['id', 'name', 'color'] }],
      order: [['startDatetime', 'ASC']]
    });

    const mappedEvents = events.map(mapToFrontend);
    res.json({ events: mappedEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/', async (req, res) => {
  try {
    const eventData = {
      ...mapToBackend(req.body),
      userId: req.userId
    };

    const event = await db.Event.create(eventData);
    const mappedEvent = mapToFrontend(event);
    res.status(201).json({ event: mappedEvent });
  } catch (error) {
    console.error('Error creating event:', error);
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

    const eventData = mapToBackend(req.body);
    await event.update(eventData);

    const mappedEvent = mapToFrontend(event);
    res.json({ event: mappedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
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
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
