import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart2, CheckCircle2, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import { calcPercent } from '../utils/helpers';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-semibold text-slate-800">{d.name}</p>
        <p className="text-xs text-slate-500">
          {d.value} topic{d.value !== 1 ? 's' : ''} ({d.payload.pct}%)
        </p>
      </div>
    );
  }
  return null;
}

export default function Progress() {
  const { subjects, topics } = useApp();

  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.completed).length;
  const incompleteTopics = totalTopics - completedTopics;
  const overallPct = calcPercent(completedTopics, totalTopics);

  // Per-subject stats
  const subjectStats = useMemo(() => {
    return subjects.map(s => {
      const sTopics = topics.filter(t => t.subjectId === s.id);
      const done = sTopics.filter(t => t.completed).length;
      const pct = calcPercent(done, sTopics.length);
      return { ...s, total: sTopics.length, done, pct };
    }).sort((a, b) => b.pct - a.pct);
  }, [subjects, topics]);

  // Doughnut chart data — completed vs incomplete
  const donutData = [
    { name: 'Completed', value: completedTopics, pct: calcPercent(completedTopics, totalTopics) },
    { name: 'Remaining', value: incompleteTopics, pct: calcPercent(incompleteTopics, totalTopics) },
  ].filter(d => d.value > 0);

  // Per-subject chart data
  const subjectChartData = subjectStats
    .filter(s => s.total > 0)
    .map((s, i) => ({
      name: s.name,
      value: s.done,
      pct: s.pct,
      color: s.color || CHART_COLORS[i % CHART_COLORS.length],
    }));

  if (subjects.length === 0 && topics.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="No data yet"
        description="Add subjects and topics to see your progress charts."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Progress</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track your study completion across all subjects.</p>
      </div>

      {/* Overall progress card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-700">Overall Completion</h3>
          <span className="text-2xl font-bold text-slate-900">{overallPct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
          <div
            className="h-3 rounded-full bg-blue-600 transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-green-500" />
            <span className="text-slate-600"><strong>{completedTopics}</strong> completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle size={15} className="text-slate-400" />
            <span className="text-slate-600"><strong>{incompleteTopics}</strong> remaining</span>
          </div>
          <div className="text-slate-400 text-xs">{totalTopics} total</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut — overall */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Completion Overview</h3>
          {totalTopics === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No topics yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#e2e8f0" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Center label */}
          {totalTopics > 0 && (
            <div className="text-center -mt-4">
              <p className="text-2xl font-bold text-slate-900">{overallPct}%</p>
              <p className="text-xs text-slate-400">done</p>
            </div>
          )}
        </div>

        {/* Doughnut — by subject */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Completed Topics by Subject</h3>
          {subjectChartData.length === 0 || subjectChartData.every(d => d.value === 0) ? (
            <p className="text-xs text-slate-400 text-center py-8">No topics completed yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={subjectChartData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {subjectChartData.filter(d => d.value > 0).map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Per-subject progress bars */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-5">Progress by Subject</h3>
        {subjectStats.length === 0 ? (
          <p className="text-xs text-slate-400">No subjects yet.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {subjectStats.map(s => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-medium text-slate-800 truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                    <span className="text-xs text-slate-500">{s.done}/{s.total} topics</span>
                    <span className="text-sm font-bold text-slate-900 w-10 text-right">{s.pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                  />
                </div>
                {/* Mini difficulty breakdown */}
                {s.total > 0 && (
                  <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
                    {['Easy', 'Medium', 'Hard'].map(d => {
                      const count = topics.filter(t => t.subjectId === s.id && t.difficulty === d).length;
                      if (!count) return null;
                      return <span key={d}>{d}: {count}</span>;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
