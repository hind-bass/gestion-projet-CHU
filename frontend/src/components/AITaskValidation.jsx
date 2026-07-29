import React, { useState } from 'react';

export default function AITaskValidation({ onInjectTasks }) {
  // Membres disponibles pour réassignation si besoin
  const teamMembers = [
    { id: 1, nom: 'Youssef Alami', role: 'Ingénieur Réseau' },
    { id: 2, nom: 'Sanaa Chraibi', role: 'Développeuse Fullstack' },
    { id: 3, nom: 'Omar Amrani', role: 'Administrateur BDD' },
    { id: 4, nom: 'Khadija Bennani', role: 'Technicienne Support' },
  ];

  // Tâches générées par l'IA en attente de validation
  const [proposedTasks, setProposedTasks] = useState([
    {
      id: 'AI-101',
      titre: 'Mise à niveau du pare-feu du bloc opératoire',
      projet: 'PRJ-CHU-01',
      assigneA: 'Youssef Alami',
      priorite: 'HAUTE',
      dateEcheance: '2026-08-05',
      confianceIA: '95%',
      statutValidation: 'EN_ATTENTE' // 'EN_ATTENTE', 'VALIDE', 'REJETE'
    },
    {
      id: 'AI-102',
      titre: 'Exécution des tests de charge API Dossier Patient',
      projet: 'PRJ-CHU-01',
      assigneA: 'Sanaa Chraibi',
      priorite: 'HAUTE',
      dateEcheance: '2026-08-01',
      confianceIA: '88%',
      statutValidation: 'EN_ATTENTE'
    },
    {
      id: 'AI-103',
      titre: 'Vérification des accès BDD médecins avec Omar',
      projet: 'PRJ-CHU-01',
      assigneA: 'Sanaa Chraibi',
      priorite: 'MOYENNE',
      dateEcheance: '2026-08-03',
      confianceIA: '72%',
      statutValidation: 'EN_ATTENTE'
    }
  ]);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Actions de validation / rejet
  const handleValidate = (id) => {
    setProposedTasks(proposedTasks.map(t => t.id === id ? { ...t, statutValidation: 'VALIDE' } : t));
  };

  const handleReject = (id) => {
    setProposedTasks(proposedTasks.map(t => t.id === id ? { ...t, statutValidation: 'REJETE' } : t));
  };

  // Édition
  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditFormData({ ...task });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setProposedTasks(proposedTasks.map(t => t.id === editingTaskId ? { ...editFormData } : t));
    setEditingTaskId(null);
  };

  // Validation globale de toutes les tâches en attente
  const handleValidateAll = () => {
    setProposedTasks(proposedTasks.map(t => ({ ...t, statutValidation: 'VALIDE' })));
  };

  // Injection des tâches validées
  const handleInjectValidatedTasks = () => {
    const validated = proposedTasks.filter(t => t.statutValidation === 'VALIDE');
    if (validated.length === 0) {
      alert("Aucune tâche validée à injecter.");
      return;
    }
    if (onInjectTasks) {
      onInjectTasks(validated);
    }
    alert(`${validated.length} tâche(s) validée(s) avec succès et intégrée(s) au projet !`);
  };

  const pendingCount = proposedTasks.filter(t => t.statutValidation === 'EN_ATTENTE').length;
  const validatedCount = proposedTasks.filter(t => t.statutValidation === 'VALIDE').length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>⚖️</span> Validation des Tâches Suggérées par l'IA
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Révisez, modifiez ou rejetez les propositions générées suite à l'analyse de réunion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={handleValidateAll}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs px-3 py-2 rounded-lg font-semibold transition-colors"
            >
              ✓ Tout Approuver ({pendingCount})
            </button>
          )}

          <button
            onClick={handleInjectValidatedTasks}
            disabled={validatedCount === 0}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs px-3.5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>📥</span> Intégrer les Tâches Validées ({validatedCount})
          </button>
        </div>
      </div>

      {/* Liste des cartes de tâches */}
      <div className="space-y-3">
        {proposedTasks.map((task) => {
          const isEditing = editingTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all ${
                task.statutValidation === 'VALIDE'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : task.statutValidation === 'REJETE'
                  ? 'bg-red-50/30 border-red-200 opacity-60'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {!isEditing ? (
                /* Vue Consultation Tâche */
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {task.id}
                      </span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                        Score IA : {task.confianceIA}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priorite === 'HAUTE' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priorite}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-slate-900">{task.titre}</h4>

                    <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                      <span>👤 Assigné : <strong>{task.assigneA}</strong></span>
                      <span>📅 Échéance : <strong>{task.dateEcheance}</strong></span>
                    </div>
                  </div>

                  {/* Boutons de decision */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {task.statutValidation === 'EN_ATTENTE' && (
                      <>
                        <button
                          onClick={() => handleStartEdit(task)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => handleReject(task.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                        >
                          ✖ Rejeter
                        </button>
                        <button
                          onClick={() => handleValidate(task.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
                        >
                          ✔ Valider
                        </button>
                      </>
                    )}

                    {task.statutValidation === 'VALIDE' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          ✓ Validée
                        </span>
                        <button
                          onClick={() => setProposedTasks(proposedTasks.map(t => t.id === task.id ? { ...t, statutValidation: 'EN_ATTENTE' } : t))}
                          className="text-xs text-slate-400 hover:text-slate-600 underline"
                        >
                          Annuler
                        </button>
                      </div>
                    )}

                    {task.statutValidation === 'REJETE' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                          ✖ Rejetée
                        </span>
                        <button
                          onClick={() => setProposedTasks(proposedTasks.map(t => t.id === task.id ? { ...t, statutValidation: 'EN_ATTENTE' } : t))}
                          className="text-xs text-slate-400 hover:text-slate-600 underline"
                        >
                          Rétablir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Formulaire de modification rapide */
                <form onSubmit={handleSaveEdit} className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Titre de la tâche</label>
                    <input
                      type="text"
                      required
                      value={editFormData.titre}
                      onChange={(e) => setEditFormData({ ...editFormData, titre: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Responsable</label>
                      <select
                        value={editFormData.assigneA}
                        onChange={(e) => setEditFormData({ ...editFormData, assigneA: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs"
                      >
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.nom}>{m.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Priorité</label>
                      <select
                        value={editFormData.priorite}
                        onChange={(e) => setEditFormData({ ...editFormData, priorite: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs"
                      >
                        <option value="BASSE">Basse</option>
                        <option value="MOYENNE">Moyenne</option>
                        <option value="HAUTE">Haute</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Échéance</label>
                      <input
                        type="date"
                        value={editFormData.dateEcheance}
                        onChange={(e) => setEditFormData({ ...editFormData, dateEcheance: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingTaskId(null)}
                      className="px-3 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}