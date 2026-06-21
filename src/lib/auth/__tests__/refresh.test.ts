import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("@/lib/auth/token-store", () => ({
  getRefreshToken: vi.fn(),
  setAccessToken: vi.fn(),
  setRefreshToken: vi.fn(),
  clearAllTokens: vi.fn(),
}));

import { refreshAccessToken, resetRefreshState } from "@/lib/auth/refresh";
import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAllTokens,
} from "@/lib/auth/token-store";

const mockGetRefreshToken = vi.mocked(getRefreshToken);
const mockSetAccessToken = vi.mocked(setAccessToken);
const mockSetRefreshToken = vi.mocked(setRefreshToken);
const mockClearAllTokens = vi.mocked(clearAllTokens);

const REFRESH_URL = "http://localhost:3000/auth/refresh";

function mockFetchSuccess(
  accessToken: string,
  refreshToken?: string
): void {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      access_token: accessToken,
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    }),
  } as Response);
}

function mockFetchFailure(status = 401): void {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ message: "Unauthorized" }),
  } as Response);
}

beforeEach(() => {
  resetRefreshState();
  vi.clearAllMocks();
  mockGetRefreshToken.mockReturnValue("rtok_valid");
  // Suppress redirect side-effects in tests
  Object.defineProperty(window, "location", {
    value: { href: "" },
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("refreshAccessToken — success", () => {
  it("calls /auth/refresh with the stored refresh token", async () => {
    mockFetchSuccess("new_access_tok");

    await refreshAccessToken();

    expect(global.fetch).toHaveBeenCalledWith(
      REFRESH_URL,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refresh_token: "rtok_valid" }),
      })
    );
  });

  it("stores the new access token", async () => {
    mockFetchSuccess("new_access_tok");

    await refreshAccessToken();

    expect(mockSetAccessToken).toHaveBeenCalledWith("new_access_tok");
  });

  it("rotates the refresh token when backend returns a new one", async () => {
    mockFetchSuccess("new_access_tok", "new_rtok");

    await refreshAccessToken();

    expect(mockSetRefreshToken).toHaveBeenCalledWith("new_rtok");
  });

  it("does not call setRefreshToken when backend omits it", async () => {
    mockFetchSuccess("new_access_tok");

    await refreshAccessToken();

    expect(mockSetRefreshToken).not.toHaveBeenCalled();
  });

  it("returns the new access token", async () => {
    mockFetchSuccess("new_access_tok");

    const token = await refreshAccessToken();

    expect(token).toBe("new_access_tok");
  });
});

describe("refreshAccessToken — single-flight (queue behavior)", () => {
  it("only issues one fetch call when called concurrently", async () => {
    let resolveRefresh!: (v: Response) => void;
    global.fetch = vi.fn().mockReturnValue(
      new Promise<Response>((res) => {
        resolveRefresh = res;
      })
    );

    const p1 = refreshAccessToken();
    const p2 = refreshAccessToken();
    const p3 = refreshAccessToken();

    resolveRefresh({
      ok: true,
      json: async () => ({ access_token: "queued_tok" }),
    } as Response);

    const results = await Promise.all([p1, p2, p3]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(results).toEqual(["queued_tok", "queued_tok", "queued_tok"]);
  });

  it("delivers the same token to all queued callers", async () => {
    let resolveRefresh!: (v: Response) => void;
    global.fetch = vi.fn().mockReturnValue(
      new Promise<Response>((res) => {
        resolveRefresh = res;
      })
    );

    const p1 = refreshAccessToken();
    const p2 = refreshAccessToken();

    resolveRefresh({
      ok: true,
      json: async () => ({ access_token: "shared_tok" }),
    } as Response);

    const [t1, t2] = await Promise.all([p1, p2]);
    expect(t1).toBe("shared_tok");
    expect(t2).toBe("shared_tok");
  });
});

describe("refreshAccessToken — failure path", () => {
  it("clears all tokens on a failed refresh response", async () => {
    mockFetchFailure(401);

    await expect(refreshAccessToken()).rejects.toThrow();

    expect(mockClearAllTokens).toHaveBeenCalled();
  });

  it("redirects to /login on failure", async () => {
    mockFetchFailure(401);

    await expect(refreshAccessToken()).rejects.toThrow();

    expect(window.location.href).toBe("/login");
  });

  it("rejects all queued callers when refresh fails", async () => {
    let rejectRefresh!: (err: Error) => void;
    global.fetch = vi.fn().mockReturnValue(
      new Promise<Response>((_res, rej) => {
        rejectRefresh = rej;
      })
    );

    const p1 = refreshAccessToken();
    const p2 = refreshAccessToken();
    const p3 = refreshAccessToken();

    rejectRefresh(new Error("network failure"));

    await expect(Promise.all([p1, p2, p3])).rejects.toThrow();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("throws when no refresh token is available", async () => {
    mockGetRefreshToken.mockReturnValue(null);

    await expect(refreshAccessToken()).rejects.toThrow(
      "No refresh token available"
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("does not loop: isRefreshing resets after failure", async () => {
    mockFetchFailure(401);
    await expect(refreshAccessToken()).rejects.toThrow();

    // Second call should attempt a fresh refresh, not be stuck
    mockFetchSuccess("fresh_tok");
    const token = await refreshAccessToken();
    expect(token).toBe("fresh_tok");
  });
});
