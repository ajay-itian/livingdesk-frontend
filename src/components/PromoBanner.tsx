"use client";


import Link from "next/link";
import { Sparkles } from "lucide-react";

const MESSAGES = [
  { text: "MEETING ROOM EXCLUSIVE", highlight: "20% OFF", suffix: "on 4–8 hour bookings" },
  { text: "WEEKEND WORKER?", highlight: "20% OFF", suffix: "on all Saturday bookings" },
];

function BannerContent() {
  return (
    <div className="flex items-center gap-10 pr-10 shrink-0">
      {MESSAGES.map((m, i) => (
        <span key={i} className="flex items-center gap-2 whitespace-nowrap">
          <Sparkles className="h-3 w-3 text-amber-300 shrink-0" />
          <span className="opacity-90">{m.text}</span>
          <span className="rounded-full bg-amber-400 text-violet-950 px-2 py-0.5 text-[10px] font-extrabold tracking-tight">
            {m.highlight}
          </span>
          <span className="opacity-90">{m.suffix}</span>
        </span>
      ))}
    </div>
  );
}

export default function PromoBanner() {
  return (
    <div className="group relative flex w-full shrink-0 items-center overflow-hidden border-b border-white/10 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-violet-700 bg-[length:200%_100%] animate-[gradientShift_8s_ease_infinite] py-1.5 text-[10px] font-bold text-white sm:text-xs">
      {/* diagonal shine sweep */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:animate-[shine_1.2s_ease]" />

      <Link
        href="/booking/?autoSelect=meeting"
        className="relative w-full overflow-hidden"
        aria-label="View meeting room and Saturday booking discounts"
      >
        <div className="flex items-center tracking-wide animate-[marquee_22s_linear_infinite]">
          {/* duplicated twice back-to-back = seamless loop, no reset jump */}
          <BannerContent />
          <BannerContent />
        </div>
      </Link>

      {/* standalone clickable CTA — separate hit target from the scrolling marquee link */}
      <Link
        href="/booking/?autoSelect=meeting"
        className="absolute right-3 z-10 hidden items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold backdrop-blur-sm transition-colors hover:bg-white hover:text-violet-700 sm:flex"
      >
        Book Now →
      </Link>

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}