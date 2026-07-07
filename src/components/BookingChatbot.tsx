"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Building2,
  Phone,
  Tag,
  RotateCcw,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";

// Custom "Desk Bot" mark — a chat bubble holding a four-point spark.
// Reads as "assistant" without being a literal robot glyph, and ties
// back to the violet/fuchsia identity instead of a generic stock icon.
function DeskBotMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="deskbot-mark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      <path
        d="M -46 -34 Q -46 -46 -34 -46 L 34 -46 Q 46 -46 46 -34 L 46 6 Q 46 18 34 18 L -6 18 L -22 34 L -20 18 L -34 18 Q -46 18 -46 6 Z"
        fill="url(#deskbot-mark-gradient)"
      />
      <path
        d="M 0 -18 L 6 -4 L 20 0 L 6 4 L 0 18 L -6 4 L -20 0 L -6 -4 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  options?: Option[];
  timestamp: number;
}

interface Option {
  label: string;
  description?: string;
  price?: string;
  badge?: string; // urgency / occupancy chip, e.g. "🟢 4 desks free"
  action: () => void;
  icon?: React.ReactNode;
}

interface Availability {
  daypass?: number; // desks free today
  meeting?: number; // meeting slots free today
}

const WHATSAPP_NUMBER = "911234567890"; // TODO: replace with real number
const TEASER_DELAY_MS = 9000;

