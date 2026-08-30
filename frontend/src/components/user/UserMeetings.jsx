import React, { useEffect, useMemo, useState } from 'react';
import { listMyMeetings } from '../../api/meetings';
import { extractErrorMessage } from '../../lib/api';
import { formatDate, formatDateTime, formatTime, fullName } from '../../lib/labels';
import Icon from '../icons/Icon';

const PROCESSING_LABELS = {
  EN_ATTENTE: { icon: 'hourglass', label: 'Compte rendu en attente' },
  EN_COURS: { icon: 'settings', label: 'Traitement IA en cours' },
  TERMINE: { icon: 'circle-check', label: 'Compte rendu disponible' },
  ERREUR: { icon: 'triangle-alert', label: 'Erreur de traitement' },
};

function agendaLines(ordreDuJour) {
  if (!ordreDuJour) return [];
  return ordreDuJour
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function UserMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('UPCOMING'); // 'UPCOMING' ou 'COMPLETED'
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listMyMeetings();
        if (!cancelled) setMeetings(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Impossible de charger vos réunions.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const sorted = [...meetings].sort((a, b) => new Date(b.date) - new Date(a.date));
    return {
      upcoming: sorted.filter((m) => new Date(m.date).getTime() >= now).reverse(),
      past: sorted.filter((m) => new Date(m.date).getTime() < now),
    };
  }, [meetings]);

  const filteredMeetings = activeTab === 'UPCOMING' ? upcoming : past;

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
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar-days" className="w-3.5 h-3.5" /> À venir ({upcoming.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'COMPLETED'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Icon name="file-text" className="w-3.5 h-3.5" /> Comptes rendus ({past.length})
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Liste des réunions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Chargement de vos réunions…
          </div>
        )}

        {!loading && filteredMeetings.map((meeting) => {
          const agenda = agendaLines(meeting.ordreDuJour);
          const isUpcoming = activeTab === 'UPCOMING';

          return (
            <div key={meeting.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                {/* Entête Carte */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100 inline-flex items-center gap-1">
                    <Icon name="folder" className="w-3 h-3" /> {meeting.projectNom}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Icon name="clock" className="w-3.5 h-3.5" /> {formatTime(meeting.date)}
                  </span>
                </div>

                {/* Titre */}
                <h3 className="text-sm font-bold text-slate-800 mb-2">{meeting.titre}</h3>

                {/* Infos Réunion */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400 inline-flex items-center gap-1">
                      <Icon name="calendar-days" className="w-3.5 h-3.5" /> Date :
                    </span>
                    <span className="font-semibold text-slate-700">{formatDate(meeting.date)}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400 inline-flex items-center gap-1">
                      <Icon name="file-text" className="w-3.5 h-3.5" /> Traitement :
                    </span>
                    <span className="font-medium text-slate-700 inline-flex items-center gap-1">
                      {PROCESSING_LABELS[meeting.statutTraitement] ? (
                        <>
                          <Icon name={PROCESSING_LABELS[meeting.statutTraitement].icon} className="w-3.5 h-3.5" />
                          {PROCESSING_LABELS[meeting.statutTraitement].label}
                        </>
                      ) : (
                        meeting.statutTraitement
                      )}
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-slate-400 shrink-0 inline-flex items-center gap-1">
                      <Icon name="users" className="w-3.5 h-3.5" /> Participants :
                    </span>
                    <span className="font-medium text-slate-700">
                      {(meeting.participants || []).map(fullName).join(', ') || '—'}
                    </span>
                  </p>
                </div>

                {/* Ordre du jour pour les réunions à venir */}
                {isUpcoming && agenda.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs mb-4">
                    <p className="font-bold text-slate-700 mb-1">Ordre du jour :</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                      {agenda.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {isUpcoming ? (
                  <>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Planifiée
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDateTime(meeting.date)}
                    </span>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedReport(meeting)}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon name="file-text" className="w-3.5 h-3.5" /> Voir le compte rendu
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {!loading && filteredMeetings.length === 0 && !error && (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Aucune réunion à afficher dans cette catégorie.
          </div>
        )}
      </div>

      {/* Modal Compte Rendu */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-teal-400">{formatDateTime(selectedReport.date)}</span>
                <h3 className="text-sm font-bold mt-0.5">{selectedReport.titre}</h3>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            {/* Corps Modal */}
            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Résumé */}
              <div>
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-1">Résumé synthétique</h4>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedReport.resumeGenere || selectedReport.notesManuelles || 'Aucun compte rendu généré pour cette réunion.'}
                </p>
              </div>

              {/* Décisions Prises */}
              <div>
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-1">Décisions prises</h4>
                <ul className="space-y-1.5">
                  {(selectedReport.decisions || []).map((dec) => (
                    <li key={dec.id} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded border border-emerald-100 text-emerald-900">
                      <span>
                        {dec.statutTraite
                          ? <Icon name="circle-check" className="w-3.5 h-3.5 mt-0.5" />
                          : <Icon name="clock" className="w-3.5 h-3.5 mt-0.5" />}
                      </span>
                      <span>{dec.texteDecision}</span>
                    </li>
                  ))}
                  {(selectedReport.decisions || []).length === 0 && (
                    <li className="text-slate-400">Aucune décision enregistrée.</li>
                  )}
                </ul>
              </div>

              {/* Actions & Affectations */}
              <div>
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-1">Actions & Prochaines étapes</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Action</th>
                        <th className="p-2">Intervenant</th>
                        <th className="p-2">Échéance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedReport.actions || []).map((act) => (
                        <tr key={act.id} className="hover:bg-slate-50">
                          <td className="p-2 font-medium text-slate-800">{act.texteAction}</td>
                          <td className="p-2 text-slate-600">{act.intervenantDetecte || '—'}</td>
                          <td className="p-2 font-mono text-teal-700">{formatDate(act.dateDetectee)}</td>
                        </tr>
                      ))}
                      {(selectedReport.actions || []).length === 0 && (
                        <tr>
                          <td className="p-3 text-slate-400" colSpan={3}>Aucune action détectée.</td>
                        </tr>
                      )}
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
