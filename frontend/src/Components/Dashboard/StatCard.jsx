// StatCard - Carte de statistique avec icône et variation
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color, trend, trendValue, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    emerald: 'from-emerald-500 to-emerald-600'
  };

  const bgColor = colorClasses[color] || colorClasses.blue;
  const isPositiveTrend = trend === 'up';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mb-2">{value}</h3>

          {subtitle && (
            <p className="text-xs text-slate-500 mb-2">{subtitle}</p>
          )}

          {trendValue && (
            <div className={`flex items-center space-x-1 text-sm ${
              isPositiveTrend ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositiveTrend ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">{trendValue}</span>
              <span className="text-slate-500">vs semaine dernière</span>
            </div>
          )}
        </div>

        <div className={`w-14 h-14 bg-gradient-to-br ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}
