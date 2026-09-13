import { useState } from 'react';
import { Menu, Search, Database, Trash2, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConfirmDialog from './ConfirmDialog';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  subjects:  'Subjects',
  topics:    'Topics',
  planner:   'Study Planner',
  progress:  'Progress',
  insights:  'Smart Insights',
};

export default function Topbar({ currentPage, collapsed, setCollapsed, searchQuery, setSearchQuery }) {
  const { loadSampleData, clearAllData, subjects, topics } = useApp();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false);

  const hasData = subjects.length > 0 || topics.length > 0;
  const showSearch = ['topics', 'subjects', 'planner'].includes(currentPage);

  return (
    <>
      <header className="h-[60px] bg-white border-b border-slate-200 flex items-center gap-3 px-4 flex-shrink-0">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
          onClick={() => setCollapsed(c => !c)}
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <h1 className="text-base font-semibold text-slate-900 min-w-0 truncate">
          {PAGE_TITLES[currentPage] || currentPage}
        </h1>

        {/* Search (context-aware) */}
        {showSearch && (
          <div className="flex-1 max-w-xs hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none w-full placeholder-slate-400"
            />
          </div>
        )}

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLoadConfirm(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <Database size={13} />
            <span>Sample Data</span>
          </button>

          {hasData && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg transition-colors"
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          )}

          {/* Mobile: compact icon buttons */}
          <button
            onClick={() => setShowLoadConfirm(true)}
            className="sm:hidden p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
            title="Load Sample Data"
          >
            <Database size={16} />
          </button>

          {/* Profile chip */}
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
              <User size={14} className="text-slate-500" />
            </div>
            <span className="hidden md:block text-xs font-medium text-slate-700">Student</span>
          </div>
        </div>
      </header>

      {/* Load Sample Data confirm */}
      <ConfirmDialog
        open={showLoadConfirm}
        title="Load Sample Data"
        message={
          hasData
            ? 'This will replace your current data with 5 sample subjects and 15 topics. Continue?'
            : 'Load 5 sample subjects and 15 topics to explore SmartStudy?'
        }
        confirmLabel="Load Sample Data"
        confirmClass="bg-blue-600 hover:bg-blue-700 text-white"
        onConfirm={() => { loadSampleData(); setShowLoadConfirm(false); }}
        onCancel={() => setShowLoadConfirm(false)}
      />

      {/* Clear All confirm */}
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear All Data"
        message="This will permanently delete all subjects and topics. This action cannot be undone."
        confirmLabel="Clear All Data"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        onConfirm={() => { clearAllData(); setShowClearConfirm(false); }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
}
