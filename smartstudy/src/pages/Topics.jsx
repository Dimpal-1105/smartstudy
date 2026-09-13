import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, CheckSquare, Square, ListChecks, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { DifficultyBadge, PriorityBadge, StatusBadge } from '../components/Badge';
import { formatDate, daysUntilLabel, urgencyColor } from '../utils/helpers';

const DEFAULT_FORM = {
  subjectId: '',
  name: '',
  difficulty: 'Medium',
  priority: 'Medium',
  examDate: '',
  estimatedHours: '',
};

function TopicForm({ initial = DEFAULT_FORM, subjects, onSave, onCancel }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initial });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Topic name is required';
    if (!form.subjectId) e.subjectId = 'Please select a subject';
    if (form.estimatedHours && (isNaN(form.estimatedHours) || Number(form.estimatedHours) <= 0))
      e.estimatedHours = 'Must be a positive number';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      subjectId: form.subjectId,
      name: form.name.trim(),
      difficulty: form.difficulty,
      priority: form.priority,
      examDate: form.examDate || null,
      estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : null,
    });
  };

  const fieldClass = (field) =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors
    ${errors[field] ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Subject */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Subject <span className="text-red-500">*</span>
        </label>
        <select value={form.subjectId} onChange={set('subjectId')} className={fieldClass('subjectId')}>
          <option value="">— Select subject —</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {errors.subjectId && <p className="text-xs text-red-500 mt-1">{errors.subjectId}</p>}
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Topic Name <span className="text-red-500">*</span>
        </label>
        <input type="text" value={form.name} onChange={set('name')}
          placeholder="e.g. Differential Calculus"
          className={fieldClass('name')} autoFocus />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Difficulty + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Difficulty</label>
          <select value={form.difficulty} onChange={set('difficulty')} className={fieldClass('difficulty')}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
          <select value={form.priority} onChange={set('priority')} className={fieldClass('priority')}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>

      {/* Exam Date + Estimated Hours */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Exam Date</label>
          <input type="date" value={form.examDate || ''} onChange={set('examDate')}
            className={fieldClass('examDate')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Est. Hours</label>
          <input type="number" value={form.estimatedHours || ''} onChange={set('estimatedHours')}
            placeholder="e.g. 3" min="0.5" step="0.5"
            className={fieldClass('estimatedHours')} />
          {errors.estimatedHours && <p className="text-xs text-red-500 mt-1">{errors.estimatedHours}</p>}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Save Topic
        </button>
      </div>
    </form>
  );
}

export default function Topics({ searchQuery }) {
  const { subjects, topics, addTopic, updateTopic, deleteTopic, toggleTopicComplete } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  const subjectMap = useMemo(() =>
    Object.fromEntries(subjects.map(s => [s.id, s])), [subjects]);

  const filtered = useMemo(() => {
    const q = searchQuery?.toLowerCase() || '';
    return topics.filter(t => {
      if (q && !t.name.toLowerCase().includes(q) &&
          !(subjectMap[t.subjectId]?.name.toLowerCase().includes(q))) return false;
      if (filterSubject && t.subjectId !== filterSubject) return false;
      if (filterStatus === 'complete' && !t.completed) return false;
      if (filterStatus === 'incomplete' && t.completed) return false;
      if (filterDifficulty && t.difficulty !== filterDifficulty) return false;
      return true;
    });
  }, [topics, searchQuery, subjectMap, filterSubject, filterStatus, filterDifficulty]);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (t) => { setEditTarget(t); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleSave = (data) => {
    if (editTarget) updateTopic(editTarget.id, data);
    else addTopic(data);
    closeModal();
  };

  const hasFilters = filterSubject || filterStatus || filterDifficulty;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Topics</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} of {topics.length} topic{topics.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Plus size={16} /> Add Topic
        </button>
      </div>

      {/* Filters */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5 p-3 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter size={13} /> Filters:
          </div>
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            className="px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700">
            <option value="">All Status</option>
            <option value="incomplete">Incomplete</option>
            <option value="complete">Complete</option>
          </select>
          <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
            className="px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700">
            <option value="">All Difficulty</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          {hasFilters && (
            <button onClick={() => { setFilterSubject(''); setFilterStatus(''); setFilterDifficulty(''); }}
              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Empty states */}
      {topics.length === 0 && (
        <EmptyState
          icon={ListChecks}
          title="No topics yet"
          description={subjects.length === 0
            ? "Add a subject first, then start adding topics."
            : "Add your first topic to start studying."}
          action={subjects.length > 0 ? openAdd : undefined}
          actionLabel="Add Topic"
        />
      )}

      {topics.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={ListChecks}
          title="No topics match your filters"
          description="Try adjusting your search or filters."
        />
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8"></th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Topic</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Difficulty</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Exam Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Hours</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(topic => {
                  const subject = subjectMap[topic.subjectId];
                  return (
                    <tr key={topic.id}
                      className={`hover:bg-slate-50 transition-colors ${topic.completed ? 'opacity-60' : ''}`}>
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <button onClick={() => toggleTopicComplete(topic.id)}
                          className="text-slate-400 hover:text-blue-600 transition-colors">
                          {topic.completed
                            ? <CheckSquare size={17} className="text-green-500" />
                            : <Square size={17} />}
                        </button>
                      </td>
                      {/* Name */}
                      <td className="px-4 py-3">
                        <span className={`font-medium text-slate-900 ${topic.completed ? 'line-through' : ''}`}>
                          {topic.name}
                        </span>
                      </td>
                      {/* Subject */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {subject ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: subject.color }} />
                            <span className="text-slate-600 text-xs">{subject.name}</span>
                          </div>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      {/* Difficulty */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <DifficultyBadge value={topic.difficulty} />
                      </td>
                      {/* Priority */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <PriorityBadge value={topic.priority} />
                      </td>
                      {/* Exam date */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {topic.examDate ? (
                          <span className={`text-xs ${urgencyColor(topic.examDate)}`}>
                            {formatDate(topic.examDate)}
                            <span className="block text-slate-400">{daysUntilLabel(topic.examDate)}</span>
                          </span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      {/* Hours */}
                      <td className="px-4 py-3 text-xs text-slate-600 hidden lg:table-cell">
                        {topic.estimatedHours ? `${topic.estimatedHours}h` : '—'}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge completed={topic.completed} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(topic)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(topic)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={modalOpen}
        title={editTarget ? 'Edit Topic' : 'Add Topic'}
        onClose={closeModal}
        size="max-w-lg"
      >
        <TopicForm
          initial={editTarget || DEFAULT_FORM}
          subjects={subjects}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Topic"
        message={deleteTarget ? `Delete "${deleteTarget.name}"?` : ''}
        confirmLabel="Delete Topic"
        onConfirm={() => { deleteTopic(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
