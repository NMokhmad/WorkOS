// RecentActivity - Liste des activités récentes
import React from 'react';
import { CheckSquare, FileText, Calendar, Folder, Clock } from 'lucide-react';

export default function RecentActivity({ activities }) {
  const getIcon = (type) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-4 h-4" />;
      case 'note':
        return <FileText className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'project':
        return <Folder className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'task':
        return 'bg-blue-50 text-blue-600';
      case 'note':
        return 'bg-green-50 text-green-600';
      case 'event':
        return 'bg-purple-50 text-purple-600';
      case 'project':
        return 'bg-orange-50 text-orange-600';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return activityDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Activité récente</h3>
        <div className="text-center py-12 text-slate-500">
          Aucune activité récente
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Activité récente</h3>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getColorClass(activity.type)}`}>
              {getIcon(activity.type)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {activity.description}
              </p>
            </div>

            <span className="text-xs text-slate-400 flex-shrink-0">
              {formatTime(activity.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
