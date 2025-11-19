import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <img src={logo} alt="The Living Desk" className="h-12 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-foreground hover:text-primary transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('services')} className="text-foreground hover:text-primary transition-colors">
              Services
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-foreground hover:text-primary transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection('gallery')} className="text-foreground hover:text-primary transition-colors">
              Gallery
            </button>
            <button onClick={() => scrollToSection('locate')} className="text-foreground hover:text-primary transition-colors">
              Locate Us
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-foreground hover:text-primary transition-colors">
              Contact
            </button>
            <Button onClick={() => navigate('/booking')} variant="outline">Book Room</Button>
            <Button onClick={() => scrollToSection('contact')}>Get Started</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-foreground">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection('home')} className="text-foreground hover:text-primary transition-colors text-left">
                Home
              </button>
              <button onClick={() => scrollToSection('services')} className="text-foreground hover:text-primary transition-colors text-left">
                Services
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-foreground hover:text-primary transition-colors text-left">
                Pricing
              </button>
              <button onClick={() => scrollToSection('gallery')} className="text-foreground hover:text-primary transition-colors text-left">
                Gallery
              </button>
              <button onClick={() => scrollToSection('locate')} className="text-foreground hover:text-primary transition-colors text-left">
                Locate Us
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-foreground hover:text-primary transition-colors text-left">
                Contact
              </button>
              <Button onClick={() => navigate('/booking')} variant="outline" className="w-full">Book Room</Button>
              <Button onClick={() => scrollToSection('contact')} className="w-full">Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
