// ThemeContext - Contexte pour gérer le thème (dark/light mode)
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Charger le thème depuis localStorage ou utiliser 'light' par défaut
    const savedTheme = localStorage.getItem('workos-theme');
    return savedTheme || 'light';
  });

  const [accentColor, setAccentColor] = useState(() => {
    const savedColor = localStorage.getItem('workos-accent-color');
    return savedColor || 'blue';
  });

  const [preferences, setPreferences] = useState(() => {
    const savedPrefs = localStorage.getItem('workos-preferences');
    return savedPrefs ? JSON.parse(savedPrefs) : {
      notifications: true,
      autoSaveNotes: true,
      compactMode: false,
      showCompletedTasks: true,
      defaultView: 'kanban'
    };
  });

  // Appliquer le thème au chargement et à chaque changement
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('workos-theme', theme);
  }, [theme]);

  // Sauvegarder la couleur d'accent
  useEffect(() => {
    localStorage.setItem('workos-accent-color', accentColor);

    // Appliquer la couleur d'accent comme variable CSS
    const colors = {
      blue: { primary: '#3B82F6', hover: '#2563EB' },
      purple: { primary: '#8B5CF6', hover: '#7C3AED' },
      green: { primary: '#10B981', hover: '#059669' },
      red: { primary: '#EF4444', hover: '#DC2626' },
      orange: { primary: '#F97316', hover: '#EA580C' },
      pink: { primary: '#EC4899', hover: '#DB2777' }
    };

    const selectedColor = colors[accentColor] || colors.blue;
    document.documentElement.style.setProperty('--accent-primary', selectedColor.primary);
    document.documentElement.style.setProperty('--accent-hover', selectedColor.hover);
  }, [accentColor]);

  // Sauvegarder les préférences
  useEffect(() => {
    localStorage.setItem('workos-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updatePreferences = (newPrefs) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    accentColor,
    setAccentColor,
    preferences,
    updatePreferences
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
