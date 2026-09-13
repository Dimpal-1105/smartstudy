import { useMemo } from 'react';
import {
  Lightbulb, AlertTriangle, TrendingDown, Zap, Trophy,
  CalendarDays, Clock, BookOpen, CheckCircle2, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import { DifficultyBadge, PriorityBadge } from '../components/Badge';
import { getRecommendations } from '../engine/recommendationEngine';
import { formatDate, daysUntilLabel, daysUntil, calcPercent } from '../utils/helpers';

function InsightCard({ icon: Icon, iconClass, title, value, sub, tag, tagClass }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-sm font-semibold text-slate-900 leading-snug">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          {tag && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${tagClass}`}>
              {tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Insights({ setPage }) {
  const { subjects, topics } = useApp();

  const subjectMap = useMemo(() =>
    Object.fromEntries(subjects.map(s => [s.id, s])), [subjects]);

  const incompleteTopics = topics.filter(t => !t.completed);
  const completedTopics  = topics.filter(t => t.completed);

  const recommendations = useMemo(() =>
    getRecommendations(topics, subjects), [topics, subjects]);

  const topRec = recommendations[0] || null;

  // Most urgent (incomplete, closest exam)
  const mostUrgent = useMemo(() => {
    return incompleteTopics
      .filter(t => t.examDate)
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0] || null;
  }, [incompleteTopics]);

  // Hardest unfinished topic
  const hardest = useMemo(() => {
    const h = incompleteTopics.filter(t => t.difficulty === 'Hard');
    if (h.length) return h[0];
    const m = incompleteTopics.filter(t => t.difficulty === 'Medium');
    if (m.length) return m[0];
    return incompleteTopics[0] || null;
  }, [incompleteTopics]);

  // Highest priority incomplete
  const highestPriority = useMemo(() => {
    const h = incompleteTopics.filter(t => t.priority === 'High');
    return h[0] || incompleteTopics.find(t => t.priority === 'Medium') || incompleteTopics[0] || null;
  }, [incompleteTopics]);

  // Subject with lowest progress
  const lowestProgressSubject = useMemo(() => {
    if (!subjects.length) return null;
    return subjects
      .map(s => {
        const st = topics.filter(t => t.subjectId === s.id);
        const done = st.filter(t => t.completed).length;
        return { ...s, pct: calcPercent(done, st.length), total: st.length };
      })
      .filter(s => s.total > 0)
      .sort((a, b) => a.pct - b.pct)[0] || null;
  }, [subjects, topics]);

  // Most urgent subject (subject whose next exam is soonest)
  const mostUrgentSubject = useMemo(() => {
    if (!subjects.length) return null;
    let best = null;
    let bestDays = Infinity;
    for (const t of incompleteTopics) {
      if (!t.examDate) continue;
      const d = daysUntil(t.examDate);
      if (d !== null && d < bestDays) {
        bestDays = d;
        best = subjectMap[t.subjectId] || null;
      }
    }
    return best ? { ...best, days: bestDays } : null;
  }, [subjects, incompleteTopics, subjectMap]);

  // Topics due this week
  const dueThisWeek = useMemo(() =>
    incompleteTopics.filter(t => {
      const d = daysUntil(t.examDate);
      return d !== null && d >= 0 && d <= 7;
    }).length, [incompleteTopics]);

  // Average estimated hours remaining
  const hoursRemaining = useMemo(() => {
    const h = incompleteTopics.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);
    return h;
  }, [incompleteTopics]);

  const hasAnyData = subjects.length > 0 || topics.length > 0;

  if (!hasAnyData) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No data to analyze"
        description="Add subjects and topics to get smart insights about your study plan."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Smart Insights</h2>
        <p className="text-sm text-slate-500 mt-0.5">Rule-based analysis of your study data — not an external AI model.</p>
      </div>

      {/* Disclaimer banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          These insights are generated by a <strong>deterministic rule-based recommendation engine</strong> using
          exam urgency, difficulty, priority, and estimated study time. No external AI API is used.
        </p>
      </div>

      {/* No incomplete topics */}
      {incompleteTopics.length === 0 && topics.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle2 size={28} className="text-green-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-green-800 mb-1">All topics completed!</h3>
          <p className="text-sm text-green-600">No pending study items. Excellent work!</p>
        </div>
      )}

      {/* Summary stats */}
      {incompleteTopics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{incompleteTopics.length}</p>
            <p className="text-xs text-slate-500 mt-1">Topics remaining</p>
          </div>
          <div className={`rounded-xl border p-4 text-center ${dueThisWeek > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
            <p className={`text-2xl font-bold ${dueThisWeek > 0 ? 'text-red-700' : 'text-slate-900'}`}>{dueThisWeek}</p>
            <p className={`text-xs mt-1 ${dueThisWeek > 0 ? 'text-red-600' : 'text-slate-500'}`}>Due this week</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{hoursRemaining}h</p>
            <p className="text-xs text-slate-500 mt-1">Est. hours left</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{completedTopics.length}</p>
            <p className="text-xs text-slate-500 mt-1">Completed</p>
          </div>
        </div>
      )}

      {/* Insight grid */}
      {incompleteTopics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Top recommendation */}
          {topRec && (
            <InsightCard
              icon={Zap}
              iconClass="bg-amber-50 text-amber-600"
              title="Top Recommendation"
              value={topRec.topic.name}
              sub={`${topRec.subject?.name || '—'} · Score ${topRec.score.toFixed(1)}`}
              tag={topRec.reason}
              tagClass="bg-amber-50 text-amber-700 border border-amber-200"
            />
          )}

          {/* Most urgent */}
          {mostUrgent && (
            <InsightCard
              icon={AlertTriangle}
              iconClass="bg-red-50 text-red-600"
              title="Most Urgent Exam"
              value={mostUrgent.name}
              sub={`${subjectMap[mostUrgent.subjectId]?.name || '—'} · ${formatDate(mostUrgent.examDate)}`}
              tag={daysUntilLabel(mostUrgent.examDate)}
              tagClass={`${daysUntil(mostUrgent.examDate) <= 3 ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}
            />
          )}

          {/* Hardest unfinished */}
          {hardest && (
            <InsightCard
              icon={TrendingDown}
              iconClass="bg-purple-50 text-purple-600"
              title="Hardest Remaining Topic"
              value={hardest.name}
              sub={`${subjectMap[hardest.subjectId]?.name || '—'}`}
              tag={hardest.difficulty}
              tagClass={hardest.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}
            />
          )}

          {/* Highest priority */}
          {highestPriority && (
            <InsightCard
              icon={Trophy}
              iconClass="bg-green-50 text-green-600"
              title="Highest Priority Topic"
              value={highestPriority.name}
              sub={`${subjectMap[highestPriority.subjectId]?.name || '—'}`}
              tag={highestPriority.priority + ' Priority'}
              tagClass={highestPriority.priority === 'High' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}
            />
          )}

          {/* Subject with lowest progress */}
          {lowestProgressSubject && (
            <InsightCard
              icon={BookOpen}
              iconClass="bg-slate-100 text-slate-600"
              title="Needs Most Attention"
              value={lowestProgressSubject.name}
              sub={`${lowestProgressSubject.pct}% complete · ${lowestProgressSubject.total} topics`}
              tag={`${lowestProgressSubject.pct}% done`}
              tagClass="bg-slate-100 text-slate-600"
            />
          )}

          {/* Most urgent subject */}
          {mostUrgentSubject && (
            <InsightCard
              icon={CalendarDays}
              iconClass="bg-orange-50 text-orange-600"
              title="Most Urgent Subject"
              value={mostUrgentSubject.name}
              sub={`Exam in ${mostUrgentSubject.days} day${mostUrgentSubject.days === 1 ? '' : 's'}`}
              tag="⚡ High urgency"
              tagClass="bg-orange-50 text-orange-700 border border-orange-200"
            />
          )}
        </div>
      )}

      {/* Recommendations table */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Full Recommendation Ranking</h3>
            <button onClick={() => setPage('planner')}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
              Open Planner →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rank</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Topic</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Subject</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Difficulty</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Priority</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Exam</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendations.map(({ topic, subject, score }, idx) => (
                  <tr key={topic.id} className={`hover:bg-slate-50 transition-colors ${idx === 0 ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold ${idx === 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900 text-xs">{topic.name}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 hidden sm:table-cell">
                      {subject ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                          {subject.name}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <DifficultyBadge value={topic.difficulty} />
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <PriorityBadge value={topic.priority} />
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className="text-xs text-slate-600">
                        {topic.examDate ? daysUntilLabel(topic.examDate) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                        {score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
