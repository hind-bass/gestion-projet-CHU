import React, { useState } from 'react';

export default function UserTasks({ user }) {
  // Liste factice des tâches assignées à ce membre
  const [tasks, setTasks] = useState([
    {
      id: 'TASK-101',
      title: 'Configuration des VLANs - Bâtiment Chirurgie',
      project: 'Déploiement Réseau CHU',
      status: 'IN_PROGRESS', // TODO, IN_PROGRESS, IN_REVIEW, DONE
      priority: 'HAUTE',
      dueDate: '2026-08-04',
      estimatedHours: 6,
      loggedHours: 4,
      description: 'Configurer les switches Cisco du 2ème étage pour séparer le flux vidéo du flux données patients.'
    },
    {
      id: 'TASK-102',
      title: 'Mise à jour des patchs de sécurité des serveurs Web',
      project: 'Sécurisation DSI & Logs',
      status: 'TODO',
      priority: 'URGENTE',
      dueDate: '2026-08-03',
      estimatedHours: 3,
      loggedHours: 0,
      description: 'Appliquer les correctifs critiques sur les 4 serveurs reverse proxy nginx.'
    },
    {
      id: 'TASK-103',
      title: 'Tests d\'intégration API - Module Urgences',
      project: 'Refonte SI Hospitalier',
      status: 'IN_REVIEW',
      priority: 'MOYENNE',
      dueDate: '2026-08-06',
      estimatedHours: 8,
      loggedHours: 7.5,
      description: 'Vérifier la transmission des constantes médicales depuis les moniteurs vers le DSI.'
    },
    {
      id: 'TASK-104',
      title: 'Documentation technique de l\'infrastructure Wifi',
      project: 'Déploiement Réseau CHU',
      status: 'DONE',
      priority: 'BASSE',
      dueDate: '2026-07-30',
      estimatedHours: 4,
      loggedHours: 4,
      description: 'Rédiger le guide d\'architecture du réseau Wifi invités/médecins.'
    }
  ]);

  const [filterProject, setFilterProject] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  // Colonnes du Kanban
  const columns = [
    { key: 'TODO', label: 'À faire', color: 'border-slate-300 bg-slate-50 text-slate-700', badgeBg: 'bg-slate-200 text-slate-800' },
    { key: 'IN_PROGRESS', label: 'En cours', color: 'border-blue-400 bg-blue-50/50 text-blue-800', badgeBg: 'bg-blue-100 text-blue-800' },
    { key: 'IN_REVIEW', label: 'En revue', color: 'border-amber-400 bg-amber-50/50 text-amber-800', badgeBg: 'bg-amber-100 text-amber-800' },
    { key: 'DONE', label: 'Terminée', color: 'border-emerald-400 bg-emerald-50/50 text-emerald-800', badgeBg: 'bg-emerald-100 text-emerald-800' }
  ];

  // Mise à jour de l'état d'une tâche
  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  // Filtrage des tâches
  const filteredTasks = tasks.filter(t => {
    const matchProject = filterProject === 'ALL' || t.project === filterProject;
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchProject && matchSearch;
  });

  // Utilitaires de badges
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENTE': return 'bg-red-100 text-red-700 border-red-200';
      case 'HAUTE': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'MOYENNE': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

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
            <option value="Refonte SI Hospitalier">Refonte SI Hospitalier</option>
            <option value="Déploiement Réseau CHU">Déploiement Réseau CHU</option>
            <option value="Sécurisation DSI & Logs">Sécurisation DSI & Logs</option>
          </select>
        </div>
      </div>

      {/* Tableau Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const columnTasks = filteredTasks.filter(t => t.status === col.key);

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
                    className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setSelectedTask(task)}
                  >
                    {/* Badge ID + Priorité */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-teal-600 transition-colors">
                        {task.id}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Titre */}
                    <h3 className="text-xs font-semibold text-slate-800 leading-snug mb-2">
                      {task.title}
                    </h3>

                    {/* Projet */}
                    <div className="text-[10px] text-slate-500 font-medium mb-3 flex items-center gap-1">
                      <span>📁</span>
                      <span className="truncate">{task.project}</span>
                    </div>

                    {/* Footer de Carte : Échéance + Changement rapide d'état */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        📅 {task.dueDate}
                      </span>

                      {/* Selecteur d'état rapide */}
                      <select
                        value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-teal-500"
                      >
                        <option value="TODO">À faire</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="IN_REVIEW">En revue</option>
                        <option value="DONE">Terminée</option>
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

      {/* Modal Détails & Édition de la tâche */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-teal-400">{selectedTask.id}</span>
                <h3 className="text-sm font-bold mt-0.5">{selectedTask.title}</h3>
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
                  {selectedTask.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Changer l'état</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white text-slate-800"
                  >
                    <option value="TODO">⏳ À faire</option>
                    <option value="IN_PROGRESS">🚀 En cours</option>
                    <option value="IN_REVIEW">🔍 En revue</option>
                    <option value="DONE">✅ Terminée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Priorité</label>
                  <div className={`p-2 rounded-lg border font-bold text-center ${getPriorityBadge(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block">Projet</span>
                  <span className="font-semibold text-slate-800">{selectedTask.project}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date Limite</span>
                  <span className="font-semibold text-slate-800">{selectedTask.dueDate}</span>
                </div>
              </div>

              <div className="bg-teal-50 p-3 rounded-lg border border-teal-100 flex justify-between items-center text-teal-900">
                <span>Temps estimé / Temps passé :</span>
                <span className="font-bold">{selectedTask.loggedHours}h / {selectedTask.estimatedHours}h</span>
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