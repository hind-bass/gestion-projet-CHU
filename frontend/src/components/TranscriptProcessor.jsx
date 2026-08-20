import React, { useEffect, useState } from 'react';
import { listProjects } from '../api/projects';
import { iaProcessTranscript } from '../lib/ia';

// Icônes SVG
const CpuIcon = () => (
  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function TranscriptProcessor({
  projects: projectsProp,
  onSendToValidation
}) {
  const [projects, setProjects] = useState(projectsProp || []);
  const [selectedProject, setSelectedProject] = useState(projectsProp?.[0]?.id || '');
  const [transcriptText, setTranscriptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (projectsProp?.length) return undefined;
    let cancelled = false;
    listProjects()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setProjects(list);
        setSelectedProject((current) => current || list[0]?.id || '');
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [projectsProp]);

  const sampleTranscript = `Réunion du 25 juillet 2026 - Projet Refonte SI Hospitalier
Participants: Chef de service IT, Youssef Alami, Sanaa Chraibi

Chef de service: On doit faire le point sur la migration des serveurs du bloc opératoire.
Youssef: Le réseau est prêt mais il faut mettre à niveau le pare-feu avant d'installer les switchs. Je peux m'en occuper d'ici le 5 août.
Sanaa: Côté base de données, l'API du dossier patient a besoin de tests de charge. Je propose de m'en charger cette semaine.
Chef de service: Parfait. Sanaa, valide aussi les droits d'accès des médecins avec Omar. On valide ce plan.`;

  // Appels vers FastAPI endpoint /api/ai/meetings/process
  const handleProcessTranscript = async () => {
    if (!transcriptText.trim()) return;

    setIsProcessing(true);
    setAnalysisResult(null);
    setErrorMessage('');

    try {
      const data = await iaProcessTranscript(transcriptText);
      setAnalysisResult(data);
    } catch (err) {
      console.error("Erreur lors de l'appel FastAPI :", err);
      setErrorMessage(err.message || "Impossible de joindre le service d'analyse FastAPI.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendToValidationModule = () => {
    if (!analysisResult?.suggested_tasks) return;
    if (onSendToValidation) {
      const mapped = (analysisResult.suggested_tasks || []).map((t, index) => ({
        id: t.id || `AI-${index + 1}`,
        titre: t.title || t.titre,
        projet: selectedProject,
        assigneA: t.assignee || t.assigneA || '',
        priorite: t.priority || t.priorite || 'MOYENNE',
        dateEcheance: t.due_date || t.dateEcheance || '',
        confianceIA: t.confidence || t.confianceIA || 70,
        statutValidation: 'EN_ATTENTE',
      }));
      onSendToValidation(mapped);
    } else {
      alert(`${analysisResult.suggested_tasks.length} tâche(s) envoyée(s) au module de validation IA avec succès !`);
    }
  };

  const getPriorityBadgeStyle = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HAUTE':
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MOYENNE':
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* En-tête de section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CpuIcon /> Traitement IA des Transcriptions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analysez les comptes-rendus ou verbatims de réunion pour extraire automatiquement résumés, décisions et tâches structurées.
          </p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200 flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" /> FastAPI + Ollama/LLM
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOC GAUCHE : Saisie / Import */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Verbatim de Réunion
              </h2>
              <div className="flex items-center gap-2">
                {transcriptText && (
                  <button
                    onClick={() => setTranscriptText('')}
                    className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Effacer le texte"
                  >
                    <TrashIcon /> Effacer
                  </button>
                )}
                <button
                  onClick={() => setTranscriptText(sampleTranscript)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline transition-colors cursor-pointer"
                >
                  Charger un exemple
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Projet associé
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-600">
                  Transcription brute
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {transcriptText.length} caractères
                </span>
              </div>
              <textarea
                rows="11"
                placeholder="Collez ici le texte de la transcription de réunion (ex: compte-rendu Teams, notes d'entretien, enregistrement transcrit)..."
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg text-xs font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
              />
            </div>
          </div>

          <button
            onClick={handleProcessTranscript}
            disabled={isProcessing || !transcriptText.trim()}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-xs transition-colors flex justify-center items-center gap-2 shadow-sm cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Traitement NLP via FastAPI...</span>
              </>
            ) : (
              <>
                <RocketIcon />
                <span>Lancer l'Analyse IA</span>
              </>
            )}
          </button>
        </div>

        {/* BLOC DROITE : Résultats */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            2. Extractions IA
          </h2>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              ⚠️ Impossible de joindre le service d'analyse FastAPI.
            </div>
          )}

          {!analysisResult && !isProcessing && !errorMessage && (
            <div className="h-80 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6 border-2 border-dashed border-slate-200 rounded-lg">
              <CpuIcon />
              <p className="font-semibold mt-2 text-slate-600">Aucune analyse disponible</p>
              <p className="mt-1 text-slate-400 max-w-xs">
                Saisissez ou chargez une transcription à gauche puis cliquez sur "Lancer l'Analyse IA".
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="h-80 flex flex-col items-center justify-center space-y-3 text-indigo-600">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-700">Extraction structurée en cours...</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Analyse par le serveur FastAPI (Résumé, Décisions et Tâches)
                </p>
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4 text-xs">
              {/* Intervenants détectés (si présents) */}
              {analysisResult.speakers && analysisResult.speakers.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="font-bold text-slate-700">👥 Intervenants :</span>
                  {analysisResult.speakers.map((s, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Résumé */}
              <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 space-y-1">
                <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                  📝 Résumé Synthétique :
                </p>
                <p className="text-indigo-900 leading-relaxed text-[11px]">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Décisions Clés */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-800">🎯 Décisions Validées :</p>
                {analysisResult.decisions?.length > 0 ? (
                  <ul className="space-y-1 pl-1">
                    {analysisResult.decisions.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 text-[11px]">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">Aucune décision explicite identifiée.</p>
                )}
              </div>

              {/* Tâches Extraites */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-800">
                    ☑️ Tâches Identifiées ({analysisResult.suggested_tasks?.length || 0})
                  </p>
                  <button
                    onClick={handleSendToValidationModule}
                    className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <CheckCircleIcon /> Envoyer pour Validation
                  </button>
                </div>

                <div className="space-y-2">
                  {analysisResult.suggested_tasks?.map((t, index) => (
                    <div
                      key={t.id || index}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 hover:border-slate-300 transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-slate-900 text-xs">{t.title}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {t.confidence && (
                            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {t.confidence}%
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeStyle(
                              t.priority
                            )}`}
                          >
                            {t.priority}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-3">
                          <span>
                            👤 <strong className="text-slate-700">{t.assignee || 'Non assigné'}</strong>
                          </span>
                          <span>
                            📅 <strong className="text-slate-700">{t.due_date || 'Non définie'}</strong>
                          </span>
                        </div>

                        {t.skills && t.skills.length > 0 && (
                          <div className="flex items-center gap-1">
                            {t.skills.map((c, i) => (
                              <span
                                key={i}
                                className="bg-white border border-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono text-[9px]"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
