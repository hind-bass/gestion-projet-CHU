import React, { useState } from 'react';

export default function AdminLayout({ children, user, activeTab, setActiveTab, onOpenProfile, onLogout }) {
  // États pour les éléments interactifs de la Topbar
  const [selectedProject, setSelectedProject] = useState('Refonte SI Hospitalier');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // État pour la modal d'envoi de notification
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Liste factice des membres IT ciblables
  const teamMembers = [
    { id: 1, nom: 'Alami', prenom: 'Youssef' },
    { id: 2, nom: 'Chraibi', prenom: 'Sanaa' },
    { id: 3, nom: 'Benali', prenom: 'Karim' }
  ];

  // Formulaire d'envoi de notification
  const [newNotification, setNewNotification] = useState({
    recipientId: 'all', // 'all' ou ID d'un membre
    title: '',
    message: ''
  });

  // Liste des projets factices
  const projects = [
    'Refonte SI Hospitalier',
    'Déploiement Réseau CHU',
    'Sécurisation DSI & Logs',
    'Gestion Patient Mobile'
  ];

  // Liste des notifications avec champ recipientId
  const [notifications, setNotifications] = useState([
    { id: 1, recipientId: 'all', title: 'Serveur principal', message: 'Surcharge CPU détectée', time: '5m', read: false },
    { id: 2, recipientId: 2, title: 'Projet SI', message: 'Nouvelle tâche assignée', time: '1h', read: false },
    { id: 3, recipientId: 'all', title: 'Sauvegarde', message: 'Sauvegarde réussie à 03:00', time: '3h', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Soumission de la nouvelle notification
  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!newNotification.title || !newNotification.message) return;

    const notificationToAdd = {
      id: Date.now(),
      recipientId: newNotification.recipientId === 'all' ? 'all' : Number(newNotification.recipientId),
      title: newNotification.title,
      message: newNotification.message,
      time: 'À l’instant',
      read: false
    };

    setNotifications([notificationToAdd, ...notifications]);
    setNewNotification({ recipientId: 'all', title: '', message: '' });
    setIsSendModalOpen(false);
  };

  // Helper pour vérifier si l'onglet Chronologie est actif
  const isTimelineActive = activeTab === 'timeline' || activeTab === 'planning' || activeTab === 'chronologie';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* ================= SIDEBAR GAUCHE ================= */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between">
        <div>
          {/* Header de la Sidebar / Brand */}
          <div className="h-16 flex items-center px-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <img 
                src="/chu-logo.png" 
                alt="Logo CHU Mohammed VI" 
                className="h-11 w-auto object-contain shrink-0" 
              />
              <span className="font-bold text-base text-slate-900 tracking-tight leading-tight">
                IT-CHU Manager
              </span>
            </div>
          </div>

          {/* Section Projets / Vues d'ensemble */}
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              Vues d'ensemble
            </p>
            <nav className="space-y-1">
              <SidebarItem 
                icon="📊" 
                label="Dashboard Global" 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
              />
              <SidebarItem 
                icon="📋" 
                label="Tableau Kanban" 
                active={activeTab === 'kanban'} 
                onClick={() => setActiveTab('kanban')} 
              />
              <SidebarItem 
                icon="☑️" 
                label="Liste des Tâches" 
                active={activeTab === 'tasks'} 
                onClick={() => setActiveTab('tasks')} 
              />
              <SidebarItem 
                icon="📅" 
                label="Chronologie / Planning" 
                active={isTimelineActive} 
                onClick={() => setActiveTab('timeline')} 
              />
              <SidebarItem 
                icon="🤝" 
                label="Réunions & IA" 
                active={activeTab === 'meetings'} 
                onClick={() => setActiveTab('meetings')} 
              />
            </nav>

            <div className="my-6 border-t border-slate-100" />

            {/* Section Administration CHU */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              Administration IT
            </p>
            <nav className="space-y-1">
              <SidebarItem 
                icon="📁" 
                label="Gestion Projets" 
                active={activeTab === 'projects'} 
                onClick={() => setActiveTab('projects')} 
              />
              <SidebarItem 
                icon="👥" 
                label="Gestion Équipe" 
                active={activeTab === 'team'} 
                onClick={() => setActiveTab('team')} 
              />
              <SidebarItem 
                icon="📜" 
                label="Journal d'audit (Logs)" 
                active={activeTab === 'logs'} 
                onClick={() => setActiveTab('logs')} 
              />
              <SidebarItem 
                icon="🤖" 
                label="Assistant Chatbot" 
                active={activeTab === 'chatbot' || activeTab === 'chat' || activeTab === 'assistant'} 
                onClick={() => setActiveTab('chatbot')}
              />
            </nav>
          </div>
        </div>
      </aside>

      {/* ================= CONTENU PRINCIPAL ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 relative z-20">
          
          {/* Sélecteur de Projet + Recherche Interactifs */}
          <div className="flex items-center gap-6">

            {/* Barre de Recherche */}
            <div className="relative w-64">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher tâche, projet..." 
                className="w-full pl-8 pr-8 py-1.5 bg-slate-100 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border border-transparent focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Actions, Notifications & Profil */}
          <div className="flex items-center gap-4">
            
            {/* Bouton Déconnexion */}
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3.5 py-1.5 rounded-md font-semibold text-sm transition-all active:scale-95 shadow-xs"
            >
              <span>🚪</span>
              <span>Déconnexion</span>
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* Notifications Interactives */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Panel Notifications */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          setIsSendModalOpen(true);
                        }}
                        className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded transition-colors"
                      >
                        ➕ Envoyer
                      </button>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[11px] text-blue-600 hover:underline"
                        >
                          Tout lire
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => {
                      const recipient = teamMembers.find(m => m.id === n.recipientId);
                      return (
                        <div 
                          key={n.id} 
                          className={`p-3 text-xs border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                            !n.read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="flex justify-between font-semibold text-slate-800 mb-0.5">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-slate-600">{n.message}</p>
                          {n.recipientId !== 'all' && recipient && (
                            <span className="inline-block mt-1 text-[10px] bg-purple-50 text-purple-700 font-medium px-1.5 py-0.5 rounded border border-purple-200">
                              Pour : {recipient.prenom} {recipient.nom}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Utilisateur / Profil */}
            <div 
              onClick={onOpenProfile}
              className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs ring-2 ring-blue-500/30">
                {user?.prenom?.[0] || 'U'}{user?.nom?.[0] || 'S'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none">
                  {user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {user?.role === 'ADMIN' ? 'Admin IT-CHU' : 'Membre IT'}
                </p>
              </div>
            </div>

          </div>
        </header>

        {/* CONTENU DE LA PAGE EN COURS */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* MODAL ENVOI NOTIFICATION AU MEMBRE */}
      {isSendModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Envoyer une notification</h3>
              <button onClick={() => setIsSendModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSendNotification} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Destinataire</label>
                <select
                  value={newNotification.recipientId}
                  onChange={(e) => setNewNotification({ ...newNotification, recipientId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">Tous les membres</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.prenom} {m.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Titre / Sujet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mise à jour système"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Saisissez le contenu du message..."
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  Envoyer
                </button>
              </div>
            </form>
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
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-600 font-semibold' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}