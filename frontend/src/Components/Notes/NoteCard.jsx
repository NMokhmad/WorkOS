// NoteCard - Carte d'affichage d'une note
import React from 'react';
import { FileText, Edit, Trash2, Star, Calendar } from 'lucide-react';

export default function NoteCard({ note, onView, onEdit, onDelete, onToggleFavorite }) {
  const formattedDate = new Date(note.updatedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const getPreview = (content) => {
    if (!content) return 'Aucun contenu';
    // Enlever les balises HTML si présentes
    const text = content.replace(/<[^>]*>/g, '');
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  return (
    <div
      className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 truncate mb-1">{note.title}</h3>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(note.id);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            note.isFavorite
              ? 'text-yellow-500 hover:bg-yellow-50'
              : 'text-slate-400 hover:bg-slate-100'
          }`}
          title={note.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <p className="text-sm text-slate-600 mb-4 line-clamp-3">{getPreview(note.content)}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs"
            >
              {tag.name}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-xs">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(note);
          }}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Modifier"
        >
          <Edit className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note);
          }}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  );
}
