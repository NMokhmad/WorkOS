import React, { useState } from 'react';
import Sidebar from './Components/Sidebar';
import Topbar from './Components/Topbar';

export default function Layout({ children, activeView, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onNavigate={onNavigate}
      />
      
      <div className="lg:ml-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}