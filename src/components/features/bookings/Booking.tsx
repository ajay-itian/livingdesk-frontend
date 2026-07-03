"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { format, addDays, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { API_BASE, apiClient, fetchWithApiKey } from "@/lib/api";
import {
  Send, Sparkles, MapPin, Plus, CheckCircle2, Loader2, ArrowRight,
  Hash, AtSign, MessageSquare, PanelLeftClose,
  PanelLeftOpen, Building2, TrendingUp,
  Sun, Repeat, Users,
} from "lucide-react";

import PromoBanner from "@/components/PromoBanner";

import { PaymentDialog } from "@/components/features/bookings/PaymentDialog";
import type { ChargeInfo, PaymentIntent } from "@/components/features/bookings/booking.types";
import { TIME_SLOTS } from "@/components/features/bookings/booking.types";

/* ─── Constants ────────────────────────────────────────────────────────── */

const PHONE_PREFIX = "+91 ";
const PHONE_RE = /^\+91\s[6-9][0-9]{9}$/;

type Step = "room" | "date" | "slots" | "phone-lookup" | "name" | "email" | "face-capture" | "summary" | "done";

interface SummaryData {
  slots: string[];
  phone: string;
  name: string;
  freshCharge: ChargeInfo | null;
  email: string;
  faceImage?: string | null;
}
RoomPicker
/* ─── Helpers ──────────────────────────────────────────────────────────── */

interface BookingHistoryItem {
  id: string;
  roomName: string;
  date: string;
  slots: string[];
  timestamp: number;
}

function saveBookingHistory(item: Omit<BookingHistoryItem, "id" | "timestamp">) {
  try {
    const prev = JSON.parse(localStorage.getItem("livingdesk_bookings") || "[]");
    prev.unshift({ ...item, id: Date.now().toString(), timestamp: Date.now() });
    localStorage.setItem("livingdesk_bookings", JSON.stringify(prev.slice(0, 10)));
    window.dispatchEvent(new Event('booking_history_updated'));
  } catch (e) {
    console.error(e);
  }
}
function getBookingHistory(): BookingHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem("livingdesk_bookings") || "[]");
  } catch (e) {
    return [];
  }
}

