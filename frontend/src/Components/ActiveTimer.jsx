// ActiveTimer - Affiche le timer actif global dans la topbar
import { useState, useEffect } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { tasksAPI } from '../services/api';

export default function ActiveTimer() {
  const [activeTask, setActiveTask] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger la tâche active au montage
    loadActiveTask();

    // Vérifier régulièrement s'il y a une tâche active
    const interval = setInterval(loadActiveTask, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  // Timer qui s'incrémente chaque seconde
  useEffect(() => {
    if (!activeTask || !activeTask.isRunning) {
      return;
    }

    const interval = setInterval(() => {
      const startedAt = new Date(activeTask.timerStartedAt);
      const now = new Date();
      const elapsed = Math.floor((now - startedAt) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask]);

  const loadActiveTask = async () => {
    try {
      const response = await tasksAPI.getAll();
      const tasks = response.tasks || [];
      const running = tasks.find(t => t.isRunning);

      if (running) {
        setActiveTask(running);
        // Calculer le temps déjà écoulé
        const startedAt = new Date(running.timerStartedAt);
        const now = new Date();
        const elapsed = Math.floor((now - startedAt) / 1000);
        setElapsedTime(elapsed);
      } else {
        setActiveTask(null);
        setElapsedTime(0);
      }
    } catch (error) {
      console.error('Error loading active task:', error);
    }
  };

  const handleStop = async () => {
    if (!activeTask) return;

    try {
      setLoading(true);
      await tasksAPI.stopTimer(activeTask.id);
      setActiveTask(null);
      setElapsedTime(0);
    } catch (error) {
      console.error('Error stopping timer:', error);
      // Recharger en cas d'erreur
      loadActiveTask();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  if (!activeTask) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
      {/* Indicateur animé */}
      <div className="relative flex items-center justify-center">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="absolute w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
      </div>

      {/* Info tâche */}
      <div className="flex flex-col min-w-0">
        <p className="text-xs font-medium text-blue-900 truncate max-w-[150px]">
          {activeTask.title}
        </p>
        <p className="text-xs text-blue-600 font-mono">
          {formatTime(elapsedTime)}
        </p>
      </div>

      {/* Bouton stop */}
      <button
        onClick={handleStop}
        disabled={loading}
        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
        title="Arrêter le timer"
      >
        <Pause className="w-4 h-4 text-blue-700" />
      </button>
    </div>
  );
}
