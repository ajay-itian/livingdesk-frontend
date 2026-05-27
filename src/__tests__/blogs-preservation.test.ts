/**
 * Preservation property tests for BlogsPage and BlogDetailPage.
 *
 * These tests run against UNFIXED code with mocked fetch (no real S3 calls).
 * They capture baseline frontend behavior that must be preserved after the fix.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import * as fc from "fast-check";

// ---------------------------------------------------------------------------
// Module mocks — must be declared before any component imports
// ---------------------------------------------------------------------------

// Mock next/navigation (BlogsPage uses useRouter)
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/blogs",
}));

// Mock next/link (BlogDetailPage uses Link)
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    React.createElement("a", { href, className }, children),
}));

// Mock Navbar so it doesn't pull in geolocation / next/navigation internals
vi.mock("@/components/Navbar", () => ({
  default: () => React.createElement("nav", { "data-testid": "navbar" }, "Navbar"),
}));

// Mock shadcn/ui components used by BlogsPage to avoid CSS-in-JS issues
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className }: any) =>
    React.createElement("button", { onClick, className }, children),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, onClick, className }: any) =>
    React.createElement("div", { onClick, className, "data-testid": "blog-card" }, children),
  CardContent: ({ children, className }: any) =>
    React.createElement("div", { className }, children),
}));

// ---------------------------------------------------------------------------
// Component imports (after mocks)
// ---------------------------------------------------------------------------
import BlogsPage from "../components/blogs/BlogsPage";
import BlogDetailPage from "../app/blogs/BlogDetailPage";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ManifestEntry {
  slug: string;
  created_at: string;
  title?: string;
  excerpt?: string;
}

function mockFetchOk(body: unknown, contentType = "application/json") {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(text),
    headers: { get: () => contentType },
  });
}

function mockFetchError(status: number) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.reject(new Error("not ok")),
    text: () => Promise.reject(new Error("not ok")),
  });
}

// ---------------------------------------------------------------------------
// BlogsPage tests
// ---------------------------------------------------------------------------

describe("BlogsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Test 1 — Sort preservation
  // -------------------------------------------------------------------------
  it("renders 2 cards with 'b' (newer) appearing before 'a' (older)", async () => {
    const manifest: ManifestEntry[] = [
      { slug: "a", created_at: "2024-01-01" },
      { slug: "b", created_at: "2024-06-01" },
    ];
    vi.stubGlobal("fetch", mockFetchOk(manifest));

    render(React.createElement(BlogsPage));

    await waitFor(() => {
      const cards = screen.getAllByTestId("blog-card");
      expect(cards).toHaveLength(2);
    });

    // The rendered cards should be in descending date order: b then a
    const cards = screen.getAllByTestId("blog-card");
    expect(cards[0].textContent).toContain("B"); // slugToTitle("b") → "B"
    expect(cards[1].textContent).toContain("A"); // slugToTitle("a") → "A"
  });

  // -------------------------------------------------------------------------
  // Test 2 — Empty manifest
  // -------------------------------------------------------------------------
  it("renders 'No blogs published yet.' when manifest is empty", async () => {
    vi.stubGlobal("fetch", mockFetchOk([]));

    render(React.createElement(BlogsPage));

    await waitFor(() => {
      expect(screen.getByText("No blogs published yet.")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 3 — Error state for 403
  // -------------------------------------------------------------------------
  it("renders error state with retry button on 403 and does NOT crash", async () => {
    vi.stubGlobal("fetch", mockFetchError(403));

    expect(() => render(React.createElement(BlogsPage))).not.toThrow();

    await waitFor(() => {
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 4 — Error state for 500
  // -------------------------------------------------------------------------
  it("renders error state with retry button on 500 and does NOT crash", async () => {
    vi.stubGlobal("fetch", mockFetchError(500));

    expect(() => render(React.createElement(BlogsPage))).not.toThrow();

    await waitFor(() => {
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 5 — Property-based: any non-ok status renders error state, never throws
  //
  // Validates: Requirements 3.3
  // **Validates: Requirements 3.3**
  // -------------------------------------------------------------------------
  it("property: for any non-ok status in [400,403,404,500,503], renders error state and never throws", async () => {
    const nonOkStatuses = [400, 403, 404, 500, 503];

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...nonOkStatuses),
        async (status) => {
          vi.stubGlobal("fetch", mockFetchError(status));

          let threw = false;
          let container: HTMLElement | null = null;
          try {
            const result = render(React.createElement(BlogsPage));
            container = result.container;
          } catch {
            threw = true;
          }

          expect(threw).toBe(false);

          if (container) {
            await waitFor(() => {
              const retryEl = container!.querySelector("button, [class*='underline']");
              expect(retryEl).not.toBeNull();
            });
          }

          // Cleanup between runs
          vi.restoreAllMocks();
        }
      ),
      { numRuns: nonOkStatuses.length }
    );
  });
});

// ---------------------------------------------------------------------------
// BlogDetailPage tests
// ---------------------------------------------------------------------------

describe("BlogDetailPage", () => {
  const defaultParams = { slug: "test-post" };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Test 6 — Successful HTML fetch renders article content
  // -------------------------------------------------------------------------
  it("renders article content on successful HTML fetch", async () => {
    const htmlContent = "<h1>Hello World</h1><p>Blog content here.</p>";

    // First fetch (direct .html) succeeds; subsequent API calls can fail silently
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve(htmlContent),
        })
        .mockResolvedValue({
          ok: false,
          status: 404,
          json: () => Promise.reject(new Error("not found")),
          text: () => Promise.reject(new Error("not found")),
        })
    );

    render(React.createElement(BlogDetailPage, { params: defaultParams }));

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 7 — 404 response renders "Post Not Found" with back link
  // -------------------------------------------------------------------------
  it("renders 'Post Not Found' with back link on 404", async () => {
    vi.stubGlobal("fetch", mockFetchError(404));

    render(React.createElement(BlogDetailPage, { params: defaultParams }));

    await waitFor(() => {
      expect(screen.getByText("Post Not Found")).toBeInTheDocument();
      expect(screen.getByText(/back to blogs/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 8 — 403 response renders "Post Not Found" with back link, does NOT crash
  // -------------------------------------------------------------------------
  it("renders 'Post Not Found' with back link on 403 and does NOT crash", async () => {
    vi.stubGlobal("fetch", mockFetchError(403));

    expect(() =>
      render(React.createElement(BlogDetailPage, { params: defaultParams }))
    ).not.toThrow();

    await waitFor(() => {
      expect(screen.getByText("Post Not Found")).toBeInTheDocument();
      expect(screen.getByText(/back to blogs/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 9 — Property-based: any non-ok status renders "Post Not Found", never throws
  //
  // Validates: Requirements 3.3
  // **Validates: Requirements 3.3**
  // -------------------------------------------------------------------------
  it("property: for any non-ok status in [403,404,500], renders 'Post Not Found' and never throws", async () => {
    const nonOkStatuses = [403, 404, 500];

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...nonOkStatuses),
        async (status) => {
          vi.stubGlobal("fetch", mockFetchError(status));

          let threw = false;
          let container: HTMLElement | null = null;
          try {
            const result = render(
              React.createElement(BlogDetailPage, { params: defaultParams })
            );
            container = result.container;
          } catch {
            threw = true;
          }

          expect(threw).toBe(false);

          if (container) {
            await waitFor(() => {
              expect(container!.textContent).toContain("Post Not Found");
            });
          }

          vi.restoreAllMocks();
        }
      ),
      { numRuns: nonOkStatuses.length }
    );
  });
});
