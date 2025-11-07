// ReportsPage - Page de rapports et exports
import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, TrendingUp, Loader, Filter } from 'lucide-react';
import { projectsAPI, tasksAPI, timeAPI } from '../../services/api';
import { downloadCSV, downloadJSON, formatTasksForExport, formatProjectsForExport, formatTimeEntriesForExport } from '../../utils/exportData';
import ProductivityChart from '../Dashboard/ProductivityChart';
import PieChart from './PieChart';
import StatCard from '../Dashboard/StatCard';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [data, setData] = useState({
    tasks: [],
    projects: [],
    timeEntries: []
  });

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalProjects: 0,
    totalTime: 0,
    averageTaskTime: 0,
    completionRate: 0
  });

  const [charts, setCharts] = useState({
    tasksByStatus: [],
    timeByProject: [],
    tasksByPriority: []
  });

  useEffect(() => {
    loadReportsData();
  }, [dateRange]);

  const loadReportsData = async () => {
    try {
      setLoading(true);

      const [tasksRes, projectsRes, timeRes] = await Promise.all([
        tasksAPI.getAll(),
        projectsAPI.getAll(),
        timeAPI.getAll()
      ]);

      const tasks = tasksRes.tasks || [];
      const projects = projectsRes.projects || [];
      const timeEntries = timeRes.timeEntries || [];

      // Filtrer par date si nécessaire
      const filteredTasks = tasks.filter(task => {
        const createdAt = new Date(task.createdAt);
        return createdAt >= new Date(dateRange.start) && createdAt <= new Date(dateRange.end);
      });

      setData({
        tasks: filteredTasks,
        projects,
        timeEntries
      });

      // Calculer les statistiques
      const totalTasks = filteredTasks.length;
      const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
      const totalProjects = projects.length;
      const totalTime = filteredTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
      const averageTaskTime = totalTasks > 0 ? Math.floor(totalTime / totalTasks) : 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setStats({
        totalTasks,
        completedTasks,
        totalProjects,
        totalTime,
        averageTaskTime,
        completionRate
      });

      // Données pour les graphiques
      const todoCount = filteredTasks.filter(t => t.status === 'todo').length;
      const inProgressCount = filteredTasks.filter(t => t.status === 'inProgress').length;
      const doneCount = filteredTasks.filter(t => t.status === 'done').length;

      setCharts({
        tasksByStatus: [
          { label: 'À faire', value: todoCount },
          { label: 'En cours', value: inProgressCount },
          { label: 'Terminées', value: doneCount }
        ],
        timeByProject: projects
          .map(project => ({
            label: project.name,
            value: Math.floor((project.totalTimeSpent || 0) / 3600), // en heures
            color: project.color
          }))
          .filter(p => p.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 5),
        tasksByPriority: [
          { label: 'Haute', value: filteredTasks.filter(t => t.priority === 'high').length },
          { label: 'Moyenne', value: filteredTasks.filter(t => t.priority === 'medium').length },
          { label: 'Basse', value: filteredTasks.filter(t => t.priority === 'low').length }
        ].filter(p => p.value > 0)
      });

    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportTasks = (format) => {
    const formattedData = formatTasksForExport(data.tasks);
    if (format === 'csv') {
      downloadCSV(formattedData, ['title', 'description', 'status', 'priority', 'project', 'dueDate', 'timeSpent', 'createdAt', 'updatedAt'], `workos-tasks-${Date.now()}`);
    } else {
      downloadJSON(formattedData, `workos-tasks-${Date.now()}`);
    }
  };

  const handleExportProjects = (format) => {
    const formattedData = formatProjectsForExport(data.projects);
    if (format === 'csv') {
      downloadCSV(formattedData, ['name', 'description', 'status', 'color', 'startDate', 'endDate', 'totalTasks', 'completedTasks', 'totalTimeSpent', 'createdAt'], `workos-projects-${Date.now()}`);
    } else {
      downloadJSON(formattedData, `workos-projects-${Date.now()}`);
    }
  };

  const handleExportTimeEntries = (format) => {
    const formattedData = formatTimeEntriesForExport(data.timeEntries);
    if (format === 'csv') {
      downloadCSV(formattedData, ['task', 'project', 'duration', 'startedAt', 'endedAt', 'date'], `workos-time-${Date.now()}`);
    } else {
      downloadJSON(formattedData, `workos-time-${Date.now()}`);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rapports & Analyses</h1>
          <p className="text-slate-600 mt-1">Vue d'ensemble de votre productivité</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm border border-slate-200">
          <Filter className="w-5 h-5 text-slate-600" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
          />
          <span className="text-slate-600">→</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tâches"
          value={stats.totalTasks}
          icon={FileText}
          color="blue"
          subtitle={`${stats.completedTasks} terminées`}
        />
        <StatCard
          title="Taux de complétion"
          value={`${stats.completionRate}%`}
          icon={TrendingUp}
          color="green"
          trend={stats.completionRate >= 50 ? 'up' : 'down'}
          trendValue={`${stats.completionRate}%`}
        />
        <StatCard
          title="Temps total"
          value={formatTime(stats.totalTime)}
          icon={Calendar}
          color="purple"
          subtitle={`Moyenne: ${formatTime(stats.averageTaskTime)}`}
        />
        <StatCard
          title="Projets actifs"
          value={stats.totalProjects}
          icon={FileText}
          color="orange"
          subtitle="En cours"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <ProductivityChart
          data={charts.tasksByStatus}
          title="Répartition des tâches par statut"
        />
        <PieChart
          data={charts.timeByProject}
          title="Temps par projet (heures)"
        />
      </div>

      {charts.tasksByPriority.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-8">
          <PieChart
            data={charts.tasksByPriority}
            title="Tâches par priorité"
          />
        </div>
      )}

      {/* Export Section */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-2">
          <Download className="w-6 h-6" />
          <span>Exporter les données</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Export Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Tâches ({data.tasks.length})</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleExportTasks('csv')}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExportTasks('json')}
                className="w-full px-4 py-2.5 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Export Projects */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Projets ({data.projects.length})</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleExportProjects('csv')}
                className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExportProjects('json')}
                className="w-full px-4 py-2.5 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Export Time Entries */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Temps ({data.timeEntries.length})</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleExportTimeEntries('csv')}
                className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExportTimeEntries('json')}
                className="w-full px-4 py-2.5 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-6">
          Les données sont exportées au format CSV ou JSON pour une utilisation dans d'autres applications.
        </p>
      </div>
    </div>
  );
}
