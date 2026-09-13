import { Zap, ArrowRight } from 'lucide-react';
import { DifficultyBadge, PriorityBadge } from './Badge';

export default function RecommendationCard({ recommendation, onNavigate }) {
  if (!recommendation) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-amber-500" />
          <span className="text-sm font-semibold text-slate-700">Top Recommendation</span>
        </div>
        <p className="text-sm text-slate-400">No incomplete topics to recommend. Great job! 🎉</p>
      </div>
    );
  }

  const { topic, subject, score, reason } = recommendation;

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-5 bg-gradient-to-br from-white to-amber-50/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-500" />
          <span className="text-sm font-semibold text-slate-700">Top Recommendation</span>
        </div>
        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          Score {score.toFixed(1)}
        </span>
      </div>

      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900 leading-tight">{topic.name}</h3>
        {subject && (
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: subject.color || '#94a3b8' }}
            />
            <span className="text-xs text-slate-500">{subject.name}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-4 italic">"{reason}"</p>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <DifficultyBadge value={topic.difficulty} />
        <PriorityBadge value={topic.priority} />
        {topic.estimatedHours && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            {topic.estimatedHours}h
          </span>
        )}
      </div>

      {onNavigate && (
        <button
          onClick={() => onNavigate('planner')}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View in Study Planner <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}
