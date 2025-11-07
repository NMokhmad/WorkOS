// DeleteConfirmModal - Modal de confirmation de suppression
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, taskTitle, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Supprimer la tâche</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 mb-2">
            Êtes-vous sûr de vouloir supprimer cette tâche ?
          </p>
          <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-lg">
            "{taskTitle}"
          </p>
          <p className="text-sm text-red-600 mt-4">
            Cette action est irréversible.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}
