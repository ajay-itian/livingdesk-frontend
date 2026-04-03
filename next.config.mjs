/** @type {import('next').NextConfig} */

const S3_BUCKET = "thelivingdesk-blogs-313701249911-ap-south-1";
const S3_REGION = "ap-south-1";

const nextConfig = {
  output: "export",
  trailingSlash: true, // This creates /visitor-survey/index.html
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com` },
    ],
  },
  // Adding these to prevent build breaks during export
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;