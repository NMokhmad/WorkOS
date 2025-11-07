// Dashboard - Vue d'ensemble avec statistiques et activité récente
import { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  FolderOpen,
  TrendingUp,
  Target,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, tasksAPI, timeAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tasksInProgress: 0,
    timeToday: '0h 0m',
    activeProjects: 0,
    completionRate: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger les données en parallèle
      const [tasksData, projectsData, timeData] = await Promise.all([
        tasksAPI.getAll(),
        projectsAPI.getAll(),
        timeAPI.getAll({ date: new Date().toISOString().split('T')[0] })
      ]);

      // Calculer les statistiques
      const tasks = tasksData.tasks || [];
      const projects = projectsData.projects || [];
      const timeEntries = timeData.timeEntries || [];

      const tasksInProgress = tasks.filter(t => t.status === 'inProgress').length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const completionRate = tasks.length > 0
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;

      // Calculer le temps total aujourd'hui
      const totalSeconds = timeEntries.reduce((sum, entry) => sum + (entry.durationSeconds || 0), 0);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const timeToday = `${hours}h ${minutes}m`;

      setStats({
        tasksInProgress,
        timeToday,
        activeProjects,
        completionRate
      });

      // Prendre les 5 dernières tâches modifiées
      const sortedTasks = [...tasks]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);

      setRecentTasks(sortedTasks);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      todo: { label: 'À faire', class: 'bg-slate-100 text-slate-700' },
      inProgress: { label: 'En cours', class: 'bg-blue-100 text-blue-700' },
      done: { label: 'Terminé', class: 'bg-green-100 text-green-700' }
    };
    const badge = badges[status] || badges.todo;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statsCards = [
    {
      icon: CheckSquare,
      title: 'Tâches en cours',
      value: stats.tasksInProgress,
      change: 'Tâches actives',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Clock,
      title: "Temps aujourd'hui",
      value: stats.timeToday,
      change: 'Temps de travail',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FolderOpen,
      title: 'Projets actifs',
      value: stats.activeProjects,
      change: 'En cours',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Target,
      title: 'Taux de complétion',
      value: `${stats.completionRate}%`,
      change: 'Objectifs atteints',
      color: 'from-orange-500 to-orange-600'
    }
  ];

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

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Activité récente */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Activité récente</h2>

          {recentTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune tâche récente</p>
              <p className="text-sm mt-2">Créez votre première tâche pour commencer !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800">{task.title}</h3>
                    <p className="text-sm text-slate-500">
                      {task.project?.name || 'Sans projet'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Actions rapides</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all">
              <p className="font-medium">Nouvelle tâche</p>
              <p className="text-sm opacity-90">Créer une tâche rapidement</p>
            </button>
            <button className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <p className="font-medium text-slate-800">Démarrer le timer</p>
              <p className="text-sm text-slate-600">Suivre votre temps de travail</p>
            </button>
            <button className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <p className="font-medium text-slate-800">Nouveau projet</p>
              <p className="text-sm text-slate-600">Organiser vos objectifs</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
