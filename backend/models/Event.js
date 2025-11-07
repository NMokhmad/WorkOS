/**
 * Modèle Event - Événements du calendrier
 */

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Event = sequelize.define('events', {
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
    startDatetime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_datetime'
    },
    endDatetime: {
      type: DataTypes.DATE,
      field: 'end_datetime'
    },
    color: {
      type: DataTypes.STRING(50),
      defaultValue: 'blue',
      validate: {
        isIn: [['blue', 'green', 'purple', 'orange', 'pink', 'red', 'yellow']]
      }
    },
    location: {
      type: DataTypes.STRING(255)
    },
    attendees: {
      type: DataTypes.TEXT,
      comment: 'JSON array des participants',
      get() {
        const rawValue = this.getDataValue('attendees');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('attendees', JSON.stringify(value));
      }
    },
    reminderMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
      field: 'reminder_minutes'
    },
    isAllDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_all_day'
    },
    recurrenceRule: {
      type: DataTypes.STRING(255),
      field: 'recurrence_rule',
      comment: 'Format iCal RRULE'
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
    tableName: 'events',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['project_id'] },
      { fields: ['start_datetime'] }
    ]
  });

  // Méthodes d'instance
  Event.prototype.getDuration = function() {
    if (!this.endDatetime) return null;
    const diff = new Date(this.endDatetime) - new Date(this.startDatetime);
    return Math.floor(diff / 1000 / 60); // en minutes
  };

  Event.prototype.isUpcoming = function() {
    return new Date(this.startDatetime) > new Date();
  };

  Event.prototype.isPast = function() {
    const endDate = this.endDatetime || this.startDatetime;
    return new Date(endDate) < new Date();
  };

  Event.prototype.isToday = function() {
    const today = new Date();
    const eventDate = new Date(this.startDatetime);
    return eventDate.toDateString() === today.toDateString();
  };

  return Event;
};
