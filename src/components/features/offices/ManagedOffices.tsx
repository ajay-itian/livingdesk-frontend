"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    MapPin,
    ArrowRight,
    Users,
    Maximize,
    ZoomIn,
    X,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    CheckCircle2,
    Play,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

// ─── Images ────────────────────────────────────────────────────────────────
const VTPAltitude = '/images/VTP/VTP_Altitude.webp';
const VTPAltitude1 = '/images/VTP/VTP_Altitude1.webp';
const VTPAltitude2 = '/images/VTP/VTP_Altitude2.webp';
const VTPAltitude3 = '/images/VTP/VTP_Altitude3.webp';
const VTPAltitude4 = '/images/VTP/VTP_Altitude4.webp';
const featureplan = '/images/VTP/feture_plan_map.webp';
const VTPInner1 = '/images/VTP/VTP_Inner1.webp';
const VTPInner2 = '/images/VTP/VTP_Inner2.webp';
const VTPInner3 = '/images/VTP/VTP_Inner3.webp';
const VTPInner4 = '/images/VTP/VTP_Inner4.webp';
const VTPInner5 = '/images/VTP/VTP_Inner02.webp';

const Punawale1 = '/images/PUNAWALE/Sai_Punawale.webp';
const Punawale2 = '/images/PUNAWALE/PUNAWALE_1.webp';
const Punawale3 = '/images/PUNAWALE/PUNAWALE_2.webp';
const Punawale4 = '/images/PUNAWALE/PUNAWALE_3.webp';
const Punawale5 = '/images/PUNAWALE/PUNAWALE_4.webp';
const Punawale6 = '/images/PUNAWALE/PUNAWALE_5.webp';
const Punawale7 = '/images/PUNAWALE/PUNAWALE_6.webp';

const Baner1 = '/images/BANER/YBZ_1.webp';
const Baner2 = '/images/BANER/YBZ_2.webp';
const Baner4 = '/images/BANER/VIRTUAL_MAPS_YBZ.webp';
const Baner5 = '/images/BANER/LOCATION_YBZ.webp';
const BanerVideo = '/videos/YBZ_VIDEO.mp4';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface OfficeLocation {
    id: string;
    slug: string;
    area: string;
    name: string;
    address: string;
    image: string;
    capacity: string;
    size: string;
    amenities: string[];
    price: string;
    gallery: string[];
    description?: string;
    highlights?: string[];
}

// ─── Helper ─────────────────────────────────────────────────────────────────
export const isVideo = (url: string) =>
    typeof url === 'string' && /\.(mp4|webm|ogg)/i.test(url);

