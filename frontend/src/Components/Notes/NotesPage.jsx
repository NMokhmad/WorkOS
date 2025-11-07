// NotesPage - Page de gestion des notes
import React, { useState, useEffect } from 'react';
import { Plus, Search, Star, Grid, List as ListIcon, Trash2, Loader, FileText, Tag } from 'lucide-react';
import { notesAPI } from '../../services/api';
import NoteCard from './NoteCard';
import NoteModal from './NoteModal';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notesRes, tagsRes] = await Promise.all([
        notesAPI.getAll(),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/tags`, {
          credentials: 'include'
        }).then(r => r.json())
      ]);

      setNotes(notesRes.notes || []);
      setTags(tagsRes.tags || []);
    } catch (error) {
      console.error('Error loading notes data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setCurrentNote(null);
    setIsNoteModalOpen(true);
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setIsNoteModalOpen(true);
  };

  const handleViewNote = (note) => {
    setSelectedNote(note);
  };

  const handleSaveNote = async (noteData) => {
    try {
      const isEditMode = currentNote && currentNote.id;
      if (isEditMode) {
        await notesAPI.update(currentNote.id, noteData);
      } else {
        await notesAPI.create(noteData);
      }
      await loadData();
      setIsNoteModalOpen(false);
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteConfirm) return;
    try {
      await notesAPI.delete(deleteConfirm.id);
      await loadData();
      setDeleteConfirm(null);
      if (selectedNote?.id === deleteConfirm.id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleToggleFavorite = async (noteId) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        await notesAPI.update(noteId, { ...note, isFavorite: !note.isFavorite });
        await loadData();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !filterFavorites || note.isFavorite;
    const matchesTag = !selectedTag || note.tags?.some(t => t.id === selectedTag);

    return matchesSearch && matchesFavorites && matchesTag;
  });

  const favoriteNotes = filteredNotes.filter(n => n.isFavorite);
  const regularNotes = filteredNotes.filter(n => !n.isFavorite);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notes</h1>
          <p className="text-slate-600 mt-1">
            {notes.length} note{notes.length > 1 ? 's' : ''} • {favoriteNotes.length} favori{favoriteNotes.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateNote}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle note</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filterFavorites
                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Star className={`w-4 h-4 ${filterFavorites ? 'fill-current' : ''}`} />
              <span>Favoris</span>
            </button>

            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tags filter */}
        {tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <Tag className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Filtrer par étiquette:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedTag === null
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Toutes
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedTag === tag.id
                      ? 'bg-green-100 text-green-700 border-2 border-green-500'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes Grid/List */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {searchQuery || filterFavorites || selectedTag ? 'Aucune note trouvée' : 'Aucune note'}
          </h3>
          <p className="text-slate-600 mb-6">
            {searchQuery || filterFavorites || selectedTag
              ? 'Essayez de modifier vos filtres'
              : 'Commencez par créer votre première note'}
          </p>
          {!searchQuery && !filterFavorites && !selectedTag && (
            <button
              onClick={handleCreateNote}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Créer une note</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Favorites */}
          {favoriteNotes.length > 0 && !filterFavorites && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <h2 className="text-lg font-semibold text-slate-800">Favoris</h2>
              </div>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {favoriteNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onView={() => handleViewNote(note)}
                    onEdit={handleEditNote}
                    onDelete={setDeleteConfirm}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes */}
          {regularNotes.length > 0 && (
            <div>
              {favoriteNotes.length > 0 && !filterFavorites && (
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Toutes les notes</h2>
              )}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onView={() => handleViewNote(note)}
                    onEdit={handleEditNote}
                    onDelete={setDeleteConfirm}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        note={currentNote}
        tags={tags}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Supprimer la note</h3>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer la note "{deleteConfirm.title}" ? Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteNote}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Detail View */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedNote.title}</h2>
                    <p className="text-sm text-slate-500">
                      Modifié le {new Date(selectedNote.updatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {selectedNote.isFavorite && (
                    <Star className="w-6 h-6 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="prose prose-slate max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                  {selectedNote.content || 'Aucun contenu'}
                </pre>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    setSelectedNote(null);
                    handleEditNote(selectedNote);
                  }}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
