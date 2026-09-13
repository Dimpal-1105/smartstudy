import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { calcPercent } from '../utils/helpers';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444',
  '#06b6d4', '#f97316', '#84cc16', '#e879f9', '#14b8a6',
];

const DEFAULT_FORM = { name: '', color: COLORS[0] };

function SubjectForm({ initial = DEFAULT_FORM, onSave, onCancel }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initial });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Subject name is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSave({ name: form.name.trim(), color: form.color });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Subject Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Mathematics"
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors
            ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
          autoFocus
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setForm(f => ({ ...f, color: c }))}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Save Subject
        </button>
      </div>
    </form>
  );
}

export default function Subjects({ searchQuery }) {
  const { subjects, topics, addSubject, updateSubject, deleteSubject } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = searchQuery?.toLowerCase() || '';
    if (!q) return subjects;
    return subjects.filter(s => s.name.toLowerCase().includes(q));
  }, [subjects, searchQuery]);

  const getStats = (subjectId) => {
    const sTopics = topics.filter(t => t.subjectId === subjectId);
    const done = sTopics.filter(t => t.completed).length;
    return { total: sTopics.length, done, pct: calcPercent(done, sTopics.length) };
  };

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (s) => { setEditTarget(s); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleSave = (data) => {
    if (editTarget) updateSubject(editTarget.id, data);
    else addSubject(data);
    closeModal();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Subjects</h2>
          <p className="text-sm text-slate-500 mt-0.5">{subjects.length} subject{subjects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {/* Empty state */}
      {subjects.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Add your first subject to start organizing your study plan."
          action={openAdd}
          actionLabel="Add Subject"
        />
      )}

      {/* No results */}
      {subjects.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No subjects match your search"
          description="Try a different search term."
        />
      )}

      {/* Subject grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(subject => {
            const { total, done, pct } = getStats(subject.id);
            return (
              <div key={subject.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                {/* Color bar */}
                <div
                  className="w-full h-1 rounded-full mb-4"
                  style={{ backgroundColor: subject.color }}
                />

                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: subject.color + '20' }}
                    >
                      <Circle size={14} style={{ color: subject.color }} fill={subject.color} />
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate">{subject.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(subject)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(subject)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>{total} topic{total !== 1 ? 's' : ''}</span>
                  <span className="font-medium text-slate-700">{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: subject.color }}
                  />
                </div>

                <p className="text-xs text-slate-400 mt-2">{done} of {total} completed</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        title={editTarget ? 'Edit Subject' : 'Add Subject'}
        onClose={closeModal}
        size="max-w-md"
      >
        <SubjectForm
          initial={editTarget || DEFAULT_FORM}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Subject"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This will also delete all its topics.`
            : ''
        }
        confirmLabel="Delete Subject"
        onConfirm={() => { deleteSubject(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
