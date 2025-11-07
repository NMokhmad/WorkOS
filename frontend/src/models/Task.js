/**
 * Modèle Task - Tâches dans le système Kanban
 */

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Task = sequelize.define('tasks', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    projectId: {
      type: DataTypes.INTEGER,
      field: 'project_id',
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('todo', 'inProgress', 'done'),
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'time_spent',
      comment: 'Temps passé en secondes'
    },
    isRunning: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_running'
    },
    timerStartedAt: {
      type: DataTypes.DATE,
      field: 'timer_started_at'
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Position dans la colonne Kanban'
    },
    dueDate: {
      type: DataTypes.DATE,
      field: 'due_date'
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completed_at'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    timestamps: true,
    tableName: 'tasks',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['project_id'] },
      { fields: ['status'] },
      { fields: ['priority'] }
    ]
  });

  // Méthodes d'instance
  Task.prototype.getFormattedTimeSpent = function() {
    const hours = Math.floor(this.timeSpent / 3600);
    const minutes = Math.floor((this.timeSpent % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  Task.prototype.startTimer = function() {
    this.isRunning = true;
    this.timerStartedAt = new Date();
    return this.save();
  };

  Task.prototype.stopTimer = async function() {
    if (!this.isRunning || !this.timerStartedAt) return this;

    const elapsed = Math.floor((new Date() - this.timerStartedAt) / 1000);
    this.timeSpent += elapsed;
    this.isRunning = false;
    this.timerStartedAt = null;

    return this.save();
  };

  Task.prototype.markAsCompleted = function() {
    this.status = 'done';
    this.completedAt = new Date();
    if (this.isRunning) {
      return this.stopTimer();
    }
    return this.save();
  };

  Task.prototype.isOverdue = function() {
    if (!this.dueDate || this.status === 'done') return false;
    return new Date(this.dueDate) < new Date();
  };

  return Task;
};
