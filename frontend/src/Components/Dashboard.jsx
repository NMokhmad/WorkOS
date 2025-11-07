// Dashboard - Vue d'ensemble avec statistiques et activité récente
import React from 'react';
import { 
  CheckSquare, 
  Clock, 
  FolderOpen, 
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';

const stats = [
  {
    icon: CheckSquare,
    title: 'Tâches en cours',
    value: '12',
    change: '+3 cette semaine',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Clock,
    title: "Temps aujourd'hui",
    value: '6h 24m',
    change: '+45m par rapport à hier',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: FolderOpen,
    title: 'Projets actifs',
    value: '5',
    change: '2 en retard',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Target,
    title: 'Objectifs atteints',
    value: '85%',
    change: '+12% ce mois',
    color: 'from-orange-500 to-orange-600'
  }
];

const recentTasks = [
  { id: 1, title: 'Révision du design système', project: 'Design', time: '2h 30m', status: 'en cours' },
  { id: 2, title: 'Réunion équipe produit', project: 'Management', time: '1h 00m', status: 'terminé' },
  { id: 3, title: 'Développement API auth', project: 'Backend', time: '3h 15m', status: 'en cours' },
  { id: 4, title: 'Tests utilisateurs', project: 'UX Research', time: '45m', status: 'planifié' }
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Bonjour Marie 👋
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
        {stats.map((stat, index) => {
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
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800">{task.title}</h3>
                  <p className="text-sm text-slate-500">{task.project}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-slate-600">{task.time}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'terminé' ? 'bg-green-100 text-green-800' :
                    task.status === 'en cours' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendrier mini */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Cette semaine</h2>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Réunion client</p>
              <p className="text-xs text-blue-600">Aujourd'hui 14:00</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-sm font-medium text-green-800">Présentation sprint</p>
              <p className="text-xs text-green-600">Demain 10:00</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
              <p className="text-sm font-medium text-purple-800">Formation équipe</p>
              <p className="text-xs text-purple-600">Vendredi 09:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}