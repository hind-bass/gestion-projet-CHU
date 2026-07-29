import React, { useState } from 'react';

export default function ProfileModal({ user, onClose, onUpdateProfile }) {
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    title: user?.title || 'Membre IT',
    notificationsEnabled: true
  });

  // États pour le changement de mot de passe
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation du mot de passe si l'utilisateur tente de le modifier
    if (passwords.newPassword || passwords.confirmPassword || passwords.currentPassword) {
      if (!passwords.currentPassword) {
        setPasswordError('Veuillez saisir votre mot de passe actuel.');
        return;
      }
      if (passwords.newPassword.length < 6) {
        setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
        return;
      }
    }

    // Soumission des données
    onUpdateProfile({
      ...formData,
      ...(passwords.newPassword ? { newPassword: passwords.newPassword } : {})
    });
    onClose();
  };

  const roleText = user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <span>👤 Gestion du Profil {roleText}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            ✕
          </button>
        </div>

        {/* Contenu avec défilement si nécessaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Badge utilisateur */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {formData.prenom[0]}{formData.nom[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{formData.prenom} {formData.nom}</p>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-0.5">
                <span>🛡️ {formData.title} ({user?.role || 'USER'})</span>
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Institutionnel</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Titre / Poste</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Section Changement de Mot de Passe */}
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>🔒</span> Changer le mot de passe
            </h4>

            {passwordError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
                {passwordError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confirmation</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Options de notification */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="notificationsEnabled"
              name="notificationsEnabled"
              checked={formData.notificationsEnabled}
              onChange={handleChange}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="notificationsEnabled" className="text-xs text-slate-600">
              Recevoir les alertes automatiques de surcharges et retards
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <span>💾 Enregistrer</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}