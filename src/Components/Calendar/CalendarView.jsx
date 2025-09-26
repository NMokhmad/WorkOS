// CalendarView - Vue calendrier pour planification
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Users } from 'lucide-react';

const mockEvents = [
  { id: 1, title: 'Réunion équipe', time: '09:00', date: 15, color: 'bg-blue-500' },
  { id: 2, title: 'Présentation client', time: '14:00', date: 18, color: 'bg-green-500' },
  { id: 3, title: 'Sprint planning', time: '10:30', date: 22, color: 'bg-purple-500' },
  { id: 4, title: 'Formation', time: '13:00', date: 25, color: 'bg-orange-500' }
];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const days = getDaysInMonth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Calendrier</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel événement</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        {/* En-tête calendrier */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Aujourd'hui
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* Grille calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const dayEvents = mockEvents.filter(event => event.date === day.getDate() && isCurrentMonth);

            return (
              <div
                key={index}
                className={`min-h-20 p-2 border border-slate-100 ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'} ${isToday ? 'bg-blue-50' : ''} hover:bg-slate-50 transition-colors`}
              >
                <span className={`text-sm font-medium ${isCurrentMonth ? 'text-slate-800' : 'text-slate-400'} ${isToday ? 'text-blue-600' : ''}`}>
                  {day.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.map(event => (
                    <div key={event.id} className={`${event.color} text-white text-xs p-1 rounded truncate`}>
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal ajout événement */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Nouvel événement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre de l'événement"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Heure</label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Annuler
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}