/**
 * Thin horizontal progress bar.
 */
export default function ProgressBar({ percent = 0, color = 'bg-blue-500', height = 'h-2', showLabel = false }) {
  const pct = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div className="w-full">
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 mt-0.5 text-right">{pct}%</p>
      )}
    </div>
  );
}
