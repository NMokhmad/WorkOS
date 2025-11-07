// CalendarView - Vue calendrier complète avec événements et tâches
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, Clock, Trash2, Edit, Loader } from 'lucide-react';
import { eventsAPI, tasksAPI, projectsAPI } from '../../services/api';
import EventModal from './EventModal';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, tasksRes, projectsRes] = await Promise.all([
        eventsAPI.getAll(),
        tasksAPI.getAll(),
        projectsAPI.getAll()
      ]);

      setEvents(eventsRes.events || []);
      setTasks((tasksRes.tasks || []).filter(t => t.dueDate));
      setProjects(projectsRes.projects || []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
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

  const handleCreateEvent = (date = null) => {
    setCurrentEvent(date ? { date } : null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      const isEditMode = currentEvent && currentEvent.id;
      if (isEditMode) {
        await eventsAPI.update(currentEvent.id, eventData);
      } else {
        await eventsAPI.create(eventData);
      }
      await loadData();
      setIsEventModalOpen(false);
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteConfirm) return;
    try {
      await eventsAPI.delete(deleteConfirm.id);
      await loadData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      return eventStart.toDateString() === dateStr;
    });
  };

  const getTasksForDate = (date) => {
    const dateStr = date.toDateString();
    return tasks.filter(task => {
      const taskDue = new Date(task.dueDate);
      return taskDue.toDateString() === dateStr;
    });
  };

  const getProjectColor = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.color || '#3B82F6';
  };

  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const days = getDaysInMonth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Calendrier</h1>
          <p className="text-slate-600 mt-1">{events.length} événement{events.length > 1 ? 's' : ''} • {tasks.length} échéance{tasks.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => handleCreateEvent()} className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
          <Plus className="w-5 h-5" />
          <span>Nouvel événement</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button onClick={previousMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button onClick={goToToday} className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Aujourd'hui
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 ml-4">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded transition-colors text-sm font-medium ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
              <CalendarIcon className="w-4 h-4 inline mr-2" />Mois
            </button>
            <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded transition-colors text-sm font-medium ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
              <List className="w-4 h-4 inline mr-2" />Liste
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const dayEvents = getEventsForDate(day);
              const dayTasks = getTasksForDate(day);

              return (
                <div key={index} className={`min-h-28 p-2 border border-slate-100 rounded-lg ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'} ${isToday ? 'ring-2 ring-blue-500' : ''} hover:bg-slate-50 transition-colors cursor-pointer`} onClick={() => handleCreateEvent(day)}>
                  <div className={`text-sm font-semibold mb-1 ${isCurrentMonth ? 'text-slate-800' : 'text-slate-400'} ${isToday ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => {
                      const projectColor = event.projectId ? getProjectColor(event.projectId) : '#3B82F6';
                      return (
                        <div key={`event-${event.id}`} onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }} className="text-xs p-1.5 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: projectColor }} title={event.title}>
                          <Clock className="w-3 h-3 inline mr-1" />{event.title}
                        </div>
                      );
                    })}
                    {dayTasks.map(task => {
                      const projectColor = task.project?.color || '#EF4444';
                      return (
                        <div key={`task-${task.id}`} className="text-xs p-1.5 rounded border-2 truncate" style={{ borderColor: projectColor, color: projectColor, backgroundColor: `${projectColor}10` }} title={`Échéance: ${task.title}`}>
                          📌 {task.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="divide-y divide-slate-200">
            {events.length === 0 && tasks.length === 0 ? (
              <div className="text-center py-16">
                <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucun événement</h3>
                <p className="text-slate-600 mb-6">Commencez par créer votre premier événement</p>
                <button onClick={() => handleCreateEvent()} className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
                  <Plus className="w-5 h-5" /><span>Créer un événement</span>
                </button>
              </div>
            ) : (
              <>
                {events.map(event => {
                  const startDate = new Date(event.startDate);
                  const projectColor = event.projectId ? getProjectColor(event.projectId) : '#3B82F6';
                  const project = projects.find(p => p.id === event.projectId);

                  return (
                    <div key={event.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: projectColor }}>
                            <CalendarIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 mb-1">{event.title}</h3>
                            {event.description && <p className="text-sm text-slate-600 mb-2">{event.description}</p>}
                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{startDate.toLocaleDateString('fr-FR')} à {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                              {project && <span className="px-2 py-1 rounded" style={{ backgroundColor: `${projectColor}20`, color: projectColor }}>{project.name}</span>}
                              {event.location && <span>📍 {event.location}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleEditEvent(event)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button onClick={() => setDeleteConfirm(event)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSave={handleSaveEvent} event={currentEvent} projects={projects} />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Supprimer l'événement</h3>
            <p className="text-slate-600 mb-6">Êtes-vous sûr de vouloir supprimer l'événement "{deleteConfirm.title}" ? Cette action est irréversible.</p>
            <div className="flex items-center justify-end space-x-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors">Annuler</button>
              <button onClick={handleDeleteEvent} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
