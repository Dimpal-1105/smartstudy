/**
 * SmartStudy Recommendation Engine
 *
 * Rule-based scoring for study topic prioritization.
 * NOT an external AI model — purely deterministic logic.
 *
 * Score = (examUrgency × 0.40) + (difficulty × 0.25) + (priority × 0.20) + (time × 0.15)
 */

import { daysUntil } from '../utils/helpers';

/** How urgent is the exam? Returns 2–10. */
function examUrgencyScore(examDate) {
  if (!examDate) return 2; // no date → lowest urgency
  const days = daysUntil(examDate);
  if (days === null) return 2;
  if (days <= 0) return 10; // past or today
  if (days <= 3) return 10;
  if (days <= 7) return 8;
  if (days <= 14) return 6;
  if (days <= 30) return 4;
  return 2;
}

/** Difficulty → numerical score */
function difficultyScore(difficulty) {
  switch (difficulty) {
    case 'Hard':   return 10;
    case 'Medium': return 6;
    case 'Easy':   return 3;
    default:       return 5;
  }
}

/** Priority → numerical score */
function priorityScore(priority) {
  switch (priority) {
    case 'High':   return 10;
    case 'Medium': return 6;
    case 'Low':    return 3;
    default:       return 5;
  }
}

/**
 * Time score: shorter tasks score a little higher, rewarding quick wins
 * without overpowering the other factors (max 5 pts difference in this range).
 */
function timeScore(estimatedHours) {
  const hours = Number(estimatedHours) || 3;
  if (hours <= 1)  return 10;
  if (hours <= 2)  return 9;
  if (hours <= 3)  return 8;
  if (hours <= 4)  return 7;
  if (hours <= 5)  return 6;
  if (hours <= 6)  return 5;
  if (hours <= 8)  return 4;
  return 3;
}

/** Build a human-readable explanation for the top recommendation. */
function buildReason(topic) {
  const parts = [];

  const days = daysUntil(topic.examDate);
  if (days !== null) {
    if (days <= 0) parts.push('Exam today!');
    else if (days === 1) parts.push('Exam tomorrow');
    else if (days <= 7) parts.push(`Exam in ${days} day${days === 1 ? '' : 's'}`);
    else if (days <= 14) parts.push(`Exam in ${days} days`);
  }

  if (topic.difficulty) parts.push(`${topic.difficulty} difficulty`);
  if (topic.priority)   parts.push(`${topic.priority} priority`);
  if (topic.estimatedHours) parts.push(`${topic.estimatedHours}h estimated`);

  return parts.join(' · ') || 'General study recommendation';
}

/**
 * Score a single topic.
 * Returns { topic, score, breakdown, reason }
 */
export function scoreTopic(topic) {
  const eu = examUrgencyScore(topic.examDate);
  const ds = difficultyScore(topic.difficulty);
  const ps = priorityScore(topic.priority);
  const ts = timeScore(topic.estimatedHours);

  const score = parseFloat(
    (eu * 0.40 + ds * 0.25 + ps * 0.20 + ts * 0.15).toFixed(2)
  );

  return {
    topic,
    score,
    breakdown: { examUrgency: eu, difficulty: ds, priority: ps, time: ts },
    reason: buildReason(topic),
  };
}

/**
 * Rank all incomplete topics by recommendation score.
 * @param {Array} topics  - all topics from context
 * @param {Array} subjects - all subjects (used to enrich results)
 * @returns {Array} scored & sorted array of { topic, subject, score, reason, breakdown }
 */
export function getRecommendations(topics, subjects) {
  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));

  const incomplete = topics.filter(t => !t.completed);

  const scored = incomplete.map(t => {
    const { score, reason, breakdown } = scoreTopic(t);
    return {
      topic: t,
      subject: subjectMap[t.subjectId] || null,
      score,
      reason,
      breakdown,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Returns the single top recommendation, or null if no incomplete topics.
 */
export function getTopRecommendation(topics, subjects) {
  const recs = getRecommendations(topics, subjects);
  return recs.length > 0 ? recs[0] : null;
}

/**
 * Return an urgency label + color class pair for use in UI.
 */
export function urgencyLabel(examDate) {
  const days = daysUntil(examDate);
  if (days === null) return { label: 'No date', color: 'text-slate-400 bg-slate-50' };
  if (days <= 0)  return { label: 'Today!',     color: 'text-red-700 bg-red-50' };
  if (days <= 3)  return { label: `${days}d`,   color: 'text-red-600 bg-red-50' };
  if (days <= 7)  return { label: `${days}d`,   color: 'text-orange-600 bg-orange-50' };
  if (days <= 14) return { label: `${days}d`,   color: 'text-yellow-600 bg-yellow-50' };
  if (days <= 30) return { label: `${days}d`,   color: 'text-blue-600 bg-blue-50' };
  return               { label: `${days}d`,     color: 'text-slate-500 bg-slate-50' };
}
