// lib/api.ts

/**
 * Get API base URL from environment
 * Supports Vite (import.meta.env) and standard Node/Next.js (process.env)
 */
const getApiBase = (): string => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE.replace(/\/$/, '');
  }
  return 'http://localhost:8000/api';
};

const getApiKey = (): string | null => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_KEY) {
    return process.env.NEXT_PUBLIC_API_KEY;
  }
  return null;
};

export const API_BASE = getApiBase();
const API_KEY = getApiKey();

/**
 * Ensures endpoints start with a slash and do not have double slashes when combined
 */
const normalizeEndpoint = (endpoint: string): string => {
  const [path, query] = endpoint.split('?');
  let safePath = path.startsWith('/') ? path : `/${path}`;
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
  const method = (options.method ?? 'GET').toUpperCase();

  // Avoid adding Content-Type for GET/HEAD requests because
  // `Content-Type: application/json` makes them non-simple CORS requests.
  // That can trigger preflight checks and fail if the gateway does not
  // handle OPTIONS correctly for the route.
  if (method !== 'GET' && method !== 'HEAD' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (API_KEY) {
    // NOTE: `x-api-key` and `Api-Key` are non-simple CORS headers.
    // They will trigger a CORS preflight (OPTIONS) on cross-origin requests
    // regardless of the HTTP method — including GET — even after the
    // Content-Type fix above.  The API Gateway must therefore have an OPTIONS
    // handler configured for every GET route that is called cross-origin
    // (e.g. /rooms, /bookings/availability) in order to fully resolve the
    // 405 error.  Configuring OPTIONS on the API Gateway is a remaining
    // infrastructure concern outside this frontend codebase.

    // Standard custom header for FastAPI
    headers.set('Api-Key', API_KEY);

    // AWS API Gateway may require x-api-key specifically.
    headers.set('x-api-key', API_KEY);
  }

  return fetch(url, {
    ...options,
    method,
    headers,
  });
};

/**
 * Helper to parse error response and throw it in a structure 
 * that matches what the frontend expects (err.response.data).
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }

    // Create a custom error object that mimics Axios error structure
    const error: any = new Error(errorData.detail || `HTTP Error ${response.status}`);
    error.response = {
      data: errorData,
      status: response.status,
      statusText: response.statusText
    };
    throw error;
  }

  // Return null if status is 204 (No Content), otherwise parse JSON
  if (response.status === 204) return null;
  return response.json();
};

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const safeEndpoint = normalizeEndpoint(endpoint);
    const fullUrl = `${API_BASE}${safeEndpoint}`;
    // console.log(`📡 GET Request: ${fullUrl}`); 
    const response = await fetchWithApiKey(fullUrl);
    return handleResponse(response);
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const safeEndpoint = normalizeEndpoint(endpoint);
    const fullUrl = `${API_BASE}${safeEndpoint}`;
    // console.log(`📡 POST Request: ${fullUrl}`);
    const response = await fetchWithApiKey(fullUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const safeEndpoint = normalizeEndpoint(endpoint);
    const response = await fetchWithApiKey(`${API_BASE}${safeEndpoint}`, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(response);
  },

  async delete(endpoint: string): Promise<void> {
    const safeEndpoint = normalizeEndpoint(endpoint);
    const response = await fetchWithApiKey(`${API_BASE}${safeEndpoint}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};