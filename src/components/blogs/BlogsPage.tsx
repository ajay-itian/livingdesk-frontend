"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Share2, Loader2, Clock, ArrowRight, Eye, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Blog } from "@/types";

interface ExtendedBlog extends Blog {
    htmlUrl?: string;
    cleanUrl?: string;
    views?: number;
    likes?: number;
    isLiked?: boolean;
}

/**
 * MIMICS BACKEND LOGIC: Sanitizes titles into slugs that match S3 filenames.
 * This prevents 404s and accidental redirects to the home page.
 */
const generateBackendMatchSlug = (title: string): string => {
    const STOP_WORDS = new Set([
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
        "with", "by", "from", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "it", "its", "this", "that", "these", "those",
        "as", "into", "through", "how", "your", "our", "their", "my", "his", "her",
        "we", "you", "they", "i", "up", "out", "about", "than", "so", "if", "all",
        "can", "just", "over", "like", "what", "which", "who", "not", "no",
    ]);

    if (!title) return "blog-post";

    // Lowercase and remove special characters
    let slug = title.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

    // Split words and filter stop words
    let words = slug.split(/\s+/).filter(w => w && !STOP_WORDS.has(w));

    // Join with hyphens
    slug = words.join("-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");

    // Cap at 60 chars on a word boundary (Matching Python's rfind logic)
    if (slug.length > 60) {
        const truncated = slug.substring(0, 60);
        const lastHyphen = truncated.lastIndexOf("-");
        slug = lastHyphen !== -1 ? truncated.substring(0, lastHyphen) : truncated;
    }

    return slug || "blog-post";
};

