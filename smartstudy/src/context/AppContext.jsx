import { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { generateSampleData } from '../data/sampleData';
import { generateId } from '../utils/helpers';

const API_URL = 'http://localhost:5000/api';

const AppContext = createContext(null);

const EMPTY_DATA = {
  subjects: [],
  topics: [],
};

export function AppProvider({ children }) {
  const [storedData, setStoredData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

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

  // ── Load data from backend ────────────────────────────────────────────────

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${API_URL}/data`);

        if (!response.ok) {
          throw new Error('Failed to load data');
        }

        const data = await response.json();
        setStoredData(data);
      } catch (error) {
        console.error('Backend connection failed:', error);
        addToast('Could not connect to backend', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [addToast]);

  // ── Subjects ──────────────────────────────────────────────────────────────

  const addSubject = useCallback(async (subjectData) => {
    const subject = {
      id: generateId('s'),
      ...subjectData,
    };

    try {
      const response = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subject),
      });

      if (!response.ok) {
        throw new Error('Failed to add subject');
      }

      const savedSubject = await response.json();

      setStoredData(prev => ({
        ...prev,
        subjects: [...prev.subjects, savedSubject],
      }));

      addToast(`Subject "${savedSubject.name}" added`);

      return savedSubject;
    } catch (error) {
      console.error(error);
      addToast('Failed to add subject', 'error');
      return null;
    }
  }, [addToast]);

  const updateSubject = useCallback(async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update subject');
      }

      const updatedSubject = await response.json();

      setStoredData(prev => ({
        ...prev,
        subjects: prev.subjects.map(subject =>
          subject.id === id
            ? updatedSubject
            : subject
        ),
      }));

      addToast('Subject updated');
    } catch (error) {
      console.error(error);
      addToast('Failed to update subject', 'error');
    }
  }, [addToast]);

  const deleteSubject = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subject');
      }

      setStoredData(prev => ({
        ...prev,
        subjects: prev.subjects.filter(subject => subject.id !== id),
        topics: prev.topics.filter(topic => topic.subjectId !== id),
      }));

      addToast('Subject and its topics deleted', 'info');
    } catch (error) {
      console.error(error);
      addToast('Failed to delete subject', 'error');
    }
  }, [addToast]);

  // ── Topics ────────────────────────────────────────────────────────────────

  const addTopic = useCallback(async (topicData) => {
    const topic = {
      id: generateId('t'),
      completed: false,
      ...topicData,
    };

    try {
      const response = await fetch(`${API_URL}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topic),
      });

      if (!response.ok) {
        throw new Error('Failed to add topic');
      }

      const savedTopic = await response.json();

      setStoredData(prev => ({
        ...prev,
        topics: [...prev.topics, savedTopic],
      }));

      addToast(`Topic "${savedTopic.name}" added`);

      return savedTopic;
    } catch (error) {
      console.error(error);
      addToast('Failed to add topic', 'error');
      return null;
    }
  }, [addToast]);

  const updateTopic = useCallback(async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/topics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update topic');
      }

      const updatedTopic = await response.json();

      setStoredData(prev => ({
        ...prev,
        topics: prev.topics.map(topic =>
          topic.id === id
            ? updatedTopic
            : topic
        ),
      }));

      addToast('Topic updated');
    } catch (error) {
      console.error(error);
      addToast('Failed to update topic', 'error');
    }
  }, [addToast]);

  const deleteTopic = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/topics/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete topic');
      }

      setStoredData(prev => ({
        ...prev,
        topics: prev.topics.filter(topic => topic.id !== id),
      }));

      addToast('Topic deleted', 'info');
    } catch (error) {
      console.error(error);
      addToast('Failed to delete topic', 'error');
    }
  }, [addToast]);

  const toggleTopicComplete = useCallback(async (id) => {
    const topic = storedData.topics.find(t => t.id === id);

    if (!topic) return;

    const newCompleted = !topic.completed;

    await updateTopic(id, {
      completed: newCompleted,
    });

    addToast(
      newCompleted
        ? `"${topic.name}" marked complete ✓`
        : `"${topic.name}" marked incomplete`
    );
  }, [storedData.topics, updateTopic, addToast]);

  // ── Bulk operations ───────────────────────────────────────────────────────

  const loadSampleData = useCallback(async () => {
    const sampleData = generateSampleData();

    try {
      const response = await fetch(`${API_URL}/data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleData),
      });

      if (!response.ok) {
        throw new Error('Failed to load sample data');
      }

      const data = await response.json();

      setStoredData(data);

      addToast(
        'Sample data loaded — 5 subjects, 15 topics',
        'success'
      );
    } catch (error) {
      console.error(error);
      addToast('Failed to load sample data', 'error');
    }
  }, [addToast]);

  const clearAllData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/data`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear data');
      }

      const data = await response.json();

      setStoredData(data);

      addToast('All data cleared', 'info');
    } catch (error) {
      console.error(error);
      addToast('Failed to clear data', 'error');
    }
  }, [addToast]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getSubjectById = useCallback((id) => {
    return storedData.subjects.find(subject => subject.id === id) || null;
  }, [storedData.subjects]);

  const getTopicsBySubject = useCallback((subjectId) => {
    return storedData.topics.filter(
      topic => topic.subjectId === subjectId
    );
  }, [storedData.topics]);

  const value = {
    subjects: storedData.subjects,
    topics: storedData.topics,

    loading,

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

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }

  return ctx;
}