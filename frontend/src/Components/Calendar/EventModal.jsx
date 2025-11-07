// EventModal - Modal pour créer/éditer un événement
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, Folder, AlertCircle } from 'lucide-react';

export default function EventModal({ isOpen, onClose, onSave, event, projects }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    projectId: '',
    location: '',
    isAllDay: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isEditMode = event && event.id;

    if (isEditMode) {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);

      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: start.toISOString().split('T')[0],
        startTime: start.toTimeString().slice(0, 5),
        endDate: end.toISOString().split('T')[0],
        endTime: end.toTimeString().slice(0, 5),
        projectId: event.projectId || '',
        location: event.location || '',
        isAllDay: event.isAllDay || false
      });
    } else if (event && event.date) {
      // Pré-remplir avec une date si fournie
      const date = new Date(event.date);
      setFormData({
        title: '',
        description: '',
        startDate: date.toISOString().split('T')[0],
        startTime: '09:00',
        endDate: date.toISOString().split('T')[0],
        endTime: '10:00',
        projectId: '',
        location: '',
        isAllDay: false
      });
    } else {
      // Réinitialiser pour un nouvel événement
      const today = new Date();
      setFormData({
        title: '',
        description: '',
        startDate: today.toISOString().split('T')[0],
        startTime: '09:00',
        endDate: today.toISOString().split('T')[0],
        endTime: '10:00',
        projectId: '',
        location: '',
        isAllDay: false
      });
    }
    setError('');
  }, [event, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    if (!formData.startDate) {
      setError('La date de début est requise');
      return;
    }

    try {
      setLoading(true);

      // Construire les dates complètes
      const startDateTime = formData.isAllDay
        ? new Date(formData.startDate).toISOString()
        : new Date(`${formData.startDate}T${formData.startTime}`).toISOString();

      const endDateTime = formData.isAllDay
        ? new Date(formData.endDate || formData.startDate).toISOString()
        : new Date(`${formData.endDate || formData.startDate}T${formData.endTime}`).toISOString();

      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: startDateTime,
        endDate: endDateTime,
        projectId: formData.projectId || null,
        location: formData.location,
        isAllDay: formData.isAllDay
      };

      await onSave(eventData);
      onClose();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEditMode = event && event.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>{isEditMode ? 'Modifier l\'événement' : 'Nouvel événement'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Réunion d'équipe"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Détails de l'événement..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Journée entière */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isAllDay"
              id="isAllDay"
              checked={formData.isAllDay}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isAllDay" className="text-sm font-medium text-slate-700">
              Journée entière
            </label>
          </div>

          {/* Dates et heures */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Heure de début */}
            {!formData.isAllDay && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Heure de début
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Heure de fin */}
            {!formData.isAllDay && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Heure de fin
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Projet et Lieu */}
          <div className="grid grid-cols-2 gap-4">
            {/* Projet */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Projet (optionnel)
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Aucun projet</option>
                {projects && projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lieu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lieu
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Salle de réunion A"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : isEditMode ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
