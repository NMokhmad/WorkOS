/**
 * Modèle User - Utilisateurs de l'application
 */

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    firstName: {
      type: DataTypes.STRING(100),
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      field: 'last_name'
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      field: 'avatar_url',
      validate: {
        isUrl: true
      }
    },
    profession: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'profession'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
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
    tableName: 'users',
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] }
    ]
  });

  // Méthodes d'instance
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.passwordHash; // Ne jamais exposer le hash du mot de passe
    return values;
  };

  User.prototype.getFullName = function() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  };

  return User;
};
