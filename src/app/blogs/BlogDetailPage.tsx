"use client";

import { useEffect, useState } from "react";
import { Loader2, Heart, Eye } from "lucide-react";
import Link from "next/link";

const S3_BASE =
  "https://thelivingdesk-blogs-313701249911-ap-south-1.s3.ap-south-1.amazonaws.com";
const API_BASE =
  "https://evzp3stpn2.execute-api.ap-south-1.amazonaws.com/prod/api";

interface BlogMeta {
  blog_id: string;
  title: string;
  views: number;
  likes: number;
  isLiked: boolean;
}

export default function BlogDetailPage({
  params,
}: {
  params: { slug: string }; // ✅ FIXED
}) {
  const { slug } = params; // ✅ FIXED

  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [meta, setMeta] = useState<BlogMeta | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchBlog();
  }, [slug]);

  // Normalize slug
  const normalizeSlug = (raw: string): string =>
    (raw || "")
      .replace(/^blogs\//, "")
      .replace(/\/index\.html$/, "")
      .replace(/\.html$/, "")
      .replace(/\/$/, "")
      .replace(/\//g, "");

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(false);

      const cleanSlug = normalizeSlug(slug);

      // Try direct file
      let s3Res = await fetch(`${S3_BASE}/blogs/${cleanSlug}.html`);

      // Fallback to folder structure
      if (!s3Res.ok) {
        s3Res = await fetch(`${S3_BASE}/blogs/${cleanSlug}/index.html`);
      }

      if (!s3Res.ok) {
        if (s3Res.status !== 404) {
          console.error(`S3 fetch failed with status: ${s3Res.status}`);
        }
        throw new Error(`S3 fetch failed: ${s3Res.status}`);
      }

      const html = await s3Res.text();
      setHtmlContent(html);

      // Fetch metadata (non-blocking)
      resolveMetaAndIncrementView(cleanSlug);

    } catch (err) {
      console.error("Fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const resolveMetaAndIncrementView = async (currentSlug: string) => {
    try {
      const listRes = await fetch(`${API_BASE}/blogs/?limit=100`);
      if (!listRes.ok) return;

      const blogs: any[] = await listRes.json();

      const matched = blogs.find((b) => {
        const bSlug = normalizeSlug(
          b.slug ||
          b.s3_key ||
          b.s3_url?.split(".amazonaws.com/").pop() ||
          ""
        );
        return bSlug === currentSlug;
      });

      if (!matched) return;

      const likedKey = `liked_${matched.blog_id}`;

      setMeta({
        blog_id: matched.blog_id,
        title: matched.title,
        views: (matched.views || 0) + 1,
        likes: matched.likes || 0,
        isLiked:
          typeof window !== "undefined" &&
          localStorage.getItem(likedKey) === "true",
      });

      // Increment view (fire & forget)
      fetch(`${API_BASE}/blogs/${matched.blog_id}/view`, {
        method: "POST",
      }).catch(() => { });

    } catch (err) {
      console.error("Meta error:", err);
    }
  };

  const handleLike = async () => {
    if (!meta || meta.isLiked) return;

    try {
      const res = await fetch(`${API_BASE}/blogs/${meta.blog_id}/like`, {
        method: "POST",
      });

      if (res.ok) {
        localStorage.setItem(`liked_${meta.blog_id}`, "true");

        setMeta((prev) =>
          prev
            ? { ...prev, likes: prev.likes + 1, isLiked: true }
            : prev
        );
      }
    } catch { }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold">Post Not Found</h1>
        <Link href="/blogs" className="text-primary underline mt-2">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-20">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <article className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </article>

            {meta && (
              <div className="mt-10 pt-6 border-t flex items-center justify-between">
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {meta.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart
                      className="w-4 h-4"
                      fill={meta.isLiked ? "#f43f5e" : "none"}
                      color={meta.isLiked ? "#f43f5e" : "currentColor"}
                    />
                    {meta.likes} likes
                  </span>
                </div>

                <button
                  onClick={handleLike}
                  disabled={meta.isLiked}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${meta.isLiked
                    ? "bg-rose-50 text-rose-500"
                    : "bg-muted hover:bg-rose-50 hover:text-rose-500"
                    }`}
                >
                  {meta.isLiked ? "Liked!" : "Like article"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}