// ─── Shared Data (exported so detail page can import it) ────────────────────
export const locations: OfficeLocation[] = [
    {
        id: 'wakad-01',
        slug: 'wakad',
        area: 'Wakad',
        name: 'VTP Altitude',
        address: '18/6, Aundh - Ravet BRTS Rd, Pawar Nagar, Mangal Nagar, Wakad, Pune 411033',
        image: VTPAltitude,
        capacity: '20 - 25 Seats - 1 Cabin',
        size: '880 sq.ft',
        price: 'Starting ₹6,500/seat',
        description:
            "A premium managed workspace nestled in the heart of Wakad, VTP Altitude offers a sophisticated environment for businesses that demand excellence. With state-of-the-art infrastructure and a prime location on the Aundh-Ravet BRTS corridor, this space is designed to elevate your team's productivity.",
        highlights: ['Prime BRTS Corridor Location', 'Dedicated Cabin Available', 'Fully Managed Services', 'Flexible Seat Plans'],
        amenities: ['High-Speed Wifi', 'Conference Rooms', 'Valet Parking', 'Power Backup', '24/7 Security & CCTV Surveillance', 'Housekeeping Services'],
        gallery: [VTPAltitude, VTPAltitude4, featureplan, VTPAltitude1, VTPInner1, VTPInner2, VTPInner3, VTPInner4, VTPInner5, VTPAltitude2, VTPAltitude3],
    },
    {
        id: 'punawale-01',
        slug: 'punawale',
        area: 'Punawale',
        name: 'Sai Millenium',
        address: 'service road, 585, Mumbai Pune Bypass Rd Flyover, Kate Wasti, Punawale, Dattwadi, Maharashtra 411033',
        image: Punawale1,
        capacity: '50 Seats',
        size: '2000 sq.ft',
        price: 'Starting ₹6,500/seat',
        description: 'Sai Millenium is a spacious, well-connected workspace sitting right on the Mumbai-Pune Bypass — making it the ideal base for teams that value accessibility and scale. With 2000 sq.ft of thoughtfully designed floor space, it comfortably accommodates growing teams.',
        highlights: ['Mumbai-Pune Bypass Access', 'Large Team Capacity', 'Scalable Floor Plans', 'Easy Highway Connectivity'],
        amenities: ['High-Speed Wifi', 'Conference Rooms', 'Valet Parking', 'Power Backup', '24/7 Security & CCTV Surveillance', 'Housekeeping Services'],
        gallery: [Punawale1, Punawale2, Punawale3, Punawale4, Punawale5, Punawale6, Punawale7],
    },
    {
        id: 'baner-01',
        slug: 'baner',
        area: 'Baner',
        name: 'YBZ Yashada Business Zone Baner',
        address: '2nd Floor, Kashiniketan, HQ7H+H8J, Kashiniketan, Ram Indu Park Rd, Lalit Estate, Baner, Pune, Maharashtra 411069',
        image: Baner1,
        capacity: '40 Seats',
        size: '1200 sq.ft',
        price: 'Starting ₹6,500/seat',
        description: "Strategically located in Baner — one of Pune's most vibrant business districts — YBZ Yashada Business Zone puts you steps away from the metro and surrounded by Pune's top tech companies and startups. A dynamic space for a dynamic team.",
        highlights: ['Steps from Metro Station', 'Baner Business Hub', 'Modern Infrastructure', 'Vibrant Startup Ecosystem'],
        amenities: ['High-Speed Wifi', 'Near Metro Station', 'Conference Rooms', 'Valet Parking', 'Power Backup', '24/7 Security & CCTV Surveillance', 'Housekeeping Services'],
        gallery: [Baner1, Baner2, Baner4, Baner5, BanerVideo],
    },
];

// ─── DEFAULT EXPORT: Listing page (cards grid) ───────────────────────────────
export default function ManagedOffices() {
    const router = useRouter();

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<OfficeLocation | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleContact = useCallback(() => {
        router.push('/#contact');
        setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, [router]);

    const handleWhatsApp = useCallback(() => {
        window.open('https://web.whatsapp.com/send?phone=917066002650&text=Hello!%20I%27m%20interested%20in%20your%20coworking%20space.', '_blank');
    }, []);

    const openGallery = (location: OfficeLocation) => {
        setCurrentLocation(location);
        setCurrentImageIndex(0);
        setIsLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeGallery = useCallback(() => {
        setIsLightboxOpen(false);
        setCurrentLocation(null);
        document.body.style.overflow = 'auto';
    }, []);

    const navigateImage = useCallback((direction: 'next' | 'prev') => {
        if (!currentLocation) return;
        setCurrentImageIndex((prev) => {
            if (direction === 'next') return prev === currentLocation.gallery.length - 1 ? 0 : prev + 1;
            return prev === 0 ? currentLocation.gallery.length - 1 : prev - 1;
        });
    }, [currentLocation]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return;
            if (e.key === 'Escape') closeGallery();
            if (e.key === 'ArrowRight') navigateImage('next');
            if (e.key === 'ArrowLeft') navigateImage('prev');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, closeGallery, navigateImage]);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
                <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                    <div className="relative max-w-4xl mx-auto text-center z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <MapPin className="w-3 h-3" /> Prime Locations
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-teal-600 tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            Workspaces Designed for{' '}
                            <span className="text-teal-600 relative whitespace-nowrap">
                                Success
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-teal-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </svg>
                            </span>
                        </h1>
                    </div>
                </section>

                <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {locations.map((location, index) => (
                            <LocationCard
                                key={location.id}
                                location={location}
                                onOpenGallery={openGallery}
                                onContact={handleContact}
                                onWhatsApp={handleWhatsApp}
                                index={index}
                            />
                        ))}
                    </div>
                </section>

                {isLightboxOpen && currentLocation && (
                    <Lightbox
                        location={currentLocation}
                        currentIndex={currentImageIndex}
                        onClose={closeGallery}
                        onNext={() => navigateImage('next')}
                        onPrev={() => navigateImage('prev')}
                        onSelect={setCurrentImageIndex}
                    />
                )}
            </div>
            <Footer />
        </>
    );
}

