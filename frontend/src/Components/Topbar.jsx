// Topbar - Barre supérieure avec recherche et notifications
import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ActiveTimer from './ActiveTimer';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './NotificationCenter';

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

      {/* Recherche globale */}
      <div className="flex-1 mx-4">
        <GlobalSearch />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Active Timer */}
        <ActiveTimer />

        {/* Notifications */}
        <NotificationCenter />
        
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