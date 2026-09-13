/**
 * Generate a lightweight unique ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Format a date string (YYYY-MM-DD) to a readable label
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * How many days from today to a date string (YYYY-MM-DD)
 * Returns null if date is missing/invalid
 */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  } catch {
    return null;
  }
}

/**
 * Returns a human-readable "days until" label
 */
export function daysUntilLabel(dateStr) {
  const n = daysUntil(dateStr);
  if (n === null) return 'No exam date';
  if (n < 0) return `${Math.abs(n)}d ago`;
  if (n === 0) return 'Today!';
  if (n === 1) return 'Tomorrow';
  return `${n}d left`;
}

/**
 * Returns a CSS color class for urgency
 */
export function urgencyColor(dateStr) {
  const n = daysUntil(dateStr);
  if (n === null) return 'text-slate-400';
  if (n <= 3) return 'text-red-600';
  if (n <= 7) return 'text-orange-500';
  if (n <= 14) return 'text-yellow-600';
  return 'text-slate-500';
}

/**
 * Clamp a value between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Calculate completion percentage
 */
export function calcPercent(completed, total) {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
}
