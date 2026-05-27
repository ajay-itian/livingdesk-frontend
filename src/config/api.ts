//API.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export const fetchWithApiKey = async (url: string, options: RequestInit = {}) => {
  const method = (options.method ?? 'GET').toUpperCase();
  const extraHeaders: Record<string, string> = {
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY as string,
  };
  if (method !== 'GET' && method !== 'HEAD') {
    extraHeaders["Content-Type"] = "application/json";
  }
  return fetch(url, {
    ...options,
    headers: {
      ...extraHeaders,
      ...options.headers,
    },
  });
};
