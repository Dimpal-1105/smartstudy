/**
 * Small pill badge for difficulty, priority, status, etc.
 */

const DIFFICULTY_CLASSES = {
  Easy:   'bg-green-50 text-green-700 border-green-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Hard:   'bg-red-50 text-red-700 border-red-200',
};

const PRIORITY_CLASSES = {
  Low:    'bg-slate-50 text-slate-600 border-slate-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  High:   'bg-purple-50 text-purple-700 border-purple-200',
};

const STATUS_CLASSES = {
  completed:  'bg-green-50 text-green-700 border-green-200',
  incomplete: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function DifficultyBadge({ value }) {
  const cls = DIFFICULTY_CLASSES[value] || 'bg-slate-50 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {value || '—'}
    </span>
  );
}

export function PriorityBadge({ value }) {
  const cls = PRIORITY_CLASSES[value] || 'bg-slate-50 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {value || '—'}
    </span>
  );
}

export function StatusBadge({ completed }) {
  const cls = completed ? STATUS_CLASSES.completed : STATUS_CLASSES.incomplete;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {completed ? '✓ Done' : 'In Progress'}
    </span>
  );
}

/** Generic badge for arbitrary labels */
export function Badge({ label, className = 'bg-slate-100 text-slate-600' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
