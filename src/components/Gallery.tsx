"use client";

import { useState } from "react";
const gallery1 = '/images/gallery-1.webp';
const gallery2 = '/images/gallery-2.webp';
const gallery3 = '/images/gallery-3.webp';
const gallery4 = '/images/gallery-4.webp';
const Cabin1 = '/images/CABIN_1.webp';
const hot_desk = '/images/hot_desk.webp';
const balcony = '/images/balcony.webp';
const cover_view = '/images/cover_view.webp';


// 1. Import DialogTitle here
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    { src: gallery1, alt: "The Living Desk workspace view 1" },
    { src: gallery2, alt: "The Living Desk workspace view 2" },
    { src: gallery3, alt: "The Living Desk workspace view 3" },
    { src: gallery4, alt: "The Living Desk workspace view 4" },
    { src: Cabin1, alt: "The Living Desk modern coworking space" },
    { src: hot_desk, alt: "Private office cabin" },
    { src: balcony, alt: "Meeting room facilities" },
    { src: cover_view, alt: "Dedicated desk workspace" },
  ];

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Gallery</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take a visual tour of our modern coworking space
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {images.map((image, index) => (
            <div
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
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-white text-center px-4 font-medium">
                  Click to enlarge
                </p>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
            {/* 2. Add DialogTitle with sr-only class to hide it visually but keep it accessible */}
            <DialogTitle className="sr-only">Gallery Image Preview</DialogTitle>

            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Gallery image"
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
