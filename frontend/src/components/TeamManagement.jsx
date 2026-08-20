import React, { useEffect, useMemo, useState } from 'react';
import { addProjectMember, listProjects, removeProjectMember } from '../api/projects';
import { activateUser, createUser, deactivateUser, listUsers, updateUser } from '../api/users';
import { extractErrorMessage } from '../lib/api';
import { fullName, roleLabel } from '../lib/labels';

const EMPTY_FORM = {
  nom: '',
  prenom: '',
  email: '',
  password: '',
  role: 'MEMBRE',
  competences: '',
  projetsAffectes: [],
  actif: true,
};

export default function TeamManagement() {
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const membershipsByUser = useMemo(() => {
    const map = {};
    projects.forEach((project) => {
      (project.membres || []).forEach((member) => {
        if (!map[member.id]) map[member.id] = [];
        map[member.id].push(project);
      });
    });
    return map;
  }, [projects]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [users, projectList] = await Promise.all([listUsers(), listProjects()]);
      setMembers(Array.isArray(users) ? users : []);
      setProjects(Array.isArray(projectList) ? projectList : []);
    } catch (err) {
      setError(extractErrorMessage(err, "Impossible de charger l'équipe."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setShowPassword(false);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setShowPassword(false);
    setFormData({
      nom: member.nom || '',
      prenom: member.prenom || '',
      email: member.email || '',
      password: '',
      role: member.role || 'MEMBRE',
      competences: (member.competences || []).join(', '),
      projetsAffectes: (membershipsByUser[member.id] || []).map((p) => p.id),
      actif: member.actif !== false,
    });
    setIsModalOpen(true);
  };

  const handleProjectToggle = (projectId) => {
    setFormData((prev) => ({
      ...prev,
      projetsAffectes: prev.projetsAffectes.includes(projectId)
        ? prev.projetsAffectes.filter((id) => id !== projectId)
        : [...prev.projetsAffectes, projectId],
    }));
  };

  const syncMemberships = async (userId, selectedIds) => {
    for (const project of projects) {
      const isMember = (project.membres || []).some((m) => m.id === userId);
      const shouldBe = selectedIds.includes(project.id);
      if (shouldBe && !isMember) {
        await addProjectMember(project.id, userId);
      } else if (!shouldBe && isMember) {
        await removeProjectMember(project.id, userId);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const competences = formData.competences.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      let userId = editingMember?.id;
      if (editingMember) {
        await updateUser(editingMember.id, {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          role: formData.role,
          competences,
          actif: formData.actif,
        });
      } else {
        const created = await createUser({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          motDePasse: formData.password,
          role: formData.role,
          competences,
        });
        userId = created.id;
      }
      await syncMemberships(userId, formData.projetsAffectes);
      setIsModalOpen(false);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, "Enregistrement du membre impossible."));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (member) => {
    setError('');
    try {
      if (member.actif) {
        await deactivateUser(member.id);
      } else {
        await activateUser(member.id);
      }
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Changement de statut impossible.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion de l'Équipe IT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Créer des comptes membres et les affecter aux projets du service informatique.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nouveau Membre
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Membre</th>
              <th className="p-4">Rôle & Compétences</th>
              <th className="p-4">Projets Affectés</th>
              <th className="p-4 text-center">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">Chargement de l'équipe…</td>
              </tr>
            )}
            {!loading && members.map((member) => {
              const assigned = membershipsByUser[member.id] || [];
              return (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                        {(member.prenom?.[0] || '')}{(member.nom?.[0] || '')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{fullName(member)}</p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800 text-xs">{roleLabel(member.role)}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(member.competences || []).map((comp) => (
                        <span key={comp} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {assigned.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {assigned.map((project) => (
                          <span key={project.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2 py-0.5 rounded-full">
                            {project.nom}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Aucun projet</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      member.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {member.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 rounded hover:bg-blue-50"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleToggleActive(member)}
                        className="text-xs text-amber-700 hover:text-amber-900 font-semibold px-2.5 py-1 rounded hover:bg-amber-50"
                      >
                        {member.actif ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingMember ? 'Modifier le membre' : 'Créer un compte membre'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {!editingMember && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-xs text-slate-400">
                      {showPassword ? 'Masquer' : 'Voir'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="MEMBRE">Membre d'équipe</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Compétences (séparées par des virgules)</label>
                <input
                  type="text"
                  value={formData.competences}
                  onChange={(e) => setFormData({ ...formData, competences: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">Affecter aux projets</label>
                <div className="space-y-2 max-h-36 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  {projects.map((project) => (
                    <label key={project.id} className="flex items-center gap-3 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.projetsAffectes.includes(project.id)}
                        onChange={() => handleProjectToggle(project.id)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>{project.nom}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  {editingMember ? 'Enregistrer' : 'Créer le membre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
