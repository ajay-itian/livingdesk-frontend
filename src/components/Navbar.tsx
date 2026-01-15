import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.webp";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!pendingScrollId) return;

    if (location.pathname === "/") {
      const id = pendingScrollId;
      setPendingScrollId(null);

      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          setTimeout(() => {
            const el2 = document.getElementById(id);
            if (el2) el2.scrollIntoView({ behavior: "smooth" });
          }, 120);
        }
      });
    }
  }, [location.pathname, pendingScrollId]);

  const close = () => setIsOpen(false);

  const scrollToSection = (id: string) => {
    if (location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      close();
      return;
    }

    setPendingScrollId(id);
    navigate("/");
    close();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link
              to="/"
              onClick={() => {
                setPendingScrollId(null);
                close();
              }}
            >
              <img src={logo} alt="The Living Desk" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection("home")} className="text-foreground transition-colors">Home</button>
            <button onClick={() => scrollToSection("services")} className="text-foreground transition-colors">Services</button>
            <Link to="/booking" onClick={close} className="text-foreground transition-colors">Booking</Link>
            <button onClick={() => scrollToSection("pricing")} className="text-foreground transition-colors">Pricing</button>
            <button onClick={() => scrollToSection("gallery")} className="text-foreground transition-colors">Gallery</button>
            <button onClick={() => scrollToSection("locate")} className="text-foreground transition-colors">Locate Us</button>
            <Link to="/blogs" onClick={close} className="text-foreground transition-colors">Blogs</Link>
            <Link to="/community" onClick={close} className="text-foreground text-left">Community</Link>
            <Link to="/wifi" onClick={close} className="text-foreground transition-colors">Wifi</Link>
            <button onClick={() => scrollToSection("contact")} className="text-foreground transition-colors">Contact</button>
            <Button onClick={() => scrollToSection("contact")} type="button">Get Started</Button>



          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-foreground">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection("home")} className="text-foreground text-left">Home</button>
              <button onClick={() => scrollToSection("services")} className="text-foreground text-left">Services</button>
              <Link to="/booking" onClick={close} className="text-foreground text-left">Booking</Link>
              <button onClick={() => scrollToSection("pricing")} className="text-foreground text-left">Pricing</button>
              <button onClick={() => scrollToSection("gallery")} className="text-foreground text-left">Gallery</button>
              <button onClick={() => scrollToSection("locate")} className="text-foreground text-left">Locate Us</button>
              <Link to="/blogs" onClick={close} className="text-foreground text-left">Blogs</Link>
              <Link to="/community" onClick={close} className="text-foreground text-left">Community</Link>
              <Link to="/wifi" onClick={close} className="text-foreground text-left">Wifi</Link>
              <button onClick={() => scrollToSection("contact")} className="text-foreground text-left">Contact</button>
              <Button onClick={() => { close(); scrollToSection("contact"); }} className="w-full">Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;