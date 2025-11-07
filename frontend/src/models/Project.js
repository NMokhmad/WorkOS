/**
 * Modèle Project - Projets de travail
 */

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Project = sequelize.define('projects', {
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
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    color: {
      type: DataTypes.STRING(50),
      defaultValue: 'blue',
      validate: {
        isIn: [['blue', 'green', 'purple', 'orange', 'pink', 'red', 'yellow', 'indigo', 'cyan', 'teal']]
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'completed'),
      defaultValue: 'active'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      field: 'start_date'
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      field: 'due_date'
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
    tableName: 'projects',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] }
    ]
  });

  // Méthodes d'instance
  Project.prototype.isOverdue = function() {
    if (!this.dueDate || this.status === 'completed') return false;
    return new Date(this.dueDate) < new Date();
  };

  Project.prototype.getDaysRemaining = function() {
    if (!this.dueDate) return null;
    const today = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return Project;
};
