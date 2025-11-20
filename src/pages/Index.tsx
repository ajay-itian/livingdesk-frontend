import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Pricing from "@/components/Pricing";
import Gallery from "@/components/Gallery";
import LocateUs from "@/components/LocateUs";
import Contact from "@/components/Contact";
import Booking from "@/components/Booking"
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Booking/>
      <Services />
      <Pricing />
      <Gallery />
      <LocateUs />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
