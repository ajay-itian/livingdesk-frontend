"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Wind, Wifi, Coffee, Clock } from "lucide-react";
const heroImage = '/images/hero-coworking.webp';

const Hero = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Modern Coworking Space in Pimple Saudagar Pune - The Living Desk Interior"
          className="w-full h-full object-cover"
          fetchPriority="high" // ✅ Boosts LCP performance
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="max-w-2xl">
            {/* ✅ SEO: Primary keyword included in H1 */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
              Premium Coworking Space in
              <span className="block text-primary">Pimple Saudagar</span>
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-muted-foreground">
              Elevate your business at Pune's most professional managed office.
              Fully air-conditioned private cabins, dedicated desks, and meeting rooms at Vision Flora.
            </p>

            {/* ✅ Amenity Badges — AC highlighted first for Pune summer visibility */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium">
                <Wind className="h-4 w-4" />
                100% Air Conditioned
              </span>
              <span className="inline-flex items-center gap-2 bg-muted text-muted-foreground border border-border rounded-full px-4 py-1.5 text-sm font-medium">
                <Wifi className="h-4 w-4" />
                High-Speed WiFi
              </span>
              <span className="inline-flex items-center gap-2 bg-muted text-muted-foreground border border-border rounded-full px-4 py-1.5 text-sm font-medium">
                <Clock className="h-4 w-4" />
                24/7 Access
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={scrollToContact} className="group" aria-label="Book a free tour">
                Schedule a Tour
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;