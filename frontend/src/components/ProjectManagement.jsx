import React, { useState } from 'react';

export default function ProjectManagement() {
  // Données de démonstration pour les projets du CHU
  const [projects, setProjects] = useState([
    {
      id: 1,
      code: 'PRJ-CHU-01',
      nom: 'Refonte SI Hospitalier',
      description: 'Mise à niveau du système d\'information central du CHU.',
      chefProjet: 'Karim El Amrani',
      dateDebut: '2026-01-10',
      dateFin: '2026-12-15',
      statut: 'EN_COURS', // EN_COURS, CLOTURE, ARCHIVE
      progression: 65
    },
    {
      id: 2,
      code: 'PRJ-CHU-02',
      nom: 'Informatisation Dossier Patient',
      description: 'Numérisation complète des dossiers médicaux des patients.',
      chefProjet: 'SARA BENALI',
      dateDebut: '2025-05-01',
      dateFin: '2026-06-30',
      statut: 'CLOTURE',
      progression: 100
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    description: '',
    chefProjet: '',
    dateDebut: '',
    dateFin: '',
    statut: 'EN_COURS'
  });

  // Ouverture de la modal pour création
  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormData({
      code: `PRJ-CHU-0${projects.length + 1}`,
      nom: '',
      description: '',
      chefProjet: 'Karim El Amrani',
      dateDebut: '',
      dateFin: '',
      statut: 'EN_COURS'
    });
    setIsModalOpen(true);
  };

  // Ouverture de la modal pour modification
  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setIsModalOpen(true);
  };

  // Enregistrement (Création ou Modification)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...formData } : p));
    } else {
      const newProject = {
        ...formData,
        id: Date.now(),
        progression: 0
      };
      setProjects([...projects, newProject]);
    }
    setIsModalOpen(false);
  };

  // Changer le statut (Clôturer / Archiver)
  const handleStatusChange = (projectId, newStatus) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, statut: newStatus } : p));
  };

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion des Projets IT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Créer, suivre, clôturer et archiver les projets du service informatique du CHU.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>+</span> Nouveau Projet
        </button>
      </div>

      {/* Grille des cartes de projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className={`bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
              project.statut === 'ARCHIVE' ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-slate-200'
            }`}
          >
            {/* Badges de statut & Code */}
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                {project.code}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                project.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-700' :
                project.statut === 'CLOTURE' ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-200 text-slate-600'
              }`}>
                {project.statut === 'EN_COURS' ? '🔵 En cours' :
                 project.statut === 'CLOTURE' ? '✅ Clôturé' : '📦 Archivé'}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-base mb-1">{project.nom}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-4">{project.description}</p>

            {/* Barre de progression */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
                <span>Avancement</span>
                <span>{project.progression}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    project.statut === 'CLOTURE' ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${project.progression}%` }}
                />
              </div>
            </div>

            {/* Actions Administrateur */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEditModal(project)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
              >
                ✏️ Modifier
              </button>

              <div className="flex items-center gap-1">
                {project.statut !== 'CLOTURE' && (
                  <button
                    onClick={() => handleStatusChange(project.id, 'CLOTURE')}
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 rounded hover:bg-emerald-50"
                  >
                    ✅ Clôturer
                  </button>
                )}
                {project.statut !== 'ARCHIVE' ? (
                  <button
                    onClick={() => handleStatusChange(project.id, 'ARCHIVE')}
                    className="text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 rounded hover:bg-amber-50"
                  >
                    📦 Archiver
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(project.id, 'EN_COURS')}
                    className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100"
                  >
                    🔄 Désarchiver
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL CRÉATION / MODIFICATION PROJET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingProject ? 'Modifier le Projet' : 'Créer un Nouveau Projet'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Code Projet</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Statut Initial</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="EN_COURS">En cours</option>
                    <option value="CLOTURE">Clôturé</option>
                    <option value="ARCHIVE">Archivé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nom du Projet</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Infrastructure Réseau CHU"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Objectifs et périmètre du projet..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date Début</label>
                  <input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date Fin Estimée</label>
                  <input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
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
                  {editingProject ? 'Mettre à jour' : 'Créer le Projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}