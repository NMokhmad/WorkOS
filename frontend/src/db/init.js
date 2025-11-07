/**
 * Script d'initialisation de la base de données
 * Teste la connexion et synchronise les modèles
 */

import db from '../models/index.js';

async function initDatabase() {
  try {
    // Test de la connexion
    console.log('🔍 Test de la connexion à la base de données...');
    await db.sequelize.authenticate();
    console.log('✅ Connexion établie avec succès!');

    // Synchronisation des modèles
    console.log('\n📦 Synchronisation des modèles...');

    // Option 1: Synchroniser sans supprimer les données existantes
    await db.sequelize.sync({ alter: false });
    console.log('✅ Modèles synchronisés!');

    // Option 2: Supprimer et recréer toutes les tables (ATTENTION: supprime les données!)
    // await db.sequelize.sync({ force: true });
    // console.log('✅ Tables recréées!');

    // Afficher les tables
    const tables = await db.sequelize.getQueryInterface().showAllTables();
    console.log('\n📋 Tables disponibles:', tables);

    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return false;
  }
}

// Fonction pour vérifier l'état de la base de données
async function checkDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Base de données accessible');

    // Compter les enregistrements dans chaque table
    const counts = {
      users: await db.User.count(),
      projects: await db.Project.count(),
      tasks: await db.Task.count(),
      events: await db.Event.count(),
      notes: await db.Note.count(),
      tags: await db.Tag.count(),
      timeEntries: await db.TimeEntry.count()
    };

    console.log('\n📊 Statistiques:');
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} enregistrements`);
    });

    return counts;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

// Fonction pour fermer la connexion
async function closeDatabase() {
  try {
    await db.sequelize.close();
    console.log('✅ Connexion fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
  }
}

// Exécuter si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const success = await initDatabase();

    if (success) {
      await checkDatabase();
    }

    await closeDatabase();
    process.exit(success ? 0 : 1);
  })();
}

export {
  initDatabase,
  checkDatabase,
  closeDatabase
};
