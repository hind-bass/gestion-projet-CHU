import React, { useEffect, useMemo, useState } from 'react';
import { getKanban } from '../api/kanban';
import { listProjects } from '../api/projects';
import { updateTaskStatus } from '../api/tasks';
import { extractErrorMessage } from '../lib/api';
import { formatDate, fullName, TASK_STATUS_LABELS, TASK_STATUSES } from '../lib/labels';
import { priorityBadgeClass, priorityLabel } from '../lib/priority';

const COLUMNS = [
  { id: 'A_FAIRE', label: TASK_STATUS_LABELS.A_FAIRE, color: 'border-slate-300 bg-slate-50' },
  { id: 'EN_COURS', label: TASK_STATUS_LABELS.EN_COURS, color: 'border-blue-400 bg-blue-50/30' },
  { id: 'EN_REVUE', label: TASK_STATUS_LABELS.EN_REVUE, color: 'border-amber-400 bg-amber-50/30' },
  { id: 'TERMINEE', label: TASK_STATUS_LABELS.TERMINEE, color: 'border-emerald-400 bg-emerald-50/30' },
];

function flattenBoard(board) {
  return TASK_STATUSES.flatMap((status) => (board?.[status] || []).map((task) => ({ ...task, statut: status })));
}

export default function KanbanBoard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [dragTaskId, setDragTaskId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProjects() {
      try {
        const data = await listProjects();
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setProjects(list);
          setSelectedProject((current) => current || String(list[0]?.id || ''));
        }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Impossible de charger les projets.'));
      }
    }
    loadProjects();
    return () => { cancelled = true; };
  }, []);

  async function loadBoard(projectId) {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const board = await getKanban(projectId);
      setTasks(flattenBoard(board));
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger le kanban.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedProject) loadBoard(selectedProject);
  }, [selectedProject]);

  const moveTask = async (taskId, newStatus) => {
    const previous = tasks;
    setUpdatingId(taskId);
    setTasks((current) => current.map((t) => (t.id === taskId ? { ...t, statut: newStatus } : t)));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      setTasks(previous);
      setError(extractErrorMessage(err, 'Déplacement de la tâche impossible.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const neighbor = (status, direction) => {
    const index = TASK_STATUSES.indexOf(status);
    return TASK_STATUSES[index + direction] || status;
  };

  const tasksByColumn = useMemo(() => {
    const grouped = {};
    TASK_STATUSES.forEach((status) => {
      grouped[status] = tasks.filter((t) => t.statut === status);
    });
    return grouped;
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tableau Kanban Projet</h1>
          <p className="text-xs text-slate-500 mt-1">
            Déplacez les tâches ; le statut est enregistré via l'API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Projet actif :</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">{error}</div>}

      {loading && (
        <div className="bg-white p-8 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
          Chargement du kanban…
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = tasksByColumn[col.id] || [];
            return (
              <div
                key={col.id}
                className={`p-4 rounded-xl border ${col.color} flex flex-col min-h-[500px]`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = Number(e.dataTransfer.getData('text/plain') || dragTaskId);
                  if (taskId) moveTask(taskId, col.id);
                  setDragTaskId(null);
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-slate-800">{col.label}</h3>
                  <span className="text-xs font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        setDragTaskId(task.id);
                        e.dataTransfer.setData('text/plain', String(task.id));
                      }}
                      className={`bg-white p-4 rounded-lg border border-slate-200 space-y-3 ${updatingId === task.id ? 'opacity-60' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityBadgeClass(task.priorite)}`}>
                          {priorityLabel(task.priorite)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">#{task.id}</span>
                      </div>
                      <h4 className="font-semibold text-xs text-slate-900 leading-snug">{task.titre}</h4>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-700">{fullName(task.responsable) || 'Non assigné'}</span>
                        <span className="font-mono text-[10px]">{formatDate(task.echeance)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <button
                          disabled={col.id === 'A_FAIRE' || updatingId === task.id}
                          onClick={() => moveTask(task.id, neighbor(col.id, -1))}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        >
                          Reculer
                        </button>
                        <button
                          disabled={col.id === 'TERMINEE' || updatingId === task.id}
                          onClick={() => moveTask(task.id, neighbor(col.id, 1))}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 disabled:opacity-30"
                        >
                          Avancer
                        </button>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 italic">Aucune tâche</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
