import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Pricing from "@/components/Pricing";
import Gallery from "@/components/Gallery";
import LocateUs from "@/components/LocateUs";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Booking from "@/components/features/bookings/Booking";
import BlogsPage from "@/components/blogs/BlogsPage";
import Community from "@/components/Community";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Booking />
      <Pricing />
      <Gallery />
      <BlogsPage />
      <Community />
      <LocateUs />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
