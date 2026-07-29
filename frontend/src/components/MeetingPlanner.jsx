import React, { useState } from 'react';

export default function MeetingPlanner() {
  // Liste des membres pour la sélection des participants
  const teamMembers = [
    { id: 1, nom: 'Youssef Alami', role: 'Ingénieur Réseau' },
    { id: 2, nom: 'Sanaa Chraibi', role: 'Développeuse Fullstack' },
    { id: 3, nom: 'Omar Amrani', role: 'Administrateur BDD' },
    { id: 4, nom: 'Khadija Bennani', role: 'Technicienne Support' },
  ];

  // Liste initiale des réunions planifiées
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      titre: 'Cadrage Technique - Refonte SI Hospitalier',
      projet: 'PRJ-CHU-01',
      date: '2026-08-02',
      heure: '10:00',
      duree: '60 min',
      lieu: 'Salle de Réunion SI / Google Meet',
      ordreDuJour: '1. Validation de l\'architecture matérielle\n2. Répartition des rôles\n3. Planning du Sprint 1',
      participants: ['Youssef Alami', 'Sanaa Chraibi', 'Omar Amrani']
    },
    {
      id: 2,
      titre: 'Point d\'avancement Dossier Patient',
      projet: 'PRJ-CHU-02',
      date: '2026-08-04',
      heure: '14:30',
      duree: '45 min',
      lieu: 'Bureau Chef de Service',
      ordreDuJour: '1. Revue des accès BDD\n2. Démo module Radiologie\n3. Retours utilisateurs',
      participants: ['Sanaa Chraibi', 'Khadija Bennani']
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    projet: 'PRJ-CHU-01',
    date: '',
    heure: '09:00',
    duree: '60 min',
    lieu: 'Salle Réunion IT',
    ordreDuJour: '',
    participants: []
  });

  const handleOpenModal = () => {
    setFormData({
      titre: '',
      projet: 'PRJ-CHU-01',
      date: '',
      heure: '09:00',
      duree: '60 min',
      lieu: 'Salle Réunion IT',
      ordreDuJour: '',
      participants: []
    });
    setIsModalOpen(true);
  };

  const handleParticipantToggle = (nom) => {
    setFormData((prev) => {
      const exists = prev.participants.includes(nom);
      return {
        ...prev,
        participants: exists
          ? prev.participants.filter((p) => p !== nom)
          : [...prev.participants, nom]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.participants.length === 0) {
      alert('Veuillez sélectionner au moins un participant.');
      return;
    }

    const newMeeting = {
      ...formData,
      id: Date.now()
    };

    setMeetings([...meetings, newMeeting]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Planification des Réunions IT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organisez les points de suivi, associez les participants et définissez l'ordre du jour.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>📅</span> Planifier une Réunion
        </button>
      </div>

      {/* Liste des réunions à venir */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetings.map((m) => (
          <div key={m.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            
            {/* Header Réunion */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                  {m.projet}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{m.titre}</h3>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                ⏱️ {m.duree}
              </span>
            </div>

            {/* Date, Heure et Lieu */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1">📆 {m.date}</span>
              <span className="flex items-center gap-1">⏰ {m.heure}</span>
              <span className="flex items-center gap-1">📍 {m.lieu}</span>
            </div>

            {/* Ordre du jour */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-700 uppercase mb-1">📋 Ordre du jour :</p>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {m.ordreDuJour || 'Aucun ordre du jour renseigné.'}
              </p>
            </div>

            {/* Participants */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">
                👥 Participants ({m.participants.length}) :
              </p>
              <div className="flex flex-wrap gap-2">
                {m.participants.map((p, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {p}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL PLANIFIER UNE RÉUNION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Planifier une Nouvelle Réunion</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Titre de la réunion</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Revue d'avancement Sprint 2"
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Lieu / Lien</label>
                  <input
                    type="text"
                    value={formData.lieu}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Heure</label>
                  <input
                    type="time"
                    required
                    value={formData.heure}
                    onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Durée</label>
                  <select
                    value={formData.duree}
                    onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="60 min">60 min</option>
                    <option value="90 min">90 min</option>
                  </select>
                </div>
              </div>

              {/* Sélection des participants */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Associé des participants (Cocher les membres)
                </label>
                <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded-lg p-3 max-h-36 overflow-y-auto bg-slate-50">
                  {teamMembers.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(m.nom)}
                        onChange={() => handleParticipantToggle(m.nom)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{m.nom}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ordre du jour */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ordre du jour (Agenda)</label>
                <textarea
                  rows="3"
                  placeholder="Points à aborder durant la réunion..."
                  value={formData.ordreDuJour}
                  onChange={(e) => setFormData({ ...formData, ordreDuJour: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {/* Boutons d'action */}
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
                  Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}