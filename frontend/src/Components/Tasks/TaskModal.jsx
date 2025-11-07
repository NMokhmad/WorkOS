// TaskModal - Modal pour créer/éditer des tâches
import { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, task, projects }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    projectId: '',
    dueDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier si c'est une vraie tâche (avec un ID) ou juste un objet de pré-remplissage
    const isEditMode = task && task.id;

    if (isEditMode) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        projectId: task.projectId || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      // Mode création - peut avoir des valeurs pré-remplies via task
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: task?.status || 'todo',
        projectId: task?.projectId || '',
        dueDate: ''
      });
    }
    setError('');
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        projectId: formData.projectId ? parseInt(formData.projectId) : null,
        dueDate: formData.dueDate || null
      };

      await onSave(taskData);
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Déterminer si on est en mode édition (tâche avec ID) ou création
  const isEditMode = task && task.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">
            {isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Nom de la tâche"
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
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Décrivez la tâche..."
            />
          </div>

          {/* Grid: Priority, Status, Project */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priorité
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="todo">À faire</option>
                <option value="inProgress">En cours</option>
                <option value="done">Terminé</option>
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Projet
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Aucun projet</option>
                {projects && projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date d'échéance
            </label>
            <div className="relative">
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
