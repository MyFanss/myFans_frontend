import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  setAuthCookie: vi.fn(),
  clearAuthCookie: vi.fn(),
}));

import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
  clearAllTokens,
} from "@/lib/auth/token-store";

import { setAuthCookie, clearAuthCookie } from "@/lib/auth/session";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("getAccessToken", () => {
  it("returns null when nothing is stored", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("returns the stored access token", () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "tok_abc");
    expect(getAccessToken()).toBe("tok_abc");
  });
});

describe("setAccessToken", () => {
  it("writes to localStorage", () => {
    setAccessToken("tok_123");
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("tok_123");
  });

  it("mirrors the token to the auth cookie", () => {
    setAccessToken("tok_123");
    expect(setAuthCookie).toHaveBeenCalledWith("tok_123");
  });
});

describe("clearAccessToken", () => {
  it("removes the access token from localStorage", () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "tok_abc");
    clearAccessToken();
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  });

  it("clears the auth cookie", () => {
    clearAccessToken();
    expect(clearAuthCookie).toHaveBeenCalled();
  });
});

describe("getRefreshToken", () => {
  it("returns null when nothing is stored", () => {
    expect(getRefreshToken()).toBeNull();
  });

  it("returns the stored refresh token", () => {
    localStorage.setItem(REFRESH_TOKEN_KEY, "rtok_xyz");
    expect(getRefreshToken()).toBe("rtok_xyz");
  });
});

describe("setRefreshToken", () => {
  it("writes to localStorage", () => {
    setRefreshToken("rtok_xyz");
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("rtok_xyz");
  });

  it("does NOT write to the auth cookie", () => {
    setRefreshToken("rtok_xyz");
    expect(setAuthCookie).not.toHaveBeenCalled();
  });
});

describe("clearRefreshToken", () => {
  it("removes the refresh token from localStorage", () => {
    localStorage.setItem(REFRESH_TOKEN_KEY, "rtok_xyz");
    clearRefreshToken();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });
});

describe("clearAllTokens", () => {
  it("removes both tokens and clears the cookie", () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "tok_abc");
    localStorage.setItem(REFRESH_TOKEN_KEY, "rtok_xyz");

    clearAllTokens();

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(clearAuthCookie).toHaveBeenCalled();
  });
});
