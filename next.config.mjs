/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Tells Next.js to build a static HTML site (creates the 'out' folder instead of '.next')
  output: 'export',

  images: {
    // 2. S3 is static hosting and doesn't support Next.js's server-side image optimization.
    // This MUST be true for the static export to succeed.
    unoptimized: true,

    // Keeping your existing remote patterns
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "thelivingdesk.in" },
    ],
  },

  turbopack: {},
};

export default nextConfig;