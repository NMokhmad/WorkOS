// ProjectCard - Carte pour afficher un projet
import React from 'react';
import { Folder, Clock, CheckCircle, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ProjectCard({ project, onView, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleView = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onView(project);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(project);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(project);
  };

  // Format time spent in seconds to "Xh Ym"
  const formatTimeSpent = (seconds) => {
    if (!seconds || seconds === 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalTasks = project.totalTasks || 0;
  const completedTasks = project.completedTasks || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => onView(project)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: project.color || '#3B82F6' }}
          >
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">{project.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${statusColors[project.status]}`}>
              {statusLabels[project.status]}
            </span>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 rounded-lg"
          >
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-44 z-10">
              <button
                onClick={handleView}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Voir détails</span>
              </button>
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <CheckCircle className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">
            {completedTasks}/{totalTasks} tâches
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">
            {formatTimeSpent(project.totalTimeSpent)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Progression</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: project.color || '#3B82F6'
            }}
          />
        </div>
      </div>

      {/* Dates */}
      {(project.startDate || project.dueDate) && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {project.startDate && (
            <span>Début: {new Date(project.startDate).toLocaleDateString('fr-FR')}</span>
          )}
          {project.dueDate && (
            <span>Échéance: {new Date(project.dueDate).toLocaleDateString('fr-FR')}</span>
          )}
        </div>
      )}
    </div>
  );
}