export default function BookingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [availability, setAvailability] = useState<Availability>({});
  const [showSuccessPing, setShowSuccessPing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const displayMessages = messages.map((msg, index) => ({
    ...msg,
    options: index === messages.length - 1 ? msg.options : undefined,
  }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Proactive teaser after a short delay on page, only if never opened
  useEffect(() => {
    if (isOpen || messages.length > 0) return;
    const t = setTimeout(() => {
      setShowTeaser(true);
      setHasUnread(true);
    }, TEASER_DELAY_MS);
    return () => clearTimeout(t);
  }, [isOpen, messages.length]);

  // Pull live occupancy so option chips reflect real numbers
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/bookings/availability");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setAvailability({
            daypass: data?.daypass ?? data?.desks ?? undefined,
            meeting: data?.meeting ?? data?.meetingRooms ?? undefined,
          });
          
          // Update root options in messages if already rendered
          setMessages((prev) =>
            prev.map((m) =>
              m.sender === "bot" && m.text.includes("What kind of space")
                ? { ...m, options: rootOptions() }
                : m
            )
          );
        }
      } catch {
        // Silently ignore — chips just won't render without a number
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Escape closes the panel
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        sendGAEvent({ event: "chatbot_close", method: "escape_key", debug_mode: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const addMessage = (msg: Omit<Message, "timestamp">) => {
    setMessages((prev) => [...prev, { ...msg, timestamp: Date.now() }]);
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const rootOptions = useCallback(
    (): Option[] => {
      const daypassBadge =
        typeof availability.daypass === "number"
          ? availability.daypass > 0
            ? `🟢 ${availability.daypass} desks free today`
            : `🔴 Fully booked today`
          : undefined;

      const meetingBadge =
        typeof availability.meeting === "number"
          ? availability.meeting <= 2 && availability.meeting > 0
            ? `🔥 Only ${availability.meeting} slot${availability.meeting === 1 ? "" : "s"} left`
            : availability.meeting === 0
              ? `🔴 Fully booked today`
              : `🟢 ${availability.meeting} slots free today`
          : undefined;

      return [
        {
          label: "Day Pass",
          description: "Full-day access, any desk",
          price: "₹299 / day",
          badge: daypassBadge,
          action: () => handleSelectSpace("Day Pass", "/booking?autoSelect=daypass"),
        },
        {
          label: "Monthly Pass",
          description: "Recurring monthly access",
          price: "₹5999 / month",
          action: () => handleSelectSpace("Monthly Pass", "/booking?autoSelect=monthly"),
        },
        {
          label: "Meeting Rooms",
          description: "For teams & meetings",
          price: "₹150 / 30 min",
          badge: meetingBadge,
          action: () => handleSelectSpace("Meeting Rooms", "/booking?autoSelect=meeting"),
        },
      ];
    },
    [availability]
  );

  const handleStart = () => {
    setIsOpen(true);
    setShowTeaser(false);
    setHasUnread(false);
    sendGAEvent({ event: "chatbot_open", value: "opened", debug_mode: true });
    if (messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage({
          id: Date.now().toString(),
          sender: "bot",
          text: "Hi there! 👋 Welcome to The Living Desk. What kind of space are you looking for?",
          options: rootOptions(),
        });
      }, 600);
    }
  };

  const hasStarted = useRef(false);
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      handleStart();
    }
  }, []);

  const handleSelectSpace = (label: string, url: string) => {
    sendGAEvent({ event: "chatbot_select_space", space_type: label, debug_mode: true });
    addMessage({ id: Date.now().toString(), sender: "user", text: label });
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: `Awesome choice! Taking you to book a ${label} now...`,
      });
      setShowSuccessPing(true);
      setTimeout(() => {
        router.push(url);
        setIsOpen(false);
        setShowSuccessPing(false);
      }, 1500);
    }, 800);
  };

  const handleRestart = () => {
    sendGAEvent({ event: "chatbot_restart", debug_mode: true });
    setMessages([]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({
        id: Date.now().toString(),
        sender: "bot",
        text: "Starting fresh! How can I help you today?",
        options: rootOptions(),
      });
    }, 500);
  };

  return (
    <>
      {/* Teaser bubble */}
      <AnimatePresence>
        {showTeaser && !isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onClick={handleStart}
            className="fixed z-50 bottom-36 right-4 sm:bottom-40 sm:right-6 max-w-[220px] text-left bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl rounded-br-sm px-4 py-3 shadow-2xl text-sm text-zinc-200 hover:border-violet-500/40 transition-colors"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTeaser(false);
              }}
              aria-label="Dismiss"
              className="absolute -top-2 -right-2 bg-zinc-800 border border-white/10 rounded-full p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
            👋 Looking for a desk today?
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={handleStart}
        aria-label="Open booking chat"
        className="fixed z-50 bottom-20 right-4 sm:bottom-24 sm:right-6 bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-4 rounded-full shadow-[0_8px_30px_rgba(124,58,237,0.45)] text-white hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        {/* resting breathing glow */}
        <motion.span
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-fuchsia-500/40"
        />
        <span className="absolute inset-0 rounded-full animate-ping bg-fuchsia-500/30" />
        <DeskBotMark className="w-6 h-6 relative z-10" />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-zinc-950 z-20" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Booking assistant"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-24 sm:left-auto sm:right-6 w-full sm:w-[380px] h-[85dvh] sm:h-[80vh] sm:max-h-[600px] bg-zinc-900/95 sm:bg-zinc-900/90 backdrop-blur-xl border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* ambient glow behind header */}
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-40 bg-violet-600/20 blur-3xl rounded-full" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-950/40 border border-white/10 p-2 rounded-xl shadow-lg">
                  <DeskBotMark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Desk Bot</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    onClick={handleRestart}
                    aria-label="Start over"
                    title="Start over"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    sendGAEvent({ event: "chatbot_close", method: "close_button", debug_mode: true });
                  }}
                  aria-label="Close chat"
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              aria-live="polite"
            >
              {displayMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className={`flex items-end gap-2 max-w-[90%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.sender === "bot" && (
                      <div className="shrink-0 w-6 h-6 rounded-full bg-zinc-950/60 border border-white/10 flex items-center justify-center">
                        <DeskBotMark className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm ${msg.sender === "user"
                        ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white rounded-tr-sm"
                        : "bg-white/10 text-zinc-200 rounded-tl-sm border border-white/5"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] text-zinc-500 mt-1 ${msg.sender === "user" ? "mr-1" : "ml-8"
                      }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>

                  {/* Options */}
                  {msg.options && (
                    <div className="mt-3 flex flex-col gap-2 w-[90%] ml-8">
                      {msg.options.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={opt.action}
                          className="flex flex-col gap-1 px-4 py-2.5 text-sm text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/40 rounded-xl text-zinc-200 transition-colors w-full"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="flex items-center gap-2 font-medium">
                              {opt.icon}
                              {opt.label}
                            </span>
                            {opt.price && (
                              <span className="text-amber-400 font-bold text-xs bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">
                                {opt.price}
                              </span>
                            )}
                          </div>
                          {opt.description && (
                            <span className="text-xs text-zinc-400">{opt.description}</span>
                          )}
                          {opt.badge && (
                            <span className="text-[11px] text-violet-300 mt-0.5">{opt.badge}</span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-zinc-950/60 border border-white/10 flex items-center justify-center">
                    <DeskBotMark className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white/10 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                    />
                  </div>
                </div>
              )}

              {showSuccessPing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center"
                >
                  <div className="w-9 h-9 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer hint */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="text-xs text-center text-zinc-500">
                Select an option above to continue.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}