export const TASK_STATUSES = ['A_FAIRE', 'EN_COURS', 'EN_REVUE', 'TERMINEE'];

export const TASK_STATUS_LABELS = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  EN_REVUE: 'En revue',
  TERMINEE: 'Terminée',
};

export const TASK_STATUS_ICONS = {
  A_FAIRE: '⏳',
  EN_COURS: '🚀',
  EN_REVUE: '🔍',
  TERMINEE: '✅',
};

export const TASK_STATUS_BADGES = {
  A_FAIRE: 'bg-slate-200 text-slate-800',
  EN_COURS: 'bg-blue-100 text-blue-800',
  EN_REVUE: 'bg-amber-100 text-amber-800',
  TERMINEE: 'bg-emerald-100 text-emerald-800',
};

export const PROJECT_STATUS_LABELS = {
  ACTIF: 'Actif',
  EN_PAUSE: 'En pause',
  TERMINE: 'Terminé',
  ARCHIVE: 'Archivé',
};

export function projectStatusBadgeClass(statut) {
  switch (statut) {
    case 'ACTIF':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'EN_PAUSE':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'TERMINE':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export const PROJECT_PRIORITY_LABELS = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique',
};

export const NOTIFICATION_TYPE_DETAILS = {
  RETARD: { icon: '🚨', tag: 'En retard', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', kind: 'danger' },
  SURCHARGE: { icon: '⚠️', tag: 'Surcharge', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', kind: 'warning' },
  DECISION_NON_TRAITEE: { icon: '📝', tag: 'Décision', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', kind: 'info' },
  REUNION: { icon: '📅', tag: 'Réunion', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', kind: 'info' },
  TACHE: { icon: '☑️', tag: 'Tâche', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', kind: 'info' },
  SYSTEME: { icon: '🔔', tag: 'Système', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', kind: 'info' },
};

export function notificationTypeDetails(type) {
  return NOTIFICATION_TYPE_DETAILS[type] || NOTIFICATION_TYPE_DETAILS.SYSTEME;
}

export const HIGH_PRIORITY_NOTIFICATION_TYPES = ['RETARD', 'SURCHARGE'];

export function roleLabel(role) {
  return role === 'ADMIN' ? 'Administrateur' : 'Membre d\u2019équipe';
}

export function fullName(user) {
  if (!user) return '';
  return [user.prenom, user.nom].filter(Boolean).join(' ');
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function relativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "à l'instant";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.round(diffHours / 24)}j`;
}

export function dueDateLabel(value) {
  if (!value) return 'Sans échéance';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const today = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(date) - startOfDay(today)) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Demain';
  if (diffDays === -1) return 'Hier';
  if (diffDays < 0) return `En retard de ${Math.abs(diffDays)}j`;
  return formatDate(value);
}
