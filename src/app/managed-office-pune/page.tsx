import type { Metadata } from "next";
import ManagedOffices from "@/components/features/offices/ManagedOffices";

export const metadata: Metadata = {
  title: "Managed Office Space in Pune | Pimple Saudagar | The Living Desk",
  description: "Premium managed office spaces in Pimple Saudagar, Pune. Fully-furnished private cabins and team rooms with high-speed WiFi, AC, and 24/7 access. From ₹499/day.",
  alternates: { canonical: "https://www.thelivingdesk.in/managed-office-pune" },
  openGraph: {
    title: "Managed Office Space in Pune | The Living Desk",
    description: "Fully-managed private office spaces in Pimple Saudagar, Pune. High-speed WiFi, AC & 24/7 access.",
    url: "https://www.thelivingdesk.in/managed-office-pune",
    siteName: "The Living Desk",
    images: [{ url: "https://www.thelivingdesk.in/og-image.jpg" }],
    type: "website",
  },
};

export default function ManagedOfficesPage() {
  return <ManagedOffices />;
}
