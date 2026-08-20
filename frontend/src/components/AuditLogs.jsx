import React, { useEffect, useMemo, useState } from 'react';
import { listAuditLogs } from '../api/audit';
import { extractErrorMessage } from '../lib/api';
import { formatDateTime } from '../lib/labels';

const CATEGORIES = [
  { id: 'ALL', label: 'Tous les logs' },
  { id: 'User', label: 'Utilisateurs' },
  { id: 'Project', label: 'Projets' },
  { id: 'Task', label: 'Tâches' },
  { id: 'Meeting', label: 'Réunions' },
];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listAuditLogs({ page: 0, size: 100 });
        const content = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
        if (!cancelled) setLogs(content);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, "Impossible de charger le journal d'audit."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredLogs = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return logs.filter((log) => {
      const matchesCategory = filterCategory === 'ALL' || log.entiteCible === filterCategory;
      const haystack = [log.userNomComplet, log.typeAction, log.detail, String(log.id), log.entiteCible]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesCategory && haystack.includes(term);
    });
  }, [logs, searchQuery, filterCategory]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Journal d'Audit & Traçabilité</h1>
          <p className="text-xs text-slate-500 mt-1">
            Historique des actions administratives enregistrées par l'API.
          </p>
        </div>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
          Traçabilité active
        </span>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">{error}</div>}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Rechercher par utilisateur, action, ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 px-4 py-2 bg-slate-100 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border border-transparent focus:border-blue-500"
        />
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`text-xs px-3 py-2 rounded-lg font-medium whitespace-nowrap ${
                filterCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">ID & Date</th>
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entité</th>
              <th className="p-4">Détail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading && (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400 text-sm">Chargement du journal…</td></tr>
            )}
            {!loading && filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80">
                <td className="p-4">
                  <p className="font-mono text-xs font-bold text-blue-600">LOG-{log.id}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{formatDateTime(log.dateAction)}</p>
                </td>
                <td className="p-4 font-semibold text-slate-800 text-xs">{log.userNomComplet || 'Système'}</td>
                <td className="p-4 text-xs text-slate-700">{log.typeAction}</td>
                <td className="p-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                    {log.entiteCible} {log.idEntiteCible ? `#${log.idEntiteCible}` : ''}
                  </span>
                </td>
                <td className="p-4 text-xs text-slate-600">{log.detail}</td>
              </tr>
            ))}
            {!loading && filteredLogs.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">
                  Aucun événement trouvé avec ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
