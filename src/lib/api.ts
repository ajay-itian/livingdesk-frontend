// lib/api.ts - Single source of truth for API configuration

/**
 * Get API base URL from environment
 * Priority: Vite env → CRA env → Window config → Default
 */
const getApiBase = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }

  if (typeof window !== 'undefined' && (window as any).APP_CONFIG?.API_BASE) {
    return (window as any).APP_CONFIG.API_BASE;
  }

  return 'http://localhost:8000';
};

/**
 * Get API key from environment
 */
const getApiKey = (): string | null => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
    return import.meta.env.VITE_API_KEY;
  }

  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_KEY) {
    return process.env.REACT_APP_API_KEY;
  }

  if (typeof window !== 'undefined' && (window as any).APP_CONFIG?.API_KEY) {
    return (window as any).APP_CONFIG.API_KEY;
  }

  return null;
};

export const API_BASE = getApiBase();
const API_KEY = getApiKey();

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

  if (API_KEY) {
    headers.set('X-API-Key', API_KEY);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Type-safe API client with error handling
 */
export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetchWithApiKey(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetchWithApiKey(`${API_BASE}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetchWithApiKey(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  async delete(endpoint: string): Promise<void> {
    const response = await fetchWithApiKey(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
  },
};

// Development helper
if (import.meta.env?.DEV) {
  console.log('API Config:', {
    baseUrl: API_BASE,
    hasApiKey: !!API_KEY,
  });
}