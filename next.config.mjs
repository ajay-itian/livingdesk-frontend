/** @type {import('next').NextConfig} */

const S3_BUCKET = "thelivingdesk-blogs-313701249911-ap-south-1";
const S3_REGION = "ap-south-1";
const S3_BASE = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

const nextConfig = {
  output: "export",
  trailingSlash: true, // ← Changed from false to true

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com` },
    ],
  },
};

export default nextConfig;