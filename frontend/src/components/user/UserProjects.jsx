import React, { useEffect, useMemo, useState } from 'react';
import { listMyProjects } from '../../api/projects';
import { extractErrorMessage } from '../../lib/api';
import {
  formatDate,
  fullName,
  PROJECT_PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
  projectStatusBadgeClass,
  roleLabel,
} from '../../lib/labels';

export default function UserProjects() {
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listMyProjects();
        if (!cancelled) setAssignedProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Impossible de charger vos projets.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtrer les projets par terme de recherche
  const filteredProjects = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return assignedProjects.filter((p) =>
      (p.nom || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term) ||
      (PROJECT_STATUS_LABELS[p.statut] || '').toLowerCase().includes(term)
    );
  }, [assignedProjects, searchTerm]);

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

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Cartes des Projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Chargement de vos projets…
          </div>
        )}

        {!loading && filteredProjects.map((project) => {
          const progress = Math.round(project.tauxAvancement || 0);
          return (
            <div 
              key={project.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Tag priorité & Statut */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Priorité {PROJECT_PRIORITY_LABELS[project.priorite] || project.priorite || '—'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${projectStatusBadgeClass(project.statut)}`}>
                    {PROJECT_STATUS_LABELS[project.statut] || project.statut}
                  </span>
                </div>

                {/* Titre & Description */}
                <h3 className="text-sm font-bold text-slate-800 mb-1">{project.nom}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {project.description || 'Aucune description fournie.'}
                </p>

                {/* Responsable du projet */}
                <div className="bg-teal-50/60 border border-teal-100 p-2.5 rounded-lg mb-4 text-xs">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Responsable du projet</span>
                  <span className="font-bold text-teal-800">{fullName(project.createur) || 'Non assigné'}</span>
                </div>

                {/* Barre de progression globale du projet */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Avancement global</span>
                    <span className="text-teal-700 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div 
                      className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Compteur de tâches */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Tâches du projet :</span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {project.tachesTerminees} / {project.totalTaches} terminées
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
          );
        })}

        {!loading && filteredProjects.length === 0 && !error && (
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
                <span className="text-xs font-mono text-teal-400">PRJ-{selectedProject.id}</span>
                <h3 className="text-sm font-bold mt-0.5">{selectedProject.nom}</h3>
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
                  {selectedProject.description || 'Aucune description fournie.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Responsable</span>
                  <span className="font-semibold text-slate-800">{fullName(selectedProject.createur) || 'Non assigné'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Statut / Priorité</span>
                  <span className="font-semibold text-teal-700">
                    {PROJECT_STATUS_LABELS[selectedProject.statut] || selectedProject.statut}
                    {' · '}
                    {PROJECT_PRIORITY_LABELS[selectedProject.priorite] || selectedProject.priorite}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Date de début</span>
                  <span className="font-mono text-slate-700">{formatDate(selectedProject.dateDebut)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Date de fin prévue</span>
                  <span className="font-mono text-slate-700">{formatDate(selectedProject.dateFinPrevue)}</span>
                </div>
              </div>

              {/* Liste de l'équipe du projet */}
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Équipe sur le projet</h4>
                <div className="space-y-1.5">
                  {(selectedProject.membres || []).map((member) => (
                    <div key={member.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="font-medium text-slate-800">{fullName(member)}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {(member.competences || []).slice(0, 3).join(', ') || roleLabel(member.role)}
                      </span>
                    </div>
                  ))}
                  {(selectedProject.membres || []).length === 0 && (
                    <p className="text-slate-400 text-[11px]">Aucun membre affecté.</p>
                  )}
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
