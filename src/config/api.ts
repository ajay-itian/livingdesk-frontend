// API configuration with environment variables
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const API_KEY = import.meta.env.VITE_API_KEY || "test-api-key-12345";

console.log("🔧 API Config:", { API_BASE, API_KEY: API_KEY.substring(0, 10) + "..." });

export const fetchWithApiKey = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...options.headers,
    },
  });
};

export { API_BASE, API_KEY };