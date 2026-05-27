/**
 * Preservation Property Tests
 *
 * Validates: Requirements 3.1, 3.2
 *
 * PURPOSE: Confirm the baseline behavior of `src/config/api.ts` that MUST be
 * preserved after the bug fix is applied. These tests run on the UNFIXED code
 * and are expected to PASS — they document what the fix must not break.
 *
 * Property 2: Preservation — Non-GET Requests Still Include Content-Type
 *   For all methods in ['POST', 'PATCH', 'DELETE', 'PUT']:
 *   `Content-Type: application/json` MUST be present when the caller has not
 *   set it explicitly.
 *
 * Property 3: Preservation — API Key Headers Injected on All Requests
 *   For all methods in ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE']:
 *   `x-api-key` MUST equal the configured API key value.
 *
 * EXPECTED OUTCOME ON UNFIXED CODE: ALL TESTS PASS.
 * Passing confirms the baseline behavior we must preserve after the fix.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { fetchWithApiKey } from "../config/api";

const TEST_URL = "https://api.example.com/rooms";
const TEST_API_KEY = "test-key";

describe("Preservation: src/config/api.ts fetchWithApiKey — baseline behavior to preserve after fix", () => {
  let capturedHeaders: Headers | undefined;

  beforeEach(() => {
    capturedHeaders = undefined;

    // Mock global fetch to capture the Headers object passed to it
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) => {
        capturedHeaders = new Headers(init?.headers as HeadersInit | undefined);
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      })
    );

    process.env.NEXT_PUBLIC_API_KEY = TEST_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_API_KEY;
  });

  /**
   * Property 2: Content-Type preservation for non-GET/HEAD methods
   *
   * Iterates over all body-carrying methods and asserts that
   * `Content-Type: application/json` is present when the caller has not set it.
   *
   * Validates: Requirements 3.1
   */
  describe("Property 2: Content-Type: application/json is present for non-GET/HEAD methods", () => {
    const bodyMethods = ["POST", "PATCH", "DELETE", "PUT"] as const;

    for (const method of bodyMethods) {
      it(`${method} request — Content-Type should be 'application/json'`, async () => {
        await fetchWithApiKey(TEST_URL, { method });

        expect(capturedHeaders).toBeDefined();
        expect(capturedHeaders!.get("Content-Type")).toBe("application/json");
      });
    }
  });

  /**
   * Property 3: x-api-key preservation for all methods
   *
   * Iterates over all methods (including GET and HEAD) and asserts that
   * `x-api-key` equals the configured API key value.
   *
   * Validates: Requirements 3.2
   */
  describe("Property 3: x-api-key header is present on all methods", () => {
    const allMethods = ["GET", "HEAD", "POST", "PATCH", "DELETE"] as const;

    for (const method of allMethods) {
      it(`${method} request — x-api-key should equal '${TEST_API_KEY}'`, async () => {
        await fetchWithApiKey(TEST_URL, { method });

        expect(capturedHeaders).toBeDefined();
        expect(capturedHeaders!.get("x-api-key")).toBe(TEST_API_KEY);
      });
    }
  });
});
