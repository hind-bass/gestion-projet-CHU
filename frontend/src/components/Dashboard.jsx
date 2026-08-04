import React from 'react';

export default function Dashboard({ onNavigate }) {
  // Données globales synthétiques
  const stats = {
    totalProjets: 4,
    projetsEnCours: 3,
    tachesTerminees: 18,
    tachesTotal: 24,
    progressionGlobale: 75,
    membresActifs: 4
  };

  // Suivi individuel des membres de l'équipe
  const teamPerformance = [
    {
      id: 1,
      nom: 'Youssef Alami',
      role: 'Ingénieur Réseau',
      taches: { total: 6, faites: 5 },
      charge: 'Normale (80%)',
      avancement: 83
    },
    {
      id: 2,
      nom: 'Sanaa Chraibi',
      role: 'Développeuse Fullstack',
      taches: { total: 8, faites: 6 },
      charge: 'Élevée (100%)',
      avancement: 75
    },
    {
      id: 3,
      nom: 'Omar Amrani',
      role: 'Administrateur BDD',
      taches: { total: 5, faites: 4 },
      charge: 'Faible (50%)',
      avancement: 80
    },
    {
      id: 4,
      nom: 'Khadija Bennani',
      role: 'Technicienne Support',
      taches: { total: 5, faites: 3 },
      charge: 'Normale (70%)',
      avancement: 60
    }
  ];

  // Avancement par projet
  const projectsOverview = [
    { code: 'PRJ-CHU-01', nom: 'Refonte SI Hospitalier', chef: 'Karim El Amrani', progression: 65, statut: 'En cours' },
    { code: 'PRJ-CHU-02', nom: 'Informatisation Dossier Patient', chef: 'Sara Benali', progression: 100, statut: 'Clôturé' },
    { code: 'PRJ-CHU-03', nom: 'Sécurisation Réseau Bloc', chef: 'Youssef Alami', progression: 40, statut: 'En cours' },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard de Pilotage IT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Vue d'ensemble de la performance globale des projets et de l'équipe CHU.
          </p>
        </div>
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
          📍 Temps réel
        </span>
      </div>

      {/* CARTE DES KPIS / INDICATEURS CLÉS (CLIQUABLES) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Projets Actifs -> Redirige vers 'projects' */}
        <div 
          onClick={() => onNavigate && onNavigate('projects')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-md transition-all active:scale-98"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase">Projets Actifs</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{stats.projetsEnCours}</span>
            <span className="text-xs text-slate-500">/ {stats.totalProjets} au total</span>
          </div>
        </div>

        {/* Tâches Réalisées -> Redirige vers 'tasks' */}
        <div 
          onClick={() => onNavigate && onNavigate('tasks')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all active:scale-98"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase">Tâches Réalisées</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-emerald-600">{stats.tachesTerminees}</span>
            <span className="text-xs text-slate-500">/ {stats.tachesTotal} achevées</span>
          </div>
        </div>

        {/* Avancement Global -> Redirige vers 'timeline' */}
        <div 
          onClick={() => onNavigate && onNavigate('timeline')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-md transition-all active:scale-98"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase">Avancement Global</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-blue-600">{stats.progressionGlobale}%</span>
          </div>
        </div>

        {/* Effectif Équipe IT -> Redirige vers 'team' */}
        <div 
          onClick={() => onNavigate && onNavigate('team')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all active:scale-98"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase">Effectif Équipe IT</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{stats.membresActifs}</span>
            <span className="text-xs text-slate-500">collaborateurs</span>
          </div>
        </div>

      </div>

      {/* SECTION DOUBLE : SUIVI INDIVIDUEL + AVANCEMENT DES PROJETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Suivi Individuel de l'Équipe */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>👥</span> Avancement Individuel
            </h2>
            <button 
              onClick={() => onNavigate && onNavigate('team')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Gérer l'équipe ➔
            </button>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {teamPerformance.map((m) => (
              <div 
                key={m.id} 
                onClick={() => onNavigate && onNavigate('team')}
                className="pt-3 first:pt-0 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="font-semibold text-sm text-slate-800">{m.nom}</span>
                    <span className="text-xs text-slate-400 ml-2">({m.role})</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {m.taches.faites}/{m.taches.total} tâches ({m.avancement}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      m.avancement >= 80 ? 'bg-emerald-500' :
                      m.avancement >= 60 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${m.avancement}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Aperçu des Projets CHU */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📁</span> Avancement des Projets
            </h2>
            <button 
              onClick={() => onNavigate && onNavigate('projects')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Voir les projets ➔
            </button>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {projectsOverview.map((p) => (
              <div 
                key={p.code} 
                onClick={() => onNavigate && onNavigate('projects')}
                className="pt-3 first:pt-0 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600 mr-2">{p.code}</span>
                    <span className="font-semibold text-sm text-slate-800">{p.nom}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.statut === 'Clôturé' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {p.statut}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300" 
                      style={{ width: `${p.progression}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 font-mono">{p.progression}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
