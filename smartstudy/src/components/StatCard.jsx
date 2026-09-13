export default function StatCard({ label, value, sub, icon: Icon, iconClass = 'bg-blue-50 text-blue-600', trend }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      {Icon && (
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        {trend && <p className="text-xs text-green-600 mt-1 font-medium">{trend}</p>}
      </div>
    </div>
  );
}
