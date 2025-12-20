import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Calendar, ExternalLink, Share2, Loader2,
    BookOpen, Clock, ArrowRight, Eye, Heart
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Blog } from "@/types";

// Interface Extension
interface ExtendedBlog extends Blog {
    htmlUrl?: string;
    views?: number;
    likes?: number;
    isLiked?: boolean;
}

const BlogsPage = () => {
    // State
    const [blogs, setBlogs] = useState<ExtendedBlog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // ==========================================
    // 🔧 CONFIGURATION 
    // ==========================================
    // These load from your .env file to fix the mobile connection issue
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
    const API_KEY = import.meta.env.VITE_API_KEY || "";

    // S3 Configuration
    const S3_BUCKET = "thelivingdesk-backend-blogsbucket-srif3kik1lob";
    const S3_REGION = "ap-south-1";
    const S3_PREFIX = "blogs/";
    const bucketBase = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

    // Fallback images (prevents "Same Image" bug)
    const FALLBACK_IMAGES = [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
        "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=800"
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Parallel Fetch: Get S3 Files AND Database Stats
            const [s3Blogs, blogStats] = await Promise.all([
                fetchS3Blogs(),
                fetchBlogStats()
            ]);

            // 2. Merge Data
            const mergedBlogs = s3Blogs.map(blog => {
                const pureId = blog.htmlUrl?.split('/').pop()?.replace('.html', '') || blog.id;
                const stats = blogStats[pureId] || { views: 0, likes: 0 };

                // Check if user already liked this post in the past
                const localLiked = localStorage.getItem(`liked_${pureId}`) === 'true';

                return {
                    ...blog,
                    views: stats.views,
                    likes: stats.likes,
                    isLiked: localLiked
                };
            });

            // 3. Sort by Date (Newest First)
            mergedBlogs.sort(
                (a, b) =>
                    new Date(b.published_at || b.created_at).getTime() -
                    new Date(a.published_at || a.created_at).getTime()
            );

            setBlogs(mergedBlogs);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load blogs";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // --- API Helper: Fetch Stats ---
    const fetchBlogStats = async (): Promise<Record<string, { views: number, likes: number }>> => {
        try {
            const res = await fetch(`${API_BASE}/blogs/stats/all`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": API_KEY // <--- Critical for AWS connection
                }
            });
            if (!res.ok) return {};
            return await res.json();
        } catch (e) {
            console.error("Failed to fetch stats", e);
            return {};
        }
    };

    // --- Action: Increment View ---
    const incrementView = async (blog: ExtendedBlog) => {
        try {
            const pureId = blog.htmlUrl?.split('/').pop()?.replace('.html', '');
            if (pureId) {
                // Fire and forget
                fetch(`${API_BASE}/blogs/${pureId}/view`, {
                    method: "POST",
                    headers: { "x-api-key": API_KEY }
                });
            }
        } catch (e) {
            console.error("Failed to increment view", e);
        }
    };

    // --- Action: Handle Like ---
    const handleLike = async (e: React.MouseEvent, blog: ExtendedBlog) => {
        e.stopPropagation(); // Stop click from opening the blog
        if (blog.isLiked) return; // Prevent spamming likes

        const pureId = blog.htmlUrl?.split('/').pop()?.replace('.html', '');

        // 1. Optimistic Update (Update UI instantly)
        setBlogs(prev => prev.map(b =>
            b.id === blog.id
                ? { ...b, likes: (b.likes || 0) + 1, isLiked: true }
                : b
        ));

        // 2. Save state locally
        if (pureId) localStorage.setItem(`liked_${pureId}`, 'true');

        // 3. Send to API
        try {
            if (pureId) {
                await fetch(`${API_BASE}/blogs/${pureId}/like`, {
                    method: "POST",
                    headers: { "x-api-key": API_KEY }
                });
            }
        } catch (err) {
            console.error("Failed to like", err);
        }
    };

    // --- S3 Parsing Logic ---
    const fetchS3Blogs = async (): Promise<ExtendedBlog[]> => {
        const listUrl = `${bucketBase}?list-type=2&prefix=${S3_PREFIX}&t=${Date.now()}`;
        const res = await fetch(listUrl);
        if (!res.ok) throw new Error("Unable to list S3 objects");

        const xmlText = await res.text();
        const xml = new DOMParser().parseFromString(xmlText, "text/xml");
        const allKeys = Array.from(xml.getElementsByTagName("Key")).map(k => k.textContent || "");

        // Find matching images in S3 bucket
        const imageSet = new Set(allKeys.filter(k => /\.(jpg|jpeg|png|webp|gif)$/i.test(k)));
        const htmlKeys = allKeys.filter((k) => k.endsWith(".html"));

        const blogPromises = htmlKeys.map(async (key) => {
            const baseKey = key.replace(/\.html$/, "");
            let s3Image = null;
            // Try to find an image with the same name as the HTML file
            for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
                if (imageSet.has(baseKey + ext)) {
                    s3Image = `${bucketBase}/${baseKey}${ext}`;
                    break;
                }
            }

            const fileUrl = `${bucketBase}/${key}?t=${Date.now()}`;
            const r = await fetch(fileUrl);
            if (!r.ok) return null;
            const html = await r.text();
            return extractFromHTML(html, key, s3Image);
        });

        return (await Promise.all(blogPromises)).filter(Boolean) as ExtendedBlog[];
    };

    const extractFromHTML = (html: string, key: string, s3Image: string | null): ExtendedBlog => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const getMeta = (name: string) => doc.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`)?.getAttribute("content");

        const parts = key.split("/");
        const fileName = parts[parts.length - 1] || "";
        const fileNameWithoutExt = fileName.replace(".html", "").replace(/-/g, ' ');
        const capitalizeWords = (str: string) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        const title = getMeta("title") || getMeta("og:title") || doc.title || capitalizeWords(fileNameWithoutExt);
        const description = getMeta("description") || getMeta("og:description") || "";
        const id = key.replace(/\//g, '-');

        // Image Selection Priority:
        // 1. S3 File with same name -> 2. <img class="featured"> -> 3. Meta og:image -> 4. Random Fallback
        let image = s3Image;
        if (!image) { const featuredImg = doc.querySelector('img.featured-image') as HTMLImageElement; if (featuredImg) image = featuredImg.src; }
        if (!image) image = getMeta("og:image") || getMeta("image");
        if (!image) { const firstImg = doc.querySelector('img') as HTMLImageElement; if (firstImg) image = firstImg.src; }

        // Fallback generator
        if (!image || image.includes("onerror")) {
            let hash = 0;
            for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
            image = FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
        }

        const author = getMeta("author") || "The Living Desk Team";
        const date = getMeta("published_time") || getMeta("date") || new Date().toISOString();
        const slug = fileName.replace(".html", "") || id;
        const tags = getMeta("keywords") ? getMeta("keywords")!.split(",").map((t) => t.trim()) : ["Coworking"];

        return {
            id, slug, title, excerpt: description, content: description,
            image_url: image!, author, created_at: date, published_at: date,
            status: "published", tags, htmlUrl: key
        };
    };

    // --- Interaction Handlers ---
    const getPublicUrl = (blog: ExtendedBlog) => `${bucketBase}/${blog.htmlUrl}`;

    const openBlog = (blog: ExtendedBlog) => {
        incrementView(blog);
        window.open(getPublicUrl(blog), "_blank", "noopener,noreferrer");
        setBlogs(prev => prev.map(b =>
            b.id === blog.id ? { ...b, views: (b.views || 0) + 1 } : b
        ));
    };

    const handleShare = async (e: React.MouseEvent, blog: ExtendedBlog) => {
        e.stopPropagation();
        const url = getPublicUrl(blog);
        try {
            if (navigator.share) await navigator.share({ title: blog.title, url });
            else { await navigator.clipboard.writeText(url); alert("Link copied!"); }
        } catch (err) { console.error("Share failed", err); }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const getReadTime = (text: string) => Math.max(3, Math.ceil(text.split(/\s+/).length / 200) + 2);

    return (
        <>
            <Navbar />
            <div className="pt-16 min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
                <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 py-12 md:py-16 border-b border-primary/10">
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4 border border-primary/20">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span className="text-primary text-sm font-semibold">Insights & Stories</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">The Living Desk Blog</h1>
                        <p className="text-primary/80 text-lg max-w-2xl font-medium">Insights on coworking, productivity & the future of work.</p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="mt-4 text-muted-foreground">Fetching latest stories...</p>
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {blogs.map((blog) => (
                                <Card
                                    key={blog.id}
                                    onClick={() => openBlog(blog)}
                                    onMouseEnter={() => setHoveredCard(blog.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    className="cursor-pointer group overflow-hidden border-border/50 bg-card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                                >
                                    <div className="relative h-52 overflow-hidden">
                                        <img
                                            src={blog.image_url}
                                            alt={blog.title}
                                            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGES[0]; }}
                                        />
                                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 text-xs font-medium backdrop-blur-sm">
                                                <Clock className="w-3 h-3" /> {getReadTime(blog.excerpt)} min
                                            </div>


                                        </div>
                                    </div>

                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            <span>{formatDate(blog.published_at)}</span>
                                        </div>

                                        <h2 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                            {blog.title}
                                        </h2>

                                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                            {blog.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <Button variant="secondary" size="sm" className="h-8 px-3" onClick={(e) => { e.stopPropagation(); openBlog(blog); }}>
                                                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Read
                                                </Button>

                                                {/* Like Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-8 w-8 transition-all duration-300 ${blog.isLiked ? 'text-red-500 bg-red-50 scale-110' : 'text-muted-foreground hover:text-red-500'}`}
                                                    onClick={(e) => handleLike(e, blog)}
                                                >
                                                    <Heart className={`w-4 h-4 ${blog.isLiked ? 'fill-current' : ''}`} />
                                                </Button>
                                                {/* Like Counter */}
                                                <span className={`text-xs font-medium ${blog.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                    {blog.likes || 0}
                                                </span>

                                                {/* Views Counter */}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 text-xs font-medium backdrop-blur-sm">
                                                    <Eye className="w-3 h-3 text-primary" />
                                                    {blog.views?.toLocaleString() || 0}
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={(e) => handleShare(e, blog)}
                                            >
                                                <Share2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 py-16 mt-8 border-t border-primary/10">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                            Ready to Transform Your Workspace?
                        </h2>
                        <Button asChild size="lg" className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                            <Link to="/">
                                Explore Our Spaces
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </div>
        </>
    );
};

export default BlogsPage;