import React, { useEffect, useMemo, useState } from 'react';
import { listMyTasks, updateTaskStatus } from '../../api/tasks';
import { extractErrorMessage } from '../../lib/api';
import {
  formatDate,
  TASK_STATUS_BADGES,
  TASK_STATUS_ICONS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
} from '../../lib/labels';
import { priorityBadgeClass, priorityLabel } from '../../lib/priority';

// Colonnes du Kanban alignées sur les statuts du backend
const columns = [
  { key: 'A_FAIRE', label: TASK_STATUS_LABELS.A_FAIRE, badgeBg: TASK_STATUS_BADGES.A_FAIRE },
  { key: 'EN_COURS', label: TASK_STATUS_LABELS.EN_COURS, badgeBg: TASK_STATUS_BADGES.EN_COURS },
  { key: 'EN_REVUE', label: TASK_STATUS_LABELS.EN_REVUE, badgeBg: TASK_STATUS_BADGES.EN_REVUE },
  { key: 'TERMINEE', label: TASK_STATUS_LABELS.TERMINEE, badgeBg: TASK_STATUS_BADGES.TERMINEE },
];

export default function UserTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [filterProject, setFilterProject] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listMyTasks();
        if (!cancelled) setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Impossible de charger vos tâches.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const projectNames = useMemo(
    () => [...new Set(tasks.map((t) => t.projectNom).filter(Boolean))],
    [tasks],
  );

  // Mise à jour de l'état d'une tâche (PATCH /api/tasks/{id}/status)
  const handleStatusChange = async (taskId, newStatus) => {
    const previous = tasks;
    setStatusError('');
    setUpdatingId(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, statut: newStatus } : t)));
    setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, statut: newStatus } : prev));

    try {
      const updated = await updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      setSelectedTask((prev) => (prev && prev.id === taskId ? updated : prev));
    } catch (err) {
      setTasks(previous);
      const restored = previous.find((t) => t.id === taskId) || null;
      setSelectedTask((prev) => (prev && prev.id === taskId ? restored : prev));
      setStatusError(extractErrorMessage(err, "Impossible de mettre à jour le statut de la tâche."));
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtrage des tâches
  const filteredTasks = tasks.filter((t) => {
    const matchProject = filterProject === 'ALL' || t.projectNom === filterProject;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      (t.titre || '').toLowerCase().includes(term) ||
      String(t.id).includes(term);
    return matchProject && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* En-tête & Filtres */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Gestion de mes Tâches</h1>
          <p className="text-xs text-slate-500">Consultez et mettez à jour l'avancement de vos activités assignées.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Recherche */}
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Filtrer par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Filtre par Projet */}
          <select 
            value={filterProject} 
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-700"
          >
            <option value="ALL">Tous mes projets</option>
            {projectNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {(error || statusError) && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
          {error || statusError}
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
          Chargement de vos tâches…
        </div>
      ) : (
        /* Tableau Kanban */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.statut === col.key);

            return (
              <div key={col.key} className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 min-h-[500px]">
                
                {/* Header de colonne */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">{col.label}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Conteneur des cartes de tâche */}
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group ${
                        updatingId === task.id ? 'opacity-60' : ''
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      {/* Badge ID + Priorité */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-teal-600 transition-colors">
                          TASK-{task.id}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityBadgeClass(task.priorite)}`}>
                          {priorityLabel(task.priorite)}
                        </span>
                      </div>

                      {/* Titre */}
                      <h3 className="text-xs font-semibold text-slate-800 leading-snug mb-2">
                        {task.titre}
                      </h3>

                      {/* Projet */}
                      <div className="text-[10px] text-slate-500 font-medium mb-3 flex items-center gap-1">
                        <span>📁</span>
                        <span className="truncate">{task.projectNom}</span>
                      </div>

                      {/* Footer de Carte : Échéance + Changement rapide d'état */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          📅 {formatDate(task.echeance)}
                        </span>

                        {/* Selecteur d'état rapide */}
                        <select
                          value={task.statut}
                          disabled={updatingId === task.id}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-teal-500"
                        >
                          {TASK_STATUSES.map((statut) => (
                            <option key={statut} value={statut}>{TASK_STATUS_LABELS[statut]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      Aucune tâche
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal Détails & Édition de la tâche */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-teal-400">TASK-{selectedTask.id}</span>
                <h3 className="text-sm font-bold mt-0.5">{selectedTask.titre}</h3>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Corps Modal */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {selectedTask.description || 'Aucune description fournie.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Changer l'état</label>
                  <select
                    value={selectedTask.statut}
                    disabled={updatingId === selectedTask.id}
                    onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white text-slate-800"
                  >
                    {TASK_STATUSES.map((statut) => (
                      <option key={statut} value={statut}>
                        {TASK_STATUS_ICONS[statut]} {TASK_STATUS_LABELS[statut]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Priorité</label>
                  <div className={`p-2 rounded-lg border font-bold text-center ${priorityBadgeClass(selectedTask.priorite)}`}>
                    {priorityLabel(selectedTask.priorite)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block">Projet</span>
                  <span className="font-semibold text-slate-800">{selectedTask.projectNom}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date Limite</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedTask.echeance)}</span>
                </div>
              </div>

              {(selectedTask.tagsCompetences || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTask.tagsCompetences.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="bg-teal-50 p-3 rounded-lg border border-teal-100 flex justify-between items-center text-teal-900">
                <span>Charge estimée :</span>
                <span className="font-bold">{selectedTask.heuresEstimees ?? 0}h</span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-1.5 rounded-lg text-xs"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