function isDayPassRoom(roomName?: string): boolean {
  return !!roomName?.toLowerCase().includes("day pass");
}
function isMonthlyPassRoom(roomName?: string): boolean {
  return !!roomName?.toLowerCase().includes("monthly");
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

/* ─── Sidebar ──────────────────────────────────────────────────────────── */

function Sidebar({ open, onToggle, onNewBooking }: { open: boolean; onToggle: () => void; onNewBooking: () => void }) {
  const [history, setHistory] = useState<BookingHistoryItem[]>([]);
  useEffect(() => {
    const loadHistory = () => setHistory(getBookingHistory());
    if (open) loadHistory();
    window.addEventListener('booking_history_updated', loadHistory);
    return () => window.removeEventListener('booking_history_updated', loadHistory);
  }, [open]);

  return (
    <aside className={`${open ? "w-72" : "w-0"} shrink-0 overflow-hidden transition-[width] duration-200 ease-out bg-[#171717] text-zinc-200 flex flex-col h-full`}>
      <div className="w-72 flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight">The Living Desk</span>
          </div>
          <button onClick={onToggle} className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" title="Collapse sidebar">
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="px-3 pt-1 pb-3">
          <button
            onClick={onNewBooking}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
          >
            <Plus size={15} /> New booking
          </button>
        </div>

        <div className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Recent</div>
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {history.length > 0 ? (
            history.map((h) => (
              <div key={h.id} className="px-3 py-2 text-xs text-zinc-300 bg-white/5 rounded-lg mb-1">
                <div className="font-semibold">{h.roomName}</div>
                <div className="text-zinc-500">{h.date} • {h.slots.length > 0 ? `${h.slots[0]} - ${addThirtyMinutes(h.slots[h.slots.length - 1])}` : 'All Day'}</div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-zinc-600 italic flex items-center gap-2">
              <MessageSquare size={12} /> No history yet
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ─── Chat bubbles ─────────────────────────────────────────────────────── */

function AssistantMessage({ text, children }: { text?: string; children?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3.5 px-1">
      <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={13} className="text-primary" />
      </div>
      <div className="min-w-0 flex-1 space-y-3 pt-0.5">
        {text && <p className="text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-100">{text}</p>}
        {children}
      </div>
    </motion.div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end px-1">
      <div className="max-w-[75%] bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-100">
        {text}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-3.5 px-1">
      <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
        <Sparkles size={13} className="text-primary" />
      </div>
      <div className="flex items-center gap-1 pt-2.5">
        {[0, 0.15, 0.3].map((d, i) => (
          <span key={i} className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Widget cards ─────────────────────────────────────────────────────── */

function CardShell({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="max-w-md space-y-2">
      {eyebrow && <p className="text-xs text-zinc-400 dark:text-zinc-500">{eyebrow}</p>}
      {children}
    </div>
  );
}

function roomVisuals(name?: string) {
  const n = name?.toLowerCase() ?? "";
  if (n.includes("day pass")) return { icon: Sun, badge: "₹299 / day", note: "Full-day access, any desk" };
  if (n.includes("monthly")) return { icon: Repeat, badge: "₹5999 / month", note: "Recurring monthly access" };
  if (n.includes("meeting") || n.includes("conference") || n.includes("huddle")) return { icon: Users, badge: "₹150 / 30 min", note: "For teams & meetings" };
  return { icon: MapPin, badge: "Hourly", note: "Dedicated workspace" };
}

function RoomPicker({ rooms, selectedRoomId, onSelect }: { rooms: any[]; selectedRoomId?: string; onSelect: (r: any) => void }) {
  return (
    <CardShell>
      {rooms.length === 0 ? (
        <div className="flex items-center gap-2 text-zinc-400 py-1">
          <Loader2 size={14} className="animate-spin" /> <span className="text-xs font-medium">Loading spaces…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {rooms.map((r) => {
            const { icon: Icon, badge, note } = roomVisuals(r.name);
            const isSelected = r.id === selectedRoomId;
            return (
              <motion.button
                key={r.id}
                onClick={() => onSelect(r)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-[border-color,box-shadow,background-color] group ${
                  isSelected
                    ? "border-primary shadow-md shadow-primary/20 bg-primary/5 dark:bg-primary/10"
                    : "border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:border-primary/60 hover:shadow-md hover:shadow-primary/5"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                  <Icon size={16} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100 truncate">{r.name}</p>
                    <ArrowRight size={13} className="text-zinc-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{note}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{badge}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </CardShell>
  );
}

function DatePicker({ onSelect }: { onSelect: (iso: string, label: string) => void }) {
  return (
    <CardShell>
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const d = addDays(new Date(), i);
          const today = isToday(d);
          return (
            <button
              key={i}
              onClick={() => onSelect(format(d, "yyyy-MM-dd"), today ? "Today" : format(d, "EEE, do"))}
              className={`px-3.5 py-2 rounded-full border text-[13px] font-semibold transition-colors ${today ? "bg-zinc-900 dark:bg-primary border-zinc-900 dark:border-primary text-white" : "border-zinc-200 dark:border-white/10 hover:border-primary text-zinc-700 dark:text-zinc-200"
                }`}
            >
              {today ? "Today" : `${format(d, "EEE")} ${format(d, "d")}`}
            </button>
          );
        })}
      </div>
    </CardShell>
  );
}

function SlotPicker({
  disabledSlots, loading, onConfirm,
}: { disabledSlots: string[]; loading: boolean; onConfirm: (slots: string[]) => void }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  // First tap sets the anchor. Every tap after that recomputes the range from
  // that anchor to the newly tapped slot — so you can keep tapping further-out
  // slots to extend the duration, or a nearer slot to shrink it, right up until
  // you hit Confirm. Tapping the anchor again keeps it a single 30-min block.
  const toggle = (s: string) => {
    if (confirmed || disabledSlots.includes(s)) return;
    if (chosen.length === 0) { setChosen([s]); return; }
    const anchor = chosen[0];
    if (anchor === s && chosen.length === 1) { setChosen([]); return; }
    const a = TIME_SLOTS.indexOf(anchor), b = TIME_SLOTS.indexOf(s);
    const range = TIME_SLOTS.slice(Math.min(a, b), Math.max(a, b) + 1);
    if (range.some((x) => disabledSlots.includes(x))) return; // blocked slot in the way — ignore, keep current range
    setChosen(range);
  };
  const quick = (h: number) => {
    if (chosen.length === 0 || confirmed) return;
    const start = TIME_SLOTS.indexOf(chosen[0]);
    const range = TIME_SLOTS.slice(start, start + h * 2);
    if (range.length === h * 2 && !range.some((x) => disabledSlots.includes(x))) {
      setChosen(range);
      setConfirmed(true);
      onConfirm(range);
    }
  };
  const confirmSelection = () => {
    if (chosen.length === 0 || confirmed) return;
    setConfirmed(true);
    onConfirm(chosen);
  };

  return (
    <CardShell>
      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400 py-1">
          <Loader2 size={14} className="animate-spin" /> <span className="text-xs">Checking availability…</span>
        </div>
      ) : (
        <>
          <div className={`flex flex-wrap gap-2 ${confirmed ? "opacity-60 pointer-events-none" : ""}`}>
            {TIME_SLOTS.map((s) => {
              const dis = disabledSlots.includes(s);
              const sel = chosen.includes(s);
              return (
                <button
                  key={s}
                  disabled={dis}
                  onClick={() => toggle(s)}
                  className={`px-2.5 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${sel ? "bg-primary border-primary text-white"
                    : dis ? "border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 line-through"
                      : "border-zinc-200 dark:border-white/10 hover:border-primary text-zinc-700 dark:text-zinc-200"
                    }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {chosen.length > 0 && !confirmed && (
            <div className="flex items-center justify-between bg-primary/8 dark:bg-primary/15 rounded-xl px-3 py-2 border border-primary/20">
              <span className="text-xs font-semibold text-primary">
                {chosen[0]}–{addThirtyMinutes(chosen[chosen.length - 1])} · {formatDuration(chosen.length)}
              </span>
              <button onClick={confirmSelection} className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold">
                Confirm <ArrowRight size={10} />
              </button>
            </div>
          )}
          {chosen.length === 1 && !confirmed && (
            <p className="text-xs text-zinc-400 pt-1">
              Tap a further slot to extend the range, or pick a duration:{" "}
              {[1, 2, 3].map((h) => (
                <button key={h} onClick={() => quick(h)} className="text-primary font-semibold underline underline-offset-2 mr-2">
                  {h}h
                </button>
              ))}
            </p>
          )}
        </>
      )}
    </CardShell>
  );
}

function CreditBar({ chargeInfo }: { chargeInfo: ChargeInfo }) {
  const creditMax = chargeInfo.monthly_credit_hours ?? 0;
  if (creditMax === 0) return null;
  const creditUsed = chargeInfo.company_used_hours ?? 0;
  const remaining = chargeInfo.company_remaining_hours ?? 0;
  const pct = Math.min(100, (creditUsed / creditMax) * 100);
  return (
    <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-white/10">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
          <Building2 size={10} /> {chargeInfo.company_name ?? "Company credits"}
        </span>
        <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-300">{creditUsed.toFixed(1)}h / {creditMax.toFixed(0)}h</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-white/10 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      {remaining > 0 && (
        <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
          <TrendingUp size={9} /> {remaining.toFixed(1)}h remaining this month
        </p>
      )}
    </div>
  );
}

function SummaryCardInline({
  roomName, date, slots, chargeInfo, amount, onConfirm, busy,
}: { roomName: string; date: string; slots: string[]; chargeInfo: ChargeInfo | null; amount: number; onConfirm: () => void; busy: boolean }) {
  const dp = isDayPassRoom(roomName);
  const sorted = [...slots].sort();
  const start = dp ? "08:00" : sorted[0];
  const end = dp ? "18:30" : addThirtyMinutes(sorted[sorted.length - 1]);
  const isMember = chargeInfo?.user_type === "member";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-md rounded-2xl border border-zinc-200 dark:border-white/10 p-4 space-y-3">
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{roomName}</p>
      <div className="space-y-1.5 text-[13px]">
        <div className="flex justify-between"><span className="text-zinc-400">Date</span><span className="font-medium text-zinc-700 dark:text-zinc-200">{format(new Date(date), "MMM do")}</span></div>
        <div className="flex justify-between"><span className="text-zinc-400">Time</span><span className="font-medium text-zinc-700 dark:text-zinc-200">{start}–{end}</span></div>
        <div className="flex justify-between"><span className="text-zinc-400">Duration</span><span className="font-medium text-zinc-700 dark:text-zinc-200">{dp ? "Full day" : formatDuration(slots.length)}</span></div>
      </div>
      {isMember && chargeInfo && <CreditBar chargeInfo={chargeInfo} />}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/10">
        <p className={`text-lg font-bold ${amount === 0 ? "text-green-600 dark:text-green-400" : "text-zinc-900 dark:text-zinc-100"}`}>
          {amount === 0 ? "Free" : `₹${amount}`}
        </p>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="bg-primary text-white px-4 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <>Confirm & pay <ArrowRight size={12} /></>}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main component ───────────────────────────────────────────────────── */

export default function BookingChat() {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [step, setStep] = useState<Step>("room");
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
  const [faceImage, setFaceImage] = useState<string | null>(null);

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  const addMsg = useCallback((m: any) => {
    setMessages((prev) => [...prev, { ...m, id: Math.random().toString(36).substring(2, 11) }]);
  }, []);

  const botSay = useCallback(async (text: string) => {
    setTyping(true);
    await new Promise((res) => setTimeout(res, 400));
    setTyping(false);
    addMsg({ from: "bot", text });
  }, [addMsg]);

  /* ── Init: load rooms + greet ─────────────────────────────────────── */

  const startConversation = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>("/rooms");
      const roomsData = Array.isArray(data) ? data : [];
      setRooms(roomsData);

      const istHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getHours();
      const greeting = istHour < 12 ? "Good morning" : istHour < 17 ? "Good afternoon" : "Good evening";

      let autoSelected = false;
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("autoSelect") === "meeting") {
          const meetingRoom = roomsData.find(r => r.name.toLowerCase().includes("meeting") || r.name.toLowerCase().includes("conference") || r.name.toLowerCase().includes("huddle"));
          if (meetingRoom) {
            autoSelected = true;
            window.history.replaceState({}, '', '/booking/');
            await botSay(`${greeting}! Which space would you like to book today?`);
            addMsg({ from: "bot-widget", widget: "room" });
            
            setSelectedRoom(meetingRoom);
            addMsg({ from: "user", text: meetingRoom.name });
            setStep("date");
            await botSay("Great choice! Now pick a date:");
            addMsg({ from: "bot-widget", widget: "date" });
          }
        }
      }

      if (!autoSelected) {
        await botSay(`${greeting}! Which space would you like to book today?`);
        addMsg({ from: "bot-widget", widget: "room" });
      }
    } catch (error: any) {
      setRooms([]);
      toast({ title: "Could not load rooms", description: error?.response?.data?.detail || "Please try again.", variant: "destructive" });
    }
  }, [botSay, addMsg, toast]);

  useEffect(() => {
    startConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  /* ── Room ──────────────────────────────────────────────────────────── */

  const handleRoomSelect = async (room: any) => {
    setSelectedRoom(room);
    addMsg({ from: "user", text: room.name });
    setStep("date");
    await botSay("Great choice! Now pick a date:");
    addMsg({ from: "bot-widget", widget: "date" });
  };

  /* ── Date ──────────────────────────────────────────────────────────── */

  const handleDateSelect = async (iso: string, label: string) => {
    setSelectedDate(iso);
    addMsg({ from: "user", text: label });

    if (isDayPassRoom(selectedRoom?.name)) {
      setChosenSlots(TIME_SLOTS);
      setDisabledSlots([]);
      setStep("phone-lookup");
      setInputValue(PHONE_PREFIX);
      await botSay("Day Pass covers the full day (8:00 – 18:30). What's your mobile number?");
      return;
    }

    if (isMonthlyPassRoom(selectedRoom?.name)) {
      setChosenSlots(TIME_SLOTS);
      setDisabledSlots([]);
      setStep("phone-lookup");
      setInputValue(PHONE_PREFIX);
      await botSay("Monthly Pass covers your recurring monthly access. What's your mobile number?");
      return;
    }

    setStep("slots");
    setLoadingAvailability(true);
    await botSay("Select your time slots — tap a start and end slot to set a range:");
    addMsg({ from: "bot-widget", widget: "slots" });

    try {
      const res = await fetchWithApiKey(`${API_BASE}/bookings/availability?room_id=${selectedRoom.id}&date=${iso}`);
      const data = await res.json();
      setDisabledSlots(data.disabled_slots || []);
    } catch {
      toast({ title: "Could not load availability", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoadingAvailability(false);
    }
  };

  /* ── Slots ─────────────────────────────────────────────────────────── */

  const handleSlotsConfirm = async (slots: string[]) => {
    setChosenSlots(slots);
    const sorted = [...slots].sort();
    addMsg({ from: "user", text: `${sorted[0]} – ${addThirtyMinutes(sorted[sorted.length - 1])} (${formatDuration(sorted.length)})` });
    setStep("phone-lookup");
    setInputValue(PHONE_PREFIX);
    await botSay("Almost there! What's your mobile number?");
  };

  /* ── Phone ─────────────────────────────────────────────────────────── */

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
      let hours = chosenSlots.length * 0.5;
      if (isDayPassRoom(selectedRoom?.name)) hours = 10.5;
      if (isMonthlyPassRoom(selectedRoom?.name)) hours = 0;

      const [lookupRes, cRes] = await Promise.all([
        fetchWithApiKey(`${API_BASE}/bookings/customers/lookup?phone=${encodeURIComponent(val)}`),
        fetchWithApiKey(`${API_BASE}/bookings/check-charge?phone=${encodeURIComponent(val)}&requested_hours=${hours}&room_id=${selectedRoom?.id || ''}&date=${selectedDate}`),
      ]);

      const freshCharge: ChargeInfo | null = cRes.ok ? await cRes.json() : null;

      setChargeInfo(freshCharge);

      if (lookupRes.ok) {
        const data = await lookupRes.json();
        setUserName(data.name);
        setUserPhone(data.phone);
        setUserEmail(data.email || "");
        setTyping(false);
        if (data.email) {
          startFaceCapture(chosenSlots, data.phone, data.name, freshCharge, data.email);
        } else {
          setStep("email");
          setInputValue("");
          await botSay(`Welcome back, ${data.name.split(" ")[0]}! We just need your email to finish.`);
        }
      } else {
        setUserPhone(val);
        setTyping(false);
        setStep("name");
        setInputValue("");
        await botSay("Nice to meet you! What's your full name?");
      }
    } catch {
      setTyping(false);
      toast({ title: "Network error", description: "Please check your connection and try again." });
    }
  };

  /* ── Name / Email ──────────────────────────────────────────────────── */

  const handleTextInput = async () => {
    const val = inputValue.trim();
    if (!val) return;
    setInputValue("");
    addMsg({ from: "user", text: val });

    if (step === "name") {
      setUserName(val);
      setStep("email");
      await botSay(`Thanks, ${val.split(" ")[0]}! Lastly, your email address?`);
    } else if (step === "email") {
      if (!val.includes("@") || !val.includes(".")) {
        toast({ title: "Invalid email", description: "Please enter a valid email address." });
        return;
      }
      setUserEmail(val);
      startFaceCapture(chosenSlots, userPhone, userName, chargeInfo, val);
    }
  };

  /* ── Face Capture ──────────────────────────────────────────────────── */

  const startFaceCapture = async (slots: string[], phone: string, name: string, freshCharge: ChargeInfo | null, email: string) => {
    setStep("face-capture");
    await botSay("Awesome! Before we finish, please take a quick photo of your face for access control.");
    addMsg({ from: "bot-widget", widget: "face-capture", meta: { slots, phone, name, freshCharge, email } });
  };

  /* ── Summary ───────────────────────────────────────────────────────── */

  const renderSummary = (slots: string[], phone: string, name: string, freshCharge: ChargeInfo | null, email: string, faceImg: string | null) => {
    setStep("summary");
    setSummaryData({ slots, phone, name, freshCharge, email, faceImage: faceImg });
    addMsg({ from: "bot", text: "Here's your booking summary:" });
    addMsg({ from: "bot-widget", widget: "summary" });
  };

  /* ── Payment / booking ─────────────────────────────────────────────── */

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
              start_time: (isDayPassRoom(selectedRoom?.name) || isMonthlyPassRoom(selectedRoom?.name)) ? "08:00" : chosenSlots[0],
              end_time: (isDayPassRoom(selectedRoom?.name) || isMonthlyPassRoom(selectedRoom?.name)) ? "18:30" : addThirtyMinutes(chosenSlots[chosenSlots.length - 1]),
              face_image_base64: summaryData?.faceImage,
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
          face_image_base64: summaryData?.faceImage,
        }),
      });
      if (res.ok) {
        saveBookingHistory({ roomName: selectedRoom?.name || "Room", date: selectedDate, slots: chosenSlots });
        setShowPayment(false);
        setStep("done");
        await botSay("You're all set! Booking confirmed 🎉");
      } else throw new Error();
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

  /* ── Reset ─────────────────────────────────────────────────────────── */

  const resetAll = () => {
    setMessages([]); setStep("room"); setSelectedRoom(null); setSelectedDate("");
    setChosenSlots([]); setDisabledSlots([]); setInputValue(""); setUserName("");
    setUserPhone(""); setUserEmail(""); setChargeInfo(null); setSummaryData(null);
    setPaymentIntent(null); setShowPayment(false);
    startConversation();
  };

  /* ── Render ────────────────────────────────────────────────────────── */

  const isTextStep = step === "phone-lookup" || step === "name" || step === "email";
  const composerDisabled = !isTextStep;
  const composerPlaceholder =
    step === "phone-lookup" ? "+91 98765 43210" : step === "name" ? "Your full name…" : step === "email" ? "you@email.com" : "Choose an option above…";
  const isDP = isDayPassRoom(selectedRoom?.name);

  const fallbackAmount = () => {
    if (isDP) return 299;
    if (isMonthlyPassRoom(selectedRoom?.name)) return 5999;
    const hours = chosenSlots.length * 0.5;
    const isMeeting = selectedRoom?.name?.toLowerCase().includes("meeting") || selectedRoom?.name?.toLowerCase().includes("conference") || selectedRoom?.name?.toLowerCase().includes("huddle");
    let discount = 1.0;
    if (isMeeting) {
      const isSaturday = new Date(selectedDate).getDay() === 6;
      if (isSaturday || (hours >= 4 && hours <= 8)) discount = 0.8;
    }
    return Math.round(chosenSlots.length * 150 * discount);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      <Navbar />
      <div className="mt-16 w-full z-40 shrink-0">
        <PromoBanner />
      </div>
      <div className="flex flex-1 min-h-0">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} onNewBooking={resetAll} />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-12 shrink-0 flex items-center gap-2 px-4 border-b border-zinc-100 dark:border-white/5">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                <PanelLeftOpen size={17} />
              </button>
            )}
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Booking Assistant</span>
            <span className="hidden sm:inline text-[10px] font-semibold text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">The Living Desk</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-400" title="Online" />
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
              <AnimatePresence mode="popLayout">
                {messages.map((m) => {
                  if (m.from === "user") return <UserMessage key={m.id} text={m.text} />;
                  if (m.from === "bot") return <AssistantMessage key={m.id} text={m.text} />;
                  if (m.from === "bot-widget") {
                    return (
                      <div key={m.id} className="pl-[42px]">
                        {m.widget === "room" && <RoomPicker rooms={rooms} selectedRoomId={selectedRoom?.id} onSelect={handleRoomSelect} />}
                        {m.widget === "date" && <DatePicker onSelect={handleDateSelect} />}
                        {m.widget === "slots" && (
                          <SlotPicker disabledSlots={disabledSlots} loading={loadingAvailability} onConfirm={handleSlotsConfirm} />
                        )}
                        {m.widget === "face-capture" && step === "face-capture" && m.meta && (
                          <div className="max-w-sm border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-2xl p-4">
                            <div className="flex flex-col items-center gap-3">
                              <Webcam
                                audio={false}
                                screenshotFormat="image/jpeg"
                                width={320}
                                height={240}
                                videoConstraints={{ facingMode: "user" }}
                                className="rounded-xl border border-zinc-200 dark:border-white/10"
                                ref={webcamRef}
                              />
                              <button
                                onClick={() => {
                                  const imageSrc = webcamRef.current?.getScreenshot();
                                  if (imageSrc) {
                                    setFaceImage(imageSrc);
                                    addMsg({ from: "user", text: "Captured face image." });
                                    renderSummary(m.meta.slots, m.meta.phone, m.meta.name, m.meta.freshCharge, m.meta.email, imageSrc);
                                  }
                                }}
                                className="mt-2 w-full py-2 bg-primary text-primary-foreground rounded-xl font-medium"
                              >
                                Capture Photo
                              </button>
                            </div>
                          </div>
                        )}
                        {m.widget === "summary" && summaryData && (
                          <SummaryCardInline
                            roomName={selectedRoom?.name ?? ""}
                            date={selectedDate}
                            slots={summaryData.slots}
                            chargeInfo={summaryData.freshCharge}
                            amount={summaryData.freshCharge?.amount ?? fallbackAmount()}
                            busy={isSubmitting || loadingPayment}
                            onConfirm={() =>
                              initiateBookingFlow(
                                summaryData.phone,
                                summaryData.name,
                                summaryData.freshCharge?.amount ?? fallbackAmount(),
                                summaryData.email
                              )
                            }
                          />
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </AnimatePresence>

              {typing && <TypingDots />}

              {step === "done" && (
                <div className="pl-[42px]">
                  <div className="max-w-sm border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 rounded-2xl p-5 flex items-center gap-3">
                    <CheckCircle2 size={28} className="text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-green-800 dark:text-green-300">Booking confirmed</p>
                      <p className="text-xs text-green-600 dark:text-green-400">See you at The Living Desk.</p>
                    </div>
                  </div>
                  <button onClick={resetAll} className="mt-3 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1">
                    <Plus size={12} /> Start another booking
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 px-4 pb-5 pt-2">
            <div className="max-w-2xl mx-auto w-full">
              <div className={`flex items-center gap-2 rounded-full border transition-colors px-2 py-2 ${composerDisabled ? "border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900" : "border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm focus-within:border-primary"
                }`}>
                <div className="pl-2.5 text-zinc-400">
                  {step === "phone-lookup" ? <Hash size={16} /> : step === "email" ? <AtSign size={16} /> : <Sparkles size={16} />}
                </div>
                <input
                  ref={inputRef}
                  value={composerDisabled ? "" : inputValue}
                  disabled={composerDisabled}
                  onChange={(e) => step === "phone-lookup" ? handlePhoneInput(e.target.value) : setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") step === "phone-lookup" ? submitPhone() : handleTextInput(); }}
                  placeholder={composerPlaceholder}
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 disabled:cursor-not-allowed py-1.5"
                />
                <button
                  onClick={() => step === "phone-lookup" ? submitPhone() : handleTextInput()}
                  disabled={composerDisabled || !inputValue.trim()}
                  className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-25 transition-opacity shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          totalCharge: chargeInfo?.amount ?? fallbackAmount(),
        }}
        copied={copied}
        onCopyUpiId={handleCopyUpi}
        onConfirmBooking={() => submitFinalBooking(userPhone, userName)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}