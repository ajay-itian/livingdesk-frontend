"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const logo = '/images/logo.webp';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInOfficePremises, setIsInOfficePremises] = useState(false);
  const pathname = usePathname();

  const OFFICE_LAT = 18.5921498;
  const OFFICE_LNG = 73.8001093;
  const OFFICE_RADIUS = 500; // meters

  // Geolocation logic
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const distance = calculateDistance(latitude, longitude, OFFICE_LAT, OFFICE_LNG);
          setIsInOfficePremises(distance <= OFFICE_RADIUS);
        },
        (error) => {
          if (error.code !== error.PERMISSION_DENIED) {
            console.warn(`Geolocation error[${error.code}]: ${error.message}`);
          }
          setIsInOfficePremises(false);
        }
      );
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const closeMenu = () => setIsOpen(false);

  // Helper array for navigation links to keep JSX clean
  const navLinks = [
    { name: "Home", href: "/#home" },
    { name: "Services", href: "/#services" },
    { name: "Booking", href: "/booking/" }, // Added /
    { name: "Managed Offices", href: "/managed-office-pune/" }, // Added /
    { name: "Pricing", href: "/#pricing" },
    { name: "Gallery", href: "/#gallery" },
    { name: "Locate Us", href: "/#locate" },
    { name: "Blogs", href: "/blogs/" }, // Added /
    { name: "Community", href: "/community/" }, // Added /
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/#home" onClick={closeMenu}>
              <img src={logo} alt="The Living Desk" width="150" height="48" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-foreground transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}

            {isInOfficePremises && (
              <Link href="/wifi" className="text-foreground transition-colors hover:text-primary">
                Wifi
              </Link>
            )}

            <Link href="/#contact" className="text-foreground transition-colors hover:text-primary">
              Contact
            </Link>

            <Button asChild>
              <Link href="/#contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className="text-foreground text-left hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}

              {isInOfficePremises && (
                <Link href="/wifi" onClick={closeMenu} className="text-foreground text-left hover:text-primary">
                  Wifi
                </Link>
              )}

              <Link href="/#contact" onClick={closeMenu} className="text-foreground text-left hover:text-primary">
                Contact
              </Link>

              <Button asChild className="w-full">
                <Link href="/#contact" onClick={closeMenu}>Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;