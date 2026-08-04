import React, { useState } from 'react';

export default function UserNotifications({ user }) {
  // Notifications intelligentes générées pour le membre
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'OVERDUE', // Tâche en retard
      title: 'Tâche en retard !',
      message: 'La tâche "Mise à jour des patchs de sécurité" a dépassé son échéance fixée à hier 18h00.',
      project: 'Sécurisation DSI & Logs',
      time: 'Il y a 2 heures',
      read: false,
      priority: 'HIGH',
      actionUrl: '/user/tasks'
    },
    {
      id: 2,
      type: 'WORKLOAD_WARNING', // Alerte Surcharge
      title: 'Alerte Surcharge de Travail',
      message: 'Votre charge hebdomadaire atteint 88% (31h / 35h). Vous approchez de la capacité maximale.',
      project: 'Général DSI',
      time: 'Ce matin à 08:30',
      read: false,
      priority: 'HIGH',
      actionUrl: '/user/workload'
    },
    {
      id: 3,
      type: 'DUE_SOON', // Échéance proche
      title: 'Échéance Imminente',
      message: 'La tâche "Configuration des VLANs - Bâtiment Chirurgie" doit être livrée demain.',
      project: 'Déploiement Réseau CHU',
      time: 'Hier à 16:45',
      read: true,
      priority: 'MEDIUM',
      actionUrl: '/user/tasks'
    },
    {
      id: 4,
      type: 'MEETING_REMINDER', // Rappel Réunion
      title: 'Réunion dans 30 minutes',
      message: 'Point d\'avancement - Refonte SI Hospitalier commence à 10h00 en Salle B / Teams.',
      project: 'Refonte SI Hospitalier',
      time: 'Il y a 10 min',
      read: false,
      priority: 'MEDIUM',
      actionUrl: '/user/meetings'
    }
  ]);

  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UNREAD', 'HIGH'

  // Marquer une notification comme lue
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Tout marquer comme lu
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Supprimer une notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Filtrage des notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'HIGH') return n.priority === 'HIGH';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Icône et badge selon le type
  const getTypeDetails = (type) => {
    switch (type) {
      case 'OVERDUE':
        return { icon: '🚨', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', tag: 'En retard' };
      case 'WORKLOAD_WARNING':
        return { icon: '⚠️', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', tag: 'Surcharge' };
      case 'DUE_SOON':
        return { icon: '⏳', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', tag: 'Échéance' };
      case 'MEETING_REMINDER':
        return { icon: '📅', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', tag: 'Réunion' };
      default:
        return { icon: '🔔', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', tag: 'Info' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* En-tête de la page */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Notifications Intelligentes</h1>
            <p className="text-xs text-slate-500">
              Alertes automatiques sur vos échéances, réunions et votre niveau de charge.
            </p>
          </div>
        </div>

        {/* Actions d'en-tête */}
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
          >
            ✓ Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Onglets de filtre */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'UNREAD' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Non lues ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('HIGH')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'HIGH' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Prioritaires 🔥 ({notifications.filter(n => n.priority === 'HIGH').length})
        </button>
      </div>

      {/* Liste des Notifications */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => {
          const typeInfo = getTypeDetails(notif.type);

          return (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                notif.read ? 'bg-white border-slate-200 opacity-80' : `${typeInfo.bg} ${typeInfo.border} shadow-2xs`
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icône du type */}
                <div className="text-xl shrink-0 mt-0.5">{typeInfo.icon}</div>

                <div className="space-y-1">
                  {/* Tag & Projet */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${typeInfo.border} ${typeInfo.text}`}>
                      {typeInfo.tag}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      📁 {notif.project}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      • {notif.time}
                    </span>
                  </div>

                  {/* Titre & Message */}
                  <h3 className={`text-xs font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notif.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>

              {/* Actions à droite */}
              <div className="flex items-center gap-2 shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    title="Marquer comme lu"
                    className="p-1.5 hover:bg-white/80 rounded-lg text-slate-400 hover:text-teal-700 text-xs transition-colors"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  title="Supprimer"
                  className="p-1.5 hover:bg-white/80 rounded-lg text-slate-400 hover:text-red-600 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Aucune notification ne correspond à ce filtre.
          </div>
        )}
      </div>

    </div>
  );
}