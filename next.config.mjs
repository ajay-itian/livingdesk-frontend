/** @type {import('next').NextConfig} */

const S3_BUCKET = "thelivingdesk-blogs-313701249911-ap-south-1";
const S3_REGION = "ap-south-1";
// We use the S3 URL for the internal rewrite
const S3_BASE = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

const nextConfig = {
  // ✅ Enable static export to the "out" directory for S3 hosting
  output: "export",

  // ✅ Ensure trailing slashes are consistent for SEO ranking
  // Next.js static export behavior:
  // - false: create route.html
  // - true: create route/index.html
  trailingSlash: false,

  /*
  // ── Rewrite /blogs/:slug.html → S3 bucket ──
  // Note: 'rewrites' are not supported when output: "export".
  // You will need to use AWS CloudFront Functions or Lambda@Edge for routing/rewrites if needed.
  async rewrites() {
    return [
      {
        source: "/blogs/:slug*.html",
        destination: `${S3_BASE}/blogs/:slug*.html`,
      },
    ];
  },

  // ── Headers for SEO and Performance ──
  // Note: 'headers' are not supported when output: "export".
  // You should configure these in CloudFront Response Headers Policies instead.
  async headers() {
    return [
      {
        source: "/blogs/:slug*.html",
        headers: [
          { key: "X-Robots-Tag", value: "index, follow" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
          { key: "X-Frame-Options", value: "DENY" }
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Content-Type", value: "application/xml" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=3600" },
        ],
      },
    ];
  },
  */

  images: {
    // When using output: "export", Next.js Image Optimization API is not supported.
    // If you use next/image, you must set unoptimized: true.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com` },
    ],
  },
};

export default nextConfig;