/**
 * Modèle Note - Notes et documentation
 */

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Note = sequelize.define('notes', {
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
    content: {
      type: DataTypes.TEXT
    },
    color: {
      type: DataTypes.STRING(50),
      defaultValue: 'blue',
      validate: {
        isIn: [['blue', 'green', 'purple', 'orange', 'pink', 'red', 'yellow', 'indigo']]
      }
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_favorite'
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_archived'
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
    tableName: 'notes',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['project_id'] },
      { fields: ['created_at'] }
    ]
  });

  // Méthodes d'instance
  Note.prototype.getExcerpt = function(length = 100) {
    if (!this.content) return '';
    const text = this.content.replace(/[#*\-\n]/g, '').trim();
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  Note.prototype.toggleFavorite = function() {
    this.isFavorite = !this.isFavorite;
    return this.save();
  };

  Note.prototype.archive = function() {
    this.isArchived = true;
    return this.save();
  };

  Note.prototype.unarchive = function() {
    this.isArchived = false;
    return this.save();
  };

  return Note;
};
