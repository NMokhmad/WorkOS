/**
 * Point d'entrée des modèles Sequelize
 * Initialise la connexion et définit toutes les associations
 */

import { Sequelize } from 'sequelize';
import config from '../config/database.js';
import UserModel from './User.js';
import ProjectModel from './Project.js';
import TaskModel from './Task.js';
import EventModel from './Event.js';
import NoteModel from './Note.js';
import TagModel from './Tag.js';
import TimeEntryModel from './TimeEntry.js';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialisation de Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Import des modèles
const User = UserModel(sequelize);
const Project = ProjectModel(sequelize);
const Task = TaskModel(sequelize);
const Event = EventModel(sequelize);
const Note = NoteModel(sequelize);
const Tag = TagModel(sequelize);
const TimeEntry = TimeEntryModel(sequelize);

// ===========================================
// Définition des associations
// ===========================================

// User associations
User.hasMany(Project, { foreignKey: 'userId', as: 'projects', onDelete: 'CASCADE' });
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks', onDelete: 'CASCADE' });
User.hasMany(Event, { foreignKey: 'userId', as: 'events', onDelete: 'CASCADE' });
User.hasMany(Note, { foreignKey: 'userId', as: 'notes', onDelete: 'CASCADE' });
User.hasMany(Tag, { foreignKey: 'userId', as: 'tags', onDelete: 'CASCADE' });
User.hasMany(TimeEntry, { foreignKey: 'userId', as: 'timeEntries', onDelete: 'CASCADE' });

// Project associations
Project.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'SET NULL' });
Project.hasMany(Event, { foreignKey: 'projectId', as: 'events', onDelete: 'SET NULL' });
Project.hasMany(Note, { foreignKey: 'projectId', as: 'notes', onDelete: 'SET NULL' });
Project.hasMany(TimeEntry, { foreignKey: 'projectId', as: 'timeEntries', onDelete: 'SET NULL' });

// Task associations
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Task.hasMany(TimeEntry, { foreignKey: 'taskId', as: 'timeEntries', onDelete: 'SET NULL' });

// Task <-> Tag (many-to-many)
Task.belongsToMany(Tag, {
  through: 'task_tags',
  foreignKey: 'task_id',
  otherKey: 'tag_id',
  as: 'tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Tag.belongsToMany(Task, {
  through: 'task_tags',
  foreignKey: 'tag_id',
  otherKey: 'task_id',
  as: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Event associations
Event.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Event.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Note associations
Note.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Note.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Note <-> Tag (many-to-many)
Note.belongsToMany(Tag, {
  through: 'note_tags',
  foreignKey: 'note_id',
  otherKey: 'tag_id',
  as: 'tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Tag.belongsToMany(Note, {
  through: 'note_tags',
  foreignKey: 'tag_id',
  otherKey: 'note_id',
  as: 'notes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Tag associations
Tag.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// TimeEntry associations
TimeEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TimeEntry.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
TimeEntry.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// ===========================================
// Export
// ===========================================

const db = {
  sequelize,
  Sequelize,
  User,
  Project,
  Task,
  Event,
  Note,
  Tag,
  TimeEntry
};

export default db;
export { sequelize, Sequelize, User, Project, Task, Event, Note, Tag, TimeEntry };
