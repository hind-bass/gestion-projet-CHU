import React, { useState } from 'react';

export default function KanbanBoard() {
  const [selectedProject, setSelectedProject] = useState('PRJ-CHU-01');

  // Colonnes du Kanban
  const columns = [
    { id: 'A_FAIRE', label: '📌 À faire', color: 'border-slate-300 bg-slate-50' },
    { id: 'EN_COURS', label: '⏳ En cours', color: 'border-blue-400 bg-blue-50/30' },
    { id: 'EN_REVUE', label: '🔍 En revue / Test', color: 'border-amber-400 bg-amber-50/30' },
    { id: 'TERMINE', label: '✅ Terminé', color: 'border-emerald-400 bg-emerald-50/30' },
  ];

  // Liste des tâches associées aux projets
  const [tasks, setTasks] = useState([
    {
      id: 1,
      titre: 'Mise à niveau du Pare-feu Bloc Opératoire',
      projet: 'PRJ-CHU-01',
      priorite: 'HAUTE',
      statut: 'EN_COURS',
      assigneA: 'Youssef Alami',
      dateEcheance: '2026-08-05',
    },
    {
      id: 2,
      titre: 'Installation des switchs réseau Chirurgie',
      projet: 'PRJ-CHU-01',
      priorite: 'MOYENNE',
      statut: 'A_FAIRE',
      assigneA: 'Khadija Bennani',
      dateEcheance: '2026-08-10',
    },
    {
      id: 3,
      titre: 'Tests de charge API Dossier Patient',
      projet: 'PRJ-CHU-01',
      priorite: 'CRITIQUE',
      statut: 'EN_REVUE',
      assigneA: 'Sanaa Chraibi',
      dateEcheance: '2026-08-01',
    },
    {
      id: 4,
      titre: 'Configuration Sauvegarde Automatique BDD',
      projet: 'PRJ-CHU-01',
      priorite: 'MOYENNE',
      statut: 'TERMINE',
      assigneA: 'Omar Amrani',
      dateEcheance: '2026-07-20',
    },
    {
      id: 5,
      titre: 'Audit de sécurité des accès radiologie',
      projet: 'PRJ-CHU-02',
      priorite: 'HAUTE',
      statut: 'A_FAIRE',
      assigneA: 'Youssef Alami',
      dateEcheance: '2026-08-15',
    }
  ]);

  // Filtrer les tâches pour le projet sélectionné
  const currentProjectTasks = tasks.filter(t => t.projet === selectedProject);

  // Déplacer une tâche vers une nouvelle colonne (statut)
  const moveTask = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, statut: newStatus } : t));
  };

  return (
    <div className="space-y-6">
      {/* En-tête + Sélecteur de Projet */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tableau Kanban Projet</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualisez et réorganisez l'avancement des tâches par glisser-déplacer ou changement de statut.
          </p>
        </div>

        {/* Sélecteur du Projet */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Projet actif :</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PRJ-CHU-01">PRJ-CHU-01 : Refonte SI Hospitalier</option>
            <option value="PRJ-CHU-02">PRJ-CHU-02 : Informatisation Dossier Patient</option>
          </select>
        </div>
      </div>

      {/* GRILLE DU KANBAN (4 Colonnes) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = currentProjectTasks.filter(t => t.statut === col.id);

          return (
            <div 
              key={col.id} 
              className={`p-4 rounded-xl border ${col.color} flex flex-col min-h-[500px] shadow-sm`}
            >
              {/* Header de la colonne */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-800">{col.label}</h3>
                <span className="text-xs font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Tâches de la colonne */}
              <div className="space-y-3 flex-1">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3"
                  >
                    {/* Badge Priorité & ID */}
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priorite === 'CRITIQUE' ? 'bg-red-100 text-red-700' :
                        task.priorite === 'HAUTE' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priorite}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">#{task.id}</span>
                    </div>

                    {/* Titre */}
                    <h4 className="font-semibold text-xs text-slate-900 leading-snug">
                      {task.titre}
                    </h4>

                    {/* Assigné & Échéance */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center">
                          {task.assigneA[0]}
                        </div>
                        <span className="font-medium text-slate-700">{task.assigneA}</span>
                      </div>
                      <span className="font-mono text-[10px]">{task.dateEcheance}</span>
                    </div>

                    {/* BOUTONS D'ACTION (Déplacer la tâche) */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <button
                        disabled={col.id === 'A_FAIRE'}
                        onClick={() => {
                          const prev = col.id === 'TERMINE' ? 'EN_REVUE' : col.id === 'EN_REVUE' ? 'EN_COURS' : 'A_FAIRE';
                          moveTask(task.id, prev);
                        }}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        ← Reculer
                      </button>

                      <button
                        disabled={col.id === 'TERMINE'}
                        onClick={() => {
                          const next = col.id === 'A_FAIRE' ? 'EN_COURS' : col.id === 'EN_COURS' ? 'EN_REVUE' : 'TERMINE';
                          moveTask(task.id, next);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 disabled:opacity-30"
                      >
                        Avancer →
                      </button>
                    </div>

                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400 italic">
                    Aucune tâche dans cette colonne
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}