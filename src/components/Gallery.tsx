"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

const gallery1 = '/images/gallery-1.webp';
const gallery2 = '/images/gallery-2.webp';
const gallery3 = '/images/gallery-3.webp';
const gallery4 = '/images/gallery-4.webp';
const Cabin1 = '/images/CABIN_1.webp';
const hot_desk = '/images/hot_desk.webp';
const balcony = '/images/balcony.webp';
const cover_view = '/images/cover_view.webp';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ✅ SEO: Descriptive alt text for Image Search ranking
  const images = [
    { src: gallery1, alt: "Shared workspace area at The Living Desk Pune" },
    { src: gallery2, alt: "Ergonomic seating and modern office design in Pimple Saudagar" },
    { src: gallery3, alt: "Professional meeting room facilities at The Living Desk" },
    { src: gallery4, alt: "Collaborative coworking environment for startups" },
    { src: Cabin1, alt: "Private office cabin for rent in Pimpri Chinchwad" },
    { src: hot_desk, alt: "Flexible hot desk workspace in Pimple Saudagar" },
    { src: balcony, alt: "Outdoor breakout area at The Living Desk Vision Flora" },
    { src: cover_view, alt: "Reception and managed office entrance" },
  ];

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Explore Our Workspace</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A premium coworking environment designed for productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {images.map((image, index) => (
            <figure
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square"
              onClick={() => setSelectedImage(image.src)}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <figcaption className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-white text-center px-4 font-medium">View Interior</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
            <DialogTitle className="sr-only">Gallery Preview</DialogTitle>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close preview"
            >
              <X className="h-8 w-8" />
            </button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Enlarged view of The Living Desk office"
                className="w-full h-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Gallery;