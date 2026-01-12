import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ExternalLink, Share2, Loader2, BookOpen, Clock, ArrowRight, Eye, Heart } from "lucide-react";
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // ==========================================
    // 🔧 CONFIGURATION
    // ==========================================
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
    const API_KEY = import.meta.env.VITE_API_KEY || "";

    // ✅ UPDATED S3 CONFIGURATION
    const S3_BUCKET = "thelivingdesk-backend-blogs-313701249911";
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

            console.log("📊 Blog Stats from API:", blogStats);
            console.log("📁 S3 Blogs:", s3Blogs.map(b => ({ id: b.id, title: b.title })));

            // 2. Merge Data
            const mergedBlogs = s3Blogs.map(blog => {
                const stats = blogStats[blog.id] || { views: 0, likes: 0 };
                const localLiked = localStorage.getItem(`liked_${blog.id}`) === 'true';
                return {
                    ...blog,
                    views: stats.views,
                    likes: stats.likes,
                    isLiked: localLiked
                };
            });

            // 3. Sort by Date (Newest First)
            mergedBlogs.sort(
                (a, b) => new Date(b.published_at || b.created_at).getTime() -
                    new Date(a.published_at || a.created_at).getTime()
            );

            setBlogs(mergedBlogs);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load blogs";
            setError(errorMessage);
            console.error("❌ Error loading blogs:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- API Helper: Fetch Stats ---
    const fetchBlogStats = async (): Promise<Record<string, any>> => {
        try {
            const res = await fetch(`${API_BASE}/blogs/stats/all`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": API_KEY
                }
            });

            if (!res.ok) {
                console.error(`❌ Stats API returned ${res.status}: ${res.statusText}`);
                return {};
            }

            const stats = await res.json();
            return stats;
        } catch (e) {
            console.error("❌ Failed to fetch stats:", e);
            return {};
        }
    };

    // --- Action: Increment View ---
    const incrementView = async (blog: ExtendedBlog) => {
        try {
            if (blog.id) {
                fetch(`${API_BASE}/blogs/${blog.id}/view`, {
                    method: "POST",
                    headers: { "x-api-key": API_KEY }
                });
            }
        } catch (e) {
            console.error("❌ Failed to increment view:", e);
        }
    };

    // --- Action: Handle Like ---
    const handleLike = async (e: React.MouseEvent, blog: ExtendedBlog) => {
        e.stopPropagation();
        if (blog.isLiked) return;

        setBlogs(prev =>
            prev.map(b =>
                b.id === blog.id
                    ? { ...b, likes: (b.likes || 0) + 1, isLiked: true }
                    : b
            )
        );

        if (blog.id) localStorage.setItem(`liked_${blog.id}`, 'true');

        try {
            if (blog.id) {
                await fetch(`${API_BASE}/blogs/${blog.id}/like`, {
                    method: "POST",
                    headers: { "x-api-key": API_KEY }
                });
            }
        } catch (err) {
            console.error("❌ Failed to like:", err);
        }
    };

    // --- S3 Parsing Logic ---
    const fetchS3Blogs = async (): Promise<ExtendedBlog[]> => {
        // Fetch XML list of objects
        const listUrl = `${bucketBase}?list-type=2&prefix=${S3_PREFIX}&t=${Date.now()}`;
        const res = await fetch(listUrl);
        if (!res.ok) throw new Error(`Unable to access S3 Bucket. Check CORS/Permissions. Status: ${res.status}`);

        const xmlText = await res.text();
        const xml = new DOMParser().parseFromString(xmlText, "text/xml");

        // Extract S3 metadata including LastModified dates
        const contents = Array.from(xml.getElementsByTagName("Contents"));
        const s3Metadata = new Map();

        contents.forEach(content => {
            const key = content.getElementsByTagName("Key")[0]?.textContent || "";
            const lastModified = content.getElementsByTagName("LastModified")[0]?.textContent || "";
            s3Metadata.set(key, { lastModified });
        });

        const allKeys = Array.from(xml.getElementsByTagName("Key")).map(k => k.textContent || "");
        const imageSet = new Set(allKeys.filter(k => /\.(jpg|jpeg|png|webp|gif)$/i.test(k)));
        const htmlKeys = allKeys.filter((k) => k.endsWith(".html"));

        const blogPromises = htmlKeys.map(async (key) => {
            const baseKey = key.replace(/\.html$/, "");
            let s3Image = null;

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
            const s3Date = s3Metadata.get(key)?.lastModified || new Date().toISOString();
            return extractFromHTML(html, key, s3Image, s3Date);
        });

        return (await Promise.all(blogPromises)).filter(Boolean) as ExtendedBlog[];
    };

    const extractFromHTML = (html: string, key: string, s3Image: string | null, s3CreatedDate: string): ExtendedBlog => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const getMeta = (name: string) =>
            doc.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`)?.getAttribute("content");

        const parts = key.split("/");
        const fileName = parts[parts.length - 1] || "";
        const fileNameWithoutExt = fileName.replace(".html", "").replace(/-/g, ' ');
        const capitalizeWords = (str: string) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        const title = getMeta("title") || getMeta("og:title") || doc.title || capitalizeWords(fileNameWithoutExt);
        const description = getMeta("description") || getMeta("og:description") || "";
        const id = fileName.replace(".html", "");

        let image = s3Image;
        if (!image) {
            const featuredImg = doc.querySelector('img.featured-image') as HTMLImageElement;
            if (featuredImg) image = featuredImg.src;
        }
        if (!image) image = getMeta("og:image") || getMeta("image");
        if (!image) {
            const firstImg = doc.querySelector('img') as HTMLImageElement;
            if (firstImg) image = firstImg.src;
        }
        if (!image || image.includes("onerror")) {
            let hash = 0;
            for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
            image = FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
        }

        const author = getMeta("author") || "The Living Desk Team";
        // Use S3 creation date instead of meta tags
        const date = s3CreatedDate;
        const slug = fileName.replace(".html", "") || id;
        const tags = getMeta("keywords") ? getMeta("keywords")!.split(",").map((t) => t.trim()) : ["Coworking"];

        return {
            id,
            slug,
            title,
            excerpt: description,
            content: description,
            image_url: image!,
            author,
            created_at: date,
            published_at: date,
            status: "published",
            tags,
            htmlUrl: key
        };
    };

    // --- Interaction Handlers ---
    const getPublicUrl = (blog: ExtendedBlog) => `${bucketBase}/${blog.htmlUrl}`;

    const openBlog = (blog: ExtendedBlog) => {
        incrementView(blog);
        window.open(getPublicUrl(blog), "_blank", "noopener,noreferrer");
        setBlogs(prev =>
            prev.map(b =>
                b.id === blog.id ? { ...b, views: (b.views || 0) + 1 } : b
            )
        );
    };

    const handleShare = async (e: React.MouseEvent, blog: ExtendedBlog) => {
        e.stopPropagation();
        const url = getPublicUrl(blog);
        try {
            if (navigator.share) await navigator.share({ title: blog.title, url });
            else {
                await navigator.clipboard.writeText(url);
                alert("Link copied!");
            }
        } catch (err) {
            console.error("Share failed", err);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

    const getReadTime = (text: string) =>
        Math.max(3, Math.ceil(text.split(/\s+/).length / 200) + 2);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                            <BookOpen className="w-4 h-4" />
                            Insights & Stories
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                            The Living Desk Blog
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Insights on coworking, productivity & the future of work.
                        </p>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                            <p className="text-muted-foreground">Fetching latest stories...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 space-y-4">
                            <p className="text-red-500 text-lg">{error}</p>
                            <p className="text-sm text-muted-foreground">
                                Check console (F12) for CORS/Network errors.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map((blog) => (
                                <Card
                                    key={blog.id}
                                    onClick={() => openBlog(blog)}
                                    onMouseEnter={() => setHoveredCard(blog.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    className="cursor-pointer group overflow-hidden border-border/50 bg-card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                                >
                                    <CardContent className="p-0">
                                        {/* Image */}
                                        <div className="relative overflow-hidden h-56 bg-gradient-to-br from-primary/20 to-primary/5">
                                            <img
                                                src={blog.image_url}
                                                alt={blog.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.currentTarget.src = FALLBACK_IMAGES[0];
                                                }}
                                            />
                                            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {getReadTime(blog.excerpt)} min
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 space-y-4">
                                            {/* Meta */}
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(blog.published_at)}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                                                {blog.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {blog.excerpt}
                                            </p>

                                            {/* Actions */}
                                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="group/btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openBlog(blog);
                                                    }}
                                                >
                                                    Read
                                                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                                                </Button>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-8 w-8 ${blog.isLiked ? 'text-red-500' : ''}`}
                                                        onClick={(e) => handleLike(e, blog)}
                                                    >
                                                        <Heart className={`w-4 h-4 ${blog.isLiked ? 'fill-current' : ''}`} />
                                                    </Button>
                                                    <span className="text-xs text-muted-foreground">
                                                        {blog.likes || 0}
                                                    </span>

                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <span className="text-xs text-muted-foreground">
                                                        {blog.views?.toLocaleString() || 0}
                                                    </span>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={(e) => handleShare(e, blog)}
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* CTA Section */}
                    <div className="mt-20 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-2xl p-12 border border-primary/20">
                        <h2 className="text-3xl font-bold mb-4">
                            Ready to Transform Your Workspace?
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Join our community of innovators and experience the future of work.
                        </p>
                        <Link to="/spaces">
                            <Button size="lg" className="group">
                                Explore Our Spaces
                                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogsPage;