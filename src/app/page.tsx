import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Pricing from "@/components/Pricing";
import Gallery from "@/components/Gallery";
import LocateUs from "@/components/LocateUs";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

// All your SEO Meta tags go here
export const metadata: Metadata = {
  title: "Coworking Space in Pimple Saudagar, Pune | The Living Desk",
  description: "Premium coworking & managed office space in Pimple Saudagar, Pune. Private cabins & meeting rooms from ₹299. Book a free tour at Vision Flora, Kunal Icon Rd!",
  alternates: { canonical: "https://www.thelivingdesk.in/" },
  openGraph: {
    title: "The Living Desk | Premium Coworking Space in Pune",
    description: "Upscale managed offices and flexible desks at Vision Flora, Pune. High-speed WiFi, AC & 24/7 Access.",
    url: "https://www.thelivingdesk.in/",
    siteName: "The Living Desk",
    images: [{ url: "https://www.thelivingdesk.in/og-image.jpg" }],
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Pricing />
      <Gallery />
      <LocateUs />
      <Contact />
      <Footer />
    </div>
  );
}