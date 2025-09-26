// KanbanBoard - Board Kanban pour gestion des tâches
import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import TaskCard from './TaskCard';

const initialTasks = {
  todo: [
    {
      id: 1,
      title: 'Mise à jour du design système',
      description: 'Réviser les composants UI selon les nouvelles guidelines',
      priority: 'high',
      tags: 'Design',
      timeSpent: '0h 30m'
    },
    {
      id: 2,
      title: 'Rédaction documentation API',
      description: 'Documenter les nouveaux endpoints',
      priority: 'medium',
      tags: 'Backend'
    }
  ],
  inProgress: [
    {
      id: 3,
      title: 'Développement authentification',
      description: 'Implémenter le système de login OAuth',
      priority: 'high',
      tags: 'Backend',
      timeSpent: '2h 15m',
      isRunning: true
    }
  ],
  done: [
    {
      id: 4,
      title: 'Tests unitaires composants',
      description: 'Écriture des tests pour les nouveaux composants',
      priority: 'medium',
      tags: 'Tests',
      timeSpent: '1h 45m'
    }
  ]
};

const columns = [
  { id: 'todo', title: 'À faire', color: 'bg-slate-100' },
  { id: 'inProgress', title: 'En cours', color: 'bg-blue-100' },
  { id: 'done', title: 'Terminé', color: 'bg-green-100' }
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);

  const handleStartTask = (taskId) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach(column => {
        newTasks[column] = newTasks[column].map(task =>
          task.id === taskId ? { ...task, isRunning: true } : { ...task, isRunning: false }
        );
      });
      return newTasks;
    });
  };

  const handlePauseTask = (taskId) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach(column => {
        newTasks[column] = newTasks[column].map(task =>
          task.id === taskId ? { ...task, isRunning: false } : task
        );
      });
      return newTasks;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Gestion des tâches</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" />
          <span>Nouvelle tâche</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {columns.map(column => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${column.color.replace('100', '500')}`}></div>
                <h2 className="font-semibold text-slate-800">{column.title}</h2>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-medium">
                  {tasks[column.id].length}
                </span>
              </div>
              <button className="p-1 hover:bg-slate-100 rounded">
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 min-h-96">
              {tasks[column.id].map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={() => handleStartTask(task.id)}
                  onPause={() => handlePauseTask(task.id)}
                />
              ))}
            </div>

            <button className="w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors">
              <Plus className="w-5 h-5 mx-auto" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}