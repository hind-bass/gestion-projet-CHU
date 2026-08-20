import React, { useEffect, useMemo, useState } from 'react';
import { getAdminStats } from '../api/dashboard';
import { extractErrorMessage } from '../lib/api';
import { TASK_STATUS_LABELS } from '../lib/labels';

const EMPTY_STATS = {
  totalProjects: 0,
  activeProjects: 0,
  totalTasks: 0,
  overdueTasks: 0,
  totalUsers: 0,
  activeUsers: 0,
  tasksByStatus: {},
  projectsProgress: [],
  workload: [],
  recentActivities: [],
};

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getAdminStats();
        if (!cancelled) setStats({ ...EMPTY_STATS, ...data });
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Impossible de charger le tableau de bord.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const doneTasks = stats.tasksByStatus?.TERMINEE || 0;
  const globalProgress = useMemo(() => {
    const points = stats.projectsProgress || [];
    if (points.length === 0) return 0;
    const sum = points.reduce((acc, point) => acc + (Number(point.value) || 0), 0);
    return Math.round(sum / points.length);
  }, [stats.projectsProgress]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard de Pilotage IT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Vue d'ensemble de la performance globale des projets et de l'équipe CHU.
          </p>
        </div>
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
          Données API
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-white p-8 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
          Chargement du tableau de bord…
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              onClick={() => onNavigate && onNavigate('projects')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase">Projets Actifs</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-slate-900">{stats.activeProjects}</span>
                <span className="text-xs text-slate-500">/ {stats.totalProjects} au total</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate && onNavigate('tasks')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase">Tâches Réalisées</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-emerald-600">{doneTasks}</span>
                <span className="text-xs text-slate-500">/ {stats.totalTasks} au total</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate && onNavigate('timeline')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase">Avancement Global</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-blue-600">{globalProgress}%</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate && onNavigate('team')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase">Effectif Équipe IT</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-slate-900">{stats.activeUsers}</span>
                <span className="text-xs text-slate-500">/ {stats.totalUsers} comptes</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900">Charge individuelle</h2>
                <button
                  onClick={() => onNavigate && onNavigate('team')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Gérer l'équipe
                </button>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                {(stats.workload || []).map((member) => {
                  const charge = Math.round(member.tauxCharge || 0);
                  return (
                    <div
                      key={member.userId}
                      onClick={() => onNavigate && onNavigate('team')}
                      className="pt-3 first:pt-0 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="font-semibold text-sm text-slate-800">{member.nomComplet}</span>
                          <span className="text-xs text-slate-400 ml-2">
                            {member.tachesEnCours} tâche(s) en cours
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700">{charge}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            charge >= 80 ? 'bg-emerald-500' : charge >= 60 ? 'bg-blue-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(charge, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {(stats.workload || []).length === 0 && (
                  <p className="text-xs text-slate-400">Aucune charge enregistrée.</p>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900">Avancement des projets</h2>
                <button
                  onClick={() => onNavigate && onNavigate('projects')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Voir les projets
                </button>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                {(stats.projectsProgress || []).map((project) => {
                  const progress = Math.round(project.value || 0);
                  return (
                    <div
                      key={project.label}
                      onClick={() => onNavigate && onNavigate('projects')}
                      className="pt-3 first:pt-0 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm text-slate-800">{project.label}</span>
                        <span className="text-xs font-bold text-slate-700 font-mono">{progress}%</span>
                      </div>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
                {(stats.projectsProgress || []).length === 0 && (
                  <p className="text-xs text-slate-400">Aucun projet à afficher.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">Répartition des tâches</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.tasksByStatus || {}).map(([status, count]) => (
                <span key={status} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                  {TASK_STATUS_LABELS[status] || status} : {count}
                </span>
              ))}
              {stats.overdueTasks > 0 && (
                <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
                  En retard : {stats.overdueTasks}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
