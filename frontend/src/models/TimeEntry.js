/**
 * Modèle TimeEntry - Historique des temps de travail
 */

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const TimeEntry = sequelize.define('time_entries', {
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
    taskId: {
      type: DataTypes.INTEGER,
      field: 'task_id',
      references: {
        model: 'tasks',
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
    description: {
      type: DataTypes.STRING(500)
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'duration_seconds',
      comment: 'Durée en secondes'
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'started_at'
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'ended_at'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date pour faciliter les requêtes'
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
    tableName: 'time_entries',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['task_id'] },
      { fields: ['project_id'] },
      { fields: ['date'] },
      { fields: ['started_at'] }
    ]
  });

  // Méthodes d'instance
  TimeEntry.prototype.getFormattedDuration = function() {
    const hours = Math.floor(this.durationSeconds / 3600);
    const minutes = Math.floor((this.durationSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Méthodes statiques
  TimeEntry.getTotalByDate = async function(userId, date) {
    const { fn, col } = sequelize.Sequelize;
    const result = await this.findOne({
      where: { userId, date },
      attributes: [[fn('SUM', col('durationSeconds')), 'total']],
      raw: true
    });
    return result ? result.total || 0 : 0;
  };

  TimeEntry.getTotalByWeek = async function(userId, startDate) {
    const { fn, col, Op } = sequelize.Sequelize;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const result = await this.findOne({
      where: {
        userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [[fn('SUM', col('durationSeconds')), 'total']],
      raw: true
    });
    return result ? result.total || 0 : 0;
  };

  return TimeEntry;
};
