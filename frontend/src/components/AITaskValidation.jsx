import React, { useEffect, useState } from 'react';
import { listProjects } from '../api/projects';
import { createTask } from '../api/tasks';
import { listUsers } from '../api/users';
import { extractErrorMessage } from '../lib/api';
import { PRIORITY_VALUES } from '../lib/priority';
import { fullName } from '../lib/labels';

// Icônes SVG intégrées
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export default function AITaskValidation({
  initialTasks = [
    {
      id: 'AI-101',
      titre: 'Mise à niveau du pare-feu du bloc opératoire',
      projet: 'PRJ-CHU-01',
      assigneA: 'Youssef Alami',
      priorite: 'HAUTE',
      dateEcheance: '2026-08-05',
      confianceIA: 95,
      statutValidation: 'EN_ATTENTE'
    },
    {
      id: 'AI-102',
      titre: 'Exécution des tests de charge API Dossier Patient',
      projet: 'PRJ-CHU-01',
      assigneA: 'Sanaa Chraibi',
      priorite: 'HAUTE',
      dateEcheance: '2026-08-01',
      confianceIA: 88,
      statutValidation: 'EN_ATTENTE'
    },
    {
      id: 'AI-103',
      titre: 'Vérification des accès BDD médecins avec Omar',
      projet: 'PRJ-CHU-01',
      assigneA: 'Sanaa Chraibi',
      priorite: 'MOYENNE',
      dateEcheance: '2026-08-03',
      confianceIA: 72,
      statutValidation: 'EN_ATTENTE'
    }
  ],
  teamMembers = [
    { id: 1, nom: 'Youssef Alami', role: 'Ingénieur Réseau' },
    { id: 2, nom: 'Sanaa Chraibi', role: 'Développeuse Fullstack' },
    { id: 3, nom: 'Omar Amrani', role: 'Administrateur BDD' },
    { id: 4, nom: 'Khadija Bennani', role: 'Technicienne Support' }
  ],
  onInjectTasks
}) {
  const [proposedTasks, setProposedTasks] = useState(initialTasks);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [filter, setFilter] = useState('TOUS');
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [injectError, setInjectError] = useState('');

  useEffect(() => {
    setProposedTasks(initialTasks || []);
  }, [initialTasks]);

  useEffect(() => {
    Promise.all([listProjects(), listUsers()])
      .then(([projectList, userList]) => {
        setProjects(Array.isArray(projectList) ? projectList : []);
        setUsers(Array.isArray(userList) ? userList : []);
      })
      .catch(() => {});
  }, []);

  // Changement de statut
  const handleUpdateStatus = (id, newStatus) => {
    setProposedTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, statutValidation: newStatus } : t))
    );
  };

  // Édition
  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditFormData({ ...task });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setProposedTasks(prev =>
      prev.map(t => (t.id === editingTaskId ? { ...editFormData } : t))
    );
    setEditingTaskId(null);
  };

  // Actions globales
  const handleValidateAll = () => {
    setProposedTasks(prev => prev.map(t => ({ ...t, statutValidation: 'VALIDE' })));
  };

  const handleRejectAll = () => {
    setProposedTasks(prev => prev.map(t => ({ ...t, statutValidation: 'REJETE' })));
  };

  const handleInjectValidatedTasks = async () => {
    const validated = proposedTasks.filter(t => t.statutValidation === 'VALIDE');
    if (validated.length === 0) {
      alert('Aucune tâche validée à intégrer.');
      return;
    }
    setInjectError('');
    try {
      for (const task of validated) {
        const project = projects.find((p) => String(p.id) === String(task.projet) || p.nom === task.projet) || projects[0];
        const assignee = users.find((u) => fullName(u) === task.assigneA || String(u.id) === String(task.assigneA));
        await createTask({
          projectId: project?.id,
          titre: task.titre,
          statut: 'A_FAIRE',
          priorite: PRIORITY_VALUES[task.priorite] || 2,
          echeance: task.dateEcheance || null,
          responsableId: assignee?.id || null,
        });
      }
      if (onInjectTasks) onInjectTasks(validated);
      alert(`${validated.length} tâche(s) créée(s) dans le projet.`);
    } catch (err) {
      setInjectError(extractErrorMessage(err, 'Injection des tâches impossible.'));
    }
  };

  // Compteurs
  const pendingCount = proposedTasks.filter(t => t.statutValidation === 'EN_ATTENTE').length;
  const validatedCount = proposedTasks.filter(t => t.statutValidation === 'VALIDE').length;
  const rejectedCount = proposedTasks.filter(t => t.statutValidation === 'REJETE').length;

  // Filtrage des tâches affichées
  const filteredTasks = proposedTasks.filter(t => {
    if (filter === 'EN_ATTENTE') return t.statutValidation === 'EN_ATTENTE';
    if (filter === 'VALIDE') return t.statutValidation === 'VALIDE';
    if (filter === 'REJETE') return t.statutValidation === 'REJETE';
    return true;
  });

  // Couleur du badge de priorité
  const getPriorityBadge = (priorite) => {
    switch (priorite) {
      case 'HAUTE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MOYENNE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BASSE':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 text-slate-800">
      {injectError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">{injectError}</div>
      )}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <SparklesIcon /> Validation des Tâches IA
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Révisez, ajustez ou validez les actions suggérées automatiquement par l'IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {pendingCount > 0 && (
            <>
              <button
                onClick={handleRejectAll}
                className="text-xs text-slate-500 hover:text-red-600 px-2.5 py-2 rounded-lg font-medium transition-colors"
              >
                Tout Rejeter
              </button>
              <button
                onClick={handleValidateAll}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckIcon /> Tout Approuver ({pendingCount})
              </button>
            </>
          )}

          <button
            onClick={handleInjectValidatedTasks}
            disabled={validatedCount === 0}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>Intégrer Tâches Validées</span>
            <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {validatedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Barre de filtres par onglet */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 text-xs">
          {[
            { key: 'TOUS', label: 'Toutes', count: proposedTasks.length },
            { key: 'EN_ATTENTE', label: 'En attente', count: pendingCount },
            { key: 'VALIDE', label: 'Validées', count: validatedCount },
            { key: 'REJETE', label: 'Rejetées', count: rejectedCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                filter === tab.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filter === tab.key ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des cartes de tâches */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            Aucune tâche disponible dans cette catégorie.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isEditing = editingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  task.statutValidation === 'VALIDE'
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : task.statutValidation === 'REJETE'
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                {!isEditing ? (
                  /* Affichage Tâche */
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {task.id}
                        </span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                          Score IA : {task.confianceIA}%
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                            task.priorite
                          )}`}
                        >
                          {task.priorite}
                        </span>
                      </div>

                      <h4 className="font-semibold text-sm text-slate-900">{task.titre}</h4>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                        <span>
                          Responsable : <strong className="text-slate-700">{task.assigneA}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Échéance : <strong className="text-slate-700">{task.dateEcheance}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Actions de décision */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      {task.statutValidation === 'EN_ATTENTE' && (
                        <>
                          <button
                            onClick={() => handleStartEdit(task)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                          >
                            <EditIcon /> Modifier
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'REJETE')}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CrossIcon /> Rejeter
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'VALIDE')}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1"
                          >
                            <CheckIcon /> Valider
                          </button>
                        </>
                      )}

                      {task.statutValidation === 'VALIDE' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckIcon /> Validée
                          </span>
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'EN_ATTENTE')}
                            className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors ml-1"
                          >
                            Annuler
                          </button>
                        </div>
                      )}

                      {task.statutValidation === 'REJETE' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600 bg-slate-200 border border-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
                            <CrossIcon /> Rejetée
                          </span>
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'EN_ATTENTE')}
                            className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors ml-1"
                          >
                            Rétablir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Formulaire d'édition */
                  <form onSubmit={handleSaveEdit} className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Titre de la tâche
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.titre || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, titre: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Responsable
                        </label>
                        <select
                          value={editFormData.assigneA || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, assigneA: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          {teamMembers.map((m) => (
                            <option key={m.id} value={m.nom}>
                              {m.nom} ({m.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Priorité
                        </label>
                        <select
                          value={editFormData.priorite || 'MOYENNE'}
                          onChange={(e) => setEditFormData({ ...editFormData, priorite: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="BASSE">Basse</option>
                          <option value="MOYENNE">Moyenne</option>
                          <option value="HAUTE">Haute</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Échéance
                        </label>
                        <input
                          type="date"
                          value={editFormData.dateEcheance || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, dateEcheance: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setEditingTaskId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100 font-medium transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold transition-colors shadow-sm"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
