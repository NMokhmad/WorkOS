// useKeyboardShortcuts - Hook pour gérer les raccourcis clavier
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = (options = {}) => {
  const navigate = useNavigate();
  const {
    onToggleTheme,
    onNewTask,
    onNewNote,
    onGlobalSearch,
    onCloseModal
  } = options;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { ctrlKey, shiftKey, key } = event;

      // Ignorer si l'utilisateur est dans un input/textarea
      const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

      // Raccourcis qui fonctionnent même dans les inputs
      if (ctrlKey && key === 'k') {
        event.preventDefault();
        onGlobalSearch?.();
        return;
      }

      if (key === 'Escape') {
        event.preventDefault();
        onCloseModal?.();
        return;
      }

      // Les autres raccourcis ne fonctionnent que si aucun input n'est focus
      if (isInputFocused) return;

      // Navigation
      if (ctrlKey && !shiftKey) {
        switch (key) {
          case 'd':
            event.preventDefault();
            navigate('/');
            break;
          case 't':
            event.preventDefault();
            navigate('/tasks');
            break;
          case 'c':
            event.preventDefault();
            navigate('/calendar');
            break;
          case 'p':
            event.preventDefault();
            navigate('/projects');
            break;
          case 'r':
            event.preventDefault();
            navigate('/reports');
            break;
          case ',':
            event.preventDefault();
            navigate('/settings');
            break;
          default:
            break;
        }
      }

      // Actions avec Ctrl + Shift
      if (ctrlKey && shiftKey) {
        switch (key) {
          case 'N':
            event.preventDefault();
            onNewNote?.();
            break;
          case 'T':
            event.preventDefault();
            onToggleTheme?.();
            break;
          default:
            break;
        }
      }

      // Nouvelle tâche (Ctrl + N)
      if (ctrlKey && !shiftKey && key === 'n') {
        event.preventDefault();
        onNewTask?.();
      }

      // Afficher l'aide des raccourcis (?)
      if (key === '?' && !ctrlKey && !shiftKey) {
        event.preventDefault();
        navigate('/settings');
        // TODO: Navigate to shortcuts tab
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onToggleTheme, onNewTask, onNewNote, onGlobalSearch, onCloseModal]);
};
