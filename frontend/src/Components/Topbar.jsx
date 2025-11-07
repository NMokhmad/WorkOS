// Topbar - Barre supérieure avec recherche et notifications
import React from 'react';
import { Search, Bell, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ActiveTimer from './ActiveTimer';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8">
      {/* Menu mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Recherche */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher des tâches, projets..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            aria-label="Rechercher"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Active Timer */}
        <ActiveTimer />

        <button 
          className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-800">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || 'Utilisateur'}
            </p>
            <p className="text-xs text-slate-500">{user?.profession || 'Utilisateur'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}