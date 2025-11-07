// ProjectDetails - Vue détaillée d'un projet avec ses tâches et statistiques
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, CheckCircle, Calendar, Edit, Trash2,
  Play, Pause, Plus, BarChart3, Loader
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '../../services/api';
import TaskCard from '../Tasks/TaskCard';
import TaskModal from '../Tasks/TaskModal';
import ProjectModal from './ProjectModal';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        projectsAPI.getOne(id),
        tasksAPI.getAll()
      ]);

      setProject(projectRes.project);

      // Filtrer les tâches du projet
      const projectTasks = (tasksRes.tasks || []).filter(t => t.projectId === parseInt(id));
      setTasks(projectTasks);

      // Calculer les statistiques
      calculateStats(projectRes.project, projectTasks);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (proj, projectTasks) => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = projectTasks.filter(t => t.status === 'todo').length;
    const totalTimeSpent = projectTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    setStats({
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      totalTimeSpent,
      progressPercentage
    });
  };

  const formatTimeSpent = (seconds) => {
    if (!seconds || seconds === 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleEditProject = () => {
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (projectData) => {
    try {
      await projectsAPI.update(id, projectData);
      await loadProjectData();
      setIsProjectModalOpen(false);
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectsAPI.delete(id);
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleCreateTask = () => {
    setCurrentTask({ projectId: parseInt(id) });
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      const isEditMode = currentTask && currentTask.id;

      if (isEditMode) {
        await tasksAPI.update(currentTask.id, taskData);
      } else {
        await tasksAPI.create({ ...taskData, projectId: parseInt(id) });
      }
      await loadProjectData();
      setIsTaskModalOpen(false);
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteConfirm) return;

    try {
      await tasksAPI.delete(deleteConfirm.id);
      await loadProjectData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      await tasksAPI.startTimer(taskId);
      await loadProjectData();
    } catch (error) {
      console.error('Error starting task:', error);
    }
  };

  const handlePauseTask = async (taskId) => {
    try {
      await tasksAPI.stopTimer(taskId);
      await loadProjectData();
    } catch (error) {
      console.error('Error stopping task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Projet introuvable</h3>
        <button
          onClick={() => navigate('/projects')}
          className="text-blue-600 hover:text-blue-700"
        >
          Retour aux projets
        </button>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    archived: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  const statusLabels = {
    active: 'Actif',
    on_hold: 'En pause',
    completed: 'Terminé',
    archived: 'Archivé'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: project.color || '#3B82F6' }}
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${statusColors[project.status]}`}>
                  {statusLabels[project.status]}
                </span>
              </div>
            </div>
            {project.description && (
              <p className="text-slate-600 mt-2 max-w-3xl">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleEditProject}
            className="flex items-center space-x-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Modifier</span>
          </button>
          <button
            onClick={() => setDeleteConfirm({ type: 'project' })}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Total tâches</span>
              <CheckCircle className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-800">{stats.totalTasks}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Terminées</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">En cours</span>
              <Play className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgressTasks}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Temps total</span>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{formatTimeSpent(stats.totalTimeSpent)}</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {stats && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Progression du projet</h3>
            <span className="text-2xl font-bold text-slate-800">{stats.progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${stats.progressPercentage}%`,
                backgroundColor: project.color || '#3B82F6'
              }}
            />
          </div>
        </div>
      )}

      {/* Tasks Section */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            Tâches ({tasks.length})
          </h2>
          <button
            onClick={handleCreateTask}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle tâche</span>
          </button>
        </div>

        <div className="p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucune tâche</h3>
              <p className="text-slate-600 mb-6">Commencez par créer votre première tâche</p>
              <button
                onClick={handleCreateTask}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Créer une tâche</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={() => handleStartTask(task.id)}
                  onPause={() => handlePauseTask(task.id)}
                  onEdit={handleEditTask}
                  onDelete={(t) => setDeleteConfirm({ type: 'task', data: t })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={currentTask}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        project={project}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {deleteConfirm.type === 'project' ? 'Supprimer le projet' : 'Supprimer la tâche'}
            </h3>
            <p className="text-slate-600 mb-6">
              {deleteConfirm.type === 'project'
                ? `Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ? Toutes les tâches associées seront également supprimées. Cette action est irréversible.`
                : `Êtes-vous sûr de vouloir supprimer la tâche "${deleteConfirm.data?.title}" ? Cette action est irréversible.`}
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={deleteConfirm.type === 'project' ? handleDeleteProject : handleDeleteTask}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
