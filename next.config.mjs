/** @type {import('next').NextConfig} */

const S3_BUCKET = "thelivingdesk-blogs-313701249911-ap-south-1";
const S3_REGION = "ap-south-1";

const nextConfig = {
  // 1. Force the output to be a static export
  output: "export",

  // 2. Keep this TRUE if you use S3 Static Website Hosting (Method 2)
  // This ensures /visitor-survey/ creates a folder with an index.html inside.
  trailingSlash: true,

  // 3. Disable image optimization since S3 cannot run the Next.js Image Optimizer
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com` },
    ],
  },

  // 4. Optional: Explicitly set the distribution directory (optional, 'out' is default)
  distDir: 'out',
};

export default nextConfig;

