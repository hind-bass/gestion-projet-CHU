import React, { useEffect, useState } from 'react';
import { archiveProject, createProject, listProjects, updateProject } from '../api/projects';
import { extractErrorMessage } from '../lib/api';
import {
  formatDate,
  fullName,
  PROJECT_PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
  projectStatusBadgeClass,
} from '../lib/labels';

const EMPTY_FORM = {
  nom: '',
  description: '',
  statut: 'ACTIF',
  priorite: 'MOYENNE',
  dateDebut: '',
  dateFinPrevue: '',
};

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await listProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger les projets.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      nom: project.nom || '',
      description: project.description || '',
      statut: project.statut || 'ACTIF',
      priorite: project.priorite || 'MOYENNE',
      dateDebut: project.dateDebut || '',
      dateFinPrevue: project.dateFinPrevue || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      nom: formData.nom,
      description: formData.description,
      statut: formData.statut,
      priorite: formData.priorite,
      dateDebut: formData.dateDebut || null,
      dateFinPrevue: formData.dateFinPrevue || null,
    };
    try {
      if (editingProject) {
        await updateProject(editingProject.id, payload);
      } else {
        await createProject(payload);
      }
      setIsModalOpen(false);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Enregistrement du projet impossible.'));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (project) => {
    setError('');
    try {
      await updateProject(project.id, {
        nom: project.nom,
        description: project.description,
        statut: 'TERMINE',
        priorite: project.priorite,
        dateDebut: project.dateDebut,
        dateFinPrevue: project.dateFinPrevue,
      });
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Clôture du projet impossible.'));
    }
  };

  const handleArchive = async (project) => {
    setError('');
    try {
      await archiveProject(project.id);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Archivage du projet impossible.'));
    }
  };

  const handleUnarchive = async (project) => {
    setError('');
    try {
      await updateProject(project.id, {
        nom: project.nom,
        description: project.description,
        statut: 'ACTIF',
        priorite: project.priorite,
        dateDebut: project.dateDebut,
        dateFinPrevue: project.dateFinPrevue,
      });
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Réouverture du projet impossible.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion des Projets IT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Créer, suivre, clôturer et archiver les projets du service informatique du CHU.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nouveau Projet
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">{error}</div>
      )}

      {loading && (
        <div className="bg-white p-8 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
          Chargement des projets…
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!loading && projects.map((project) => {
          const progress = Math.round(project.tauxAvancement || 0);
          return (
            <div
              key={project.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                project.statut === 'ARCHIVE' ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                  PRJ-{project.id}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${projectStatusBadgeClass(project.statut)}`}>
                  {PROJECT_STATUS_LABELS[project.statut] || project.statut}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1">{project.nom}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-2">{project.description || 'Aucune description.'}</p>
              <p className="text-[11px] text-slate-500 mb-4">
                Chef : {fullName(project.createur) || '—'} · Priorité {PROJECT_PRIORITY_LABELS[project.priorite] || project.priorite}
                {' · '}
                {formatDate(project.dateDebut)} → {formatDate(project.dateFinPrevue)}
              </p>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
                  <span>Avancement ({project.tachesTerminees}/{project.totalTaches})</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${project.statut === 'TERMINE' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEditModal(project)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
                >
                  Modifier
                </button>
                <div className="flex items-center gap-1">
                  {project.statut !== 'TERMINE' && project.statut !== 'ARCHIVE' && (
                    <button
                      onClick={() => handleClose(project)}
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 rounded hover:bg-emerald-50"
                    >
                      Clôturer
                    </button>
                  )}
                  {project.statut !== 'ARCHIVE' ? (
                    <button
                      onClick={() => handleArchive(project)}
                      className="text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 rounded hover:bg-amber-50"
                    >
                      Archiver
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnarchive(project)}
                      className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100"
                    >
                      Désarchiver
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && projects.length === 0 && !error && (
        <div className="bg-white p-8 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
          Aucun projet. Créez le premier projet du service.
        </div>
      )}

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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="ACTIF">Actif</option>
                    <option value="EN_PAUSE">En pause</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="ARCHIVE">Archivé</option>
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
                    <option value="CRITIQUE">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nom du Projet</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
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
                    value={formData.dateFinPrevue}
                    onChange={(e) => setFormData({ ...formData, dateFinPrevue: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
