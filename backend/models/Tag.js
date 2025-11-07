/**
 * Modèle Tag - Tags pour organiser les notes et tâches
 */

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Tag = sequelize.define('tags', {
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
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    color: {
      type: DataTypes.STRING(50),
      defaultValue: 'gray',
      validate: {
        isIn: [['blue', 'green', 'purple', 'orange', 'pink', 'red', 'yellow', 'indigo', 'cyan', 'teal', 'amber', 'lime', 'gray']]
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    timestamps: false,
    tableName: 'tags',
    indexes: [
      { fields: ['user_id'] },
      {
        unique: true,
        fields: ['user_id', 'name'],
        name: 'unique_user_tag'
      }
    ]
  });

  return Tag;
};
