import React, { useState } from 'react';

export default function TaskManagement() {
  // Liste des membres de l'équipe IT avec leurs compétences et leur charge (nombre de tâches en cours)
  const teamMembers = [
    { id: 1, nom: 'Youssef Alami', role: 'Ingénieur Réseau', competences: ['Réseau', 'Cisco', 'Sécurité', 'Wifi'], charge: 2 },
    { id: 2, nom: 'Sanaa Chraibi', role: 'Développeuse Fullstack', competences: ['React', 'Spring Boot', 'Base de données', 'API'], charge: 4 },
    { id: 3, nom: 'Omar Amrani', role: 'Administrateur BDD', competences: ['PostgreSQL', 'Oracle', 'Sauvegarde', 'Base de données'], charge: 1 },
    { id: 4, nom: 'Khadija Bennani', role: 'Technicienne Support', competences: ['Support', 'Matériel', 'Windows', 'Maintenance'], charge: 3 }
  ];

  // Liste initiale des tâches IT du CHU
  const [tasks, setTasks] = useState([
    {
      id: 1,
      titre: 'Mise à niveau du Pare-feu du Bloc Opératoire',
      projet: 'PRJ-CHU-01',
      priorite: 'HAUTE',
      statut: 'EN_COURS',
      assigneA: 'Youssef Alami',
      dateEcheance: '2026-08-05',
      competencesRequises: ['Réseau', 'Sécurité']
    },
    {
      id: 2,
      titre: 'Optimisation de la BDD Dossiers Patients',
      projet: 'PRJ-CHU-02',
      priorite: 'CRITIQUE',
      statut: 'A_FAIRE',
      assigneA: 'Omar Amrani',
      dateEcheance: '2026-08-02',
      competencesRequises: ['Base de données', 'PostgreSQL']
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const [formData, setFormData] = useState({
    titre: '',
    projet: 'PRJ-CHU-01',
    priorite: 'MOYENNE',
    statut: 'A_FAIRE',
    assigneA: '',
    dateEcheance: '',
    competencesRequises: ''
  });

  // Ouverture de la modal pour création
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setAiSuggestion(null);
    setFormData({
      titre: '',
      projet: 'PRJ-CHU-01',
      priorite: 'MOYENNE',
      statut: 'A_FAIRE',
      assigneA: '',
      dateEcheance: '',
      competencesRequises: ''
    });
    setIsModalOpen(true);
  };

  // Ouverture de la modal pour modification
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setAiSuggestion(null);
    setFormData({
      ...task,
      competencesRequises: Array.isArray(task.competencesRequises) ? task.competencesRequises.join(', ') : task.competencesRequises
    });
    setIsModalOpen(true);
  };

  // ALGORITHME D'ATTRIBUTION INTELLIGENTE (IA / Smart Assign)
  const handleSmartAssign = () => {
    if (!formData.competencesRequises) {
      alert("Veuillez d'abord saisir au moins une compétence requise pour utiliser l'attribution intelligente.");
      return;
    }

    const requiredSkills = formData.competencesRequises.toLowerCase().split(',').map(s => s.trim());

    // Calcul du score pour chaque membre basé sur le match de compétences et la charge actuelle
    const scoredMembers = teamMembers.map(member => {
      const matchCount = member.competences.filter(skill => 
        requiredSkills.some(req => skill.toLowerCase().includes(req) || req.includes(skill.toLowerCase()))
      ).length;

      // Score = (Match de compétences * 10) - (Charge actuelle * 2)
      const score = (matchCount * 10) - (member.charge * 2);

      return { ...member, matchCount, score };
    });

    // Trier par score décroissant
    scoredMembers.sort((a, b) => b.score - a.score);
    const bestMatch = scoredMembers[0];

    if (bestMatch) {
      setFormData(prev => ({ ...prev, assigneA: bestMatch.nom }));
      setAiSuggestion({
        nom: bestMatch.nom,
        role: bestMatch.role,
        raison: `Compétences correspondantes (${bestMatch.matchCount}) et charge de travail faible (${bestMatch.charge} tâches).`
      });
    }
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = typeof formData.competencesRequises === 'string'
      ? formData.competencesRequises.split(',').map(s => s.trim()).filter(Boolean)
      : formData.competencesRequises;

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...formData, competencesRequises: skillsArray } : t));
    } else {
      const newTask = {
        ...formData,
        id: Date.now(),
        competencesRequises: skillsArray
      };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion des Tâches IT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Créer, assigner manuellement ou utiliser l'attribution intelligente pilotée par l'IA.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>+</span> Nouvelle Tâche
        </button>
      </div>

      {/* Tableau des Tâches */}
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
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                
                {/* Tâche & Projet */}
                <td className="p-4">
                  <p className="font-semibold text-slate-900">{task.titre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {task.projet}
                    </span>
                    {task.competencesRequises?.map((skill, idx) => (
                      <span key={idx} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Priorité */}
                <td className="p-4">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    task.priorite === 'CRITIQUE' ? 'bg-red-100 text-red-700' :
                    task.priorite === 'HAUTE' ? 'bg-amber-100 text-amber-700' :
                    task.priorite === 'MOYENNE' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {task.priorite}
                  </span>
                </td>

                {/* Assigné à */}
                <td className="p-4">
                  {task.assigneA ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                        {task.assigneA[0]}
                      </div>
                      <span className="text-xs font-medium text-slate-800">{task.assigneA}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium italic">⚠️ Non assigné</span>
                  )}
                </td>

                {/* Date d'échéance */}
                <td className="p-4 text-xs font-mono text-slate-600">
                  {task.dateEcheance || '—'}
                </td>

                {/* Statut */}
                <td className="p-4 text-center">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    task.statut === 'TERMINE' ? 'bg-emerald-100 text-emerald-700' :
                    task.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {task.statut === 'TERMINE' ? '✅ Terminé' :
                     task.statut === 'EN_COURS' ? '⏳ En cours' : '📌 À faire'}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50"
                  >
                    ✏️ Modifier / Réassigner
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CRÉATION / MODIFICATION TÂCHE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingTask ? 'Modifier / Réassigner la Tâche' : 'Créer une Nouvelle Tâche'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Titre de la tâche</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Configuration VLAN Urgences"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Projet</label>
                  <select
                    value={formData.projet}
                    onChange={(e) => setFormData({ ...formData, projet: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="PRJ-CHU-01">PRJ-CHU-01 (Refonte SI)</option>
                    <option value="PRJ-CHU-02">PRJ-CHU-02 (Dossier Patient)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priorité</label>
                  <select
                    value={formData.priorite}
                    onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="BASSE">Basse</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="HAUTE">Haute</option>
                    <option value="CRITIQUE">🚨 Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Compétences requises (utilisées pour l'attribution intelligente)
                </label>
                <input
                  type="text"
                  placeholder="ex: Réseau, Sécurité, React..."
                  value={formData.competencesRequises}
                  onChange={(e) => setFormData({ ...formData, competencesRequises: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {/* ASSIGNATION + BOUTON ATTRIBUTION INTELLIGENTE */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-800">Assigner à</label>
                  <button
                    type="button"
                    onClick={handleSmartAssign}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>🧠</span> Attribution Intelligente
                  </button>
                </div>

                <select
                  value={formData.assigneA}
                  onChange={(e) => setFormData({ ...formData, assigneA: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="">-- Sélectionner manuellement --</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.nom}>{m.nom} ({m.role})</option>
                  ))}
                </select>

                {/* Bannière de recommandation IA */}
                {aiSuggestion && (
                  <div className="mt-2 p-3 bg-indigo-50/80 border border-indigo-200 rounded-lg text-xs text-indigo-900">
                    <p className="font-bold flex items-center gap-1">
                      <span>✨ Recommandation de l'IA :</span> {aiSuggestion.nom}
                    </p>
                    <p className="text-indigo-700 mt-0.5">{aiSuggestion.raison}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date d'échéance</label>
                  <input
                    type="date"
                    value={formData.dateEcheance}
                    onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="A_FAIRE">À faire</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINE">Terminé</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {editingTask ? 'Mettre à jour' : 'Créer la Tâche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}