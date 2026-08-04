import React, { useState } from 'react';

export default function UserProjects({ user }) {
  // Liste des projets auxquels le membre est affecté
  const [assignedProjects] = useState([
    {
      id: 'PRJ-2026-01',
      title: 'Refonte SI Hospitalier',
      category: 'Développement & Intégration',
      roleInProject: 'Développeur Full-Stack',
      status: 'EN_COURS',
      progress: 65,
      startDate: '2026-05-10',
      endDate: '2026-10-15',
      manager: 'Karim El Amrani (Chef DSI)',
      description: 'Refonte globale du système d\'information hospitalier avec intégration du suivi des soins et dossier patient informatisé.',
      teamMembers: [
        { name: 'Karim El Amrani', role: 'Chef de projet' },
        { name: 'Youssef Alami', role: 'Ingénieur Réseaux & Systèmes' },
        { name: 'Sarah Benali', role: 'UI/UX Designer' }
      ],
      myTasksCount: { total: 8, completed: 5 }
    },
    {
      id: 'PRJ-2026-02',
      title: 'Déploiement Réseau CHU',
      category: 'Infrastructure & Réseau',
      roleInProject: 'Responsable VLANs & Infrastructure',
      status: 'EN_COURS',
      progress: 40,
      startDate: '2026-06-01',
      endDate: '2026-11-30',
      manager: 'Karim El Amrani (Chef DSI)',
      description: 'Mise à niveau de la connectivité du bâtiment Chirurgie et segmentation du réseau pour sécuriser les flux de données médicales.',
      teamMembers: [
        { name: 'Karim El Amrani', role: 'Superviseur' },
        { name: 'Youssef Alami', role: 'Lead Réseau' }
      ],
      myTasksCount: { total: 6, completed: 2 }
    },
    {
      id: 'PRJ-2026-03',
      title: 'Sécurisation DSI & Logs',
      category: 'Cybersécurité',
      roleInProject: 'Auditeur SecOps',
      status: 'PLANIFIE',
      progress: 15,
      startDate: '2026-07-15',
      endDate: '2026-09-30',
      manager: 'Karim El Amrani (Chef DSI)',
      description: 'Audit de sécurité des conteneurs, centralisation des logs d\'accès et rotation des clés d\'authentification DSI.',
      teamMembers: [
        { name: 'Karim El Amrani', role: 'Chef DSI' },
        { name: 'Youssef Alami', role: 'Auditeur SecOps' }
      ],
      myTasksCount: { total: 3, completed: 1 }
    }
  ]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les projets par terme de recherche
  const filteredProjects = assignedProjects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.roleInProject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PLANIFIE': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'TERMINE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* En-tête de la page */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Mes Projets Affectés</h1>
          <p className="text-xs text-slate-500">
            Liste et état d'avancement des projets auxquels vous participez activement.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <span className="absolute left-3 top-2 text-xs text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-w-[220px]"
          />
        </div>
      </div>

      {/* Cartes des Projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Tag catégorie & Statut */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {project.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(project.status)}`}>
                  {project.status === 'EN_COURS' ? 'En cours' : project.status === 'PLANIFIE' ? 'Planifié' : 'Terminé'}
                </span>
              </div>

              {/* Titre & Description */}
              <h3 className="text-sm font-bold text-slate-800 mb-1">{project.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                {project.description}
              </p>

              {/* Rôle attribué dans ce projet */}
              <div className="bg-teal-50/60 border border-teal-100 p-2.5 rounded-lg mb-4 text-xs">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Mon Rôle sur ce projet</span>
                <span className="font-bold text-teal-800">{project.roleInProject}</span>
              </div>

              {/* Barre de progression globale du projet */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Avancement global</span>
                  <span className="text-teal-700 font-bold">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div 
                    className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Compteur de mes tâches */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Mes tâches sur ce projet :</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {project.myTasksCount.completed} / {project.myTasksCount.total} terminées
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedProject(project)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>📂 Consulter le projet</span>
              </button>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Aucun projet affecté correspondant à votre recherche.
          </div>
        )}
      </div>

      {/* Modal Détails du Projet */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            
            {/* En-tête Modal */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-teal-400">{selectedProject.id}</span>
                <h3 className="text-sm font-bold mt-0.5">{selectedProject.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Contenu Modal */}
            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Description</h4>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Responsable</span>
                  <span className="font-semibold text-slate-800">{selectedProject.manager}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Mon Rôle</span>
                  <span className="font-semibold text-teal-700">{selectedProject.roleInProject}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Date de début</span>
                  <span className="font-mono text-slate-700">{selectedProject.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Date de fin prévue</span>
                  <span className="font-mono text-slate-700">{selectedProject.endDate}</span>
                </div>
              </div>

              {/* Liste de l'équipe du projet */}
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Équipe sur le projet</h4>
                <div className="space-y-1.5">
                  {selectedProject.teamMembers.map((member, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="font-medium text-slate-800">{member.name}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">{member.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
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