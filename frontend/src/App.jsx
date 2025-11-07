// Page principale - Démonstration des différentes vues
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import KanbanBoard from './Components/Tasks/KanbanBoard';
import CalendarView from './Components/Calendar/CalendarView';
import NotesPage from './Components/Notes/NotesPage';
import TimeTracker from './Components/TimeTracker';
import Settings from './pages/Settings';
import ProjectsPage from './Components/Projects/ProjectsPage';
import ProjectDetails from './Components/Projects/ProjectDetails';
import ReportsPage from './Components/Reports/ReportsPage';
import Layout from './Layout';
import Auth from './pages/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

function HomePage() {
  const [selectedNote, setSelectedNote] = useState(null);
  const { user, loading, login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={login} />;
  }

  // Déterminer la vue active basée sur l'URL
  const getActiveView = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path.startsWith('/tasks')) return 'tasks';
    if (path.startsWith('/projects')) return 'projects';
    if (path.startsWith('/calendar')) return 'calendar';
    if (path.startsWith('/notes')) return 'notes';
    if (path.startsWith('/time')) return 'time';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeView = getActiveView();

  const handleNavigate = (view) => {
    const routes = {
      'dashboard': '/',
      'tasks': '/tasks',
      'projects': '/projects',
      'calendar': '/calendar',
      'notes': '/notes',
      'time': '/time',
      'reports': '/reports',
      'settings': '/settings'
    };
    navigate(routes[view] || '/');
  };

  return (
    <div className="min-h-screen">
      <Layout activeView={activeView} onNavigate={handleNavigate}>
        {/* Navigation demo rapide */}
        <div className="mb-8 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Tableau de bord' },
              { id: 'tasks', label: 'Tâches' },
              { id: 'projects', label: 'Projets' },
              { id: 'calendar', label: 'Calendrier' },
              { id: 'notes', label: 'Notes' },
              { id: 'time', label: 'Temps' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => handleNavigate(view.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeView === view.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<KanbanBoard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/time" element={<TimeTracker />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}