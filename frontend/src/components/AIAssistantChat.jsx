import React, { useState, useRef, useEffect } from 'react';

export default function AIAssistantChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Bonjour Karim ! Je suis votre assistant virtuel IT-CHU. Je dispose d'un accès en temps réel à l'ensemble de vos projets, tâches, ressources et comptes-rendus de réunion. Que souhaitez-vous savoir aujourd'hui ?",
      timestamp: '10:00'
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

  // Moteur de réponse simulé (RAG / Connaissance SI CHU)
  const generateResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('avancement') || q.includes('refonte si') || q.includes('prj-chu-01')) {
      return "Le projet **PRJ-CHU-01 (Refonte SI Hospitalier)** est actuellement avancé à **65%**. 3 tâches sur 5 sont en cours, et la mise à niveau du pare-feu du bloc opératoire est planifiée pour le 5 août 2026.";
    } 
    else if (q.includes('non assign') || q.includes('critique') || q.includes('urgenc')) {
      return "Il y a actuellement **1 tâche critique en attente** : *'Optimisation de la BDD Dossiers Patients'*. L'attribution intelligente recommande de l'assigner à **Omar Amrani** (charge actuelle faible : 1 tâche).";
    } 
    else if (q.includes('disponible') || q.includes('bdd') || q.includes('charge')) {
      return "D'après la grille de charge globale :\n- **Omar Amrani** (DBA) est le plus disponible (charge à 50%).\n- **Sanaa Chraibi** est à charge maximale (100% - 4 tâches en cours).";
    } 
    else if (q.includes('réunion') || q.includes('décision') || q.includes('compte-rendu')) {
      return "Lors de la dernière réunion du **25 juillet 2026** sur le bloc opératoire, il a été décidé :\n1. De valider la mise à niveau du pare-feu avant d'installer les switchs (Youssef Alami).\n2. D'exécuter les tests de charge sur l'API Dossier Patient d'ici le 1er août (Sanaa Chraibi).";
    } 
    else {
      return `J'ai analysé votre requête ("${query}"). D'après le SI CHU, l'ensemble des 4 projets actifs se déroulent conformément au planning. Souhaitez-vous des détails spécifiques sur une tâche, un membre de l'équipe ou une réunion ?`;
    }
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // Simulation du temps de réponse de l'IA
    setTimeout(() => {
      const aiReplyText = generateResponse(text);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
        
        {/* En-tête du Chat */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            🤖
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Copilote SI-CHU</p>
            <p className="text-[10px] text-emerald-600 font-medium">● Actif • Synchro BDD & Relevés OK</p>
          </div>
        </div>

        {/* Message History */}
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
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-indigo-600 text-xs italic font-medium p-2 bg-white rounded-lg border border-slate-200 w-fit">
              <span className="animate-pulse">🤖 L'assistant consulte la base de connaissances du CHU...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion de questions rapides */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto">
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
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
            className="flex-1 px-4 py-2.5 bg-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            Envoyer ➔
          </button>
        </form>

      </div>
    </div>
  );
}