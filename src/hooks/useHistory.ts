import { useState, useCallback } from 'react';
import type { SessionEntry } from '../types/workout';

const STORAGE_KEY = 'office-timer:history';
const MAX_ENTRIES = 20;

function loadHistory(): SessionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SessionEntry[];
  } catch {
    // ignore
  }
  return [];
}

function saveHistory(entries: SessionEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function useHistory() {
  const [history, setHistory] = useState<SessionEntry[]>(loadHistory);

  const addEntry = useCallback((entry: SessionEntry) => {
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    saveHistory([]);
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
