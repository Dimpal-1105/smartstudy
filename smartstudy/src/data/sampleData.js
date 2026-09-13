/**
 * Sample academic data — 5 subjects, 15 topics.
 * Exam dates are offset from a known reference so they remain
 * "in the future" relative to when sample data is loaded.
 */

export function generateSampleData() {
  const now = new Date();

  // Helper: date N days from now as ISO string
  const daysFromNow = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  const subjects = [
    { id: 's1', name: 'Mathematics', color: '#3b82f6' },
    { id: 's2', name: 'Computer Science', color: '#8b5cf6' },
    { id: 's3', name: 'Physics', color: '#f59e0b' },
    { id: 's4', name: 'English Literature', color: '#10b981' },
    { id: 's5', name: 'History', color: '#ef4444' },
  ];

  const topics = [
    // Mathematics (s1)
    {
      id: 't1',
      subjectId: 's1',
      name: 'Differential Calculus',
      difficulty: 'Hard',
      priority: 'High',
      examDate: daysFromNow(5),
      estimatedHours: 6,
      completed: false,
    },
    {
      id: 't2',
      subjectId: 's1',
      name: 'Matrix Algebra',
      difficulty: 'Medium',
      priority: 'Medium',
      examDate: daysFromNow(12),
      estimatedHours: 4,
      completed: false,
    },
    {
      id: 't3',
      subjectId: 's1',
      name: 'Probability Theory',
      difficulty: 'Medium',
      priority: 'High',
      examDate: daysFromNow(3),
      estimatedHours: 3,
      completed: false,
    },

    // Computer Science (s2)
    {
      id: 't4',
      subjectId: 's2',
      name: 'Data Structures',
      difficulty: 'Hard',
      priority: 'High',
      examDate: daysFromNow(7),
      estimatedHours: 8,
      completed: false,
    },
    {
      id: 't5',
      subjectId: 's2',
      name: 'Algorithm Complexity',
      difficulty: 'Hard',
      priority: 'High',
      examDate: daysFromNow(7),
      estimatedHours: 5,
      completed: false,
    },
    {
      id: 't6',
      subjectId: 's2',
      name: 'Operating Systems Basics',
      difficulty: 'Medium',
      priority: 'Medium',
      examDate: daysFromNow(21),
      estimatedHours: 4,
      completed: true,
    },

    // Physics (s3)
    {
      id: 't7',
      subjectId: 's3',
      name: 'Quantum Mechanics Introduction',
      difficulty: 'Hard',
      priority: 'High',
      examDate: daysFromNow(10),
      estimatedHours: 7,
      completed: false,
    },
    {
      id: 't8',
      subjectId: 's3',
      name: 'Thermodynamics Laws',
      difficulty: 'Medium',
      priority: 'Medium',
      examDate: daysFromNow(14),
      estimatedHours: 4,
      completed: false,
    },
    {
      id: 't9',
      subjectId: 's3',
      name: 'Electromagnetism',
      difficulty: 'Hard',
      priority: 'Low',
      examDate: daysFromNow(28),
      estimatedHours: 6,
      completed: false,
    },

    // English Literature (s4)
    {
      id: 't10',
      subjectId: 's4',
      name: 'Shakespeare Tragedies',
      difficulty: 'Medium',
      priority: 'High',
      examDate: daysFromNow(6),
      estimatedHours: 3,
      completed: false,
    },
    {
      id: 't11',
      subjectId: 's4',
      name: 'Romantic Poetry Analysis',
      difficulty: 'Easy',
      priority: 'Medium',
      examDate: daysFromNow(18),
      estimatedHours: 2,
      completed: true,
    },
    {
      id: 't12',
      subjectId: 's4',
      name: 'Modern Novel Themes',
      difficulty: 'Easy',
      priority: 'Low',
      examDate: daysFromNow(35),
      estimatedHours: 2,
      completed: false,
    },

    // History (s5)
    {
      id: 't13',
      subjectId: 's5',
      name: 'World War II Causes',
      difficulty: 'Medium',
      priority: 'High',
      examDate: daysFromNow(4),
      estimatedHours: 4,
      completed: false,
    },
    {
      id: 't14',
      subjectId: 's5',
      name: 'Cold War Politics',
      difficulty: 'Medium',
      priority: 'Medium',
      examDate: daysFromNow(9),
      estimatedHours: 3,
      completed: false,
    },
    {
      id: 't15',
      subjectId: 's5',
      name: 'Industrial Revolution',
      difficulty: 'Easy',
      priority: 'Low',
      examDate: daysFromNow(40),
      estimatedHours: 2,
      completed: true,
    },
  ];

  return { subjects, topics };
}
