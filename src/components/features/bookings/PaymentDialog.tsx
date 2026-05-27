"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, User, CalendarDays, ShieldCheck, ArrowRight, Zap, Check, Smartphone, QrCode } from "lucide-react";
import { PaymentIntent, PendingBooking } from "./booking.types";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadingPayment: boolean;
  paymentIntent: PaymentIntent | null;
  pendingBooking: PendingBooking | null;
  copied: boolean;
  onCopyUpiId: () => void;
  onConfirmBooking: () => void;
  isSubmitting: boolean;
}

export function PaymentDialog({ open, onOpenChange, loadingPayment, paymentIntent, pendingBooking, copied, onCopyUpiId, onConfirmBooking, isSubmitting }: PaymentDialogProps) {
  const [showQR, setShowQR] = useState(false);

  const upiUrl = paymentIntent
    ? `upi://pay?pa=${paymentIntent.upi_id}&pn=Library%20Booking&am=${paymentIntent.amount}&cu=INR&tn=Booking%20for%20${pendingBooking?.name || 'User'}`
    : "#";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-[2rem] sm:rounded-[3rem] w-[95vw] max-w-lg border-none shadow-2xl bg-white">

        {/* Top Branding Section */}
        <div className="bg-zinc-950 p-8 pt-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#3b82f644_0%,transparent_70%)] pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-2">
              <ShieldCheck size={12} />
              Secure Checkout
            </div>
            <h2 className="text-white text-3xl font-black tracking-tight">
              ₹{paymentIntent?.amount}
            </h2>
            <p className="text-zinc-400 text-xs font-medium tracking-wide">
              Complete payment to secure your seat
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
          {loadingPayment ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 relative" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Initialising Security...</p>
            </div>
          ) : (
            <>
              {/* Main Action Area */}
              <div className="space-y-4">
                {/* 1. THE BIG BUTTON (Deep Link) */}
                <a
                  href={upiUrl}
                  className="group relative flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white h-16 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  <Zap size={20} className="fill-white group-hover:animate-pulse" />
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase opacity-80 leading-none">Pay via</p>
                    <p className="text-sm font-black uppercase tracking-widest">Any UPI App</p>
                  </div>
                  <ArrowRight size={18} className="absolute right-6 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </a>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-zinc-100"></div>
                  <span className="flex-none px-4 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Or choose another way</span>
                  <div className="flex-grow border-t border-zinc-100"></div>
                </div>

                {/* 2. THE ALTERNATIVES TABLET */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className={cn(
                      "flex items-center justify-center gap-2 h-12 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all",
                      showQR ? "bg-zinc-950 border-zinc-950 text-white" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    <QrCode size={14} />
                    {showQR ? "Hide QR" : "Show QR"}
                  </button>

                  <button
                    onClick={onCopyUpiId}
                    className={cn(
                      "flex items-center justify-center gap-2 h-12 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all",
                      copied ? "bg-green-50 border-green-200 text-green-600" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied ID" : "Copy ID"}
                  </button>
                </div>

                {/* QR Display Area (Collapsible) */}
                {showQR && paymentIntent && (
                  <div className="pt-4 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100 mb-2">
                      <img
                        src={paymentIntent.qr_code}
                        alt="UPI QR"
                        className="w-40 h-40 mix-blend-multiply"
                      />
                    </div>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Scan with GPay, PhonePe, or Paytm</p>
                  </div>
                )}
              </div>

              {/* Booking Context Card */}
              <div className="bg-zinc-50 rounded-2xl p-5 flex items-center justify-between border border-zinc-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-zinc-100">
                    <User size={18} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900 leading-tight">{pendingBooking?.name}</p>
                    <p className="text-[10px] font-medium text-zinc-500 italic">{pendingBooking?.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Status</p>
                  <p className="text-[10px] font-bold text-blue-600">Waiting for Pay</p>
                </div>
              </div>

              {/* Verify Step */}
              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <p className="text-[10px] text-center font-medium text-zinc-400 px-6">
                  After completing the payment in your app, click below to verify and finalize your booking.
                </p>
                <Button
                  onClick={onConfirmBooking}
                  disabled={isSubmitting}
                  className="w-full h-14 bg-zinc-950 hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    "Verify & Confirm"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}