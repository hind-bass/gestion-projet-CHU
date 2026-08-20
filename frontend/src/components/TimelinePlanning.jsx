import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { getAdminStats } from '../api/dashboard';
import { listMeetings } from '../api/meetings';
import { listProjects } from '../api/projects';
import { extractErrorMessage } from '../lib/api';
import { formatDate, PROJECT_STATUS_LABELS, TASK_STATUS_LABELS } from '../lib/labels';

const STATUS_COLORS = {
  TERMINEE: '#10B981',
  EN_COURS: '#3B82F6',
  A_FAIRE: '#F59E0B',
  EN_REVUE: '#8B5CF6',
};

export default function TimelinePlanning() {
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [projectList, dashboard, meetingList] = await Promise.all([
          listProjects(),
          getAdminStats(),
          listMeetings(),
        ]);
        if (!cancelled) {
          setProjects(Array.isArray(projectList) ? projectList : []);
          setStats(dashboard);
          setMeetings(Array.isArray(meetingList) ? meetingList : []);
        }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Impossible de charger les analytics.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedProject === 'ALL') return projects;
    return projects.filter((p) => String(p.id) === String(selectedProject));
  }, [projects, selectedProject]);

  const progressData = filteredProjects.map((p) => ({
    projet: p.nom,
    realise: Math.round(p.tauxAvancement || 0),
    planifie: 100,
  }));

  const statusData = Object.entries(stats?.tasksByStatus || {}).map(([key, value]) => ({
    name: TASK_STATUS_LABELS[key] || key,
    value,
    color: STATUS_COLORS[key] || '#64748b',
  }));

  const workloadData = (stats?.workload || []).map((item) => ({
    membre: item.nomComplet,
    heures: Math.round(item.heuresAssignees || 0),
    charge: Math.round(item.tauxCharge || 0),
  }));

  const milestones = [
    ...filteredProjects.map((p) => ({
      id: `p-${p.id}`,
      date: formatDate(p.dateFinPrevue),
      title: p.nom,
      project: PROJECT_STATUS_LABELS[p.statut] || p.statut,
      status: p.statut === 'TERMINE' ? 'Terminé' : p.statut === 'ACTIF' ? 'En cours' : 'À faire',
    })),
    ...meetings
      .filter((m) => selectedProject === 'ALL' || String(m.projectId) === String(selectedProject))
      .map((m) => ({
        id: `m-${m.id}`,
        date: formatDate(m.date),
        title: m.titre,
        project: m.projectNom || `PRJ-${m.projectId}`,
        status: 'Réunion',
      })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Chronologie & Graphiques de Suivi</h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyse de l'avancement des projets et de la charge, à partir de l'API.
          </p>
        </div>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
        >
          <option value="ALL">Tous les projets</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.nom}</option>
          ))}
        </select>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">{error}</div>}
      {loading && <div className="bg-white p-8 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">Chargement des graphiques…</div>}

      {!loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Avancement par projet (%)</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="projet" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="planifie" name="Cible" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
                    <Line type="monotone" dataKey="realise" name="Réalisé" stroke="#2563eb" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Répartition des statuts</h2>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Charge de travail (heures assignées)</h2>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="membre" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="h" />
                    <Tooltip />
                    <Bar dataKey="heures" name="Heures" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Jalons et réunions</h2>
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 my-2">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white border-blue-500" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{milestone.date}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{milestone.status}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 mt-1">{milestone.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{milestone.project}</p>
                  </div>
                ))}
                {milestones.length === 0 && <p className="text-xs text-slate-400 pl-6">Aucun jalon.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
