import React, { useEffect, useState } from 'react';
import { getMyStats } from '../../api/dashboard';
import { extractErrorMessage } from '../../lib/api';
import { dueDateLabel, fullName, TASK_STATUS_LABELS } from '../../lib/labels';
import { priorityBadgeClass, priorityLabel } from '../../lib/priority';

const EMPTY_STATS = {
  myProjectsCount: 0,
  activeTasksCount: 0,
  todayMeetingsCount: 0,
  weeklyPlannedHours: 0,
  weeklyCapacityHours: 35,
  weeklyChargePercent: 0,
  urgentTasks: [],
};

export default function UserDashboard({ user, onNavigate }) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getMyStats();
        if (!cancelled) setStats({ ...EMPTY_STATS, ...data, urgentTasks: data?.urgentTasks || [] });
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Impossible de charger votre tableau de bord.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const capacity = stats.weeklyCapacityHours || 35;
  const chargePercent = Math.round(stats.weeklyChargePercent || 0);
  const plannedHours = Math.round((stats.weeklyPlannedHours || 0) * 10) / 10;
  const remainingHours = Math.max(0, Math.round((capacity - plannedHours) * 10) / 10);
  const urgentCount = stats.urgentTasks.filter((t) => priorityLabel(t.priorite) === 'URGENTE').length;

  return (
    <div className="space-y-6">
      
      {/* Bannière de bienvenue */}
      <div className="bg-gradient-to-r from-teal-800 to-sky-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-teal-200 text-xs font-semibold uppercase tracking-wider">
              Espace Membre DSI CHU
            </span>
            <h1 className="text-2xl font-bold mt-1">
              Bonjour, {fullName(user) || 'Membre IT'} 👋
            </h1>
            <p className="text-teal-100/80 text-xs mt-1">
              {(user?.competences || []).join(' · ') || 'Service Informatique (CHU)'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-[10px] text-teal-200 uppercase font-bold">Charge cette semaine</p>
              <p className="text-sm font-bold">{plannedHours}h / {capacity}h ({chargePercent}%)</p>
            </div>
          </div>
        </div>

        {/* Halo décoratif */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Cartes d'indicateurs clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigate && onNavigate('projects')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-teal-400 transition-all"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mes Projets</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{loading ? '…' : stats.myProjectsCount}</p>
            <span className="text-[10px] text-teal-600 font-medium">Affectations actives</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base">
            📁
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('tasks')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tâches en cours</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{loading ? '…' : stats.activeTasksCount}</p>
            <span className="text-[10px] text-amber-600 font-medium">
              {urgentCount > 0 ? `${urgentCount} urgente(s)` : 'Aucune urgence'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base">
            ☑️
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('meetings')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-sky-400 transition-all"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Réunions aujourd'hui</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{loading ? '…' : stats.todayMeetingsCount}</p>
            <span className="text-[10px] text-sky-600 font-medium">Voir mon planning</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-base">
            📅
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('workload')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Heures planifiées</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{loading ? '…' : `${plannedHours}h`}</p>
            <span className="text-[10px] text-emerald-600 font-medium">
              {remainingHours}h disponibles sur {capacity}h
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
            ⏱️
          </div>
        </div>

      </div>

      {/* Bloc principal élargi (pleine largeur) */}
      <div className="w-full bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Tâches Prioritaires</h2>
            <p className="text-[11px] text-slate-400">À réaliser ou à faire avancer en priorité aujourd'hui.</p>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('tasks')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors flex items-center gap-1"
          >
            <span>Voir tout le Kanban</span>
            <span>➔</span>
          </button>
        </div>

        <div className="space-y-3">
          {loading && (
            <div className="text-center py-8 text-xs text-slate-400">Chargement de vos tâches…</div>
          )}

          {!loading && stats.urgentTasks.map((task) => (
            <div 
              key={task.id}
              className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-teal-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">TASK-{task.id}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${priorityBadgeClass(task.priorite)}`}>
                    {priorityLabel(task.priorite)}
                  </span>
                  <span className="text-[10px] text-slate-500">📁 {task.projectNom}</span>
                  <span className="text-[10px] text-slate-400">{TASK_STATUS_LABELS[task.statut] || task.statut}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800">{task.titre}</h3>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 shrink-0">
                <span className="text-[11px] font-medium text-slate-500">⏳ {dueDateLabel(task.echeance)}</span>
                <button 
                  onClick={() => onNavigate && onNavigate('tasks')}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-all active:scale-95 shadow-xs"
                >
                  Ouvrir
                </button>
              </div>
            </div>
          ))}

          {!loading && stats.urgentTasks.length === 0 && !error && (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
              Aucune tâche prioritaire pour le moment. 🎉
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
