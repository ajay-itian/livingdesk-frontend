//API.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export const fetchWithApiKey = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_API_KEY as string,
      ...options.headers,
    },
  });
};
