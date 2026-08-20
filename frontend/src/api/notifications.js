import api from '../lib/api';

export async function listNotifications({ unreadOnly = false } = {}) {
  const { data } = await api.get('/notifications', { params: { unreadOnly } });
  return data;
}

export async function getUnreadCount() {
  const { data } = await api.get('/notifications/unread-count');
  return data?.count ?? 0;
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch('/notifications/read-all');
  return data;
}

export async function alertAdmin({ subject, message, priority = 'INFO' }) {
  const { data } = await api.post('/notifications/alert-admin', { subject, message, priority });
  return data;
}
