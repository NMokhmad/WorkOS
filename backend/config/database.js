/**
 * Configuration de la connexion à la base de données
 * Supporte MySQL et PostgreSQL
 */

import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'workos',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql', // 'mysql' ou 'postgres'
    logging: console.log, // Affiche les requêtes SQL en développement
    timezone: '+00:00',
    define: {
      timestamps: true,
      underscored: false, // utilise camelCase au lieu de snake_case
      freezeTableName: true, // empêche Sequelize de pluraliser les noms de tables
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE_TEST || 'workos_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false, // Désactive les logs en test
    timezone: '+00:00',
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    }
  },

  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false, // Désactive les logs en production
    timezone: '+00:00',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  }
};
