import React, { useState, useRef, useEffect } from 'react';

export default function UserChatbot({ user }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Bonjour ! Je suis votre assistant DSI contextuel. Je suis connecté à vos projets (*Refonte SI Hospitalier*, *Déploiement Réseau CHU*, *Sécurisation DSI & Logs*). Comment puis-je vous aider aujourd'hui ?`,
      time: '11:00'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Défilement automatique vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Suggestions de questions rapides
  const quickPrompts = [
    "Quelles sont mes tâches prioritaires cette semaine ?",
    "Résumé de la dernière réunion SI Hospitalier",
    "Quelle est ma disponibilité restante ?",
    "Règles d'accès pour les switches Cisco ?"
  ];

  // Simulation de réponse de l'assistant IA
  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Simulation de réponse intelligente basée sur le contexte utilisateur
    setTimeout(() => {
      let botResponse = "Je n'ai pas trouvé de directive spécifique à ce sujet dans la documentation de vos projets actuels.";

      const lower = text.toLowerCase();
      if (lower.includes('tâche') || lower.includes('prioritaire') || lower.includes('urgente')) {
        botResponse = "D'après votre tableau Kanban, vous avez 1 tâche urgente en attente :\n- **Mise à jour des patchs de sécurité des serveurs Web** (Échéance: 03 Août 2026).\n\nVous avez également 1 tâche en cours : *Configuration des VLANs - Bâtiment Chirurgie*.";
      } else if (lower.includes('réunion') || lower.includes('compte rendu') || lower.includes('résumé')) {
        botResponse = "Le dernier compte rendu concerne la **Revue d'Architecture & Bilan Sprint 2** (28 Juillet 2026).\n\n**Décisions clés :**\n- Passage en production de la v1.4 validé.\n- Accord pour l'outil de monitoring centralisé.";
      } else if (lower.includes('charge') || lower.includes('disponibilité') || lower.includes('heure')) {
        botResponse = "Votre charge de travail est actuellement de **31h / 35h** (88% de capacité). Il vous reste **4 heures de disponibilité** sur la semaine en cours.";
      } else if (lower.includes('vlan') || lower.includes('cisco') || lower.includes('réseau')) {
        botResponse = "Extrait de la documentation *Déploiement Réseau CHU* :\n- Les switches du 2ème étage doivent isoler le flux vidéo (VLAN 20) du flux DSI Patients (VLAN 10).\n- La passerelle par défaut est `10.200.4.1`.";
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      
      {/* En-tête Assistant */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            🤖
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Assistant IA Projets</h1>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Synchronisé avec vos projets CHU
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
          Modèle: LLM Local / RAG restreint
        </span>
      </div>

      {/* Zone Principale de Chat */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-[580px] overflow-hidden">
        
        {/* Historique des messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                {/* Rendu simple avec sauts de ligne */}
                <div className="whitespace-pre-line font-medium">
                  {msg.text}
                </div>
                <div
                  className={`text-[9px] mt-1.5 text-right font-mono ${
                    msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {/* Animation chargement IA */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
                <span className="text-[11px] font-medium text-slate-500 ml-1">L'assistant recherche dans la documentation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions de Prompts Rapides */}
        <div className="p-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-2 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 rounded-full px-3 py-1 shrink-0 transition-colors"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Barre de Saisie */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Posez une question sur vos tâches, réunions ou spécifications..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
          >
            <span>Envoyer</span>
            <span>➔</span>
          </button>
        </form>

      </div>

    </div>
  );
}