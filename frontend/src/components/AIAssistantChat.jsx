import React, { useState, useRef, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function AIAssistantChat({ user }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Bonjour ${user?.name || 'Karim'} ! Je suis votre assistant virtuel IT-CHU. Je dispose d'un accès en temps réel à l'ensemble de vos projets, tâches, ressources et comptes-rendus de réunion. Que souhaitez-vous savoir aujourd'hui ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Questions fréquentes suggérées
  const suggestedQueries = [
    "Quel est l'avancement global du projet Refonte SI ?",
    "Quelles sont les tâches critiques non assignées ?",
    "Qui est disponible pour une tâche d'administration BDD ?",
    "Résumé des décisions de la dernière réunion réseau"
  ];

  // Envoi du message au Microservice FastAPI Python
  const handleSendMessage = async (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputQuery).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      // Appel API FastAPI avec variable d'environnement
      const response = await fetch(`${API_BASE_URL}/api/ai/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user?.id ? parseInt(user.id, 10) : 1, // Conversion explicite en int (Pydantic ChatRequest)
          role: 'ADMIN',                               // Rôle Admin garanti
          question: text
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json(); // Reçoit ChatResponse { answer, sources_count }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.answer || "Aucune réponse générée.",
        sourcesCount: data.sources_count,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      console.error("Erreur de connexion au backend IA:", error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "⚠️ Impossible de contacter le service IA. Vérifiez que le serveur FastAPI est bien démarré.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>🤖</span> Assistant Virtuel IT & Décisionnel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Posez des questions sur vos projets, l'état des tâches, les réunions et la charge de vos équipes.
          </p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200">
          ● Modèle Connecté (RAG SI CHU)
        </span>
      </div>

      {/* ZONE CONVERSATIONNELLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[580px] overflow-hidden">
        
        {/* En-tête du Chat */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            🤖
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Copilote SI-CHU (Admin)</p>
            <p className="text-[10px] text-emerald-600 font-medium">● Actif • Synchro FastAPI & LLM OK</p>
          </div>
        </div>

        {/* Historique des messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center shrink-0 mb-1">
                    🤖
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}

                  {/* Affichage des sources consultées par le RAG */}
                  {msg.sender === 'ai' && msg.sourcesCount !== undefined && (
                    <div className="mt-2 text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md w-fit font-sans flex items-center gap-1">
                      <span>📚</span>
                      <span>{msg.sourcesCount} document(s) BDD analysé(s)</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-indigo-600 text-xs italic font-medium p-2.5 bg-white rounded-xl border border-slate-200 w-fit">
              <span className="animate-pulse">🤖 L'assistant consulte la base de connaissances FastAPI / Ollama...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion de questions rapides */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none">
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isTyping}
              className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors disabled:opacity-50 cursor-pointer"
            >
              💡 {q}
            </button>
          ))}
        </div>

        {/* Barre de saisie */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Interrogez le chatbot (ex: Quel est le statut des tâches de Sanaa ?)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-xs text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Envoyer ➔
          </button>
        </form>

      </div>
    </div>
  );
}
