"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    MapPin,
    ArrowRight,
    Users,
    Maximize,
    X,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    CheckCircle2,
    Play,
    ArrowLeft,
    Wifi,
    Car,
    Shield,
    Zap,
    SparklesIcon,
    Building2,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { locations, isVideo, OfficeLocation } from './ManagedOffices';

// ─── Detail Page Component ───────────────────────────────────────────────────
export default function ManagedOfficeDetail() {
    const router = useRouter();
    const params = useParams();
    const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : null;
    const location = slug ? locations.find((l) => l.slug === slug) : null;

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const openLightbox = (idx: number) => {
        setActiveIndex(idx);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = useCallback(() => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    }, []);

    const navigate = useCallback((dir: 'next' | 'prev') => {
        if (!location) return;
        setActiveIndex((prev) => {
            if (dir === 'next') return prev === location.gallery.length - 1 ? 0 : prev + 1;
            return prev === 0 ? location.gallery.length - 1 : prev - 1;
        });
    }, [location]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') navigate('next');
            if (e.key === 'ArrowLeft') navigate('prev');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxOpen, closeLightbox, navigate]);

    const handleContact = () => {
        router.push('/#contact');
        setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleWhatsApp = () => {
        window.open('https://web.whatsapp.com/send?phone=917066002650&text=Hello!%20I%27m%20interested%20in%20your%20coworking%20space.', '_blank');
    };

    const amenityIcon = (amenity: string) => {
        if (amenity.toLowerCase().includes('wifi')) return <Wifi className="w-4 h-4" />;
        if (amenity.toLowerCase().includes('parking')) return <Car className="w-4 h-4" />;
        if (amenity.toLowerCase().includes('security')) return <Shield className="w-4 h-4" />;
        if (amenity.toLowerCase().includes('power')) return <Zap className="w-4 h-4" />;
        if (amenity.toLowerCase().includes('housekeeping')) return <SparklesIcon className="w-4 h-4" />;
        return <Building2 className="w-4 h-4" />;
    };

    if (!location) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                    <h1 className="text-3xl font-bold">Location not found</h1>
                    <p className="text-slate-500">The office location you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push('/managed-office-pune')} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to all locations
                    </Button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 text-slate-900">

                {/* Back */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <button
                        onClick={() => router.push('/managed-office-pune')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to all locations
                    </button>
                </div>

                {/* Hero */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-start">

                        {/* Main Image */}
                        <div
                            className="relative rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer group shadow-xl"
                            onClick={() => openLightbox(0)}
                        >
                            <img src={location.image} alt={location.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300" />
                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {location.gallery.length} Photos
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="bg-white/90 backdrop-blur-md text-slate-900 px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg">View Gallery</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                                    <MapPin className="w-3 h-3" /> {location.area}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2">{location.name}</h1>
                                <p className="flex items-start gap-2 text-slate-500 text-sm">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-teal-500" />
                                    {location.address}
                                </p>
                            </div>

                            {location.description && (
                                <p className="text-slate-600 leading-relaxed text-sm md:text-base">{location.description}</p>
                            )}

                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Capacity', value: location.capacity, icon: <Users className="w-4 h-4" /> },
                                    { label: 'Size', value: location.size, icon: <Maximize className="w-4 h-4" /> },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                                        <div className="flex items-center gap-1.5 text-teal-500 mb-1.5">
                                            {stat.icon}
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{stat.label}</span>
                                        </div>
                                        <p className="font-bold text-slate-800 text-sm leading-snug">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {location.highlights && (
                                <div className="flex flex-wrap gap-2">
                                    {location.highlights.map((h, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                            <CheckCircle2 className="w-3 h-3" /> {h}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md h-12 group/btn" onClick={handleContact}>
                                    Contact Us <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                                <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-xl h-12" onClick={handleWhatsApp}>
                                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Amenities */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Amenities & Features</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {location.amenities.map((amenity, i) => (
                            <div key={i} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-teal-200 hover:shadow-md transition-all duration-200 text-center">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                                    {amenityIcon(amenity)}
                                </div>
                                <span className="text-xs font-medium text-slate-600 leading-snug">{amenity}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Gallery Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Gallery</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {location.gallery.map((media, idx) => {
                            const isVid = isVideo(media);
                            return (
                                <div
                                    key={idx}
                                    className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300"
                                    onClick={() => openLightbox(idx)}
                                >
                                    {isVid ? (
                                        <div className="relative w-full h-full bg-slate-900">
                                            <video src={media} className="w-full h-full object-cover opacity-70 pointer-events-none" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <Play className="w-5 h-5 text-teal-600 fill-teal-600 ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={media} alt={`${location.name} ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                    )}
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300 rounded-2xl" />
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {lightboxOpen && (
                <Lightbox
                    location={location}
                    currentIndex={activeIndex}
                    onClose={closeLightbox}
                    onNext={() => navigate('next')}
                    onPrev={() => navigate('prev')}
                    onSelect={setActiveIndex}
                />
            )}

            <Footer />
        </>
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
                                            <Play className="w-5 h-5 text-white fill-white opacity-90" />
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