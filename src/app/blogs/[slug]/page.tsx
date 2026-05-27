// app/blogs/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogInteractions from "@/components/blogs/BlogInteractions";

const S3_BASE =
  "https://thelivingdesk-blogs-313701249911-ap-south-1.s3.ap-south-1.amazonaws.com";
const API_BASE =
  "https://evzp3stpn2.execute-api.ap-south-1.amazonaws.com/prod/api";

function normalizeSlug(raw: string): string {
  return (raw || "")
    .replace(/^blogs\//, "")
    .replace(/\/index\.html$/, "")
    .replace(/\.html$/, "")
    .replace(/\/$/, "")
    .replace(/\//g, "");
}

async function fetchHtmlFromS3(slug: string): Promise<string | null> {
  const cleanSlug = normalizeSlug(slug);
  try {
    let res = await fetch(`${S3_BASE}/blogs/${cleanSlug}.html`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      res = await fetch(`${S3_BASE}/blogs/${cleanSlug}/index.html`, {
        next: { revalidate: 3600 },
      });
    }
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function getBlogMeta(slug: string) {
  try {
    const listRes = await fetch(`${API_BASE}/blogs/?limit=100`, {
      next: { revalidate: 60 },
    });
    if (!listRes.ok) return null;
    const blogs: any[] = await listRes.json();
    const cleanSlug = normalizeSlug(slug);
    return (
      blogs.find((b) => {
        const bSlug = normalizeSlug(
          b.slug ||
          b.s3_key ||
          b.s3_url?.split(".amazonaws.com/").pop() ||
          ""
        );
        return bSlug === cleanSlug;
      }) ?? null
    );
  } catch {
    return null;
  }
}

// ✅ Next.js 15: params is a Promise — must be awaited
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params; // ← await here
  const html = await fetchHtmlFromS3(slug);
  const titleMatch = html?.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const rawTitle = titleMatch?.[1]?.replace(/<[^>]+>/g, "").trim();
  const title =
    rawTitle ||
    slug
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");

  return {
    title: `${title} | The Living Desk`,
    alternates: {
      canonical: `https://www.thelivingdesk.in/blogs/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/blogs/?limit=100`, {
      cache: "no-store",
    });
    if (!res.ok) return [{ slug: "placeholder" }];
    const blogs: any[] = await res.json();
    const params = blogs
      .map((b) => {
        const rawSlug = b.slug || b.s3_url?.split("/").pop() || "";
        const cleanSlug = normalizeSlug(rawSlug);
        return cleanSlug ? { slug: cleanSlug } : null;
      })
      .filter(Boolean) as { slug: string }[];
    return params.length > 0 ? params : [{ slug: "placeholder" }];
  } catch {
    return [{ slug: "placeholder" }];
  }
}

// ✅ Next.js 15: params is a Promise — must be awaited
export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ← await here

  const [htmlContent, matched] = await Promise.all([
    fetchHtmlFromS3(slug),
    getBlogMeta(slug),
  ]);

  if (!htmlContent) notFound();

  if (matched?.blog_id) {
    fetch(`${API_BASE}/blogs/${matched.blog_id}/view`, {
      method: "POST",
    }).catch(() => { });
  }

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-20">
        <article
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent! }}
        />
        {matched && (
          <BlogInteractions
            blogId={matched.blog_id}
            initialViews={(matched.views || 0) + 1}
            initialLikes={matched.likes || 0}
            apiBase={API_BASE}
          />
        )}
      </main>
    </div>
  );
}