//API.ts
export const API_BASE = import.meta.env.VITE_API_BASE;

export const fetchWithApiKey = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_API_KEY,
      ...options.headers,
    },
  });
};
