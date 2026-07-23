import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import * as searchModule from "@/lib/api/search";

// Mock the search API
vi.mock("@/lib/api/search", () => ({
  search: vi.fn(),
}));

const mockedSearch = vi.mocked(searchModule.search);

describe("useGlobalSearch", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("initialises with empty query and no results", () => {
    const { result } = renderHook(() => useGlobalSearch());

    expect(result.current.query).toBe("");
    expect(result.current.results).toBeNull();
    expect(result.current.isSearching).toBe(false);
    expect(result.current.hasSearched).toBe(false);
    expect(result.current.recentSearches).toEqual([]);
  });

  it("updates query state when setQuery is called", () => {
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery("luna");
    });

    expect(result.current.query).toBe("luna");
  });

  it("debounces search and returns results", async () => {
    const mockResults: searchModule.SearchResult = {
      creators: [],
      posts: [],
      settings: [],
    };

    mockedSearch.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery("luna");
    });

    // Should be searching while debouncing
    expect(result.current.isSearching).toBe(true);
    expect(result.current.hasSearched).toBe(true);

    // Wait for debounce (300ms) + async
    await vi.waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });

    expect(mockedSearch).toHaveBeenCalledWith("luna");
    expect(result.current.results).toEqual(mockResults);
  });

  it("clears results when query is set to empty string", () => {
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery("luna");
    });

    act(() => {
      result.current.setQuery("");
    });

    expect(result.current.results).toBeNull();
    expect(result.current.isSearching).toBe(false);
    expect(result.current.hasSearched).toBe(false);
  });

  it("loads recent searches from localStorage on mount", () => {
    const searches = ["luna", "marco"];
    localStorage.setItem("global_search_recents", JSON.stringify(searches));

    const { result } = renderHook(() => useGlobalSearch());

    expect(result.current.recentSearches).toEqual(searches);
  });

  it("adds a recent search and persists to localStorage", () => {
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.addRecent("nova");
    });

    expect(result.current.recentSearches).toContain("nova");
    const stored = JSON.parse(
      localStorage.getItem("global_search_recents") || "[]"
    );
    expect(stored).toContain("nova");
  });

  it("limits recent searches to max 5 items", () => {
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.addRecent("a");
    });
    act(() => {
      result.current.addRecent("b");
    });
    act(() => {
      result.current.addRecent("c");
    });
    act(() => {
      result.current.addRecent("d");
    });
    act(() => {
      result.current.addRecent("e");
    });
    act(() => {
      result.current.addRecent("f");
    });

    expect(result.current.recentSearches.length).toBeLessThanOrEqual(5);
  });

  it("clears all recent searches", () => {
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.addRecent("luna");
    });
    act(() => {
      result.current.clearRecents();
    });

    expect(result.current.recentSearches).toEqual([]);
    expect(localStorage.getItem("global_search_recents")).toBeNull();
  });

  it("deduplicates recent searches", () => {
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.addRecent("luna");
    });
    act(() => {
      result.current.addRecent("luna");
    });

    expect(result.current.recentSearches).toEqual(["luna"]);
  });

  it("handles search API errors gracefully", async () => {
    mockedSearch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery("luna");
    });

    await vi.waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });

    // Should not crash; results stay null on error
    expect(result.current.results).toBeNull();
  });
});
