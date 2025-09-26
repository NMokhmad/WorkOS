// TaskCard - Carte individuelle pour chaque tâche
import React from 'react';
import { Play, Pause, Clock, Tag, MoreVertical } from 'lucide-react';

export default function TaskCard({ task, onStart, onPause }) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${priorityColors[task.priority]}`}>
            {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Faible'}
          </span>
          {task.tags && (
            <div className="flex items-center space-x-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{task.tags}</span>
            </div>
          )}
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded">
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <h3 className="font-semibold text-slate-800 mb-2">{task.title}</h3>
      <p className="text-sm text-slate-600 mb-4">{task.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>{task.timeSpent || '0h 00m'}</span>
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