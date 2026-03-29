// app/blogs/[slug]/page.tsx
import BlogDetailPage from "../BlogDetailPage";

export async function generateStaticParams() {
  try {
    const API_BASE = "https://evzp3stpn2.execute-api.ap-south-1.amazonaws.com/prod/api";
    const listRes = await fetch(`${API_BASE}/blogs?limit=100`);
    if (!listRes.ok) return [];
    const blogs: any[] = await listRes.json();
    
    // Map blog entries to their respective slugs
    return blogs.map((b) => {
      const slug = b.slug || (b.s3_url ? b.s3_url.split("/").pop()?.replace(".html", "") : null);
      return { slug };
    }).filter((item) => !!item.slug);
  } catch {
    return [];
  }
}

export default function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    return <BlogDetailPage params={params} />;
}