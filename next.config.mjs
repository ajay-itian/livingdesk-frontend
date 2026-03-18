/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true, // This ensures folders like /blogs/index.html are created

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "thelivingdesk.in" },
      { protocol: "https", hostname: "images.pexels.com" }, // Added pexels for your fallbacks
    ],
  },
};

export default nextConfig;