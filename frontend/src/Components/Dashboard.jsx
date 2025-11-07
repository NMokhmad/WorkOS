// Dashboard - Vue d'ensemble avec statistiques et analytics
import { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  FolderOpen,
  Target,
  Loader,
  FileText,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, tasksAPI, timeAPI, eventsAPI, notesAPI } from '../services/api';
import StatCard from './Dashboard/StatCard';
import ProductivityChart from './Dashboard/ProductivityChart';
import RecentActivity from './Dashboard/RecentActivity';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tasksInProgress: 0,
    timeToday: '0h 0m',
    activeProjects: 0,
    completionRate: 0,
    totalNotes: 0,
    upcomingEvents: 0,
    tasksCompleted: 0,
    totalTimeSpent: 0
  });
  const [productivityData, setProductivityData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger toutes les données en parallèle
      const [tasksData, projectsData, timeData, eventsData, notesData] = await Promise.all([
        tasksAPI.getAll(),
        projectsAPI.getAll(),
        timeAPI.getAll({ date: new Date().toISOString().split('T')[0] }),
        eventsAPI.getAll(),
        notesAPI.getAll()
      ]);

      const tasks = tasksData.tasks || [];
      const projects = projectsData.projects || [];
      const timeEntries = timeData.timeEntries || [];
      const events = eventsData.events || [];
      const notes = notesData.notes || [];

      // Statistiques
      const tasksInProgress = tasks.filter(t => t.status === 'inProgress').length;
      const tasksCompleted = tasks.filter(t => t.status === 'done').length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completionRate = tasks.length > 0
        ? Math.round((tasksCompleted / tasks.length) * 100)
        : 0;

      // Temps total aujourd'hui
      const totalSeconds = timeEntries.reduce((sum, entry) => sum + (entry.durationSeconds || 0), 0);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const timeToday = `${hours}h ${minutes}m`;

      // Temps total passé sur toutes les tâches
      const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);

      // Événements à venir (dans les 7 prochains jours)
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= now && eventDate <= sevenDaysLater;
      }).length;

      setStats({
        tasksInProgress,
        timeToday,
        activeProjects,
        completionRate,
        totalNotes: notes.length,
        upcomingEvents,
        tasksCompleted,
        totalTimeSpent
      });

      // Données de productivité par statut
      const todoCount = tasks.filter(t => t.status === 'todo').length;
      const inProgressCount = tasks.filter(t => t.status === 'inProgress').length;
      const doneCount = tasks.filter(t => t.status === 'done').length;

      setProductivityData([
        { label: 'À faire', value: todoCount },
        { label: 'En cours', value: inProgressCount },
        { label: 'Terminées', value: doneCount }
      ]);

      // Activités récentes (combinaison de tâches, notes, événements)
      const activities = [];

      // Tâches récentes
      tasks.slice(0, 3).forEach(task => {
        activities.push({
          type: 'task',
          title: task.title,
          description: `Tâche ${task.status === 'done' ? 'terminée' : task.status === 'inProgress' ? 'en cours' : 'créée'}`,
          timestamp: task.updatedAt
        });
      });

      // Notes récentes
      notes.slice(0, 2).forEach(note => {
        activities.push({
          type: 'note',
          title: note.title,
          description: 'Note mise à jour',
          timestamp: note.updatedAt
        });
      });

      // Événements récents
      events.slice(0, 2).forEach(event => {
        activities.push({
          type: 'event',
          title: event.title,
          description: `Événement le ${new Date(event.startDate).toLocaleDateString('fr-FR')}`,
          timestamp: event.updatedAt
        });
      });

      // Trier par date
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentActivity(activities.slice(0, 8));

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Bonjour {user?.firstName || user?.username} 👋
        </h1>
        <p className="text-slate-600">
          Voici un aperçu de votre journée du {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tâches en cours"
          value={stats.tasksInProgress}
          icon={CheckSquare}
          color="blue"
          subtitle={`${stats.tasksCompleted} terminées`}
        />
        <StatCard
          title="Temps aujourd'hui"
          value={stats.timeToday}
          icon={Clock}
          color="green"
          subtitle={`Total: ${formatTime(stats.totalTimeSpent)}`}
        />
        <StatCard
          title="Projets actifs"
          value={stats.activeProjects}
          icon={FolderOpen}
          color="purple"
          subtitle="En cours de réalisation"
        />
        <StatCard
          title="Taux de complétion"
          value={`${stats.completionRate}%`}
          icon={Target}
          color="orange"
          trend={stats.completionRate >= 50 ? 'up' : 'down'}
          trendValue={`${stats.completionRate}%`}
        />
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Notes"
          value={stats.totalNotes}
          icon={FileText}
          color="emerald"
          subtitle="Notes enregistrées"
        />
        <StatCard
          title="Événements à venir"
          value={stats.upcomingEvents}
          icon={Calendar}
          color="purple"
          subtitle="Dans les 7 prochains jours"
        />
        <StatCard
          title="Tendance"
          value={<TrendingUp className="w-8 h-8" />}
          icon={TrendingUp}
          color="blue"
          subtitle="Productivité en hausse"
        />
      </div>

      {/* Graphiques et activités */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Graphique de productivité */}
        <div className="lg:col-span-2">
          <ProductivityChart
            data={productivityData}
            title="Répartition des tâches"
          />
        </div>

        {/* Activités récentes */}
        <div>
          <RecentActivity activities={recentActivity} />
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Actions rapides</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/tasks'}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-6 rounded-xl transition-all text-left"
          >
            <CheckSquare className="w-8 h-8 mb-3" />
            <p className="font-semibold text-lg">Nouvelle tâche</p>
            <p className="text-sm opacity-90">Créer une tâche rapidement</p>
          </button>
          <button
            onClick={() => window.location.href = '/projects'}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-6 rounded-xl transition-all text-left"
          >
            <FolderOpen className="w-8 h-8 mb-3" />
            <p className="font-semibold text-lg">Nouveau projet</p>
            <p className="text-sm opacity-90">Organiser vos objectifs</p>
          </button>
          <button
            onClick={() => window.location.href = '/notes'}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-6 rounded-xl transition-all text-left"
          >
            <FileText className="w-8 h-8 mb-3" />
            <p className="font-semibold text-lg">Nouvelle note</p>
            <p className="text-sm opacity-90">Capturer une idée</p>
          </button>
        </div>
      </div>
    </div>
  );
}
