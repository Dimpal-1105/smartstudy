import { useMemo } from 'react';
import { CheckSquare, Square, CalendarDays, Zap, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import { DifficultyBadge, PriorityBadge } from '../components/Badge';
import { getRecommendations, urgencyLabel } from '../engine/recommendationEngine';
import { formatDate } from '../utils/helpers';

export default function Planner({ searchQuery }) {
  const { subjects, topics, toggleTopicComplete } = useApp();

  const recommendations = useMemo(() =>
    getRecommendations(topics, subjects), [topics, subjects]);

  const filtered = useMemo(() => {
    const q = searchQuery?.toLowerCase() || '';
    if (!q) return recommendations;
    return recommendations.filter(({ topic, subject }) =>
      topic.name.toLowerCase().includes(q) ||
      (subject?.name.toLowerCase().includes(q))
    );
  }, [recommendations, searchQuery]);

  const completedTopics = useMemo(() =>
    topics.filter(t => t.completed), [topics]);

  if (topics.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No topics yet"
        description="Add subjects and topics to see your personalized study plan."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Study Planner</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Topics ranked by recommendation score — tackle the most urgent first.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
        <div className="flex items-center gap-1.5">
          <Zap size={13} className="text-amber-600" />
          <span className="font-medium">Score formula:</span>
          <span>Exam urgency (40%) + Difficulty (25%) + Priority (20%) + Time (15%)</span>
        </div>
      </div>

      {/* No incomplete topics */}
      {recommendations.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-3xl mb-3">🎉</div>
          <h3 className="text-base font-semibold text-green-800 mb-1">All topics completed!</h3>
          <p className="text-sm text-green-600">You've finished every topic. Excellent work!</p>
        </div>
      )}

      {/* Planner list */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map(({ topic, subject, score, reason, breakdown }, idx) => {
            const urgency = urgencyLabel(topic.examDate);
            return (
              <div
                key={topic.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 transition-all
                  ${idx === 0 ? 'border-amber-300 shadow-sm' : 'border-slate-200'}`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    #{idx + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{topic.name}</h3>
                        {subject && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: subject.color }} />
                            <span className="text-xs text-slate-500">{subject.name}</span>
                          </div>
                        )}
                      </div>
                      {/* Score */}
                      <div className="flex-shrink-0 text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                          ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-slate-400 italic mt-1 mb-3">"{reason}"</p>

                    {/* Badges + details */}
                    <div className="flex flex-wrap items-center gap-2">
                      <DifficultyBadge value={topic.difficulty} />
                      <PriorityBadge value={topic.priority} />

                      {topic.examDate && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${urgency.color}`}>
                          <CalendarDays size={10} />
                          {formatDate(topic.examDate)} · {urgency.label}
                        </span>
                      )}

                      {topic.estimatedHours && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                          <Clock size={10} />
                          {topic.estimatedHours}h
                        </span>
                      )}
                    </div>

                    {/* Score breakdown (compact) */}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
                      <span>Urgency: <strong className="text-slate-600">{breakdown.examUrgency}</strong></span>
                      <span>Difficulty: <strong className="text-slate-600">{breakdown.difficulty}</strong></span>
                      <span>Priority: <strong className="text-slate-600">{breakdown.priority}</strong></span>
                      <span>Time: <strong className="text-slate-600">{breakdown.time}</strong></span>
                    </div>
                  </div>

                  {/* Complete button */}
                  <button
                    onClick={() => toggleTopicComplete(topic.id)}
                    className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    title="Mark complete"
                  >
                    <Square size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed section */}
      {completedTopics.length > 0 && (
        <div className="mt-2">
          <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
            <CheckSquare size={15} className="text-green-500" />
            Completed ({completedTopics.length})
          </h3>
          <div className="flex flex-col gap-2">
            {completedTopics.map(topic => {
              const subject = subjects.find(s => s.id === topic.subjectId);
              return (
                <div key={topic.id}
                  className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 opacity-60">
                  <button
                    onClick={() => toggleTopicComplete(topic.id)}
                    className="flex-shrink-0 text-green-500 hover:text-slate-400 transition-colors"
                    title="Mark incomplete"
                  >
                    <CheckSquare size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 line-through truncate">{topic.name}</p>
                    {subject && (
                      <span className="text-xs text-slate-400">{subject.name}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
