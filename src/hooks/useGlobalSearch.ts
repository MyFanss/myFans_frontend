"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { search, type SearchResult } from "@/lib/api/search";

const RECENT_SEARCHES_KEY = "global_search_recents";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(terms: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(terms));
  } catch {
    /* noop */
  }
}

function addRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return loadRecentSearches();
  const existing = loadRecentSearches().filter((t) => t !== trimmed);
  const updated = [trimmed, ...existing].slice(0, MAX_RECENT);
  saveRecentSearches(updated);
  return updated;
}

function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    /* noop */
  }
}

export interface UseGlobalSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult | null;
  isSearching: boolean;
  recentSearches: string[];
  addRecent: (term: string) => void;
  clearRecents: () => void;
  hasSearched: boolean;
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const q = query.trim();
    if (!q) {
      setResults(null);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    timerRef.current = setTimeout(async () => {
      try {
        const data = await search(q);
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query]);

  const addRecent = useCallback((term: string) => {
    const updated = addRecentSearch(term);
    setRecentSearches(updated);
  }, []);

  const clearRecents = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    recentSearches,
    addRecent,
    clearRecents,
    hasSearched,
  };
}
