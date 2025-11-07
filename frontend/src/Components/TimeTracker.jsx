// TimeTracker - Suivi du temps de travail
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Calendar, Target } from 'lucide-react';

const mockTimeEntries = [
  { id: 1, task: 'Développement API', project: 'Backend', time: '2h 30m', date: '2024-01-15' },
  { id: 2, task: 'Design interface', project: 'Frontend', time: '1h 45m', date: '2024-01-15' },
  { id: 3, task: 'Tests unitaires', project: 'QA', time: '3h 15m', date: '2024-01-14' },
  { id: 4, task: 'Réunion équipe', project: 'Management', time: '1h 00m', date: '2024-01-14' }
];

export default function TimeTracker() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isRunning && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!currentTask.trim()) {
      alert('Veuillez saisir une tâche');
      return;
    }
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTime(0);
    setCurrentTask('');
  };

  const totalToday = mockTimeEntries
    .filter(entry => entry.date === '2024-01-15')
    .reduce((total, entry) => {
      const [hours, minutes] = entry.time.split('h ')[0].split('h')[0].split(' ');
      const mins = entry.time.includes('m') ? parseInt(entry.time.split('h ')[1]?.split('m')[0] || 0) : 0;
      return total + parseInt(hours || 0) * 60 + mins;
    }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Suivi du temps</h1>
      </div>

      {/* Timer principal */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="text-center mb-6">
          <div className="text-6xl font-mono font-bold mb-4">
            {formatTime(time)}
          </div>
          <input
            type="text"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            className="w-full max-w-md mx-auto px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Sur quoi travaillez-vous ?"
            disabled={isRunning}
          />
        </div>

        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all"
            >
              <Play className="w-5 h-5" />
              <span>Démarrer</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all"
            >
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </button>
          )}
          
          <button
            onClick={handleStop}
            className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all"
            disabled={time === 0}
          >
            <Square className="w-5 h-5" />
            <span>Arrêter</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Aujourd'hui</h3>
              <p className="text-sm text-slate-500">Temps total</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{Math.floor(totalToday / 60)}h {totalToday % 60}m</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Cette semaine</h3>
              <p className="text-sm text-slate-500">Moyenne/jour</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">6h 24m</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Objectif</h3>
              <p className="text-sm text-slate-500">8h / jour</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">80%</p>
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Historique récent</h2>
        <div className="space-y-3">
          {mockTimeEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <h3 className="font-medium text-slate-800">{entry.task}</h3>
                <p className="text-sm text-slate-500">{entry.project}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-800">{entry.time}</p>
                <p className="text-sm text-slate-500">{new Date(entry.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}