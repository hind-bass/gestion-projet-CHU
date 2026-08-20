import React, { useCallback, useEffect, useState } from 'react';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api/notifications';
import { extractErrorMessage } from '../../lib/api';
import {
  HIGH_PRIORITY_NOTIFICATION_TYPES,
  notificationTypeDetails,
  relativeTime,
} from '../../lib/labels';

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UNREAD', 'HIGH'

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger vos notifications.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Marquer une notification comme lue
  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de marquer cette notification comme lue.'));
      load();
    }
  };

  // Tout marquer comme lu
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de marquer les notifications comme lues.'));
      load();
    }
  };

  const isHigh = (notif) => HIGH_PRIORITY_NOTIFICATION_TYPES.includes(notif.type);

  // Filtrage des notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.lu;
    if (filter === 'HIGH') return isHigh(n);
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.lu).length;

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
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={load}
            className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            ⟳ Rafraîchir
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              ✓ Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

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
          Prioritaires 🔥 ({notifications.filter(isHigh).length})
        </button>
      </div>

      {/* Liste des Notifications */}
      <div className="space-y-3">
        {loading && (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Chargement de vos notifications…
          </div>
        )}

        {!loading && filteredNotifications.map((notif) => {
          const typeInfo = notificationTypeDetails(notif.type);

          return (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                notif.lu ? 'bg-white border-slate-200 opacity-80' : `${typeInfo.bg} ${typeInfo.border} shadow-2xs`
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icône du type */}
                <div className="text-xl shrink-0 mt-0.5">{typeInfo.icon}</div>

                <div className="space-y-1">
                  {/* Tag & Horodatage */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${typeInfo.border} ${typeInfo.text}`}>
                      {typeInfo.tag}
                    </span>
                    {notif.lienReference && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        🔗 {notif.lienReference}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      • {relativeTime(notif.dateCreation)}
                    </span>
                  </div>

                  {/* Message */}
                  <p className={`text-xs leading-relaxed ${notif.lu ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                    {notif.message}
                  </p>
                </div>
              </div>

              {/* Actions à droite */}
              <div className="flex items-center gap-2 shrink-0">
                {!notif.lu && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    title="Marquer comme lu"
                    className="p-1.5 hover:bg-white/80 rounded-lg text-slate-400 hover:text-teal-700 text-xs transition-colors"
                  >
                    ✓
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {!loading && filteredNotifications.length === 0 && !error && (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Aucune notification ne correspond à ce filtre.
          </div>
        )}
      </div>

    </div>
  );
}
