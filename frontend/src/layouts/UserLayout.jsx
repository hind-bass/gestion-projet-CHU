import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  alertAdmin,
  listNotifications,
  markAllNotificationsRead,
} from '../api/notifications';
import { extractErrorMessage } from '../lib/api';
import { notificationTypeDetails, relativeTime } from '../lib/labels';

const NOTIFICATIONS_POLL_MS = 60000;

export default function UserLayout({ children, user, activeTab, setActiveTab, onOpenProfile, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // État pour la modal d'envoi de notification à l'admin
  const [isSendNotifOpen, setIsSendNotifOpen] = useState(false);
  const [notifSubject, setNotifSubject] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifPriority, setNotifPriority] = useState('INFO');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  // Ref pour fermer le dropdown au clic extérieur
  const notificationRef = useRef(null);

  // Notifications du membre (backend)
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.lu).length;

  const loadNotifications = useCallback(async () => {
    try {
      const data = await listNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // Le bandeau reste silencieux : les vues détaillées affichent l'erreur.
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, NOTIFICATIONS_POLL_MS);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Rafraîchit le compteur quand le membre quitte le centre de notifications.
  useEffect(() => {
    if (activeTab !== 'notifications') loadNotifications();
  }, [activeTab, loadNotifications]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      loadNotifications();
    }
  };

  // Fermeture du dropdown notifications au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Soumission de la notification vers l'admin
  const handleSendToAdmin = async (e) => {
    e.preventDefault();
    if (!notifSubject.trim() || !notifMessage.trim()) return;

    setSending(true);
    setSendError('');
    try {
      await alertAdmin({
        subject: notifSubject.trim(),
        message: notifMessage.trim(),
        priority: notifPriority,
      });

      // Feedback visuel et réinitialisation
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setIsSendNotifOpen(false);
        setNotifSubject('');
        setNotifMessage('');
        setNotifPriority('INFO');
      }, 1500);
    } catch (err) {
      setSendError(extractErrorMessage(err, "Impossible d'envoyer l'alerte à l'administrateur."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* ================= SIDEBAR MEMBRE ================= */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Sidebar / Brand */}
          <div className="h-16 flex items-center px-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <img 
                src="/chu-logo.png" 
                alt="Logo CHU Mohammed VI" 
                className="h-10 w-auto object-contain shrink-0" 
              />
              <div>
                <span className="font-bold text-sm text-slate-900 tracking-tight block leading-none">
                  IT-CHU Manager
                </span>
                <span className="text-[10px] text-teal-600 font-semibold uppercase">Espace Membre</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              Mon Espace
            </p>
            <nav className="space-y-1">
              <SidebarItem 
                icon="📊" 
                label="Mon Tableau de Bord" 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
              />
              <SidebarItem 
                icon="📁" 
                label="Mes Projets" 
                active={activeTab === 'projects'} 
                onClick={() => setActiveTab('projects')} 
              />
              <SidebarItem 
                icon="☑️" 
                label="Mes Tâches & Kanban" 
                active={activeTab === 'tasks' || activeTab === 'kanban'} 
                onClick={() => setActiveTab('tasks')} 
              />
              <SidebarItem 
                icon="📅" 
                label="Réunions & Planning" 
                active={activeTab === 'meetings'} 
                onClick={() => setActiveTab('meetings')} 
              />
              <SidebarItem 
                icon="⚡" 
                label="Ma Charge de travail" 
                active={activeTab === 'workload'} 
                onClick={() => setActiveTab('workload')} 
              />

              {/* Item Notifications avec badge */}
              <button 
                onClick={() => setActiveTab('notifications')} 
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'notifications' 
                    ? 'bg-teal-50 text-teal-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>🔔</span>
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-amber-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              <SidebarItem 
                icon="🤖" 
                label="Assistant IA (Projets)" 
                active={activeTab === 'chatbot'} 
                onClick={() => setActiveTab('chatbot')} 
              />
            </nav>
          </div>
        </div>

        {/* Footer Sidebar : Profil utilisateur */}
        <div className="p-4 border-t border-slate-100">
          <div 
            onClick={onOpenProfile}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {user?.prenom?.[0] || 'M'}{user?.nom?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user ? `${user.prenom} ${user.nom}` : 'Membre IT'}
              </p>
              <p className="text-[10px] text-teal-600 font-medium">Gérer mon profil ⚙️</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= CONTENU PRINCIPAL ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 relative z-20">
          
          {/* Recherche */}
          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher mes tâches..." 
                className="w-full pl-8 pr-8 py-1.5 bg-slate-100 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white border border-transparent focus:border-teal-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Actions topbar */}
          <div className="flex items-center gap-3">
            
            {/* Bouton d'alerte admin */}
            <button
              onClick={() => setIsSendNotifOpen(true)}
              className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 px-3 py-1.5 rounded-md font-semibold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>📨</span>
              <span>Alerter l'Admin</span>
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* Menu Dropdown Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Panel Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[11px] text-teal-600 hover:underline cursor-pointer"
                      >
                        Tout lire
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">Aucune notification</p>
                    ) : (
                      notifications.map((n) => {
                        const details = notificationTypeDetails(n.type);
                        return (
                          <div 
                            key={n.id} 
                            className={`p-3 text-xs border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                              !n.lu ? 'bg-teal-50/20' : ''
                            }`}
                          >
                            <div className="flex justify-between font-semibold text-slate-800 mb-0.5">
                              <span className={
                                details.kind === 'danger' ? 'text-red-600' :
                                details.kind === 'warning' ? 'text-amber-600' : 'text-teal-600'
                              }>
                                {details.icon} {details.tag}
                              </span>
                              <span className="text-[10px] text-slate-400">{relativeTime(n.dateCreation)}</span>
                            </div>
                            <p className="text-slate-600">{n.message}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                    <button 
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        setActiveTab('notifications');
                      }}
                      className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Ouvrir le centre de notifications ➔
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Bouton Déconnexion */}
            <button 
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-1.5 rounded-md font-semibold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>🚪</span>
              <span>Déconnexion</span>
            </button>

          </div>
        </header>

        {/* CONTENU INJECTÉ */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50/50">
          {children}
        </main>
      </div>

      {/* ================= MODAL NOTIFICATION ADMIN ================= */}
      {isSendNotifOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">📨</span>
                <h3 className="font-bold text-sm">Envoyer une notification à l'Admin</h3>
              </div>
              <button 
                onClick={() => setIsSendNotifOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Corps Modal */}
            {sentSuccess ? (
              <div className="p-8 text-center space-y-3">
                <span className="text-4xl block animate-bounce">✅</span>
                <p className="font-bold text-slate-800 text-sm">Notification envoyée avec succès !</p>
                <p className="text-xs text-slate-500">L'administrateur recevra votre message immédiatement.</p>
              </div>
            ) : (
              <form onSubmit={handleSendToAdmin} className="p-5 space-y-4">
                {sendError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
                    {sendError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Niveau d'Urgence / Type
                  </label>
                  <select 
                    value={notifPriority}
                    onChange={(e) => setNotifPriority(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="INFO">ℹ️ Information simple</option>
                    <option value="WARNING">⚠️ Bloquant / Besoin d'aide</option>
                    <option value="URGENT">🚨 Urgent / Incident majeur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sujet de l'alerte
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Problème d'accès au serveur SQL..."
                    value={notifSubject}
                    onChange={(e) => setNotifSubject(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message détaillé
                  </label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Expliquez clairement votre demande ou la situation..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSendNotifOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {sending ? 'Envoi…' : 'Envoyer'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
        active 
          ? 'bg-teal-50 text-teal-700 font-semibold' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
