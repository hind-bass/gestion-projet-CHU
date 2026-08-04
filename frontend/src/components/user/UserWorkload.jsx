import React, { useState } from 'react';

export default function UserWorkload({ user }) {
  // Capacité hebdomadaire théorique (ex: 35h)
  const maxCapacityHours = 35;

  // Données de charge de l'utilisateur
  const [workloadData] = useState({
    totalPlannedHours: 31, // Heures planifiées cette semaine
    totalLoggedHours: 18,    // Heures déjà effectuées
    projects: [
      { id: 1, name: 'Refonte SI Hospitalier', hours: 14, color: 'bg-teal-500', percentage: 45 },
      { id: 2, name: 'Déploiement Réseau CHU', hours: 11, color: 'bg-sky-500', percentage: 35 },
      { id: 3, name: 'Sécurisation DSI & Logs', hours: 6, color: 'bg-indigo-500', percentage: 20 },
    ],
    dailyBreakdown: [
      { day: 'Lun', hours: 7, max: 7 },
      { day: 'Mar', hours: 8, max: 7 }, // Journée en légère surcharge
      { day: 'Mer', hours: 6, max: 7 },
      { day: 'Jeu', hours: 6, max: 7 },
      { day: 'Ven', hours: 4, max: 7 },
    ]
  });

  // Calculs d'indicateurs
  const plannedPercentage = Math.round((workloadData.totalPlannedHours / maxCapacityHours) * 100);
  const remainingHours = maxCapacityHours - workloadData.totalPlannedHours;

  // Détermination du statut de charge & couleur
  const getWorkloadStatus = (percentage) => {
    if (percentage > 100) return { label: 'Surcharge critique', color: 'text-red-600', bg: 'bg-red-500', border: 'border-red-200', alertBg: 'bg-red-50 text-red-700' };
    if (percentage >= 85) return { label: 'Charge élevée', color: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-200', alertBg: 'bg-amber-50 text-amber-700' };
    return { label: 'Charge équilibrée', color: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200', alertBg: 'bg-emerald-50 text-emerald-700' };
  };

  const status = getWorkloadStatus(plannedPercentage);

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Ma Charge de Travail</h1>
          <p className="text-xs text-slate-500">
            Suivi de votre volume horaire hebdomadaire et de votre capacité disponible.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500">Période :</span>
          <span className="text-xs font-bold text-slate-700">Semaine en cours (35h max)</span>
        </div>
      </div>

      {/* Alerte intelligente si charge élevée ou surcharge */}
      {plannedPercentage >= 85 && (
        <div className={`p-4 rounded-xl border ${status.border} ${status.alertBg} flex items-center justify-between gap-3 text-xs`}>
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold">Alerte de capacité : {status.label}</p>
              <p className="opacity-90">
                Vous avez {workloadData.totalPlannedHours}h planifiées sur une capacité maximale de {maxCapacityHours}h ({plannedPercentage}%).
              </p>
            </div>
          </div>
          <span className="font-semibold underline cursor-pointer text-[11px] shrink-0">
            Aviser le chef de projet
          </span>
        </div>
      )}

      {/* Cartes Métriques Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Capacité Totale */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Capacité Max</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-slate-800">{maxCapacityHours}h</span>
            <span className="text-xs text-slate-400">/ semaine</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Base temps plein CHU</p>
        </div>

        {/* Heures Planifiées */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Heures Affectées</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-800">{workloadData.totalPlannedHours}h</span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${status.alertBg}`}>
              {plannedPercentage}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Sur l'ensemble des tâches</p>
        </div>

        {/* Heures Réalisées */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Temps Passé</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-teal-600">{workloadData.totalLoggedHours}h</span>
            <span className="text-xs text-slate-400">saisies</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Avancement réel</p>
        </div>

        {/* Disponibilité Restante */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Disponibilité</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className={`text-2xl font-bold ${remainingHours < 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {remainingHours < 0 ? 0 : remainingHours}h
            </span>
            <span className="text-xs text-slate-400">libres</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Marge de sécurité</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Jauge Principale & Répartition par Projet */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">Occupation Globale & Projets</h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.alertBg}`}>
              Status: {status.label}
            </span>
          </div>

          {/* Jauge Principale de Capacité */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Niveau de charge ({workloadData.totalPlannedHours}h / {maxCapacityHours}h)</span>
              <span className={status.color}>{plannedPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${status.bg}`}
                style={{ width: `${Math.min(plannedPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Ventilation par Projet */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Répartition du temps par projet
            </h3>

            {workloadData.projects.map((proj) => (
              <div key={proj.id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${proj.color}`} />
                    {proj.name}
                  </span>
                  <span className="font-bold text-slate-600">{proj.hours}h ({proj.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${proj.color} transition-all duration-500`} 
                    style={{ width: `${proj.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Histogramme Hebdomadaire (Par Jour) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
              Charge Journalière (Lundi - Vendredi)
            </h2>

            <div className="flex items-end justify-between h-48 pt-6 px-2">
              {workloadData.dailyBreakdown.map((item, idx) => {
                const heightPercent = Math.min(Math.round((item.hours / item.max) * 100), 120);
                const isOver = item.hours > item.max;

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 w-1/6">
                    <span className="text-[10px] font-bold text-slate-500">{item.hours}h</span>
                    <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden p-1">
                      <div 
                        className={`w-full rounded-t transition-all duration-500 ${
                          isOver ? 'bg-red-500' : 'bg-teal-600'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <span>💡</span>
            <span>Moyenne recommandée : 7h par jour.</span>
          </div>
        </div>

      </div>

    </div>
  );
}