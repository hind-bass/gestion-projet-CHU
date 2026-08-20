import React, { useEffect, useState } from 'react';
import { createMeeting, deleteMeeting, listMeetings, processMeeting } from '../api/meetings';
import { listProjects } from '../api/projects';
import { listUsers } from '../api/users';
import { extractErrorMessage } from '../lib/api';
import { formatDate, formatTime, fullName } from '../lib/labels';

const EMPTY_FORM = {
  titre: '',
  projectId: '',
  date: '',
  heure: '09:00',
  ordreDuJour: '',
  notesManuelles: '',
  participantIds: [],
};

export default function MeetingPlanner() {
  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [meetingList, projectList, userList] = await Promise.all([listMeetings(), listProjects(), listUsers()]);
      setMeetings(Array.isArray(meetingList) ? meetingList : []);
      setProjects(Array.isArray(projectList) ? projectList : []);
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger les réunions.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleOpenModal = () => {
    setFormData({ ...EMPTY_FORM, projectId: projects[0]?.id || '' });
    setIsModalOpen(true);
  };

  const handleParticipantToggle = (userId) => {
    setFormData((prev) => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter((id) => id !== userId)
        : [...prev.participantIds, userId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.participantIds.length === 0) {
      setError('Sélectionnez au moins un participant.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createMeeting({
        projectId: Number(formData.projectId),
        titre: formData.titre,
        date: `${formData.date}T${formData.heure}:00`,
        participantIds: formData.participantIds,
        ordreDuJour: formData.ordreDuJour,
        notesManuelles: formData.notesManuelles,
      });
      setIsModalOpen(false);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Planification impossible.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (meeting) => {
    if (!window.confirm(`Supprimer la réunion « ${meeting.titre} » ?`)) return;
    try {
      await deleteMeeting(meeting.id);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Suppression impossible.'));
    }
  };

  const handleProcess = async (meeting) => {
    setProcessingId(meeting.id);
    setError('');
    try {
      await processMeeting(meeting.id);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Traitement IA impossible. Vérifiez que le service FastAPI est démarré.'));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Planification des Réunions IT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organisez les points de suivi, associez les participants et définissez l'ordre du jour.
          </p>
        </div>
        <button onClick={handleOpenModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Planifier une réunion
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">{error}</div>}

      {loading && (
        <div className="bg-white p-8 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
          Chargement des réunions…
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!loading && meetings.map((m) => (
          <div key={m.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                  {m.projectNom || `PRJ-${m.projectId}`}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{m.titre}</h3>
              </div>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                {m.statutTraitement || 'EN_ATTENTE'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span>{formatDate(m.date)}</span>
              <span>{formatTime(m.date)}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-700 uppercase mb-1">Ordre du jour</p>
              <p className="text-xs text-slate-600 whitespace-pre-line">{m.ordreDuJour || 'Aucun ordre du jour.'}</p>
            </div>
            {m.resumeGenere && (
              <p className="text-xs text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-lg p-2">{m.resumeGenere}</p>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Participants ({(m.participants || []).length})</p>
              <div className="flex flex-wrap gap-2">
                {(m.participants || []).map((p) => (
                  <span key={p.id} className="text-xs font-medium bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full border border-slate-200">
                    {fullName(p)}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleProcess(m)}
                disabled={processingId === m.id}
                className="text-xs text-indigo-700 font-semibold px-2 py-1 rounded hover:bg-indigo-50 disabled:opacity-50"
              >
                {processingId === m.id ? 'Analyse…' : 'Analyser (IA)'}
              </button>
              <button onClick={() => handleDelete(m)} className="text-xs text-red-600 font-semibold px-2 py-1 rounded hover:bg-red-50">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Planifier une réunion</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Titre</label>
                <input required value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Projet</label>
                <select required value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                  <option value="">Sélectionner</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Heure</label>
                  <input type="time" required value={formData.heure} onChange={(e) => setFormData({ ...formData, heure: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Participants</label>
                <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded-lg p-3 max-h-36 overflow-y-auto bg-slate-50">
                  {users.filter((u) => u.actif !== false).map((u) => (
                    <label key={u.id} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.participantIds.includes(u.id)}
                        onChange={() => handleParticipantToggle(u.id)}
                      />
                      {fullName(u)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ordre du jour</label>
                <textarea rows="3" value={formData.ordreDuJour} onChange={(e) => setFormData({ ...formData, ordreDuJour: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">Annuler</button>
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Planifier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
