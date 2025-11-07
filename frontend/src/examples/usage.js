/**
 * Exemples d'utilisation de Sequelize avec WorkOS
 * Démonstration des opérations CRUD et des requêtes courantes
 */

import db from '../models/index.js';
import { Op } from 'sequelize';

// ===========================================
// Exemples CRUD de base
// ===========================================

async function createUser() {
  try {
    const user = await db.User.create({
      username: 'john.doe',
      email: 'john.doe@example.com',
      passwordHash: 'hashed_password_here',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true
    });
    console.log('✅ Utilisateur créé:', user.toJSON());
    return user;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function findUser(email) {
  try {
    const user = await db.User.findOne({
      where: { email },
      attributes: { exclude: ['passwordHash'] } // Exclure le mot de passe
    });
    console.log('✅ Utilisateur trouvé:', user ? user.toJSON() : 'Aucun');
    return user;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function updateUser(userId, updates) {
  try {
    const [updatedCount] = await db.User.update(updates, {
      where: { id: userId }
    });
    console.log(`✅ ${updatedCount} utilisateur(s) mis à jour`);
    return updatedCount;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// ===========================================
// Exemples avec relations
// ===========================================

async function getUserWithProjects(userId) {
  try {
    const user = await db.User.findByPk(userId, {
      include: [
        {
          model: db.Project,
          as: 'projects',
          where: { status: 'active' },
          required: false // LEFT JOIN au lieu de INNER JOIN
        }
      ]
    });
    console.log('✅ Utilisateur avec projets:', user ? user.toJSON() : 'Aucun');
    return user;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function getProjectWithTasks(projectId) {
  try {
    const project = await db.Project.findByPk(projectId, {
      include: [
        {
          model: db.Task,
          as: 'tasks',
          include: [
            {
              model: db.Tag,
              as: 'tags',
              through: { attributes: [] } // Exclure les colonnes de la table de jonction
            }
          ]
        }
      ]
    });
    console.log('✅ Projet avec tâches:', project ? project.toJSON() : 'Aucun');
    return project;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// ===========================================
// Exemples de requêtes avancées
// ===========================================

async function getTasksKanban(userId) {
  try {
    const tasks = await db.Task.findAll({
      where: { userId },
      include: [
        {
          model: db.Project,
          as: 'project',
          attributes: ['id', 'name', 'color']
        },
        {
          model: db.Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ],
      order: [
        ['status', 'ASC'],
        ['position', 'ASC']
      ]
    });

    // Grouper par statut
    const kanban = {
      todo: tasks.filter(t => t.status === 'todo'),
      inProgress: tasks.filter(t => t.status === 'inProgress'),
      done: tasks.filter(t => t.status === 'done')
    };

    console.log('✅ Tâches Kanban:', {
      todo: kanban.todo.length,
      inProgress: kanban.inProgress.length,
      done: kanban.done.length
    });

    return kanban;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function getUpcomingEvents(userId, days = 7) {
  try {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const events = await db.Event.findAll({
      where: {
        userId,
        startDatetime: {
          [Op.between]: [now, future]
        }
      },
      include: [
        {
          model: db.Project,
          as: 'project',
          attributes: ['id', 'name', 'color']
        }
      ],
      order: [['startDatetime', 'ASC']]
    });

    console.log(`✅ ${events.length} événement(s) à venir dans les ${days} prochains jours`);
    return events;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function searchNotes(userId, searchTerm) {
  try {
    const notes = await db.Note.findAll({
      where: {
        userId,
        [Op.or]: [
          { title: { [Op.like]: `%${searchTerm}%` } },
          { content: { [Op.like]: `%${searchTerm}%` } }
        ],
        isArchived: false
      },
      include: [
        {
          model: db.Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    console.log(`✅ ${notes.length} note(s) trouvée(s) pour "${searchTerm}"`);
    return notes;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// ===========================================
// Statistiques et agrégations
// ===========================================

async function getDailyTimeStats(userId, date) {
  try {
    const timeEntries = await db.TimeEntry.findAll({
      where: {
        userId,
        date
      },
      include: [
        {
          model: db.Project,
          as: 'project',
          attributes: ['id', 'name', 'color']
        }
      ]
    });

    const totalSeconds = timeEntries.reduce((sum, entry) => sum + entry.durationSeconds, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    console.log(`✅ Temps total pour ${date}: ${hours}h ${minutes}m`);
    return {
      entries: timeEntries,
      totalSeconds,
      formatted: `${hours}h ${minutes}m`
    };
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function getProjectStats(projectId) {
  try {
    const [tasksCount, completedTasks, totalTime] = await Promise.all([
      db.Task.count({ where: { projectId } }),
      db.Task.count({ where: { projectId, status: 'done' } }),
      db.TimeEntry.sum('durationSeconds', { where: { projectId } })
    ]);

    const stats = {
      totalTasks: tasksCount,
      completedTasks,
      completionRate: tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0,
      totalTimeSpent: totalTime || 0,
      formattedTime: formatSeconds(totalTime || 0)
    };

    console.log('✅ Statistiques du projet:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// ===========================================
// Gestion des tâches avec timer
// ===========================================

async function startTaskTimer(taskId) {
  try {
    // Arrêter tous les autres timers de l'utilisateur
    const task = await db.Task.findByPk(taskId);
    if (!task) throw new Error('Tâche non trouvée');

    await db.Task.update(
      { isRunning: false, timerStartedAt: null },
      { where: { userId: task.userId, isRunning: true } }
    );

    // Démarrer le timer de cette tâche
    await task.startTimer();
    console.log('✅ Timer démarré pour la tâche:', taskId);
    return task;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function stopTaskTimer(taskId) {
  try {
    const task = await db.Task.findByPk(taskId);
    if (!task) throw new Error('Tâche non trouvée');

    if (!task.isRunning) {
      console.log('ℹ️  Le timer n\'est pas en cours');
      return task;
    }

    // Calculer la durée
    const elapsed = Math.floor((new Date() - new Date(task.timerStartedAt)) / 1000);

    // Créer une entrée de temps
    await db.TimeEntry.create({
      userId: task.userId,
      taskId: task.id,
      projectId: task.projectId,
      description: task.title,
      durationSeconds: elapsed,
      startedAt: task.timerStartedAt,
      endedAt: new Date(),
      date: new Date().toISOString().split('T')[0]
    });

    // Arrêter le timer
    await task.stopTimer();
    console.log(`✅ Timer arrêté - Durée: ${formatSeconds(elapsed)}`);
    return task;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// ===========================================
// Gestion des tags
// ===========================================

async function addTagsToTask(taskId, tagNames) {
  try {
    const task = await db.Task.findByPk(taskId);
    if (!task) throw new Error('Tâche non trouvée');

    // Trouver ou créer les tags
    const tags = await Promise.all(
      tagNames.map(name =>
        db.Tag.findOrCreate({
          where: { userId: task.userId, name },
          defaults: { color: 'gray' }
        }).then(([tag]) => tag)
      )
    );

    // Associer les tags à la tâche
    await task.setTags(tags);
    console.log(`✅ ${tags.length} tag(s) ajouté(s) à la tâche`);
    return tags;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// ===========================================
// Utilitaires
// ===========================================

function formatSeconds(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

// ===========================================
// Exemple d'utilisation complète
// ===========================================

async function exampleWorkflow() {
  try {
    console.log('\n🚀 Démarrage du workflow d\'exemple...\n');

    // 1. Créer un utilisateur
    console.log('1️⃣  Création d\'un utilisateur...');
    const user = await createUser();
    if (!user) return;

    // 2. Créer un projet
    console.log('\n2️⃣  Création d\'un projet...');
    const project = await db.Project.create({
      userId: user.id,
      name: 'Projet de test',
      description: 'Un projet de démonstration',
      color: 'blue',
      status: 'active'
    });
    console.log('✅ Projet créé:', project.name);

    // 3. Créer des tâches
    console.log('\n3️⃣  Création de tâches...');
    const task1 = await db.Task.create({
      userId: user.id,
      projectId: project.id,
      title: 'Première tâche',
      description: 'Description de la tâche',
      status: 'todo',
      priority: 'high',
      position: 1
    });
    console.log('✅ Tâche créée:', task1.title);

    // 4. Ajouter des tags
    console.log('\n4️⃣  Ajout de tags...');
    await addTagsToTask(task1.id, ['urgent', 'backend']);

    // 5. Démarrer le timer
    console.log('\n5️⃣  Démarrage du timer...');
    await startTaskTimer(task1.id);

    // Simuler du travail
    console.log('⏳ Simulation de travail (2 secondes)...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Arrêter le timer
    console.log('\n6️⃣  Arrêt du timer...');
    await stopTaskTimer(task1.id);

    // 7. Récupérer les statistiques
    console.log('\n7️⃣  Récupération des statistiques...');
    const today = new Date().toISOString().split('T')[0];
    await getDailyTimeStats(user.id, today);

    // 8. Récupérer les tâches Kanban
    console.log('\n8️⃣  Récupération du Kanban...');
    await getTasksKanban(user.id);

    console.log('\n✅ Workflow terminé avec succès!\n');
  } catch (error) {
    console.error('\n❌ Erreur dans le workflow:', error.message);
  } finally {
    await db.sequelize.close();
  }
}

// Exécuter l'exemple si le fichier est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleWorkflow();
}

export {
  createUser,
  findUser,
  updateUser,
  getUserWithProjects,
  getProjectWithTasks,
  getTasksKanban,
  getUpcomingEvents,
  searchNotes,
  getDailyTimeStats,
  getProjectStats,
  startTaskTimer,
  stopTaskTimer,
  addTagsToTask
};
