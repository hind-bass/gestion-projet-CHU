import React, { useState } from 'react';

export default function UserMeetings({ user }) {
  // Liste des réunions filtrées pour ce membre
  const [meetings] = useState([
    {
      id: 1,
      title: 'Point d\'avancement - Refonte SI Hospitalier',
      project: 'Refonte SI Hospitalier',
      date: '2026-08-05',
      time: '10:00 - 11:00',
      location: 'Salle Réunion B / Teams',
      status: 'UPCOMING', // UPCOMING ou COMPLETED
      organizer: 'Karim El Amrani (Chef DSI)',
      meetingUrl: 'https://teams.microsoft.com/l/meetup-join/...',
      agenda: [
        'Validation des maquettes de la vue Urgences',
        'Point de blocage sur l\'intégration API',
        'Planification du Sprint 3'
      ]
    },
    {
      id: 2,
      title: 'Synchronisation Réseau & Sécurité',
      project: 'Déploiement Réseau CHU',
      date: '2026-08-07',
      time: '14:30 - 15:30',
      location: 'Salle Informatique - Bloc Central',
      status: 'UPCOMING',
      organizer: 'Youssef Alami',
      meetingUrl: '',
      agenda: [
        'Vérification du déploiement des VLANs',
        'Recette des règles de Firewall'
      ]
    },
    {
      id: 3,
      title: 'Revue d\'Architecture & Bilan Sprint 2',
      project: 'Sécurisation DSI & Logs',
      date: '2026-07-28',
      time: '11:00 - 12:00',
      location: 'Visioconférence',
      status: 'COMPLETED',
      organizer: 'Karim El Amrani (Chef DSI)',
      report: {
        summary: 'Présentation des résultats des audits de sécurité sur les conteneurs et validation des correctifs de failles critiques.',
        decisions: [
          'Validation du passage en production de la mise à jour v1.4',
          'Accord pour la mise en place d\'un outil de monitoring centralisé'
        ],
        actionItems: [
          { action: 'Mettre à jour la documentation des accès SSH', assignee: 'Youssef Alami', deadline: '2026-08-02' },
          { action: 'Effectuer la rotation des clés d\'API', assignee: 'Équipe SecOps', deadline: '2026-08-04' }
        ]
      }
    }
  ]);

  const [activeTab, setActiveTab] = useState('UPCOMING'); // 'UPCOMING' ou 'COMPLETED'
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredMeetings = meetings.filter(m => m.status === activeTab);

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Mes Réunions & Comptes Rendus</h1>
          <p className="text-xs text-slate-500">
            Consultez votre planning de réunions et accédez aux comptes rendus rédigés.
          </p>
        </div>

        {/* Commutateur À venir / Passées */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'UPCOMING'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📅 À venir ({meetings.filter(m => m.status === 'UPCOMING').length})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'COMPLETED'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📝 Comptes rendus ({meetings.filter(m => m.status === 'COMPLETED').length})
          </button>
        </div>
      </div>

      {/* Liste des réunions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeetings.map((meeting) => (
          <div key={meeting.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              {/* Entête Carte */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100">
                  📁 {meeting.project}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  🕒 {meeting.time}
                </span>
              </div>

              {/* Titre */}
              <h3 className="text-sm font-bold text-slate-800 mb-2">{meeting.title}</h3>

              {/* Infos Réunion */}
              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">📅 Date :</span>
                  <span className="font-semibold text-slate-700">{meeting.date}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">📍 Lieu / Lien :</span>
                  <span className="font-medium text-slate-700">{meeting.location}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">👤 Organisateur :</span>
                  <span className="font-medium text-slate-700">{meeting.organizer}</span>
                </p>
              </div>

              {/* Ordre du jour pour les réunions à venir */}
              {meeting.status === 'UPCOMING' && meeting.agenda && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs mb-4">
                  <p className="font-bold text-slate-700 mb-1">Ordre du jour :</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                    {meeting.agenda.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {meeting.status === 'UPCOMING' ? (
                <>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    🟢 Confirmé
                  </span>
                  {meeting.meetingUrl ? (
                    <a
                      href={meeting.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>📹 Rejoindre</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Présentiel</span>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setSelectedReport(meeting)}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>📄 Voir le compte rendu</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredMeetings.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Aucune réunion à afficher dans cette catégorie.
          </div>
        )}
      </div>

      {/* Modal Compte Rendu */}
      {selectedReport && selectedReport.report && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-teal-400">{selectedReport.date}</span>
                <h3 className="text-sm font-bold mt-0.5">{selectedReport.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Corps Modal */}
            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Résumé */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400 mb-1">Résumé synthétique</h4>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedReport.report.summary}
                </p>
              </div>

              {/* Décisions Prises */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400 mb-1">Décisions prises</h4>
                <ul className="space-y-1.5">
                  {selectedReport.report.decisions.map((dec, i) => (
                    <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded border border-emerald-100 text-emerald-900">
                      <span>✅</span>
                      <span>{dec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions & Affectations */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400 mb-1">Actions & Prochaines étapes</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Action</th>
                        <th className="p-2">Responsable</th>
                        <th className="p-2">Échéance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedReport.report.actionItems.map((act, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-medium text-slate-800">{act.action}</td>
                          <td className="p-2 text-slate-600">{act.assignee}</td>
                          <td className="p-2 font-mono text-teal-700">{act.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
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