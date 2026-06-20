import assert from "node:assert/strict";
import test from "node:test";

import {
  getCreatorByHandle,
  getMockCreatorByHandle,
} from "./creators.ts";

test("getMockCreatorByHandle finds mock creators by handle", () => {
  const creator = getMockCreatorByHandle("luna");

  assert.equal(creator?.displayName, "Luna Vale");
  assert.equal(creator?.handle, "luna");
});

test("getCreatorByHandle falls back to mock data when the API is unavailable", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () => {
    throw new Error("offline");
  };

  const creator = await getCreatorByHandle("marco");

  assert.equal(creator?.displayName, "Marco Stone");
  assert.equal(creator?.handle, "marco");
});

test("getCreatorByHandle fetches from the configured API URL", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }
  });
  process.env.NEXT_PUBLIC_API_URL = "https://api.myfans.test";
  globalThis.fetch = async (url) => {
    assert.equal(String(url), "https://api.myfans.test/creators/luna");
    return new Response(
      JSON.stringify({
        id: "api_luna",
        userId: "api_user_luna",
        handle: "luna",
        displayName: "API Luna",
        bio: "Loaded from API",
        category: "Music",
        subscriberCount: 42,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  const creator = await getCreatorByHandle("luna");

  assert.equal(creator?.id, "api_luna");
  assert.equal(creator?.displayName, "API Luna");
  assert.equal(creator?.subscriberCount, 42);
});

test("getCreatorByHandle returns null for an unknown handle when the API is unavailable", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () => {
    throw new Error("offline");
  };

  const creator = await getCreatorByHandle("unknown-creator");

  assert.equal(creator, null);
});
