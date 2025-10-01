// Page principale - Démonstration des différentes vues
import React, { useState } from 'react';
import Dashboard from './Components/Dashboard';
import KanbanBoard from './Components/Tasks/KanbanBoard';
import CalendarView from './Components/Calendar/CalendarView';
import NotesList from './Components/Notes/NotesList';
import TimeTracker from './Components/TimeTracker';
import Layout from './Layout';

export default function HomePage() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedNote, setSelectedNote] = useState(null);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <KanbanBoard />;
      case 'calendar':
        return <CalendarView />;
      case 'notes':
        return <NotesList onSelectNote={setSelectedNote} selectedNote={selectedNote} />;
      case 'time':
        return <TimeTracker />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Vue active */}
      <Layout activeView={activeView} onNavigate={setActiveView}>
      {/* Navigation demo rapide */}
        <div className="mb-8 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Tableau de bord' },
              { id: 'tasks', label: 'Tâches' },
              { id: 'calendar', label: 'Calendrier' },
              { id: 'notes', label: 'Notes' },
              { id: 'time', label: 'Temps' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
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
        {renderActiveView()}
      </Layout>

    </div>
  );
}