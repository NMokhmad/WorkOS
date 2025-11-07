// GlobalSearch - Recherche globale dans tout le système
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, CheckSquare, Folder, Calendar, Clock, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fermer quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/search?q=${encodeURIComponent(query)}`, {
          credentials: 'include'
        });
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (type, id) => {
    setIsOpen(false);
    setQuery('');
    setResults(null);

    switch (type) {
      case 'task':
        navigate('/tasks');
        break;
      case 'project':
        navigate(`/projects/${id}`);
        break;
      case 'event':
        navigate('/calendar');
        break;
      case 'note':
        navigate('/notes');
        break;
      default:
        break;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-4 h-4" />;
      case 'project':
        return <Folder className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'note':
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'task':
        return 'Tâche';
      case 'project':
        return 'Projet';
      case 'event':
        return 'Événement';
      case 'note':
        return 'Note';
      default:
        return type;
    }
  };

  const totalResults = results ?
    (results.tasks?.length || 0) +
    (results.projects?.length || 0) +
    (results.events?.length || 0) +
    (results.notes?.length || 0) : 0;

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher partout... (tâches, projets, événements, notes)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader className="w-4 h-4 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query && results && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 overflow-y-auto z-50">
          {totalResults === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Aucun résultat trouvé</p>
              <p className="text-sm text-slate-500 mt-1">Essayez d'autres mots-clés</p>
            </div>
          ) : (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
              </div>

              {/* Tasks */}
              {results.tasks && results.tasks.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-medium text-slate-600">Tâches</div>
                  {results.tasks.map((task) => (
                    <button
                      key={`task-${task.id}`}
                      onClick={() => handleResultClick('task', task.id)}
                      className="w-full px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left flex items-start space-x-3"
                    >
                      <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                        {getIcon('task')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-slate-500 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-slate-400">{getTypeLabel('task')}</span>
                          {task.project && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${task.project.color}20`, color: task.project.color }}>
                              {task.project.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Projects */}
              {results.projects && results.projects.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-medium text-slate-600">Projets</div>
                  {results.projects.map((project) => (
                    <button
                      key={`project-${project.id}`}
                      onClick={() => handleResultClick('project', project.id)}
                      className="w-full px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left flex items-start space-x-3"
                    >
                      <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${project.color}20` }}>
                        {getIcon('project')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{project.name}</p>
                        {project.description && (
                          <p className="text-sm text-slate-500 truncate">{project.description}</p>
                        )}
                        <span className="text-xs text-slate-400">{getTypeLabel('project')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Events */}
              {results.events && results.events.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-medium text-slate-600">Événements</div>
                  {results.events.map((event) => (
                    <button
                      key={`event-${event.id}`}
                      onClick={() => handleResultClick('event', event.id)}
                      className="w-full px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left flex items-start space-x-3"
                    >
                      <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
                        {getIcon('event')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{event.title}</p>
                        {event.description && (
                          <p className="text-sm text-slate-500 truncate">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-slate-400">{getTypeLabel('event')}</span>
                          {event.startDate && (
                            <span className="text-xs text-slate-500">
                              {new Date(event.startDate).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Notes */}
              {results.notes && results.notes.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-medium text-slate-600">Notes</div>
                  {results.notes.map((note) => (
                    <button
                      key={`note-${note.id}`}
                      onClick={() => handleResultClick('note', note.id)}
                      className="w-full px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left flex items-start space-x-3"
                    >
                      <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                        {getIcon('note')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{note.title}</p>
                        {note.content && (
                          <p className="text-sm text-slate-500 truncate">{note.content.substring(0, 100)}</p>
                        )}
                        <span className="text-xs text-slate-400">{getTypeLabel('note')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
