/**
 * Bug Condition Exploration Test
 *
 * Validates: Requirements 1.1, 1.2
 *
 * PURPOSE: Surface the bug in `src/config/api.ts` where `fetchWithApiKey`
 * unconditionally sets `Content-Type: application/json` on ALL requests,
 * including GET and HEAD. This causes the browser to send a CORS preflight
 * (OPTIONS) before the actual GET. Because the AWS API Gateway `/rooms` route
 * has no OPTIONS handler, it returns 405 — blocking the rooms fetch entirely.
 *
 * EXPECTED OUTCOME ON UNFIXED CODE: ALL THREE TESTS FAIL.
 * Failure is the correct result — it proves the bug exists.
 *
 * Counterexample documented:
 *   GET request (no options)  → headers contain "Content-Type: application/json"
 *   GET request (explicit)    → headers contain "Content-Type: application/json"
 *   HEAD request              → headers contain "Content-Type: application/json"
 *
 * These headers make the request "non-simple" under the CORS spec, forcing a
 * preflight. The API Gateway returns 405 for OPTIONS → browser blocks the GET
 * → rooms never load → booking UI is broken.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We import the UNFIXED version from src/config/api.ts
// (not src/lib/api.ts which already has a partial fix)
import { fetchWithApiKey } from "../config/api";

const TEST_URL = "https://api.example.com/rooms";

describe("Bug Condition: src/config/api.ts fetchWithApiKey — GET/HEAD must NOT include Content-Type", () => {
  let capturedHeaders: Headers | undefined;

  beforeEach(() => {
    capturedHeaders = undefined;

    // Mock global fetch to capture the Headers object passed to it
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) => {
        // Normalise whatever was passed into a real Headers object so we can
        // use .has() / .get() regardless of whether the caller passed a plain
        // object, a Headers instance, or nothing at all.
        capturedHeaders = new Headers(init?.headers as HeadersInit | undefined);
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      })
    );

    // Ensure the API key env var is set so it doesn't interfere with the
    // Content-Type assertion (we're only checking Content-Type here).
    process.env.NEXT_PUBLIC_API_KEY = "test-api-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_API_KEY;
  });

  /**
   * Test 1: Default GET (no options passed)
   *
   * Bug counterexample: Content-Type is "application/json" on a GET request.
   * This triggers a CORS preflight → API Gateway returns 405.
   *
   * Validates: Requirements 1.1, 1.2
   */
  it("GET with no options — Content-Type should NOT be in headers", async () => {
    await fetchWithApiKey(TEST_URL);

    expect(capturedHeaders).toBeDefined();
    // FAILS on unfixed code: Content-Type: application/json is present
    expect(capturedHeaders!.has("Content-Type")).toBe(false);
  });

  /**
   * Test 2: Explicit GET method
   *
   * Bug counterexample: Content-Type is "application/json" even when the
   * caller explicitly specifies method: 'GET'.
   *
   * Validates: Requirements 1.1, 1.2
   */
  it("GET with explicit { method: 'GET' } — Content-Type should NOT be in headers", async () => {
    await fetchWithApiKey(TEST_URL, { method: "GET" });

    expect(capturedHeaders).toBeDefined();
    // FAILS on unfixed code: Content-Type: application/json is present
    expect(capturedHeaders!.has("Content-Type")).toBe(false);
  });

  /**
   * Test 3: HEAD request
   *
   * Bug counterexample: Content-Type is "application/json" on a HEAD request.
   * HEAD is also a "safe" method that should never carry a body or Content-Type.
   *
   * Validates: Requirements 1.1, 1.2
   */
  it("HEAD request — Content-Type should NOT be in headers", async () => {
    await fetchWithApiKey(TEST_URL, { method: "HEAD" });

    expect(capturedHeaders).toBeDefined();
    // FAILS on unfixed code: Content-Type: application/json is present
    expect(capturedHeaders!.has("Content-Type")).toBe(false);
  });
});
