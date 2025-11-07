import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ tasks: [], projects: [], events: [], notes: [] });
    }

    const searchTerm = `%${q.trim()}%`;

    // Rechercher dans les tâches
    const tasks = await db.Task.findAll({
      where: {
        userId: req.userId,
        [Op.or]: [
          { title: { [Op.iLike]: searchTerm } },
          { description: { [Op.iLike]: searchTerm } }
        ]
      },
      include: [{
        model: db.Project,
        as: 'project',
        attributes: ['id', 'name', 'color']
      }],
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    // Rechercher dans les projets
    const projects = await db.Project.findAll({
      where: {
        userId: req.userId,
        [Op.or]: [
          { name: { [Op.iLike]: searchTerm } },
          { description: { [Op.iLike]: searchTerm } }
        ]
      },
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    // Rechercher dans les événements
    const events = await db.Event.findAll({
      where: {
        userId: req.userId,
        [Op.or]: [
          { title: { [Op.iLike]: searchTerm } },
          { description: { [Op.iLike]: searchTerm } },
          { location: { [Op.iLike]: searchTerm } }
        ]
      },
      include: [{
        model: db.Project,
        as: 'project',
        attributes: ['id', 'name', 'color']
      }],
      limit: 10,
      order: [['startDatetime', 'DESC']]
    });

    // Mapper les événements pour le frontend
    const mappedEvents = events.map(event => ({
      ...event.toJSON(),
      startDate: event.startDatetime,
      endDate: event.endDatetime
    }));

    // Rechercher dans les notes
    const notes = await db.Note.findAll({
      where: {
        userId: req.userId,
        [Op.or]: [
          { title: { [Op.iLike]: searchTerm } },
          { content: { [Op.iLike]: searchTerm } }
        ]
      },
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      tasks,
      projects,
      events: mappedEvents,
      notes
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

export default router;
