import { useState } from 'react';
import { User, Lock, Bell, Palette, Save, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, authAPI } from '../services/api';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    profession: user?.profession || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userAPI.updateProfile(profileData);
      updateUser(response.user);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' });
      setLoading(false);
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la modification' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Mot de passe', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Palette }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Paramètres</h1>
        <p className="text-slate-600">Gérez vos préférences et paramètres de compte</p>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-4 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Messages */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Profil */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  Informations personnelles
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Profession
                </label>
                <input
                  type="text"
                  name="profession"
                  value={profileData.profession}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Développeur, Designer, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email (lecture seule)
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-500">
                  L'email ne peut pas être modifié pour des raisons de sécurité
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </form>
          )}

          {/* Mot de passe */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  Changer le mot de passe
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Au moins 6 caractères
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                <span>{loading ? 'Modification...' : 'Modifier le mot de passe'}</span>
              </button>
            </form>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Préférences de notifications
              </h2>
              <p className="text-slate-600 mb-6">
                Fonctionnalité à venir prochainement
              </p>
            </div>
          )}

          {/* Apparence */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Apparence
              </h2>
              <p className="text-slate-600 mb-6">
                Fonctionnalité à venir prochainement
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
