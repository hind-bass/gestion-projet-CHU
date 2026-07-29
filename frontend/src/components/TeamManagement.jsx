import React, { useState } from 'react';

export default function TeamManagement() {
  // Liste des projets disponibles dans le CHU
  const availableProjects = [
    { id: 'PRJ-CHU-01', nom: 'Refonte SI Hospitalier' },
    { id: 'PRJ-CHU-02', nom: 'Informatisation Dossier Patient' },
    { id: 'PRJ-CHU-03', nom: 'Sécurisation Réseau & Wifi Bloc' },
    { id: 'PRJ-CHU-04', nom: 'Gestion Téléphonie IP Service Urgences' }
  ];

  // Liste des membres de l'équipe IT
  const [members, setMembers] = useState([
    {
      id: 1,
      nom: 'Alami',
      prenom: 'Youssef',
      email: 'y.alami@chu.ma',
      password: 'password123',
      role: 'Ingénieur Système & Réseau',
      competences: ['Linux', 'Cisco', 'Sécurité'],
      projetsAffectes: ['PRJ-CHU-01', 'PRJ-CHU-03'],
      chargeActuelle: '4/5 Tâches'
    },
    {
      id: 2,
      nom: 'Chraibi',
      prenom: 'Sanaa',
      email: 's.chraibi@chu.ma',
      password: 'password123',
      role: 'Développeuse Fullstack',
      competences: ['Spring Boot', 'React', 'PostgreSQL'],
      projetsAffectes: ['PRJ-CHU-01', 'PRJ-CHU-02'],
      chargeActuelle: '3/5 Tâches'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'Technicien Support IT',
    competences: '',
    projetsAffectes: []
  });

  // Supprimer un membre
  const handleDeleteMember = (id, prenom, nom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le membre ${prenom} ${nom} ?`)) {
      setMembers(members.filter(member => member.id !== id));
    }
  };

  // Ouvrir la modal en mode Création
  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setShowPassword(false);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'Technicien Support IT',
      competences: '',
      projetsAffectes: []
    });
    setIsModalOpen(true);
  };

  // Ouvrir la modal en mode Modification
  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setShowPassword(false);
    setFormData({
      ...member,
      password: '', // Vide lors de l'édition (à remplir seulement si réinitialisation)
      competences: Array.isArray(member.competences) ? member.competences.join(', ') : member.competences
    });
    setIsModalOpen(true);
  };

  // Gestion des cases à cocher pour les projets affectés
  const handleProjectToggle = (projectCode) => {
    const updatedProjects = formData.projetsAffectes.includes(projectCode)
      ? formData.projetsAffectes.filter(code => code !== projectCode)
      : [...formData.projetsAffectes, projectCode];

    setFormData({ ...formData, projetsAffectes: updatedProjects });
  };

  // Enregistrement
  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = typeof formData.competences === 'string' 
      ? formData.competences.split(',').map(s => s.trim()).filter(Boolean)
      : formData.competences;

    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id 
        ? { 
            ...formData, 
            // Si le mot de passe est laissé vide en modification, conserver l'ancien
            password: formData.password ? formData.password : m.password,
            competences: skillsArray 
          } 
        : m
      ));
    } else {
      const newMember = {
        ...formData,
        id: Date.now(),
        competences: skillsArray,
        chargeActuelle: '0/5 Tâches'
      };
      setMembers([...members, newMember]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion de l'Équipe IT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Créer des comptes membres et les affecter aux projets du service informatique.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>+</span> Nouveau Membre
        </button>
      </div>

      {/* Tableau de l'équipe */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Membre</th>
              <th className="p-4">Rôle & Compétences</th>
              <th className="p-4">Projets Affectés</th>
              <th className="p-4 text-center">Charge</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                
                {/* Membre Info */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                      {member.prenom[0]}{member.nom[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{member.prenom} {member.nom}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>
                </td>

                {/* Rôle & Compétences */}
                <td className="p-4">
                  <p className="font-medium text-slate-800 text-xs">{member.role}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {member.competences.map((comp, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {comp}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Projets Affectés */}
                <td className="p-4">
                  {member.projetsAffectes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {member.projetsAffectes.map((pCode) => (
                        <span key={pCode} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2 py-0.5 rounded-full">
                          {pCode}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Aucun projet</span>
                  )}
                </td>

                {/* Charge */}
                <td className="p-4 text-center">
                  <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                    {member.chargeActuelle}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 rounded hover:bg-blue-50 transition-colors"
                      title="Modifier le membre"
                    >
                      ✏️ Affecter / Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id, member.prenom, member.nom)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold px-2.5 py-1 rounded hover:bg-red-50 transition-colors"
                      title="Supprimer le membre"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CRÉATION / MODIFICATION MEMBRE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingMember ? 'Modifier le Membre & ses Projets' : 'Créer un Compte Membre'}
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Adresse Email Institutionnelle</label>
                <input
                  type="email"
                  required
                  placeholder="m.nom@chu.ma"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Champ Mot de Passe */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mot de passe {editingMember && <span className="text-slate-400 font-normal">(laisser vide pour ne pas modifier)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingMember}
                    placeholder={editingMember ? '••••••••' : 'Saisir un mot de passe sécurisé'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rôle / Spécialité</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Technicien Support IT">Technicien Support IT</option>
                  <option value="Ingénieur Système & Réseau">Ingénieur Système & Réseau</option>
                  <option value="Développeuse Fullstack">Développeur / Développeuse Application</option>
                  <option value="Administrateur Base de Données">Administrateur BDD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Compétences (séparées par des virgules)</label>
                <input
                  type="text"
                  placeholder="Java, React, SQL, Virtualisation..."
                  value={formData.competences}
                  onChange={(e) => setFormData({ ...formData, competences: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* SECTION AFFECTATION AUX PROJETS */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Affecter à un ou plusieurs projets :
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  {availableProjects.map((prj) => (
                    <label key={prj.id} className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={formData.projetsAffectes.includes(prj.id)}
                        onChange={() => handleProjectToggle(prj.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-mono font-bold text-blue-700">{prj.id}</span>
                      <span>— {prj.nom}</span>
                    </label>
                  ))}
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
                  {editingMember ? 'Enregistrer les modifications' : 'Créer le Membre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}