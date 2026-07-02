'use client';

import { create } from 'zustand';
import { useEffect, useCallback, useRef } from 'react';

const RECENT_SEARCHES_KEY = 'agriintel360-recent-searches';
const MAX_RECENT_SEARCHES = 8;

interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  recentSearches: string[];
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;
}

function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    return;
  }
}

export const useCommandPalette = create<CommandPaletteState>((set, get) => ({
  isOpen: false,
  query: '',
  selectedIndex: -1,
  recentSearches: loadRecentSearches(),

  open: () => set({ isOpen: true, query: '', selectedIndex: -1 }),
  close: () => set({ isOpen: false, query: '', selectedIndex: -1 }),
  toggle: () =>
    set((s) => ({
      isOpen: !s.isOpen,
      query: '',
      selectedIndex: -1,
    })),
  setQuery: (query) => set({ query, selectedIndex: -1 }),
  setSelectedIndex: (index) => set({ selectedIndex: index }),

  addRecentSearch: (query) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    set((s) => {
      const filtered = s.recentSearches.filter((r) => r !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      saveRecentSearches(updated);
      return { recentSearches: updated };
    });
  },

  clearRecentSearches: () => {
    saveRecentSearches([]);
    set({ recentSearches: [] });
  },

  removeRecentSearch: (query) => {
    set((s) => {
      const updated = s.recentSearches.filter((r) => r !== query);
      saveRecentSearches(updated);
      return { recentSearches: updated };
    });
  },
}));

export function initCommandPaletteShortcut() {
  if (typeof window === 'undefined') return;
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      useCommandPalette.getState().toggle();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}

export function useCommandPaletteKeyboard(
  itemsLength: number,
  onSelect: (index: number) => void,
  enabled: boolean = true
) {
  const { selectedIndex, setSelectedIndex, close } = useCommandPalette();

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const closeRef = useRef(close);
  closeRef.current = close;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(
            selectedIndex < itemsLength - 1 ? selectedIndex + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(
            selectedIndex > 0 ? selectedIndex - 1 : itemsLength - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < itemsLength) {
            onSelectRef.current(selectedIndex);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeRef.current();
          break;
        case 'Tab':
          if (selectedIndex < 0) {
            e.preventDefault();
            setSelectedIndex(0);
          }
          break;
      }
    },
    [enabled, itemsLength, selectedIndex, setSelectedIndex]
  );

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}
