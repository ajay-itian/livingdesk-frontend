import { API_BASE, fetchWithApiKey } from '../lib/api';
import type { Blog } from '../types';

export const api = {
    // Fetch all blogs (optionally filtered by status)
    getBlogs: async (status?: string): Promise<Blog[]> => {
        const url = new URL(`${API_BASE}/blogs`);
        if (status) {
            url.searchParams.append('status', status);
        }

        const response = await fetchWithApiKey(url.toString());

        if (!response.ok) {
            throw new Error(`Failed to fetch blogs: ${response.statusText}`);
        }

        return response.json();
    },

    // Fetch a single blog by slug
    getBlogBySlug: async (slug: string): Promise<Blog> => {
        const url = `${API_BASE}/blogs/slug/${slug}`;
        const response = await fetchWithApiKey(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch blog with slug "${slug}": ${response.statusText}`);
        }

        return response.json();
    },
};
