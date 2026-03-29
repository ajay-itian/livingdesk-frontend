// app/blogs/BlogsPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Loader2, Clock, ArrowRight, Eye, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface BlogData {
    blog_id: string;
    title: string;
    slug: string;
    s3_url: string;
    s3_key: string;
    created_at: string;
    status: string;
    views: number;
    likes: number;
}

interface ExtendedBlog extends BlogData {
    isLiked: boolean;
    displayImage: string;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const API_BASE = "https://evzp3stpn2.execute-api.ap-south-1.amazonaws.com/prod/api";

// Free-to-use coworking images from Pexels CDN — same list as the backend.
// Image is picked deterministically from the slug so it's always consistent.
const COWORKING_IMAGES = [
    "https://images.pexels.com/photos/1181304/pexels-photo-1181304.jpeg?w=800",
    "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?w=800",
    "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?w=800",
    "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?w=800",
    "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?w=800",
    "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?w=800",
    "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=800",
    "https://images.pexels.com/photos/7974/pexels-photo.jpg?w=800",
    "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?w=800",
    "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?w=800",
];

const FALLBACK_IMAGE = COWORKING_IMAGES[0];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Deterministic image pick from slug — same blog always gets same image. */
function pickImage(slug: string): string {
    if (!slug) return FALLBACK_IMAGE;
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
    }
    return COWORKING_IMAGES[hash % COWORKING_IMAGES.length];
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const BlogsPage = () => {
    const router = useRouter();
    const [blogs, setBlogs] = useState<ExtendedBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${API_BASE}/blogs?limit=50`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);

            const data = await res.json();
            const rawBlogs: BlogData[] = Array.isArray(data) ? data : (data.blogs ?? data.items ?? []);

            const processedBlogs: ExtendedBlog[] = rawBlogs
                .filter(b => {
                    const status = (b.status ?? "").toLowerCase();
                    return status === "completed" || status === "published";
                })
                .map(blog => {
                    const likedKey = `liked_${blog.blog_id}`;
                    const isLiked = typeof window !== "undefined"
                        && localStorage.getItem(likedKey) === "true";

                    return {
                        ...blog,
                        isLiked,
                        displayImage: pickImage(blog.slug),
                    };
                });

            // Sort newest first
            processedBlogs.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            });

            setBlogs(processedBlogs);
        } catch (err: unknown) {
            console.error("Load Error:", err);
            setError("Unable to load blogs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const openBlog = (blog: ExtendedBlog) => {
        // Navigate by slug — no view increment here, BlogDetailPage handles it
        router.push(`/blogs/${blog.slug}`);
    };

    const handleLike = async (e: React.MouseEvent, blog: ExtendedBlog) => {
        e.stopPropagation();

        const likedKey = `liked_${blog.blog_id}`;
        if (localStorage.getItem(likedKey) === "true") return;

        try {
            const res = await fetch(`${API_BASE}/blogs/${blog.blog_id}/like`, { method: "POST" });
            if (res.ok) {
                localStorage.setItem(likedKey, "true");
                setBlogs(prev =>
                    prev.map(b =>
                        b.blog_id === blog.blog_id
                            ? { ...b, likes: b.likes + 1, isLiked: true }
                            : b
                    )
                );
            }
        } catch {
            // silently fail — don't disrupt UX
        }
    };

    // ─────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-foreground">
                            The Living Desk Blog
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Insights for the Pune community.
                        </p>
                    </div>

                    {/* States */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground text-lg">{error}</p>
                            <button
                                onClick={loadData}
                                className="mt-4 text-primary underline text-sm"
                            >
                                Retry
                            </button>
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground text-lg">No blogs published yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map(blog => (
                                <Card
                                    key={blog.blog_id}
                                    onClick={() => openBlog(blog)}
                                    className="cursor-pointer group overflow-hidden border-border/50 bg-card hover:shadow-2xl transition-all duration-500"
                                >
                                    <CardContent className="p-0">
                                        {/* Thumbnail */}
                                        <div className="relative overflow-hidden h-56 bg-muted">
                                            <img
                                                src={blog.displayImage}
                                                alt={blog.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={e => {
                                                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                                }}
                                            />
                                            <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
                                                <Clock className="w-3 h-3" />
                                                2 min
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {blog.created_at
                                                    ? new Date(blog.created_at).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric",
                                                    })
                                                    : "Recently"}
                                            </div>

                                            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary h-14">
                                                {blog.title}
                                            </h3>

                                            {/* Static tagline — no content stored in DB */}
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                Practical insights for Pune freelancers, startups, and remote workers.
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <Button variant="ghost" size="sm" className="px-0 font-semibold text-primary">
                                                    Read Now <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>

                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                    {/* Like button */}
                                                    <button
                                                        onClick={e => handleLike(e, blog)}
                                                        className={`flex items-center gap-1 transition-colors ${blog.isLiked ? "text-rose-500" : "hover:text-rose-400"
                                                            }`}
                                                        title={blog.isLiked ? "Liked!" : "Like this post"}
                                                    >
                                                        <Heart
                                                            className="w-4 h-4"
                                                            fill={blog.isLiked ? "currentColor" : "none"}
                                                        />
                                                        <span className="text-xs">{blog.likes}</span>
                                                    </button>

                                                    {/* Views (read-only display) */}
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4" />
                                                        <span className="text-xs">{blog.views}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default BlogsPage;