// ─── Location Card ────────────────────────────────────────────────────────────
function LocationCard({
    location, onOpenGallery, onContact, onWhatsApp, index,
}: {
    location: OfficeLocation;
    onOpenGallery: (l: OfficeLocation) => void;
    onContact: () => void;
    onWhatsApp: () => void;
    index: number;
}) {
    const router = useRouter();

    return (
        <div
            className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full cursor-pointer animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards"
            style={{ animationDelay: `${index * 150}ms` }}
            onClick={() => router.push(`/managed-office-pune/${location.slug}`)}
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                    <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-teal-700 shadow-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {location.area}
                    </span>
                </div>
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenGallery(location); }}
                        className="flex items-center gap-2 bg-white/90 backdrop-blur-md text-slate-900 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-teal-600 hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95"
                    >
                        <ZoomIn className="w-4 h-4" /> View Gallery
                    </button>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-teal-900 group-hover:text-teal-600 transition-colors mb-2">{location.name}</h3>
                    <div className="flex items-start gap-2 text-slate-500 text-sm leading-snug">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-teal-500/70" />
                        <span className="line-clamp-2">{location.address}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                            <Users className="w-3.5 h-3.5" /> Capacity
                        </div>
                        <p className="font-bold text-slate-800">{location.capacity}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                            <Maximize className="w-3.5 h-3.5" /> Size
                        </div>
                        <p className="font-bold text-slate-800">{location.size}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {location.amenities.map((amenity, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-teal-500" /> {amenity}
                        </span>
                    ))}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                    <Button
                        variant="default"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md group/btn"
                        onClick={(e) => { e.stopPropagation(); onContact(); }}
                    >
                        Contact Us <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); onWhatsApp(); }}
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-xl"
                    >
                        <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
    location, currentIndex, onClose, onNext, onPrev, onSelect,
}: {
    location: OfficeLocation;
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    onSelect: (i: number) => void;
}) {
    const thumbRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        thumbRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [currentIndex]);

    const currentMedia = location.gallery[currentIndex];
    const isVid = isVideo(currentMedia);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-4 md:px-8 bg-gradient-to-b from-black/50 to-transparent z-50">
                <div className="text-white">
                    <h3 className="font-bold text-lg">{location.name}</h3>
                    <p className="text-white/60 text-sm hidden sm:block">{location.address}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-white/10 px-3 py-1 rounded-full text-white/90 text-sm font-medium backdrop-blur-md">
                        {currentIndex + 1} / {location.gallery.length}
                    </span>
                    <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4">
                <button onClick={onPrev} className="absolute left-4 md:left-8 p-3 bg-black/20 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-sm z-40 group border border-white/5">
                    <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="relative w-full h-full flex items-center justify-center">
                    {isVid ? (
                        <video key={currentIndex} src={currentMedia} controls autoPlay playsInline className="max-h-[75vh] max-w-full object-contain shadow-2xl animate-in zoom-in-95 fade-in duration-300 rounded-md" />
                    ) : (
                        <img key={currentIndex} src={currentMedia} alt="Gallery view" className="max-h-[75vh] max-w-full object-contain shadow-2xl animate-in zoom-in-95 fade-in duration-300 rounded-md" />
                    )}
                </div>
                <button onClick={onNext} className="absolute right-4 md:right-8 p-3 bg-black/20 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-sm z-40 group border border-white/5">
                    <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="h-24 md:h-28 bg-black/40 backdrop-blur-md border-t border-white/5 w-full flex items-center justify-center z-50">
                <div className="flex gap-3 overflow-x-auto w-full max-w-6xl px-4 py-2 no-scrollbar scroll-smooth">
                    {location.gallery.map((media, idx) => {
                        const isThumbVid = isVideo(media);
                        return (
                            <button
                                key={idx}
                                ref={idx === currentIndex ? thumbRef : null}
                                onClick={() => onSelect(idx)}
                                className={`relative flex-shrink-0 h-16 w-24 md:h-20 md:w-32 rounded-lg overflow-hidden transition-all duration-300 ${currentIndex === idx ? 'ring-2 ring-teal-500 ring-offset-2 ring-offset-black scale-105 opacity-100' : 'opacity-50 hover:opacity-100 hover:scale-105'
                                    }`}
                            >
                                {isThumbVid ? (
                                    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                                        <video src={media} className="w-full h-full object-cover opacity-60 pointer-events-none" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white fill-white opacity-90" />
                                        </div>
                                    </div>
                                ) : (
                                    <img src={media} alt="thumb" className="w-full h-full object-cover" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}