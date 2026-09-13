import {
  LayoutDashboard,
  BookOpen,
  ListChecks,
  CalendarDays,
  BarChart2,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'subjects',   label: 'Subjects',        icon: BookOpen },
  { id: 'topics',     label: 'Topics',          icon: ListChecks },
  { id: 'planner',    label: 'Study Planner',   icon: CalendarDays },
  { id: 'progress',   label: 'Progress',        icon: BarChart2 },
  { id: 'insights',   label: 'Smart Insights',  icon: Lightbulb },
];

export default function Sidebar({ currentPage, setPage, collapsed, setCollapsed }) {
  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-white border-r border-slate-200
          transition-all duration-200 ease-in-out
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-60'}
        `}
      >
        {/* Logo / brand */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100 min-h-[60px]">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-slate-900 text-sm tracking-tight">SmartStudy</span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                title={collapsed ? label : undefined}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium
                  transition-colors rounded-none
                  ${active
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex justify-end px-3 py-3 border-t border-slate-100">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
