// app/blogs/page.tsx
import type { Metadata } from "next";
import BlogsPageInner from "@/components/blogs/BlogsPage";

export const metadata: Metadata = {
  title: "Coworking & Office Space Blog | Tips & Insights | The Living Desk",
  description: "Read expert tips on coworking, managed offices, productivity, and startup culture from The Living Desk — Pimple Saudagar's leading workspace.",
  alternates: { canonical: "https://www.thelivingdesk.in/blogs" },
  openGraph: {
    title: "Blog | The Living Desk Pune",
    description: "Expert coworking tips and managed office insights from The Living Desk, Pimple Saudagar.",
    url: "https://www.thelivingdesk.in/blogs",
    siteName: "The Living Desk",
    images: [{ url: "https://www.thelivingdesk.in/og-image.jpg" }],
    type: "website",
  },
};

export default function BlogsPage() {
  return <BlogsPageInner />;
}