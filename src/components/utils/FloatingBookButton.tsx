"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";

export default function FloatingBookButton() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        let cachedInnerHeight = window.innerHeight;
        let cachedScrollHeight = document.body.scrollHeight;

        const updateDimensions = () => {
            cachedInnerHeight = window.innerHeight;
            cachedScrollHeight = document.body.scrollHeight;
        };

        const observer = new ResizeObserver(updateDimensions);
        observer.observe(document.body);
        window.addEventListener("resize", updateDimensions, { passive: true });

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentY = window.scrollY;
                    const scrolledPastThreshold = currentY > 400;
                    const nearBottom =
                        cachedInnerHeight + currentY >= cachedScrollHeight - 200;

                    setVisible(scrolledPastThreshold && !nearBottom);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", updateDimensions);
            observer.disconnect();
        };
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-6 sm:left-auto sm:right-6"
                >
                    <Link
                        href="/booking/?autoSelect=meeting"
                        className="relative flex items-center justify-center gap-2 overflow-hidden
                       bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white
                       shadow-[0_8px_30px_rgba(124,58,237,0.45)]
                       sm:w-auto sm:rounded-full sm:px-6 sm:py-3"
                    >
                        {/* pulsing glow ring, desktop pill only */}
                        <span className="pointer-events-none absolute inset-0 hidden animate-ping rounded-full bg-fuchsia-500/40 sm:block" />

                        <span className="relative flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4" />
                            Book Your Space Now
                            <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-violet-950">
                                20% OFF
                            </span>
                        </span>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}