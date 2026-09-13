import { createContext, useContext, useCallback, useRef, useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { generateSampleData } from '../data/sampleData';
import { generateId } from '../utils/helpers';

const STORAGE_KEY = 'smartstudy_data';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [storedData, setStoredData, removeStoredData] = useStorage(STORAGE_KEY, {
    subjects: [],
    topics: [],
  });

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Subjects ──────────────────────────────────────────────────────────────

  const addSubject = useCallback((subjectData) => {
    const subject = { id: generateId('s'), ...subjectData };
    setStoredData(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
    addToast(`Subject "${subject.name}" added`);
    return subject;
  }, [setStoredData, addToast]);

  const updateSubject = useCallback((id, updates) => {
    setStoredData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
    addToast('Subject updated');
  }, [setStoredData, addToast]);

  const deleteSubject = useCallback((id) => {
    setStoredData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      topics: prev.topics.filter(t => t.subjectId !== id),
    }));
    addToast('Subject and its topics deleted', 'info');
  }, [setStoredData, addToast]);

  // ── Topics ────────────────────────────────────────────────────────────────

  const addTopic = useCallback((topicData) => {
    const topic = { id: generateId('t'), completed: false, ...topicData };
    setStoredData(prev => ({ ...prev, topics: [...prev.topics, topic] }));
    addToast(`Topic "${topic.name}" added`);
    return topic;
  }, [setStoredData, addToast]);

  const updateTopic = useCallback((id, updates) => {
    setStoredData(prev => ({
      ...prev,
      topics: prev.topics.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
    addToast('Topic updated');
  }, [setStoredData, addToast]);

  const deleteTopic = useCallback((id) => {
    setStoredData(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t.id !== id),
    }));
    addToast('Topic deleted', 'info');
  }, [setStoredData, addToast]);

  const toggleTopicComplete = useCallback((id) => {
    let topicName = '';
    let nowComplete = false;
    setStoredData(prev => ({
      ...prev,
      topics: prev.topics.map(t => {
        if (t.id === id) {
          topicName = t.name;
          nowComplete = !t.completed;
          return { ...t, completed: !t.completed };
        }
        return t;
      }),
    }));
    // The toast is deferred because setStoredData is async-state
    setTimeout(() => {
      addToast(nowComplete ? `"${topicName}" marked complete ✓` : `"${topicName}" marked incomplete`);
    }, 0);
  }, [setStoredData, addToast]);

  // ── Bulk operations ───────────────────────────────────────────────────────

  const loadSampleData = useCallback(() => {
    const { subjects, topics } = generateSampleData();
    setStoredData({ subjects, topics });
    addToast('Sample data loaded — 5 subjects, 15 topics', 'success');
  }, [setStoredData, addToast]);

  const clearAllData = useCallback(() => {
    removeStoredData();
    addToast('All data cleared', 'info');
  }, [removeStoredData, addToast]);

  // ── Derived convenience helpers ───────────────────────────────────────────

  const getSubjectById = useCallback((id) => {
    return storedData.subjects.find(s => s.id === id) || null;
  }, [storedData.subjects]);

  const getTopicsBySubject = useCallback((subjectId) => {
    return storedData.topics.filter(t => t.subjectId === subjectId);
  }, [storedData.topics]);

  const value = {
    subjects: storedData.subjects,
    topics: storedData.topics,
    // CRUD
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
    toggleTopicComplete,
    // Bulk
    loadSampleData,
    clearAllData,
    // Helpers
    getSubjectById,
    getTopicsBySubject,
    // Toasts
    toasts,
    addToast,
    removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
