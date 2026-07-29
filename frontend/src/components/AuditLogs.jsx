import React, { useState } from 'react';

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Données de démonstration du journal d'audit CHU
  const initialLogs = [
    {
      id: 'LOG-1092',
      horodatage: '2026-07-25 18:42:10',
      utilisateur: 'Admin IT-CHU (Chef de Service)',
      action: 'Création du projet "Refonte SI Hospitalier"',
      categorie: 'PROJECTS',
      ip: '192.168.1.45',
      statut: 'SUCCES'
    },
    {
      id: 'LOG-1091',
      horodatage: '2026-07-25 16:15:02',
      utilisateur: 'Admin IT-CHU (Chef de Service)',
      action: 'Attribution intelligente de la tâche "Mise à niveau Pare-feu" à Youssef Alami',
      categorie: 'TASKS',
      ip: '192.168.1.45',
      statut: 'SUCCES'
    },
    {
      id: 'LOG-1090',
      horodatage: '2026-07-25 14:00:55',
      utilisateur: 'Sanaa Chraibi',
      action: 'Connexion à la plateforme IT-CHU Manager',
      categorie: 'SECURITY',
      ip: '192.168.1.88',
      statut: 'SUCCES'
    },
    {
      id: 'LOG-1089',
      horodatage: '2026-07-24 11:30:22',
      utilisateur: 'Admin IT-CHU (Chef de Service)',
      action: 'Création du compte utilisateur "Khadija Bennani"',
      categorie: 'TEAM',
      ip: '192.168.1.45',
      statut: 'SUCCES'
    },
    {
      id: 'LOG-1088',
      horodatage: '2026-07-24 09:12:00',
      utilisateur: 'Inconnu / Tentative externe',
      action: 'Échec de connexion (Mot de passe incorrect)',
      categorie: 'SECURITY',
      ip: '105.158.12.90',
      statut: 'ECHEC'
    }
  ];

  // Filtrage des logs selon la recherche et la catégorie
  const filteredLogs = initialLogs.filter((log) => {
    const matchesCategory = filterCategory === 'ALL' || log.categorie === filterCategory;
    const matchesSearch = 
      log.utilisateur.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Journal d'Audit & Traçabilité</h1>
          <p className="text-xs text-slate-500 mt-1">
            Historique complet et inaltérable des actions administratives et événements de sécurité du SI CHU.
          </p>
        </div>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
          🛡️ Traçabilité Active
        </span>
      </div>

      {/* Barre d'outils de recherche et filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Recherche par mot-clé */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par utilisateur, action, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-slate-100 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border border-transparent focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filtres de catégorie */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Tous les logs' },
            { id: 'SECURITY', label: '🔒 Sécurité' },
            { id: 'PROJECTS', label: '📁 Projets' },
            { id: 'TEAM', label: '👥 Équipe' },
            { id: 'TASKS', label: '☑️ Tâches' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">ID & Date / Heure</th>
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Action effectuée</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">IP</th>
              <th className="p-4 text-center">Résultat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* ID & Date */}
                  <td className="p-4">
                    <p className="font-mono text-xs font-bold text-blue-600">{log.id}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{log.horodatage}</p>
                  </td>

                  {/* Utilisateur */}
                  <td className="p-4 font-semibold text-slate-800 text-xs">
                    {log.utilisateur}
                  </td>

                  {/* Action */}
                  <td className="p-4 text-xs text-slate-700">
                    {log.action}
                  </td>

                  {/* Catégorie */}
                  <td className="p-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {log.categorie}
                    </span>
                  </td>

                  {/* IP */}
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {log.ip}
                  </td>

                  {/* Statut */}
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      log.statut === 'SUCCES' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {log.statut === 'SUCCES' ? '✔ Succès' : '✖ Échec'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400 text-sm">
                  Aucun événement trouvé dans le journal d'audit avec ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}