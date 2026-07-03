"use client";

import { useEffect, useState } from "react";
import NotFoundInner from "@/pages/NotFound";
import BlogInteractions from "@/components/blogs/BlogInteractions";

const S3_BASE =
  process.env.NEXT_PUBLIC_S3_BASE ||
  "https://thelivingdesk-blogs-313701249911-ap-south-1.s3.ap-south-1.amazonaws.com";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://thelivingdesk-backend-prod.thelivingdesk.in";

export default function NotFound() {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [matchedMeta, setMatchedMeta] = useState<any>(null);

  useEffect(() => {
    const checkDynamicBlog = async () => {
      const pathname = window.location.pathname;
      if (!pathname.startsWith("/blogs/")) {
        setIsLoading(false);
        return;
      }

      const slug = pathname.replace("/blogs/", "").replace(/\/$/, "");
      if (!slug) {
        setIsLoading(false);
        return;
      }

      try {
        const [htmlRes, listRes] = await Promise.all([
          fetch(`${S3_BASE}/blogs/${slug}.html`),
          fetch(`${API_BASE}/blogs/?limit=100`),
        ]);

        if (htmlRes.ok) {
          const html = await htmlRes.text();
          setHtmlContent(html);
          
          if (listRes.ok) {
            const blogs = await listRes.json();
            const matched = blogs.find((b: any) => (b.slug || b.s3_url?.split("/").pop()?.replace(".html", "")) === slug);
            if (matched) setMatchedMeta(matched);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic blog", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkDynamicBlog();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (htmlContent) {
    return (
      <div className="bg-white min-h-screen">
        <main className="max-w-4xl mx-auto px-4 pt-6 pb-20">
          <article
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          {matchedMeta && (
            <BlogInteractions
              blogId={matchedMeta.blog_id}
              initialViews={(matchedMeta.views || 0) + 1}
              initialLikes={matchedMeta.likes || 0}
              apiBase={API_BASE}
            />
          )}
        </main>
      </div>
    );
  }

  return <NotFoundInner />;
}
