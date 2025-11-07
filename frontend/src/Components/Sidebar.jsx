// Sidebar - Navigation principale avec menu vertical
import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  Clock,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', id: 'dashboard' },
  { icon: CheckSquare, label: 'Tâches', id: 'tasks' },
  { icon: Calendar, label: 'Calendrier', id: 'calendar' },
  { icon: FileText, label: 'Notes', id: 'notes' },
  { icon: Clock, label: 'Temps', id: 'time' },
];

export default function Sidebar({ isOpen, onClose, activeView, onNavigate }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleNavigation = (viewId) => {
    onNavigate(viewId);
    onClose();
  };
  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"></div>
              <span className="text-xl font-bold text-slate-800">WorkOS</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={() => handleNavigation('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                activeView === 'settings'
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Paramètres</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}