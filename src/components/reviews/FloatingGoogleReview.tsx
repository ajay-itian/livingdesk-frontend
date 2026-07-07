"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FloatingGoogleReview = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after a small delay to not distract immediately on load
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-end"
        >
          <a
            href="https://g.page/r/CWL2APY32ejlEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center bg-white rounded-full shadow-lg border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 p-2 md:pr-6"
            aria-label="View our Google Reviews"
          >
            <div className="bg-muted/30 rounded-full p-2 flex-shrink-0">
              {/* Google G Icon */}
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            
            <div className="hidden md:flex flex-col ml-3">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-foreground">4.9</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                View Reviews
              </span>
            </div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
