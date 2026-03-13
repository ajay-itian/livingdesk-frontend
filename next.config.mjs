/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  // ADD THIS LINE: This fixes the S3/CloudFront 403 refresh error
  trailingSlash: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "thelivingdesk.in" },
    ],
  },
  turbopack: {},
};

export default nextConfig;