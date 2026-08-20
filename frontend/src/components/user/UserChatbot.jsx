import React, { useState, useRef, useEffect } from 'react';
import { iaChat } from '../../lib/ia';

export default function UserChatbot({ user }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Bonjour ! Je suis votre assistant DSI contextuel. Je suis connecté à vos projets. Comment puis-je vous aider aujourd'hui ?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    "Quelles sont mes tâches prioritaires cette semaine ?",
    "Résumé de la dernière réunion SI Hospitalier",
    "Quelle est ma disponibilité restante ?",
    "Règles d'accès pour les switches Cisco ?"
  ];

  const handleSendMessage = async (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // 1. URL alignée avec la route FastAPI (/api/ai/chat/)
      const data = await iaChat({
        userId: user?.id,
        role: user?.role === 'ADMIN' ? 'ADMIN' : 'MEMBRE',
        question: text,
      });

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.answer || "Aucune réponse reçue de l'assistant.",
        sourcesCount: data.sources_count, // Récupération du nombre de sources consultées
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      console.error("Erreur Chatbot FastAPI :", error);
      
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "⚠️ Désolé, je n'ai pas pu contacter le service IA. Vérifiez que votre serveur FastAPI est opérationnel.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);

    } finally {
      setIsTyping(false);
    }
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
          FastAPI / RAG Local
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
                <div className="whitespace-pre-line font-medium">
                  {msg.text}
                </div>

                {/* Indicateur optionnel du nombre de sources RAG consultées */}
                {msg.sender === 'bot' && msg.sourcesCount !== undefined && (
                  <div className="mt-2 text-[10px] text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md w-fit font-sans flex items-center gap-1">
                    <span>📚</span>
                    <span>{msg.sourcesCount} source(s) BDD consultée(s)</span>
                  </div>
                )}

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

          {/* Animation de chargement */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
                <span className="text-[11px] font-medium text-slate-500 ml-1">L'assistant interroge FastAPI / LLM...</span>
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
              disabled={isTyping}
              className="text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 rounded-full px-3 py-1 shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
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
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Envoyer</span>
            <span>➔</span>
          </button>
        </form>

      </div>
    </div>
  );
}
