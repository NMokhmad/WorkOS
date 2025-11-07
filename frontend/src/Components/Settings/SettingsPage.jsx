// SettingsPage - Page de paramètres et préférences utilisateur
import React, { useState } from 'react';
import { Settings, Moon, Sun, Palette, Keyboard, Bell, Save, User, Shield } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsPage() {
  const { theme, toggleTheme, accentColor, setAccentColor, preferences, updatePreferences } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appearance');
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const tabs = [
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'preferences', label: 'Préférences', icon: Settings },
    { id: 'shortcuts', label: 'Raccourcis', icon: Keyboard },
    { id: 'account', label: 'Compte', icon: User }
  ];

  const accentColors = [
    { id: 'blue', name: 'Bleu', color: '#3B82F6' },
    { id: 'purple', name: 'Violet', color: '#8B5CF6' },
    { id: 'green', name: 'Vert', color: '#10B981' },
    { id: 'red', name: 'Rouge', color: '#EF4444' },
    { id: 'orange', name: 'Orange', color: '#F97316' },
    { id: 'pink', name: 'Rose', color: '#EC4899' }
  ];

  const handleSave = () => {
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handlePreferenceChange = (key, value) => {
    updatePreferences({ [key]: value });
    handleSave();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Paramètres</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Personnalisez votre expérience WorkOS
        </p>
      </div>

      {/* Save Message */}
      {showSaveMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex items-center space-x-2">
          <Save className="w-5 h-5" />
          <span>Paramètres sauvegardés automatiquement</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700 flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-8">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-8">
              {/* Theme Toggle */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                  Thème
                </h3>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {theme === 'dark' ? (
                      <Moon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Sun className="w-6 h-6 text-amber-600" />
                    )}
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        Mode {theme === 'dark' ? 'sombre' : 'clair'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {theme === 'dark' ? 'Réduire la fatigue oculaire' : 'Thème par défaut'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                  Couleur d'accent
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {accentColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setAccentColor(color.id);
                        handleSave();
                      }}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                        accentColor === color.id
                          ? 'border-current shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      style={{ borderColor: accentColor === color.id ? color.color : undefined }}
                    >
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                Préférences générales
              </h3>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">Notifications</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Recevoir des alertes pour les échéances et événements
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('notifications', !preferences.notifications)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    preferences.notifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.notifications ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-save Notes */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Save className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      Sauvegarde automatique des notes
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Enregistrer automatiquement les modifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('autoSaveNotes', !preferences.autoSaveNotes)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    preferences.autoSaveNotes ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.autoSaveNotes ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Show Completed Tasks */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    Afficher les tâches terminées
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Montrer les tâches complétées dans la liste
                  </p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('showCompletedTasks', !preferences.showCompletedTasks)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    preferences.showCompletedTasks ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.showCompletedTasks ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">Mode compact</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Réduire l'espacement pour afficher plus de contenu
                  </p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('compactMode', !preferences.compactMode)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    preferences.compactMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.compactMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Default View */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <p className="font-medium text-slate-800 dark:text-slate-100 mb-3">
                  Vue par défaut des tâches
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handlePreferenceChange('defaultView', 'kanban')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      preferences.defaultView === 'kanban'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    Kanban
                  </button>
                  <button
                    onClick={() => handlePreferenceChange('defaultView', 'list')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      preferences.defaultView === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    Liste
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                Raccourcis clavier
              </h3>

              <div className="space-y-3">
                {[
                  { keys: ['Ctrl', 'K'], description: 'Recherche globale' },
                  { keys: ['Ctrl', 'N'], description: 'Nouvelle tâche' },
                  { keys: ['Ctrl', 'Shift', 'N'], description: 'Nouvelle note' },
                  { keys: ['Ctrl', 'D'], description: 'Tableau de bord' },
                  { keys: ['Ctrl', 'T'], description: 'Tâches' },
                  { keys: ['Ctrl', 'C'], description: 'Calendrier' },
                  { keys: ['Ctrl', 'P'], description: 'Projets' },
                  { keys: ['Ctrl', ','], description: 'Paramètres' },
                  { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle thème' },
                  { keys: ['Esc'], description: 'Fermer le modal actif' }
                ].map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                  >
                    <p className="text-slate-700 dark:text-slate-300">{shortcut.description}</p>
                    <div className="flex items-center space-x-2">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <kbd className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-slate-400">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Utilisez <kbd className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded text-xs">?</kbd> pour afficher cette liste de raccourcis n'importe où dans l'application.
                </p>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                Informations du compte
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Nom d'utilisateur</p>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{user?.username}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Nom</p>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : 'Non défini'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Profession</p>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {user?.profession || 'Non défini'}
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Zone de sécurité
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      La modification du profil et la gestion du mot de passe seront disponibles prochainement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
