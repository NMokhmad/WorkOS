// TaskCard - Carte individuelle pour chaque tâche
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Clock, Tag, MoreVertical, Edit, Trash2 } from 'lucide-react';

export default function TaskCard({ task, onStart, onPause, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
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

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(task);
  };

  // Format time spent in seconds to "Xh Ym"
  const formatTimeSpent = (seconds) => {
    if (!seconds || seconds === 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${priorityColors[task.priority]}`}>
            {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Faible'}
          </span>
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">
                {Array.isArray(task.tags) ? task.tags.map(t => t.name).join(', ') : task.tags}
              </span>
            </div>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-40 z-10">
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

      <h3 className="font-semibold text-slate-800 mb-2">{task.title}</h3>
      <p className="text-sm text-slate-600 mb-4">{task.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>{formatTimeSpent(task.timeSpent)}</span>
        </div>
        
        <button
          onClick={task.isRunning ? onPause : onStart}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            task.isRunning
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
          aria-label={task.isRunning ? 'Pause timer' : 'Start timer'}
        >
          {task.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{task.isRunning ? 'Pause' : 'Start'}</span>
        </button>
      </div>
    </div>
  );
}