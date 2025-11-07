// NoteEditor - Éditeur de notes simple
import React, { useState } from 'react';
import { Save, Bold, Italic, List, Link2, Image } from 'lucide-react';

export default function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  const handleSave = () => {
    onSave({ ...note, title, content });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Bold">
            <Bold className="w-4 h-4 text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Italic">
            <Italic className="w-4 h-4 text-slate-600" />
          </button>
          <div className="w-px h-6 bg-slate-300 mx-2"></div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="List">
            <List className="w-4 h-4 text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Link">
            <Link2 className="w-4 h-4 text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Image">
            <Image className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
          )}
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* Éditeur */}
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-bold text-slate-800 bg-transparent border-none outline-none placeholder-slate-400"
          placeholder="Titre de la note..."
        />
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 text-slate-600 bg-transparent resize-none border-none outline-none leading-relaxed text-lg placeholder-slate-400"
          placeholder="Commencez à écrire votre note..."
        />
      </div>
    </div>
  );
}