import React, { useState } from 'react';

export default function TranscriptProcessor() {
  const [selectedProject, setSelectedProject] = useState('PRJ-CHU-01');
  const [transcriptText, setTranscriptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Exemple de texte de démonstration à charger rapidement
  const sampleTranscript = `Réunion du 25 juillet 2026 - Projet Refonte SI Hospitalier
Participants: Chef de service IT, Youssef Alami, Sanaa Chraibi

Chef de service: On doit faire le point sur la migration des serveurs du bloc opératoire.
Youssef: Le réseau est prêt mais il faut mettre à niveau le pare-feu avant d'installer les switchs. Je peux m'en occuper d'ici le 5 août.
Sanaa: Côté base de données, l'API du dossier patient a besoin de tests de charge. Je propose de m'en charger cette semaine.
Chef de service: Parfait. Sanaa, valide aussi les droits d'accès des médecins avec Omar. On valide ce plan.`;

  // Déclenchement du Pipeline IA (Simulation d'analyse NLP/LLM)
  const handleProcessTranscript = () => {
    if (!transcriptText.trim()) {
      alert("Veuillez saisir ou coller une transcription avant de lancer le traitement IA.");
      return;
    }

    setIsProcessing(true);
    setAnalysisResult(null);

    // Simulation du temps de traitement du pipeline IA
    setTimeout(() => {
      setIsProcessing(false);
      setAnalysisResult({
        resume: "La réunion a porté sur la préparation de la migration des serveurs du bloc opératoire. Le réseau est prêt et les actions prioritaires sur le pare-feu et la BDD ont été validées.",
        decisions: [
          "Mise à niveau du pare-feu validée avant la pose des switchs.",
          "Exécution des tests de charge sur l'API Dossier Patient accordée pour cette semaine."
        ],
        tachesExtraites: [
          {
            id: 1,
            titre: "Mise à niveau du pare-feu du bloc opératoire",
            assigneA: "Youssef Alami",
            priorite: "HAUTE",
            dateEcheance: "2026-08-05",
            competences: ["Réseau", "Sécurité"]
          },
          {
            id: 2,
            titre: "Tests de charge API Dossier Patient",
            assigneA: "Sanaa Chraibi",
            priorite: "HAUTE",
            dateEcheance: "2026-08-01",
            competences: ["React", "API", "Spring Boot"]
          },
          {
            id: 3,
            titre: "Validation des droits d'accès BDD médecins avec Omar",
            assigneA: "Sanaa Chraibi",
            priorite: "MOYENNE",
            dateEcheance: "2026-08-03",
            competences: ["Base de données"]
          }
        ]
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Traitement IA des Transcriptions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Importez les verbatims de réunion pour générer résumés, décisions et tâches structurées via IA.
          </p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200 flex items-center gap-1.5">
          <span>🤖</span> Pipeline Ollama / LLM
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BLOC GAUCHE : Saisie / Import de la Transcription */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">1. Saisie ou Import du Verbatim</h2>
            <button
              onClick={() => setTranscriptText(sampleTranscript)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Insérer un exemple
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Projet cible</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            >
              <option value="PRJ-CHU-01">PRJ-CHU-01 (Refonte SI Hospitalier)</option>
              <option value="PRJ-CHU-02">PRJ-CHU-02 (Dossier Patient)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Transcription brute</label>
            <textarea
              rows="10"
              placeholder="Collez ici le texte de la transcription de réunion..."
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={handleProcessTranscript}
            disabled={isProcessing || !transcriptText.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex justify-center items-center gap-2 shadow-sm"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin">⏳</span> Traitement du pipeline IA en cours...
              </>
            ) : (
              <>
                <span>🚀</span> Déclencher le Traitement IA
              </>
            )}
          </button>
        </div>

        {/* BLOC DROITE : Résultats de l'analyse IA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            2. Résultats de l'Analyse IA
          </h2>

          {!analysisResult && !isProcessing && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-lg">
              <span>🧠 Aucun traitement lancé.</span>
              <span className="mt-1">Importez un texte et cliquez sur "Déclencher le Traitement IA".</span>
            </div>
          )}

          {isProcessing && (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 text-indigo-600">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Extraction du résumé, des décisions et des tâches...</p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Résumé */}
              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <p className="text-xs font-bold text-indigo-900 mb-1">📝 Résumé Automatique :</p>
                <p className="text-xs text-indigo-800 leading-relaxed">{analysisResult.resume}</p>
              </div>

              {/* Décisions Clés */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">🎯 Décisions Identifiées :</p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                  {analysisResult.decisions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* Tâches Extraites */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-slate-700">
                    ☑️ Tâches Réduites / Extraites ({analysisResult.tachesExtraites.length}) :
                  </p>
                  <button 
                    onClick={() => alert("Les tâches ont été enregistrées avec succès dans le projet !")}
                    className="text-[11px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded hover:bg-emerald-700 transition-colors"
                  >
                    + Valider & Injecter les tâches
                  </button>
                </div>

                <div className="space-y-2">
                  {analysisResult.tachesExtraites.map((t) => (
                    <div key={t.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{t.titre}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            👤 {t.assigneA}
                          </span>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                            📅 {t.dateEcheance}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {t.priorite}
                      </span>
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