// lib/api.ts

/**
 * Get API base URL from environment
 */
const getApiBase = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) {
    // Remove trailing slash from base if present to avoid double slashes later
    return import.meta.env.VITE_API_BASE.replace(/\/$/, '');
  }
  return 'http://localhost:8000/api'; // Default fallback
};

/**
 * Get API key from environment
 */
const getApiKey = (): string | null => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
    return import.meta.env.VITE_API_KEY;
  }
  return null;
};

export const API_BASE = getApiBase();
const API_KEY = getApiKey();

/**
 * Helper to ensure correct URL formatting.
 * UPDATED: No longer forces trailing slashes. Relies on Backend redirects.
 */
const normalizeEndpoint = (endpoint: string): string => {
  const [path, query] = endpoint.split('?');

  // Ensure path starts with /
  let safePath = path.startsWith('/') ? path : `/${path}`;

  // Removed the logic that forced a trailing slash. 
  // We now rely on the Backend 'redirect_slashes=True' to handle mismatches.

  return query ? `${safePath}?${query}` : safePath;
};

/**
 * Enhanced fetch wrapper with automatic API key injection
 */
export const fetchWithApiKey = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Ensure consistent API Key header
  if (API_KEY) {
    headers.set('Api-Key', API_KEY);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Type-safe API client
 */
export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const safeEndpoint = normalizeEndpoint(endpoint);
    const fullUrl = `${API_BASE}${safeEndpoint}`;

    // Debug log to see exactly what is being requested
    // console.log(`📡 GET Request: ${fullUrl}`);

    const response = await fetchWithApiKey(fullUrl);

    if (!response.ok) {
      console.error(`GET ${safeEndpoint} failed:`, response.status, response.statusText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const safeEndpoint = normalizeEndpoint(endpoint);
    const response = await fetchWithApiKey(`${API_BASE}${safeEndpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.error(`POST ${safeEndpoint} failed:`, response.status);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const safeEndpoint = normalizeEndpoint(endpoint);
    const response = await fetchWithApiKey(`${API_BASE}${safeEndpoint}`, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async delete(endpoint: string): Promise<void> {
    const safeEndpoint = normalizeEndpoint(endpoint);
    const response = await fetchWithApiKey(`${API_BASE}${safeEndpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  },
};