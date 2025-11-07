import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../../models/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const projects = await db.Project.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });

    // Enrichir chaque projet avec ses statistiques
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        // Compter les tâches par statut
        const tasks = await db.Task.findAll({
          where: { projectId: project.id, userId: req.userId },
          attributes: ['status', 'timeSpent']
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const totalTimeSpent = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);

        return {
          ...project.toJSON(),
          totalTasks,
          completedTasks,
          totalTimeSpent
        };
      })
    );

    res.json({ projects: projectsWithStats });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/', async (req, res) => {
  try {
    const project = await db.Project.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await db.Project.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await db.Project.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await project.update(req.body);
    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await db.Project.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
