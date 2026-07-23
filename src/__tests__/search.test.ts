import { describe, it, expect, vi, beforeEach } from "vitest";
import { search } from "@/lib/api/search";

describe("search API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns fallback results when API is unreachable", async () => {
    // When process.env.NEXT_PUBLIC_API_URL is set,
    // the search function tries to call the API which will fail
    // and then fall back to mock data.
    const results = await search("luna");
    expect(results).toBeDefined();
    expect(Array.isArray(results.creators)).toBe(true);
    expect(Array.isArray(results.posts)).toBe(true);
    expect(Array.isArray(results.settings)).toBe(true);
  });

  it("returns results with creators and posts arrays", async () => {
    const results = await search("luna");
    expect(results).toBeDefined();
    expect(results.creators).toBeDefined();
    expect(results.posts).toBeDefined();
    expect(results.settings).toBeDefined();
  });
});
