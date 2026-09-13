import { useMemo } from 'react';
import { BookOpen, ListChecks, CheckCircle2, TrendingUp, Zap, Clock, CalendarDays, ArrowRight, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import RecommendationCard from '../components/RecommendationCard';
import ProgressBar from '../components/ProgressBar';
import { DifficultyBadge, PriorityBadge } from '../components/Badge';
import { getTopRecommendation, getRecommendations } from '../engine/recommendationEngine';
import { formatDate, daysUntilLabel, urgencyColor, calcPercent } from '../utils/helpers';

export default function Dashboard({ setPage, loadSampleData }) {
  const { subjects, topics } = useApp();

  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.completed).length;
  const incompleteTopics = topics.filter(t => !t.completed).length;
  const overallPct = calcPercent(completedTopics, totalTopics);

  const subjectMap = useMemo(() =>
    Object.fromEntries(subjects.map(s => [s.id, s])), [subjects]);

  const topRec = useMemo(() =>
    getTopRecommendation(topics, subjects), [topics, subjects]);

  const plannerPreview = useMemo(() =>
    getRecommendations(topics, subjects).slice(0, 5), [topics, subjects]);

  // Recent activity: last 5 completed topics
  const recentCompleted = useMemo(() =>
    topics
      .filter(t => t.completed)
      .slice(-5)
      .reverse(), [topics]);

  // Upcoming exams
  const upcomingExams = useMemo(() => {
    return topics
      .filter(t => !t.completed && t.examDate)
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
      .slice(0, 4);
  }, [topics]);

  // No data state
  const isEmpty = subjects.length === 0 && topics.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
          <Zap size={28} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to SmartStudy</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          Your AI-powered study planner. Add subjects and topics to get smart recommendations
          based on exam urgency, difficulty, and priority.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={loadSampleData}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Database size={16} /> Load Sample Data
          </button>
          <button
            onClick={() => setPage('subjects')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
          >
            <BookOpen size={16} /> Add Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Subjects"
          value={subjects.length}
          icon={BookOpen}
          iconClass="bg-blue-50 text-blue-600"
          sub="Total enrolled"
        />
        <StatCard
          label="Total Topics"
          value={totalTopics}
          icon={ListChecks}
          iconClass="bg-purple-50 text-purple-600"
          sub={`${incompleteTopics} remaining`}
        />
        <StatCard
          label="Completed"
          value={completedTopics}
          icon={CheckCircle2}
          iconClass="bg-green-50 text-green-600"
          sub="Topics finished"
        />
        <StatCard
          label="Overall Progress"
          value={`${overallPct}%`}
          icon={TrendingUp}
          iconClass="bg-amber-50 text-amber-600"
          sub={`${completedTopics}/${totalTopics} topics`}
        />
      </div>

      {/* Overall progress bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
          <span className="text-sm font-bold text-slate-900">{overallPct}%</span>
        </div>
        <ProgressBar percent={overallPct} height="h-3" />
        <p className="text-xs text-slate-400 mt-2">{completedTopics} of {totalTopics} topics completed</p>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recommendation + Upcoming exams */}
        <div className="flex flex-col gap-4">
          <RecommendationCard recommendation={topRec} onNavigate={setPage} />

          {/* Upcoming exams */}
          {upcomingExams.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={15} className="text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Upcoming Exams</span>
              </div>
              <div className="flex flex-col gap-3">
                {upcomingExams.map(t => {
                  const subject = subjectMap[t.subjectId];
                  return (
                    <div key={t.id} className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{t.name}</p>
                        {subject && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: subject.color }} />
                            <span className="text-xs text-slate-400">{subject.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <p className="text-xs font-medium text-slate-600">{formatDate(t.examDate)}</p>
                        <p className={`text-xs font-semibold ${urgencyColor(t.examDate)}`}>
                          {daysUntilLabel(t.examDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Today's planner preview */}
        <div className="flex flex-col gap-4">
          {plannerPreview.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Study Planner Preview</span>
                </div>
                <button onClick={() => setPage('planner')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors">
                  View all <ArrowRight size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {plannerPreview.map(({ topic, subject, score, reason }, idx) => (
                  <div key={topic.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${idx === 0 ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-slate-50/50'}`}>
                    <span className={`text-xs font-bold flex-shrink-0 mt-0.5 w-5 text-center
                      ${idx === 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{topic.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {subject && (
                          <span className="text-xs text-slate-400">{subject.name}</span>
                        )}
                        <DifficultyBadge value={topic.difficulty} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 flex-shrink-0">{score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-subject progress */}
          {subjects.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-700">Subject Progress</span>
                <button onClick={() => setPage('progress')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors">
                  Details <ArrowRight size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {subjects.map(s => {
                  const sTopics = topics.filter(t => t.subjectId === s.id);
                  const done = sTopics.filter(t => t.completed).length;
                  const pct = calcPercent(done, sTopics.length);
                  return (
                    <div key={s.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.color }} />
                          <span className="text-xs font-medium text-slate-700 truncate">{s.name}</span>
                        </div>
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{done}/{sTopics.length}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Add Subject', icon: BookOpen, page: 'subjects', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
          { label: 'Add Topic',   icon: ListChecks, page: 'topics',  color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
          { label: 'Study Planner', icon: Clock, page: 'planner',   color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
          { label: 'View Progress', icon: TrendingUp, page: 'progress', color: 'text-green-600 bg-green-50 hover:bg-green-100' },
        ].map(({ label, icon: Icon, page, color }) => (
          <button key={page} onClick={() => setPage(page)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${color}`}>
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
