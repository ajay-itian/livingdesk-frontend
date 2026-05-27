// components/blogs/BlogsPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Loader2, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const S3_BASE =
    "https://thelivingdesk-blogs-313701249911-ap-south-1.s3.ap-south-1.amazonaws.com";
const MANIFEST_URL = `${S3_BASE}/blogs-manifest.json`;

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

interface ManifestEntry {
    slug: string;
    title?: string;       // ← add these to your manifest generator
    excerpt?: string;     // ← add these to your manifest generator
    created_at: string;
}

function pickImage(slug: string): string {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
    }
    return COWORKING_IMAGES[hash % COWORKING_IMAGES.length];
}

function slugToTitle(slug: string): string {
    return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export default function BlogsPage() {
    const router = useRouter();
    const [blogs, setBlogs] = useState<ManifestEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBlogs();
    }, []);

    const loadBlogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(MANIFEST_URL);
            if (!res.ok) {
                const msg = res.status === 403
                    ? "Blog content is temporarily unavailable. Please try again later."
                    : `Failed to load blog list (${res.status})`;
                throw new Error(msg);
            }
            const manifest: ManifestEntry[] = await res.json();
            manifest.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setBlogs(manifest);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to load blogs. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-foreground">
                            The Living Desk Blog
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Insights for the Pune community.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground text-lg">{error}</p>
                            <button onClick={loadBlogs} className="mt-4 text-primary underline text-sm">
                                Retry
                            </button>
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground text-lg">No blogs published yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map((blog) => (
                                <Card
                                    key={blog.slug}
                                    onClick={() => router.push(`/blogs/${blog.slug}`)}
                                    className="cursor-pointer group overflow-hidden border-border/50 bg-card hover:shadow-2xl transition-all duration-500"
                                >
                                    <CardContent className="p-0">
                                        <div className="relative overflow-hidden h-56 bg-muted">
                                            <img
                                                src={pickImage(blog.slug)}
                                                alt={blog.title || blog.slug}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
                                                <Clock className="w-3 h-3" />
                                                2 min
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {blog.created_at
                                                    ? new Date(blog.created_at).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "Recently"}
                                            </div>
                                            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary h-14">
                                                {blog.title || slugToTitle(blog.slug)}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {blog.excerpt ||
                                                    "Practical insights for Pune freelancers, startups, and remote workers."}
                                            </p>
                                            <div className="pt-4 border-t">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="px-0 font-semibold text-primary"
                                                >
                                                    Read Now <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
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
}