import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // close mobile menu whenever route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // If a scroll was requested from another route, perform it when we land on "/"
  useEffect(() => {
    if (!pendingScrollId) return;

    // Only attempt to scroll when we're on the home route
    if (location.pathname === "/") {
      const id = pendingScrollId;
      setPendingScrollId(null);

      // small timeout to allow DOM to render
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          // fallback: try again shortly (useful if content renders slightly later)
          setTimeout(() => {
            const el2 = document.getElementById(id);
            if (el2) el2.scrollIntoView({ behavior: "smooth" });
          }, 120);
        }
      });
    }
  }, [location.pathname, pendingScrollId]);

  const close = () => setIsOpen(false);

  /**
   * Scroll to a section on the home page.
   * If we're not on "/", navigate there first and set a pending scroll.
   */
  const scrollToSection = (id: string) => {
    // If already on home page, scroll immediately
    if (location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      close();
      return;
    }

    // Not on home page: navigate to "/" and set pending scroll
    setPendingScrollId(id);
    navigate("/", { replace: false });
    close();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" onClick={() => { setPendingScrollId(null); close(); }}>
              <img src={logo} alt="The Living Desk" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button type="button" onClick={() => scrollToSection("home")} className="text-foreground transition-colors">Home</button>
            <button type="button" onClick={() => scrollToSection("services")} className="text-foreground transition-colors">Services</button>

            {/* Booking route (desktop) */}
            <Link to="/booking" onClick={close} className="text-foreground transition-colors">Booking</Link>

            <button type="button" onClick={() => scrollToSection("pricing")} className="text-foreground transition-colors">Pricing</button>
            <button type="button" onClick={() => scrollToSection("gallery")} className="text-foreground transition-colors">Gallery</button>
            <button type="button" onClick={() => scrollToSection("locate")} className="text-foreground transition-colors">Locate Us</button>
            <button type="button" onClick={() => scrollToSection("contact")} className="text-foreground transition-colors">Contact</button>
            <Button onClick={() => scrollToSection("contact")} type="button">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-foreground" aria-label="Toggle menu">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <button type="button" onClick={() => scrollToSection("home")} className="text-foreground text-left">Home</button>
              <button type="button" onClick={() => scrollToSection("services")} className="text-foreground text-left">Services</button>

              {/* Booking route (mobile) */}
              <Link to="/booking" onClick={close} className="text-foreground text-left">Booking</Link>

              <button type="button" onClick={() => scrollToSection("pricing")} className="text-foreground text-left">Pricing</button>
              <button type="button" onClick={() => scrollToSection("gallery")} className="text-foreground text-left">Gallery</button>
              <button type="button" onClick={() => scrollToSection("locate")} className="text-foreground text-left">Locate Us</button>
              <button type="button" onClick={() => scrollToSection("contact")} className="text-foreground text-left">Contact</button>
              <Button onClick={() => { close(); scrollToSection("contact"); }} className="w-full" type="button">Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
