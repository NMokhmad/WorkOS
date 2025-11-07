// NoteModal - Modal pour créer/éditer une note avec éditeur enrichi
import React, { useState, useEffect } from 'react';
import { X, FileText, Tag, Star, AlertCircle, Bold, Italic, List, ListOrdered } from 'lucide-react';

export default function NoteModal({ isOpen, onClose, onSave, note, tags }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isFavorite: false,
    tagIds: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (note && note.id) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        isFavorite: note.isFavorite || false,
        tagIds: note.tags ? note.tags.map(t => t.id) : []
      });
    } else {
      setFormData({
        title: '',
        content: '',
        isFavorite: false,
        tagIds: []
      });
    }
    setError('');
  }, [note, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }));
  };

  const applyFormat = (format) => {
    const textarea = document.getElementById('note-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    let newText = formData.content;

    switch (format) {
      case 'bold':
        newText = formData.content.substring(0, start) + `**${selectedText}**` + formData.content.substring(end);
        break;
      case 'italic':
        newText = formData.content.substring(0, start) + `*${selectedText}*` + formData.content.substring(end);
        break;
      case 'list':
        newText = formData.content.substring(0, start) + `\n- ${selectedText}` + formData.content.substring(end);
        break;
      case 'orderedList':
        newText = formData.content.substring(0, start) + `\n1. ${selectedText}` + formData.content.substring(end);
        break;
      default:
        break;
    }

    setFormData(prev => ({ ...prev, content: newText }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEditMode = note && note.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span>{isEditMode ? 'Modifier la note' : 'Nouvelle note'}</span>
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

          {/* Titre et Favori */}
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Idées pour le projet"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div className="pt-8">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                className={`p-3 rounded-lg transition-colors ${
                  formData.isFavorite
                    ? 'bg-yellow-50 text-yellow-500'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
                title={formData.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Star className={`w-5 h-5 ${formData.isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Barre d'outils de formatage */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contenu
            </label>
            <div className="flex items-center space-x-2 mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => applyFormat('bold')}
                className="p-2 hover:bg-white rounded transition-colors"
                title="Gras"
              >
                <Bold className="w-4 h-4 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={() => applyFormat('italic')}
                className="p-2 hover:bg-white rounded transition-colors"
                title="Italique"
              >
                <Italic className="w-4 h-4 text-slate-600" />
              </button>
              <div className="w-px h-6 bg-slate-300" />
              <button
                type="button"
                onClick={() => applyFormat('list')}
                className="p-2 hover:bg-white rounded transition-colors"
                title="Liste à puces"
              >
                <List className="w-4 h-4 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={() => applyFormat('orderedList')}
                className="p-2 hover:bg-white rounded transition-colors"
                title="Liste numérotée"
              >
                <ListOrdered className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <textarea
              id="note-content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Écrivez votre note ici... Vous pouvez utiliser le markdown pour formater le texte."
              rows={12}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Utilisez **texte** pour le gras, *texte* pour l'italique, - pour les listes
            </p>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Étiquettes</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.tagIds.includes(tag.id)
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : 'bg-slate-100 text-slate-700 border-2 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
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
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : isEditMode ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
