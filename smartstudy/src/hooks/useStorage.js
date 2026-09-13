import { useState, useEffect } from 'react';

/**
 * Custom hook that syncs state to localStorage.
 * @param {string} key - localStorage key
 * @param {*} initialValue - default value if nothing is stored
 */
export function useStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn(`useStorage: failed to parse key "${key}"`, err);
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn(`useStorage: failed to write key "${key}"`, err);
    }
  }, [key, state]);

  const setStoredState = (value) => {
    setState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      return next;
    });
  };

  const removeStoredState = () => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`useStorage: failed to remove key "${key}"`, err);
    }
    setState(typeof initialValue === 'function' ? initialValue() : initialValue);
  };

  return [state, setStoredState, removeStoredState];
}
