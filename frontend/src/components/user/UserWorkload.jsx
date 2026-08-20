import React, { useEffect, useState } from 'react';
import { alertAdmin } from '../../api/notifications';
import { getMyWorkload } from '../../api/workload';
import { extractErrorMessage } from '../../lib/api';

const PROJECT_COLORS = ['bg-teal-500', 'bg-sky-500', 'bg-indigo-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500'];

const EMPTY_WORKLOAD = {
  userId: null,
  nomComplet: '',
  weeklyCapacityHours: 35,
  totalPlannedHours: 0,
  totalLoggedHours: 0,
  chargePercent: 0,
  tachesEnCours: 0,
  projects: [],
};

export default function UserWorkload() {
  const [workloadData, setWorkloadData] = useState(EMPTY_WORKLOAD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState({ sending: false, sent: false, error: '' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getMyWorkload();
        if (!cancelled) setWorkloadData({ ...EMPTY_WORKLOAD, ...data, projects: data?.projects || [] });
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Impossible de charger votre charge de travail.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxCapacityHours = workloadData.weeklyCapacityHours || 35;
  const plannedHours = Math.round((workloadData.totalPlannedHours || 0) * 10) / 10;
  const loggedHours = Math.round((workloadData.totalLoggedHours || 0) * 10) / 10;
  const plannedPercentage = Math.round(workloadData.chargePercent || 0);
  const remainingHours = Math.round((maxCapacityHours - plannedHours) * 10) / 10;

  // Détermination du statut de charge & couleur
  const getWorkloadStatus = (percentage) => {
    if (percentage > 100) return { label: 'Surcharge critique', color: 'text-red-600', bg: 'bg-red-500', border: 'border-red-200', alertBg: 'bg-red-50 text-red-700' };
    if (percentage >= 85) return { label: 'Charge élevée', color: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-200', alertBg: 'bg-amber-50 text-amber-700' };
    return { label: 'Charge équilibrée', color: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200', alertBg: 'bg-emerald-50 text-emerald-700' };
  };

  const status = getWorkloadStatus(plannedPercentage);

  const handleAlertAdmin = async () => {
    setAlertState({ sending: true, sent: false, error: '' });
    try {
      await alertAdmin({
        subject: `Alerte de capacité : ${status.label}`,
        message:
          `Ma charge hebdomadaire atteint ${plannedPercentage}% ` +
          `(${plannedHours}h planifiées pour une capacité de ${maxCapacityHours}h) ` +
          `sur ${workloadData.tachesEnCours} tâche(s) en cours. Merci de réévaluer mes affectations.`,
        priority: plannedPercentage > 100 ? 'URGENT' : 'WARNING',
      });
      setAlertState({ sending: false, sent: true, error: '' });
    } catch (err) {
      setAlertState({
        sending: false,
        sent: false,
        error: extractErrorMessage(err, "Impossible d'envoyer l'alerte à l'administrateur."),
      });
    }
  };

  const maxProjectHours = Math.max(1, ...workloadData.projects.map((p) => p.heures || 0));

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
          <span className="text-xs font-bold text-slate-700">Semaine en cours ({maxCapacityHours}h max)</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Alerte intelligente si charge élevée ou surcharge */}
      {!loading && plannedPercentage >= 85 && (
        <div className={`p-4 rounded-xl border ${status.border} ${status.alertBg} flex items-center justify-between gap-3 text-xs`}>
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold">Alerte de capacité : {status.label}</p>
              <p className="opacity-90">
                Vous avez {plannedHours}h planifiées sur une capacité maximale de {maxCapacityHours}h ({plannedPercentage}%).
              </p>
              {alertState.error && <p className="mt-1 font-semibold text-red-700">{alertState.error}</p>}
            </div>
          </div>
          <button
            onClick={handleAlertAdmin}
            disabled={alertState.sending || alertState.sent}
            className={`font-semibold text-[11px] shrink-0 px-3 py-1.5 rounded-lg bg-white/70 border ${status.border} hover:bg-white transition-colors cursor-pointer disabled:opacity-60`}
          >
            {alertState.sent
              ? '✅ Administrateur averti'
              : alertState.sending
                ? 'Envoi…'
                : "Aviser l'administrateur"}
          </button>
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
            <span className="text-2xl font-bold text-slate-800">{loading ? '…' : `${plannedHours}h`}</span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${status.alertBg}`}>
              {plannedPercentage}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Sur l'ensemble des tâches</p>
        </div>

        {/* Heures Réalisées */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tâches en cours</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-teal-600">{loading ? '…' : workloadData.tachesEnCours}</span>
            <span className="text-xs text-slate-400">actives</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{loggedHours}h déjà réalisées</p>
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
              <span>Niveau de charge ({plannedHours}h / {maxCapacityHours}h)</span>
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

            {workloadData.projects.map((proj, idx) => {
              const color = PROJECT_COLORS[idx % PROJECT_COLORS.length];
              const percentage = Math.round(proj.percentage || 0);
              return (
                <div key={proj.projectId} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      {proj.projectNom}
                    </span>
                    <span className="font-bold text-slate-600">{proj.heures}h ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${color} transition-all duration-500`} 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {!loading && workloadData.projects.length === 0 && (
              <p className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg p-6 text-center">
                Aucune heure planifiée sur vos projets cette semaine.
              </p>
            )}
          </div>
        </div>

        {/* Histogramme par Projet */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
              Volume horaire par projet
            </h2>

            <div className="flex items-end justify-between h-48 pt-6 px-2 gap-2">
              {workloadData.projects.map((proj, idx) => {
                const heightPercent = Math.round(((proj.heures || 0) / maxProjectHours) * 100);
                return (
                  <div key={proj.projectId} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-500">{proj.heures}h</span>
                    <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden p-1">
                      <div 
                        className={`w-full rounded-t transition-all duration-500 ${PROJECT_COLORS[idx % PROJECT_COLORS.length]}`}
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 truncate w-full text-center" title={proj.projectNom}>
                      {proj.projectNom}
                    </span>
                  </div>
                );
              })}

              {workloadData.projects.length === 0 && (
                <p className="w-full text-center text-xs text-slate-400">Aucune donnée à afficher.</p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <span>💡</span>
            <span>Capacité de référence : {maxCapacityHours}h par semaine.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