const BlogsPage = () => {
    const [blogs, setBlogs] = useState<ExtendedBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
    const S3_BUCKET = "thelivingdesk-blogs-313701249911-ap-south-1";
    const S3_REGION = "ap-south-1";
    const S3_PREFIX = "blogs/";
    const bucketBase = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

    const FALLBACK_IMAGES = [
        "https://images.pexels.com/photos/1181304/pexels-photo-1181304.jpeg?w=800",
        "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?w=800",
        "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?w=800",
        "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?w=800",
    ];

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [s3Blogs, blogStats] = await Promise.all([
                fetchS3Blogs(),
                fetchBlogStats(),
            ]);

            const mergedBlogs = s3Blogs.map(blog => {
                const stats = blogStats[blog.id] || { views: 0, likes: 0 };
                const localLiked = localStorage.getItem(`liked_${blog.id}`) === "true";
                return { ...blog, views: stats.views, likes: stats.likes, isLiked: localLiked };
            });

            mergedBlogs.sort((a, b) =>
                new Date(b.published_at || b.created_at).getTime() -
                new Date(a.published_at || a.created_at).getTime()
            );

            setBlogs(mergedBlogs);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to load blogs";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const fetchBlogStats = async (): Promise<Record<string, { views: number; likes: number }>> => {
        try {
            const res = await fetch(`${API_BASE}/blogs/stats/all`, {
                headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
            });
            return res.ok ? await res.json() : {};
        } catch (e) {
            return {};
        }
    };

    const fetchS3Blogs = async (): Promise<ExtendedBlog[]> => {
        const listUrl = `${bucketBase}?list-type=2&prefix=${S3_PREFIX}&t=${Date.now()}`;
        const res = await fetch(listUrl);
        if (!res.ok) throw new Error("Unable to access S3 bucket.");

        const xmlText = await res.text();
        const xml = new DOMParser().parseFromString(xmlText, "text/xml");
        const s3Meta = new Map<string, string>();

        Array.from(xml.getElementsByTagName("Contents")).forEach(c => {
            const key = c.getElementsByTagName("Key")[0]?.textContent || "";
            const date = c.getElementsByTagName("LastModified")[0]?.textContent || "";
            s3Meta.set(key, date);
        });

        const allKeys = Array.from(xml.getElementsByTagName("Key")).map(k => k.textContent || "");
        const imageSet = new Set(allKeys.filter(k => /\.(jpg|jpeg|png|webp|gif)$/i.test(k)));
        const htmlKeys = allKeys.filter(k => k.endsWith(".html"));

        const blogPromises = htmlKeys.map(async key => {
            const baseKey = key.replace(/\.html$/, "");
            let s3Image: string | null = null;
            for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
                if (imageSet.has(baseKey + ext)) {
                    s3Image = `${bucketBase}/${baseKey}${ext}`;
                    break;
                }
            }
            const fileUrl = `${bucketBase}/${key}?t=${Date.now()}`;
            const r = await fetch(fileUrl);
            if (!r.ok) return null;

            const html = await r.text();
            const s3Date = s3Meta.get(key) || new Date().toISOString();
            return extractFromHTML(html, key, s3Image, s3Date);
        });

        return (await Promise.all(blogPromises)).filter(Boolean) as ExtendedBlog[];
    };

    const extractFromHTML = (
        html: string,
        s3Key: string,
        s3Image: string | null,
        s3CreatedDate: string,
    ): ExtendedBlog => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const getMeta = (name: string) =>
            doc.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`)
                ?.getAttribute("content");

        const fileName = s3Key.split("/").pop() || "";
        const slugFromS3 = fileName.replace(".html", "");

        const title = getMeta("title") || getMeta("og:title") || doc.title || slugFromS3.replace(/-/g, " ");
        const description = getMeta("description") || getMeta("og:description") || "";

        // IMPORTANT: We use the S3 slug as the source of truth for the ID/URL
        const slug = slugFromS3;

        // FIX: Replaced BLOG_BASE with bucketBase so sharing the link gives a working URL
        const cleanUrl = `${bucketBase}/blogs/${slug}.html`;

        let image = s3Image;
        if (!image) {
            const ogImg = getMeta("og:image") || getMeta("image");
            if (ogImg && !ogImg.includes("onerror")) image = ogImg;
        }
        if (!image) {
            let hash = 0;
            for (let i = 0; i < slug.length; i++) {
                hash = slug.charCodeAt(i) + ((hash << 5) - hash);
            }
            image = FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
        }

        let finalDate = s3CreatedDate;
        const internalDate = getMeta("article:published_time") || getMeta("date") || "";
        if (internalDate) {
            const parsed = new Date(internalDate);
            if (!isNaN(parsed.getTime())) finalDate = parsed.toISOString();
        }

        return {
            id: slug,
            slug,
            title,
            excerpt: description,
            content: description,
            image_url: image!,
            author: getMeta("author") || "The Living Desk Team",
            created_at: finalDate,
            published_at: finalDate,
            status: "published",
            tags: getMeta("keywords") ? getMeta("keywords")!.split(",").map(t => t.trim()) : ["Coworking"],
            htmlUrl: s3Key,
            cleanUrl,
        };
    };

    const getBlogUrl = (blog: ExtendedBlog) => {
        // If the slug is missing, generate it from the title to predict the S3 filename
        const finalSlug = blog.slug || generateBackendMatchSlug(blog.title);

        // FIX: Point directly to the S3 bucket to bypass Next.js 404s & redirects
        return `${bucketBase}/blogs/${finalSlug}.html`;
    };

    const openBlog = (blog: ExtendedBlog) => {
        incrementView(blog);
        window.open(getBlogUrl(blog), "_blank", "noopener,noreferrer");
    };

    const incrementView = async (blog: ExtendedBlog) => {
        setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, views: (b.views || 0) + 1 } : b));
        try {
            fetch(`${API_BASE}/blogs/${blog.id}/view`, {
                method: "POST",
                headers: { "x-api-key": API_KEY },
                keepalive: true,
            });
        } catch (e) { console.error(e); }
    };

    const handleLike = async (e: React.MouseEvent, blog: ExtendedBlog) => {
        e.stopPropagation();
        if (blog.isLiked) return;
        setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, likes: (b.likes || 0) + 1, isLiked: true } : b));
        localStorage.setItem(`liked_${blog.id}`, "true");
        try {
            await fetch(`${API_BASE}/blogs/${blog.id}/like`, {
                method: "POST",
                headers: { "x-api-key": API_KEY },
            });
        } catch (err) { console.error(err); }
    };

    const handleShare = async (e: React.MouseEvent, blog: ExtendedBlog) => {
        e.stopPropagation();
        const url = getBlogUrl(blog);
        try {
            if (navigator.share) await navigator.share({ title: blog.title, url });
            else {
                await navigator.clipboard.writeText(url);
                alert("Link copied!");
            }
        } catch (err) { console.error(err); }
    };

    const getReadTime = (text: string) => Math.max(2, Math.ceil((text || "").split(/\s+/).length / 200));

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-500">{error}</p>
                            <Button className="mt-4" onClick={loadData}>Retry</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map(blog => (
                                <Card
                                    key={blog.id}
                                    onClick={() => openBlog(blog)}
                                    className="cursor-pointer group overflow-hidden border-border/50 bg-card hover:shadow-2xl transition-all duration-500"
                                >
                                    <CardContent className="p-0">
                                        <div className="relative overflow-hidden h-56">
                                            <img
                                                src={blog.image_url}
                                                alt={blog.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {getReadTime(blog.excerpt)} min
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(blog.published_at).toLocaleDateString()}
                                            </div>
                                            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                                                {blog.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {blog.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <Button variant="ghost" size="sm">
                                                    Read <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                                <div className="flex items-center gap-2">
                                                    <Heart className={`w-4 h-4 ${blog.isLiked ? "text-red-500 fill-current" : ""}`} onClick={(e) => handleLike(e, blog)} />
                                                    <span className="text-xs">{blog.likes || 0}</span>
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-xs">{blog.views || 0}</span>
                                                    <Share2 className="w-4 h-4" onClick={(e) => handleShare(e, blog)} />
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