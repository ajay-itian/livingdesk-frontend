"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { format, addDays, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { API_BASE, fetchWithApiKey } from "@/lib/api";
import {
  Send,
  CheckCircle2,
  Sparkles,
  MapPin,
  ChevronLeft,
  AtSign,
  Timer,
  Hash,
  ArrowRight,
  Loader2,
  CalendarDays,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Building2,
} from "lucide-react";

import { PaymentDialog } from "@/components/features/bookings/PaymentDialog";
import type { ChargeInfo, PaymentIntent } from "@/components/features/bookings/booking.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PHONE_PREFIX = "+91 ";
const PHONE_RE = /^\+91\s[6-9][0-9]{9}$/;
const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

type Step = "room" | "date" | "slots" | "phone-lookup" | "name" | "email" | "summary" | "done";

// ─── Summary data stored separately to avoid stale closures ──────────────────
interface SummaryData {
  slots: string[];
  phone: string;
  name: string;
  freshCharge: ChargeInfo | null;
  email: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isDayPassRoom(roomName?: string): boolean {
  return !!roomName?.toLowerCase().includes("day pass");
}

function addThirtyMinutes(slot: string | undefined): string {
  if (!slot) return "00:00";
  const [h, m] = slot.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m + 30);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDuration(slotCount: number): string {
  const totalMins = slotCount * 30;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const STEP_LABELS: Partial<Record<Step, string>> = {
  room: "Space", date: "Date", slots: "Time", "phone-lookup": "Contact", summary: "Confirm",
};

function ProgressBar({ step }: { step: Step }) {
  const visibleSteps: Step[] = ["room", "date", "slots", "phone-lookup", "summary"];
  const currentIdx = visibleSteps.indexOf(
    step === "name" || step === "email" ? "phone-lookup" : step === "done" ? "summary" : step
  );
  return (
    <div className="flex items-center gap-1 px-8 py-3 border-b border-zinc-100 dark:border-white/5 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm">
      {visibleSteps.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
          <div className={`flex items-center gap-1.5 ${i <= currentIdx ? "text-primary" : "text-zinc-300 dark:text-zinc-600"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 transition-all duration-300 ${i < currentIdx ? "bg-primary border-primary text-white" :
              i === currentIdx ? "border-primary text-primary bg-primary/10" :
                "border-zinc-200 dark:border-zinc-700 text-zinc-400"
              }`}>
              {i < currentIdx ? "✓" : i + 1}
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider hidden sm:block">
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < visibleSteps.length - 1 && (
            <div className={`flex-1 h-px mx-1 transition-all duration-300 ${i < currentIdx ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Credit Bar ───────────────────────────────────────────────────────────────

function CreditBar({ chargeInfo }: { chargeInfo: ChargeInfo }) {
  const creditUsed = chargeInfo.company_used_hours ?? 0;
  const creditMax = chargeInfo.monthly_credit_hours ?? 0;
  const remaining = chargeInfo.company_remaining_hours ?? 0;
  const freeApplied = chargeInfo.free_hours_applied ?? 0;
  const paidHours = chargeInfo.paid_hours ?? 0;

  if (creditMax === 0) return null;

  const pct = Math.min(100, (creditUsed / creditMax) * 100);
  const overLimit = creditUsed >= creditMax;

  return (
    <div className="space-y-2 border-t border-white/10 pt-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Building2 size={10} />
          <span className="text-[10px] font-bold">{chargeInfo.company_name ?? "Company Credits"}</span>
        </div>
        <span className="text-[10px] font-black text-zinc-300">
          {creditUsed.toFixed(1)}h <span className="text-zinc-500 font-normal">/ {creditMax.toFixed(0)}h</span>
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${overLimit ? "bg-red-400" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {remaining > 0 && (
        <p className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
          <TrendingUp size={10} /> {remaining.toFixed(1)}h credit remaining this month
        </p>
      )}

      {(freeApplied > 0 || paidHours > 0) && (
        <div className="bg-white/5 rounded-xl p-2.5 space-y-1.5 border border-white/5">
          {freeApplied > 0 && (
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-400">Free credits applied</span>
              <span className="font-bold text-green-400">{freeApplied.toFixed(1)}h → ₹0</span>
            </div>
          )}
          {paidHours > 0 && (
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-400">Overage (billable)</span>
              <span className="font-bold text-primary">
                {paidHours.toFixed(1)}h @ ₹{chargeInfo.rate_per_30min}/30 min
              </span>
            </div>
          )}
          {freeApplied > 0 && paidHours > 0 && (
            <div className="flex items-center gap-1 text-[9px] text-amber-400 border-t border-white/10 pt-1.5">
              <Zap size={9} className="flex-shrink-0" />
              <span>This session crosses your company's monthly credit limit.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── BookingSummary Sub-component ─────────────────────────────────────────────

interface BookingSummaryProps {
  roomName: string;
  date: string;
  slots: string[];
  amount: number;
  chargeInfo: ChargeInfo | null;
  isSubmitting: boolean;
  loadingPayment: boolean;
  onConfirm: () => void;
}

function BookingSummary({ roomName, date, slots, amount, chargeInfo, isSubmitting, loadingPayment, onConfirm }: BookingSummaryProps) {
  const isDayPass = isDayPassRoom(roomName);
  const sorted = [...slots].sort();
  const startTime = isDayPass ? "08:00" : sorted[0];
  const endTime = isDayPass ? "18:30" : addThirtyMinutes(sorted[sorted.length - 1]);
  const durationLabel = isDayPass ? "Full Day" : formatDuration(slots.length);
  const isDisabled = isSubmitting || loadingPayment;
  const isMember = chargeInfo?.user_type === "member";

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="bg-zinc-950 text-white rounded-2xl overflow-hidden shadow-2xl border border-white/10"
    >
      <div className="bg-gradient-to-r from-primary/80 to-primary px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mb-0.5">Your Reservation</p>
          <h4 className="text-lg font-black">{roomName}</h4>
        </div>
        <Sparkles size={18} className="text-white/70" />
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: CalendarDays, label: "Date", value: format(new Date(date), "MMM do") },
            { icon: Clock, label: "Time", value: `${startTime}–${endTime}` },
            { icon: Timer, label: "Duration", value: durationLabel },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1 mb-1">
                <Icon size={10} className="text-zinc-400" />
                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">{label}</p>
              </div>
              <p className="text-xs font-black leading-tight">{value}</p>
            </div>
          ))}
        </div>

        {isDayPass && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-[10px] text-primary font-bold flex items-center gap-1.5">
            <Zap size={10} /> Full day access · Flat rate ₹299
          </div>
        )}

        {isMember && chargeInfo && <CreditBar chargeInfo={chargeInfo} />}

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Total</p>
            {amount === 0 ? (
              <p className="text-2xl font-black text-green-400">Free ✓</p>
            ) : (
              <p className="text-2xl font-black">₹{amount}</p>
            )}
          </div>
          <button
            onClick={onConfirm}
            disabled={isDisabled}
            aria-busy={isDisabled}
            className="bg-primary text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2"
          >
            {isDisabled ? (
              <><Loader2 size={13} className="animate-spin" />Processing…</>
            ) : (
              <>Confirm & Pay<ArrowRight size={13} /></>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────

interface ChatMessageProps {
  m: any;
  summaryData: SummaryData | null;
  roomName: string;
  selectedDate: string;
  isSubmitting: boolean;
  loadingPayment: boolean;
  onSummaryConfirm: (phone: string, name: string, amount: number, email: string) => void;
}

function ChatMessage({ m, summaryData, roomName, selectedDate, isSubmitting, loadingPayment, onSummaryConfirm }: ChatMessageProps) {
  const isUser = m.from === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
          <Sparkles size={12} className="text-primary" />
        </div>
      )}
      <div className={`max-w-[82%] ${m.node || m.type === "summary" ? "w-full" : ""}`}>
        {m.text && (
          <div className={`px-4 py-2.5 rounded-2xl text-sm font-semibold leading-relaxed ${isUser
            ? "bg-primary text-white rounded-tr-sm shadow-md shadow-primary/20"
            : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-sm shadow-sm border border-zinc-100 dark:border-white/5"
            }`}>
            {m.text}
          </div>
        )}
        {m.node && <div className="mt-1">{m.node}</div>}
        {m.type === "summary" && summaryData && (
          <div className="mt-1">
            <BookingSummary
              roomName={roomName}
              date={selectedDate}
              slots={summaryData.slots}
              amount={summaryData.freshCharge?.amount ?? (isDayPassRoom(roomName) ? 299 : summaryData.slots.length * 150)}
              chargeInfo={summaryData.freshCharge}
              isSubmitting={isSubmitting}
              loadingPayment={loadingPayment}
              onConfirm={() =>
                onSummaryConfirm(
                  summaryData.phone,
                  summaryData.name,
                  summaryData.freshCharge?.amount ?? (isDayPassRoom(roomName) ? 299 : summaryData.slots.length * 150),
                  summaryData.email
                )
              }
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingChat() {
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [step, setStep] = useState<Step>("room");
  const [stepHistory, setStepHistory] = useState<Step[]>([]);
  const [typing, setTyping] = useState(false);

  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [chosenSlots, setChosenSlots] = useState<string[]>([]);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [chargeInfo, setChargeInfo] = useState<ChargeInfo | null>(null);

  const [inputValue, setInputValue] = useState("");

  const [showPayment, setShowPayment] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  // ─── Messaging ──────────────────────────────────────────────────────────────

  const addMsg = useCallback((m: any) => {
    setMessages((prev) => [...prev, { ...m, id: Math.random().toString(36).substring(2, 11) }]);
  }, []);

  const botSay = useCallback(async (text: string, node?: React.ReactNode) => {
    setTyping(true);
    await new Promise((res) => setTimeout(res, 400));
    setTyping(false);
    addMsg({ from: "bot", text, node });
  }, [addMsg]);

  // ─── Init ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let active = true;
    fetchWithApiKey(`${API_BASE}/rooms`)
      .then((r) => r.json())
      .then((data) => { if (active) setRooms(data); })
      .catch(() => toast({ title: "Could not load rooms", variant: "destructive" }));

    const istHour = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    ).getHours();

    const greeting =
      istHour < 12 ? "Good morning" :
        istHour < 17 ? "Good afternoon" :
          "Good evening";
    if (active) botSay(`${greeting}! Which space would you like to book today?`);
    return () => { active = false; };
  }, [botSay]);

  // ─── Auto-scroll ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, typing]);

  // ─── Step Navigation ─────────────────────────────────────────────────────────

  const navigateTo = useCallback((nextStep: Step) => {
    setStepHistory((prev) => {
      if (prev[prev.length - 1] === step) return prev;
      return [...prev, step];
    });
    setStep(nextStep);
  }, [step]);

  const goBack = useCallback(() => {
    if (stepHistory.length === 0) return;
    const prevStep = stepHistory[stepHistory.length - 1];

    if (step === "slots") setChosenSlots([]);
    if (step === "date") { setSelectedDate(""); setDisabledSlots([]); }
    if (step === "phone-lookup" || step === "name" || step === "email") setInputValue("");

    setStepHistory((prev) => prev.slice(0, -1));
    setStep(prevStep);
    setMessages((prev) => {
      const lastBotIdx = [...prev].reverse().findIndex((m) => m.from === "bot");
      if (lastBotIdx === -1) return prev;
      return prev.slice(0, prev.length - 1 - lastBotIdx);
    });
  }, [stepHistory, step]);

  // ─── Room ────────────────────────────────────────────────────────────────────

  const handleRoomSelect = async (room: any) => {
    setSelectedRoom(room);
    addMsg({ from: "user", text: room.name });
    navigateTo("date");
    await botSay("Great choice! Now pick a date:");
  };

  // ─── Date ────────────────────────────────────────────────────────────────────

  const handleDateSelect = async (iso: string, label: string) => {
    setSelectedDate(iso);
    addMsg({ from: "user", text: label });

    // ── Day Pass: skip slot picker, auto-fill full day ──
    if (isDayPassRoom(selectedRoom?.name)) {
      setChosenSlots(TIME_SLOTS);
      setDisabledSlots([]);
      navigateTo("phone-lookup");
      setInputValue(PHONE_PREFIX);
      await botSay("Day Pass covers the full day (8:00 – 18:30). What's your mobile number?");
      return;
    }

    setLoadingAvailability(true);
    try {
      const res = await fetchWithApiKey(
        `${API_BASE}/bookings/availability?room_id=${selectedRoom.id}&date=${iso}`
      );
      const data = await res.json();
      setDisabledSlots(data.disabled_slots || []);
    } catch {
      toast({ title: "Could not load availability", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoadingAvailability(false);
    }
    navigateTo("slots");
    await botSay("Select your time slots — tap a start and end slot to set a range:");
  };

  // ─── Slots ───────────────────────────────────────────────────────────────────

  const handleSlotToggle = (slot: string) => {
    if (disabledSlots.includes(slot)) return;
    setChosenSlots((prev) => {
      if (prev.length === 0 || prev.includes(slot)) return [slot];
      const startIdx = TIME_SLOTS.indexOf(prev[0]);
      const endIdx = TIME_SLOTS.indexOf(slot);
      const range = TIME_SLOTS.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1);
      if (range.some((s) => disabledSlots.includes(s))) {
        toast({ title: "Blocked slot in range", description: "Selection reset to tapped slot." });
        return [slot];
      }
      return range;
    });
  };

  const applyDuration = (hours: number) => {
    if (chosenSlots.length === 0) {
      toast({ title: "Pick a start slot first" });
      return;
    }
    const startIdx = TIME_SLOTS.indexOf(chosenSlots[0]);
    const range = TIME_SLOTS.slice(startIdx, startIdx + hours * 2);
    if (range.length < hours * 2) {
      toast({ title: "Not enough slots available at end of day" });
      return;
    }
    if (range.some((s) => disabledSlots.includes(s))) {
      toast({ title: "Time block unavailable", description: "A slot in this range is taken." });
      return;
    }
    setChosenSlots(range);
  };

  const handleSlotsConfirm = async () => {
    const sorted = [...chosenSlots].sort();
    addMsg({ from: "user", text: `${sorted[0]} – ${addThirtyMinutes(sorted[sorted.length - 1])} (${formatDuration(sorted.length)})` });
    navigateTo("phone-lookup");
    setInputValue(PHONE_PREFIX);
    await botSay("Almost there! What's your mobile number?");
  };

  // ─── Phone Input ─────────────────────────────────────────────────────────────

  const handlePhoneInput = (val: string) => {
    if (!val.startsWith(PHONE_PREFIX)) { setInputValue(PHONE_PREFIX); return; }
    const digits = val.slice(PHONE_PREFIX.length).replace(/\D/g, "").slice(0, 10);
    setInputValue(PHONE_PREFIX + digits);
  };

  const submitPhone = async () => {
    const val = inputValue.trim();
    if (!PHONE_RE.test(val)) {
      toast({ title: "Invalid number", description: "Format: +91 9876543210" });
      return;
    }
    setInputValue("");
    addMsg({ from: "user", text: val });
    setTyping(true);

    try {
      const hours = isDayPassRoom(selectedRoom?.name) ? 10.5 : chosenSlots.length * 0.5;
      const [lookupRes, cRes] = await Promise.all([
        fetchWithApiKey(`${API_BASE}/bookings/customers/lookup?phone=${encodeURIComponent(val)}`),
        fetchWithApiKey(`${API_BASE}/bookings/check-charge?phone=${encodeURIComponent(val)}&requested_hours=${hours}`),
      ]);

      const freshCharge: ChargeInfo | null = cRes.ok ? await cRes.json() : null;

      // For Day Pass, always override amount to 299 unless member with full credit
      if (freshCharge && isDayPassRoom(selectedRoom?.name)) {
        if (freshCharge.amount !== 0) {
          freshCharge.amount = 299;
        }
      }

      setChargeInfo(freshCharge);

      if (lookupRes.ok) {
        const data = await lookupRes.json();
        setUserName(data.name);
        setUserPhone(data.phone);
        setUserEmail(data.email || "");
        setTyping(false);
        if (data.email) {
          renderSummary(chosenSlots, data.phone, data.name, freshCharge, data.email);
        } else {
          navigateTo("email");
          setInputValue("");
          await botSay(`Welcome back, ${data.name.split(" ")[0]}! We just need your email to finish.`);
        }
      } else {
        setUserPhone(val);
        setTyping(false);
        navigateTo("name");
        setInputValue("");
        await botSay("Nice to meet you! What's your full name?");
      }
    } catch {
      setTyping(false);
      toast({ title: "Network error", description: "Please check your connection and try again." });
    }
  };

  // ─── Text Input (name / email) ────────────────────────────────────────────────

  const handleTextInput = async (suggestion?: string) => {
    const val = (suggestion ?? inputValue).trim();
    if (!val) return;
    setInputValue("");
    addMsg({ from: "user", text: val });

    if (step === "name") {
      setUserName(val);
      navigateTo("email");
      setInputValue("");
      await botSay(`Thanks, ${val.split(" ")[0]}! Lastly, your email address?`);
    } else if (step === "email") {
      if (!val.includes("@") || !val.includes(".")) {
        toast({ title: "Invalid email", description: "Please enter a valid email address." });
        return;
      }
      setUserEmail(val);
      renderSummary(chosenSlots, userPhone, userName, chargeInfo, val);
    }
  };

  // ─── Summary ─────────────────────────────────────────────────────────────────

  const renderSummary = (slots: string[], phone: string, name: string, freshCharge: ChargeInfo | null, email: string) => {
    navigateTo("summary");
    setSummaryData({ slots, phone, name, freshCharge, email });
    addMsg({
      from: "bot",
      text: "Here's your booking summary:",
      type: "summary",
    });
  };

  // ─── Payment / Booking Flow ───────────────────────────────────────────────────

  const initiateBookingFlow = async (phone: string, name: string, amount: number, email: string) => {
    if (amount > 0) {
      setLoadingPayment(true);
      setShowPayment(true);
      try {
        const res = await fetchWithApiKey(`${API_BASE}/payments/create-intent`, {
          method: "POST",
          body: JSON.stringify({
            phone, name, email, amount,
            booking_data: {
              phone, name, email,
              room_id: selectedRoom.id, date: selectedDate,
              start_time: isDayPassRoom(selectedRoom?.name) ? "08:00" : chosenSlots[0],
              end_time: isDayPassRoom(selectedRoom?.name) ? "18:30" : addThirtyMinutes(chosenSlots[chosenSlots.length - 1]),
            },
          }),
        });
        setPaymentIntent(await res.json());
      } catch {
        setShowPayment(false);
        toast({ title: "Payment system offline", description: "Please try again shortly." });
      } finally {
        setLoadingPayment(false);
      }
    } else {
      submitFinalBooking(phone, name, email);
    }
  };

  const submitFinalBooking = async (phone: string, name: string, email?: string) => {
    const resolvedEmail = email ?? userEmail;
    const fcmToken = typeof window !== "undefined" ? localStorage.getItem("fcm_token") : null;
    const isDP = isDayPassRoom(selectedRoom?.name);

    setIsSubmitting(true);
    try {
      const res = await fetchWithApiKey(`${API_BASE}/bookings/`, {
        method: "POST",
        body: JSON.stringify({
          phone, name, email: resolvedEmail || undefined,
          room_id: selectedRoom.id, date: selectedDate,
          start_time: isDP ? "08:00" : chosenSlots[0],
          end_time: isDP ? "18:30" : addThirtyMinutes(chosenSlots[chosenSlots.length - 1]),
          payment_id: (paymentIntent as any)?.payment_id ?? "FREE",
          fcm_token: fcmToken,
        }),
      });
      if (res.ok) { setShowPayment(false); setStep("done"); }
      else throw new Error();
    } catch {
      toast({ title: "Booking failed", description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUpi = () => {
    if (paymentIntent?.upi_id) {
      navigator.clipboard.writeText(paymentIntent.upi_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  const isInputStep = step === "phone-lookup" || step === "name" || step === "email";
  const isDP = isDayPassRoom(selectedRoom?.name);

  return (
    <div className="flex flex-col h-screen bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col min-h-0 pt-16 pb-4 px-3 sm:px-4">
        <div className="flex-1 flex flex-col min-h-0 max-w-lg mx-auto w-full">

          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-white/5 overflow-hidden">

            <div className="flex-shrink-0 px-6 py-4 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-zinc-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles size={14} className="text-primary" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-zinc-900" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-200 leading-none">Booking Assistant</p>
                  <p className="text-[10px] text-zinc-400 font-medium">The Living Desk</p>
                </div>
              </div>
              {stepHistory.length > 0 && step !== "done" && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all"
                >
                  <ChevronLeft size={12} /> Back
                </button>
              )}
            </div>

            {/* Hide "slots" step from progress for Day Pass since it's skipped */}
            {step !== "done" && <ProgressBar step={isDP && step === "phone-lookup" ? "phone-lookup" : step} />}

            <div
              ref={chatRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((m) => (
                  <ChatMessage
                    key={m.id}
                    m={m}
                    summaryData={summaryData}
                    roomName={selectedRoom?.name ?? ""}
                    selectedDate={selectedDate}
                    isSubmitting={isSubmitting}
                    loadingPayment={loadingPayment}
                    onSummaryConfirm={initiateBookingFlow}
                  />
                ))}
              </AnimatePresence>

              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 ml-9">
                  <div className="flex gap-1 bg-white dark:bg-zinc-800 rounded-2xl px-3 py-2 shadow-sm border border-zinc-100 dark:border-white/5">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="flex-shrink-0 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/80">
              <AnimatePresence mode="wait">

                {step === "room" && (
                  <motion.div key="room" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="p-4">
                    {rooms.length === 0 ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-zinc-400">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm font-medium">Loading spaces…</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        {rooms.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => handleRoomSelect(r)}
                            className="p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border-2 border-transparent hover:border-primary/50 active:scale-[0.97] transition-all text-left group"
                          >
                            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded-lg mb-3 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                              <MapPin size={16} className="text-zinc-500 group-hover:text-primary transition-colors" />
                            </div>
                            <p className="font-black text-xs uppercase tracking-wide text-zinc-800 dark:text-zinc-100">{r.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Users size={9} className="text-zinc-400" />
                              {isDayPassRoom(r.name) && (
                                <span className="text-[9px] font-bold text-primary">₹299 · Full Day</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {step === "date" && (
                  <motion.div key="date" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="p-4">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                        const d = addDays(new Date(), i);
                        const today = isToday(d);
                        return (
                          <button
                            key={i}
                            onClick={() => handleDateSelect(format(d, "yyyy-MM-dd"), today ? "Today" : format(d, "EEE, do"))}
                            className={`flex-shrink-0 w-[4.5rem] h-[5.5rem] rounded-2xl flex flex-col items-center justify-center border-2 transition-all active:scale-95 ${today
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                              : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-white/5 hover:border-primary/50 text-zinc-800 dark:text-zinc-100"
                              }`}
                          >
                            <span className="text-[9px] font-black uppercase tracking-wider opacity-70">
                              {today ? "Today" : format(d, "EEE")}
                            </span>
                            <span className="text-xl font-black mt-0.5">{format(d, "d")}</span>
                            <span className="text-[9px] font-bold opacity-60">{format(d, "MMM")}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === "slots" && (
                  <motion.div key="slots" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mr-1">Quick:</span>
                      {[1, 2, 3].map((h) => (
                        <button
                          key={h}
                          onClick={() => applyDuration(h)}
                          disabled={loadingAvailability}
                          className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-700 text-white rounded-full text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all disabled:opacity-40"
                        >
                          <Timer size={10} /> {h}h
                        </button>
                      ))}
                    </div>

                    {loadingAvailability ? (
                      <div className="flex items-center justify-center py-6 gap-2 text-zinc-400">
                        <Loader2 size={15} className="animate-spin" />
                        <span className="text-xs font-medium">Checking availability…</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                        {TIME_SLOTS.map((s) => {
                          const isDisabled = disabledSlots.includes(s);
                          const isSelected = chosenSlots.includes(s);
                          const isFirst = s === chosenSlots[0];
                          const isLast = s === chosenSlots[chosenSlots.length - 1];
                          return (
                            <button
                              key={s}
                              disabled={isDisabled}
                              onClick={() => handleSlotToggle(s)}
                              className={`py-2 rounded-xl text-[10px] font-black border transition-all relative ${isSelected
                                ? "bg-primary border-primary text-white shadow-sm"
                                : isDisabled
                                  ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600 cursor-not-allowed line-through"
                                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-white/10 hover:border-primary/50 text-zinc-700 dark:text-zinc-200"
                                }`}
                            >
                              {s}
                              {(isFirst || isLast) && isSelected && chosenSlots.length > 1 && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border-2 border-primary rounded-full" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {chosenSlots.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between bg-primary/8 dark:bg-primary/15 rounded-xl px-3 py-2 border border-primary/20">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-primary" />
                          <span className="text-xs font-black text-primary">
                            {chosenSlots[0]} – {addThirtyMinutes(chosenSlots[chosenSlots.length - 1])}
                          </span>
                          <span className="text-[10px] text-primary/60 font-bold">· {formatDuration(chosenSlots.length)}</span>
                        </div>
                        <button
                          onClick={handleSlotsConfirm}
                          className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
                        >
                          Next <ArrowRight size={10} />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {isInputStep && (
                  <motion.div key="text-input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="p-4 space-y-2.5">
                    {step === "email" && (
                      <div className="flex gap-2">
                        {["@gmail.com", "@outlook.com", "@yahoo.com"].map((s) => (
                          <button
                            key={s}
                            onClick={() => setInputValue((prev) => prev.split("@")[0] + s)}
                            className="px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-full text-[10px] font-black border border-zinc-200 dark:border-white/10 hover:border-primary/50 transition-all active:scale-95"
                          >
                            <AtSign size={9} className="inline mr-0.5 text-primary" />{s}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="relative flex items-center gap-2">
                      <div className="absolute left-4 text-zinc-400 pointer-events-none">
                        {step === "phone-lookup" ? <Hash size={16} /> : step === "name" ? <Sparkles size={16} /> : <AtSign size={16} />}
                      </div>
                      <input
                        ref={inputRef}
                        autoFocus
                        value={inputValue}
                        onChange={(e) => step === "phone-lookup" ? handlePhoneInput(e.target.value) : setInputValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") step === "phone-lookup" ? submitPhone() : handleTextInput(); }}
                        placeholder={step === "phone-lookup" ? "+91 98765 43210" : step === "name" ? "Your full name…" : "your@email.com"}
                        className="flex-1 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-white/10 focus:border-primary rounded-2xl py-3.5 pl-11 pr-4 outline-none font-bold text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 transition-all"
                      />
                      <button
                        onClick={() => step === "phone-lookup" ? submitPhone() : handleTextInput()}
                        className="flex-shrink-0 w-11 h-11 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-transform"
                      >
                        <Send size={17} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "summary" && (
                  <motion.div key="summary-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-3">
                    <p className="text-center text-[10px] text-zinc-400 font-semibold">
                      Review your booking above and tap <strong className="text-zinc-600 dark:text-zinc-300">Confirm & Pay</strong> when ready
                    </p>
                  </motion.div>
                )}

                {step === "done" && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 text-center space-y-3">
                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/30">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg uppercase tracking-tight text-zinc-800 dark:text-zinc-100">Booking Confirmed!</h3>
                      <p className="text-xs text-zinc-400 font-medium mt-0.5">See you at The Living Desk.</p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-8 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-black text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
                    >
                      Book Another
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        loadingPayment={loadingPayment}
        paymentIntent={paymentIntent}
        pendingBooking={{
          date: selectedDate,
          start_time: isDP ? "08:00" : (chosenSlots[0] || ""),
          end_time: isDP ? "18:30" : addThirtyMinutes(chosenSlots[chosenSlots.length - 1]),
          room_id: selectedRoom?.id || "",
          phone: userPhone,
          name: userName,
          email: userEmail,
          totalCharge: chargeInfo?.amount ?? (isDP ? 299 : chosenSlots.length * 150),
        }}
        copied={copied}
        onCopyUpiId={handleCopyUpi}
        onConfirmBooking={() => submitFinalBooking(userPhone, userName)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}