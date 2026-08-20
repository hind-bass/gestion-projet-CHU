export const PRIORITY_VALUES = {
  BASSE: 1,
  MOYENNE: 2,
  HAUTE: 3,
  CRITIQUE: 4,
};

// Le backend expose `priorite` comme un nombre. Les jeux de données historiques
// utilisent un score normalisé entre 0 et 1, il est donc ramené sur l'échelle 1-4.
function normalize(priorite) {
  const value = Number(priorite);
  if (!Number.isFinite(value)) return null;
  if (value > 0 && value <= 1) return value * 4;
  return value;
}

export function priorityLabel(priorite) {
  const value = normalize(priorite);
  if (value === null) return 'NON DÉFINIE';
  if (value >= 4) return 'URGENTE';
  if (value >= 3) return 'HAUTE';
  if (value >= 2) return 'MOYENNE';
  return 'BASSE';
}

export function priorityBadgeClass(priorite) {
  switch (priorityLabel(priorite)) {
    case 'URGENTE':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'HAUTE':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'MOYENNE':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function isHighPriority(priorite) {
  const label = priorityLabel(priorite);
  return label === 'URGENTE' || label === 'HAUTE';
}
