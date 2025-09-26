// NotesList - Liste des notes avec aperçu
import React from 'react';
import { Search, Plus, Clock, Tag } from 'lucide-react';

const mockNotes = [
  {
    id: 1,
    title: 'Idées pour le nouveau produit',
    content: 'Brainstorming sur les fonctionnalités prioritaires...',
    date: '2024-01-15',
    tags: ['produit', 'brainstorming'],
    color: 'blue'
  },
  {
    id: 2,
    title: 'Notes réunion équipe',
    content: 'Points abordés : planning sprint, objectifs Q1...',
    date: '2024-01-14',
    tags: ['réunion', 'équipe'],
    color: 'green'
  },
  {
    id: 3,
    title: 'Formation React avancée',
    content: 'Hooks personnalisés, patterns avancés, performance...',
    date: '2024-01-12',
    tags: ['formation', 'react'],
    color: 'purple'
  },
  {
    id: 4,
    title: 'Feedback utilisateurs',
    content: 'Retours des tests utilisateurs sur la nouvelle interface...',
    date: '2024-01-10',
    tags: ['ux', 'feedback'],
    color: 'orange'
  }
];

export default function NotesList({ onSelectNote, selectedNote }) {
  const colorClasses = {
    blue: 'border-l-blue-500 bg-blue-50',
    green: 'border-l-green-500 bg-green-50',
    purple: 'border-l-purple-500 bg-purple-50',
    orange: 'border-l-orange-500 bg-orange-50'
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Notes</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" />
          <span>Nouvelle note</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Liste des notes */}
        <div className="lg:col-span-1 space-y-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher dans les notes..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Rechercher des notes"
            />
          </div>

          {/* Notes */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mockNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote && onSelectNote(note)}
                className={`p-4 border-l-4 rounded-r-xl cursor-pointer transition-all hover:shadow-md ${
                  colorClasses[note.color]
                } ${selectedNote?.id === note.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <h3 className="font-semibold text-slate-800 mb-2 truncate">{note.title}</h3>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{note.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(note.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {note.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="flex items-center space-x-1 px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone d'édition */}
        <div className="lg:col-span-2">
          {selectedNote ? (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 h-full">
              <input
                type="text"
                value={selectedNote.title}
                className="w-full text-2xl font-bold text-slate-800 bg-transparent border-none outline-none mb-4"
                placeholder="Titre de la note"
              />
              <textarea
                value={selectedNote.content}
                className="w-full h-96 text-slate-600 bg-transparent resize-none border-none outline-none leading-relaxed"
                placeholder="Commencez à écrire..."
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Sélectionnez une note</h3>
                <p className="text-slate-600">Choisissez une note existante ou créez-en une nouvelle</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}