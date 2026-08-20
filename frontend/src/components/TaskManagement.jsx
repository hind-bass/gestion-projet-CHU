import React, { useEffect, useState } from 'react';
import { listProjects } from '../api/projects';
import { createTask, deleteTask, listTasks, updateTask } from '../api/tasks';
import { listUsers } from '../api/users';
import { extractErrorMessage } from '../lib/api';
import { formatDate, fullName, TASK_STATUS_BADGES, TASK_STATUS_LABELS, TASK_STATUSES } from '../lib/labels';
import { PRIORITY_VALUES, priorityBadgeClass, priorityLabel } from '../lib/priority';

const EMPTY_FORM = {
  titre: '',
  projectId: '',
  priorite: 'MOYENNE',
  statut: 'A_FAIRE',
  responsableId: '',
  echeance: '',
  tagsCompetences: '',
  description: '',
};

export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [taskList, projectList, userList] = await Promise.all([listTasks(), listProjects(), listUsers()]);
      setTasks(Array.isArray(taskList) ? taskList : []);
      setProjects(Array.isArray(projectList) ? projectList : []);
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger les tâches.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setAiSuggestion(null);
    setFormData({ ...EMPTY_FORM, projectId: projects[0]?.id || '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setAiSuggestion(null);
    setFormData({
      titre: task.titre || '',
      projectId: task.projectId || '',
      priorite: priorityLabel(task.priorite) === 'URGENTE' ? 'CRITIQUE' : (Object.keys(PRIORITY_VALUES).find((k) => PRIORITY_VALUES[k] === Number(task.priorite)) || 'MOYENNE'),
      statut: task.statut || 'A_FAIRE',
      responsableId: task.responsable?.id || '',
      echeance: task.echeance || '',
      tagsCompetences: (task.tagsCompetences || []).join(', '),
      description: task.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSmartAssign = () => {
    const required = formData.tagsCompetences.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
    if (required.length === 0) {
      setError('Saisissez au moins une compétence pour l’attribution intelligente.');
      return;
    }
    const chargeByUser = {};
    tasks.forEach((task) => {
      if (task.responsable?.id && task.statut !== 'TERMINEE') {
        chargeByUser[task.responsable.id] = (chargeByUser[task.responsable.id] || 0) + 1;
      }
    });
    const scored = users
      .filter((u) => u.actif !== false && u.role === 'MEMBRE')
      .map((member) => {
        const matchCount = (member.competences || []).filter((skill) =>
          required.some((req) => skill.toLowerCase().includes(req) || req.includes(skill.toLowerCase()))
        ).length;
        const charge = chargeByUser[member.id] || 0;
        return { member, matchCount, charge, score: matchCount * 10 - charge * 2 };
      })
      .sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (best) {
      setFormData((prev) => ({ ...prev, responsableId: best.member.id }));
      setAiSuggestion({
        nom: fullName(best.member),
        raison: `Compétences correspondantes (${best.matchCount}) et charge actuelle (${best.charge} tâches).`,
      });
    }
  };

  const toPayload = () => ({
    projectId: Number(formData.projectId),
    titre: formData.titre,
    description: formData.description,
    statut: formData.statut,
    priorite: PRIORITY_VALUES[formData.priorite] || 2,
    echeance: formData.echeance || null,
    responsableId: formData.responsableId ? Number(formData.responsableId) : null,
    tagsCompetences: formData.tagsCompetences.split(',').map((s) => s.trim()).filter(Boolean),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingTask) {
        await updateTask(editingTask.id, toPayload());
      } else {
        await createTask(toPayload());
      }
      setIsModalOpen(false);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Enregistrement de la tâche impossible.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Supprimer la tâche « ${task.titre} » ?`)) return;
    setError('');
    try {
      await deleteTask(task.id);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Suppression impossible.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion des Tâches IT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Créer, assigner manuellement ou utiliser l'attribution intelligente.
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nouvelle Tâche
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Tâche & Projet</th>
              <th className="p-4">Priorité</th>
              <th className="p-4">Assigné à</th>
              <th className="p-4">Échéance</th>
              <th className="p-4 text-center">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-400 text-xs">Chargement des tâches…</td></tr>
            )}
            {!loading && tasks.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400 text-xs">
                  {error ? 'Les tâches n’ont pas pu être chargées.' : 'Aucune tâche pour le moment.'}
                </td>
              </tr>
            )}
            {!loading && tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/80">
                <td className="p-4">
                  <p className="font-semibold text-slate-900">{task.titre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {task.projectNom || `PRJ-${task.projectId}`}
                    </span>
                    {(task.tagsCompetences || []).map((skill) => (
                      <span key={skill} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{skill}</span>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${priorityBadgeClass(task.priorite)}`}>
                    {priorityLabel(task.priorite)}
                  </span>
                </td>
                <td className="p-4">
                  {task.responsable ? (
                    <span className="text-xs font-medium text-slate-800">{fullName(task.responsable)}</span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium italic">Non assigné</span>
                  )}
                </td>
                <td className="p-4 text-xs font-mono text-slate-600">{formatDate(task.echeance)}</td>
                <td className="p-4 text-center">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TASK_STATUS_BADGES[task.statut]}`}>
                    {TASK_STATUS_LABELS[task.statut] || task.statut}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenEditModal(task)} className="text-xs text-blue-600 font-semibold px-2 py-1 rounded hover:bg-blue-50">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(task)} className="text-xs text-red-600 font-semibold px-2 py-1 rounded hover:bg-red-50">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">{editingTask ? 'Modifier la tâche' : 'Créer une tâche'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Titre</label>
                <input required value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Projet</label>
                  <select required value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                    <option value="">Sélectionner</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priorité</label>
                  <select value={formData.priorite} onChange={(e) => setFormData({ ...formData, priorite: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                    {Object.keys(PRIORITY_VALUES).map((key) => <option key={key} value={key}>{key}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Compétences requises</label>
                <input value={formData.tagsCompetences} onChange={(e) => setFormData({ ...formData, tagsCompetences: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-800">Assigner à</label>
                  <button type="button" onClick={handleSmartAssign} className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-1 rounded-md font-semibold">
                    Attribution intelligente
                  </button>
                </div>
                <select value={formData.responsableId} onChange={(e) => setFormData({ ...formData, responsableId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                  <option value="">Non assigné</option>
                  {users.filter((u) => u.actif !== false).map((u) => (
                    <option key={u.id} value={u.id}>{fullName(u)}</option>
                  ))}
                </select>
                {aiSuggestion && (
                  <p className="mt-2 text-xs text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                    Suggestion : {aiSuggestion.nom} — {aiSuggestion.raison}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Échéance</label>
                  <input type="date" value={formData.echeance} onChange={(e) => setFormData({ ...formData, echeance: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Statut</label>
                  <select value={formData.statut} onChange={(e) => setFormData({ ...formData, statut: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                    {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">Annuler</button>
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                  {editingTask ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
