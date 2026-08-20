import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../lib/api';

export default function LoginPage({ onLoggedIn }) {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', motDePasse: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const logoUrl = "/chu-logo.png";

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.motDePasse) {
      setError('Veuillez saisir des identifiants valides.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(credentials.email.trim(), credentials.motDePasse);
      if (onLoggedIn) onLoggedIn();
    } catch (err) {
      setError(extractErrorMessage(err, 'Échec de la connexion. Vérifiez vos identifiants.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-teal-50 via-sky-50 to-emerald-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Halos décoratifs Thème Santé */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Carte de Connexion */}
      <div className="relative z-10 max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-teal-100 overflow-hidden">
        
        {/* En-tête */}
        <div className="bg-gradient-to-r from-teal-800 to-sky-900 p-6 text-white text-center border-b border-teal-700/50 flex flex-col items-center">
          
          <div className="w-24 h-24 rounded-full bg-white p-1.5 mb-3 shadow-xl ring-4 ring-teal-400/30 flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src={logoUrl} 
              alt="Logo CHU" 
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">IT-CHU Manager</h2>
          <p className="text-teal-100/80 text-xs mt-1">
            Plateforme de gestion du service informatique hospitalier
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Champ Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adresse Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">✉️</span>
              <input
                type="email"
                name="email"
                required
                value={credentials.email}
                onChange={handleChange}
                placeholder="prenom.nom@chu.local"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="motDePasse"
                required
                value={credentials.motDePasse}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-teal-700 text-xs focus:outline-none transition-colors"
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* Bouton de Connexion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 active:scale-[0.99] text-white py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter ➔'}
          </button>
        </form>

      </div>
    </div>
  );
}
