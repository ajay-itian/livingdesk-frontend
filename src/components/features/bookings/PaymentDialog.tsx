"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, CheckCircle2, ExternalLink, Smartphone, User, CalendarDays, Clock } from "lucide-react";
import { PaymentIntent, PendingBooking } from "./booking.types";
import { useState } from "react";

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
  const [imageLoaded, setImageLoaded] = useState(false);

  // 1. Construct the UPI URL
  // pa: Payee VPA, pn: Payee Name, am: Amount, cu: Currency, tn: Transaction Note
  const upiUrl = paymentIntent
    ? `upi://pay?pa=${paymentIntent.upi_id}&pn=Library%20Booking&am=${paymentIntent.amount}&cu=INR&tn=Booking%20for%20${pendingBooking?.name || 'User'}`
    : "#";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg max-h-[92dvh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <DialogTitle className="text-lg font-black uppercase tracking-tight">Complete Payment</DialogTitle>
          <DialogDescription className="text-sm">Scan QR or pay via UPI ID to confirm booking.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loadingPayment ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Generating QR…</p>
            </div>
          ) : paymentIntent && (
            <div className="p-5 space-y-5">
              {/* Amount Display */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-zinc-500 mb-1">Amount Due</p>
                <p className="text-4xl font-black text-primary">₹{paymentIntent.amount}</p>
              </div>

              {/* Mobile Redirect Button (Visible mostly on mobile) */}
              <div className="block sm:hidden">
                <Button
                  asChild
                  className="w-full bg-[#111] hover:bg-black text-white h-12 rounded-xl flex items-center justify-center gap-2 font-bold"
                >
                  <a href={upiUrl}>
                    <Smartphone size={18} />
                    Pay via Any UPI App
                  </a>
                </Button>
                <p className="text-[10px] text-center mt-2 text-zinc-500 font-medium">GPay, PhonePe, Paytm, etc.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* QR Code Section */}
                <div className="space-y-3">
                  <p className="text-sm font-bold flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                    Scan QR
                  </p>
                  <div className="bg-white border rounded-2xl p-3 flex justify-center min-h-[160px] relative">
                    {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-zinc-300" /></div>}
                    <img
                      src={paymentIntent.qr_code}
                      alt="UPI QR"
                      className={`w-full max-w-[160px] aspect-square object-contain transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                      onLoad={() => setImageLoaded(true)}
                    />
                  </div>
                </div>

                {/* UPI ID Section */}
                <div className="space-y-3">
                  <p className="text-sm font-bold flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                    UPI ID
                  </p>
                  <div className="flex items-center gap-2 bg-muted rounded-xl p-3 border">
                    <code className="flex-1 text-[11px] font-mono font-bold break-all">{paymentIntent.upi_id}</code>
                    <button onClick={onCopyUpiId} className="p-2 bg-white rounded-lg border shadow-sm shrink-0">
                      {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Web-only link helper */}
                  <div className="hidden sm:block">
                    <a
                      href={upiUrl}
                      className="text-[11px] flex items-center gap-1 font-bold text-primary hover:underline underline-offset-2"
                    >
                      <ExternalLink size={12} /> Launch UPI App
                    </a>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-700 space-y-1 font-medium">
                    <p className="font-bold uppercase mb-1 text-[9px]">Quick Steps:</p>
                    <p>• Open GPay/PhonePe</p>
                    <p>• Scan QR or enter UPI ID</p>
                    <p>• Pay ₹{paymentIntent.amount} & click Confirm</p>
                  </div>
                </div>
              </div>

              {pendingBooking && (
                <div className="border rounded-xl p-4 space-y-2 bg-muted/30">
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Booking Details</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <div className="flex items-center gap-1.5"><User size={12} /> {pendingBooking.name}</div>
                    <div className="flex items-center gap-1.5"><CalendarDays size={12} /> {pendingBooking.date}</div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Clock size={12} />
                      {pendingBooking.totalCharge === 299 ? "Full Day (8 AM - 6:30 PM)" : `${pendingBooking.start_time} - ${pendingBooking.end_time}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t bg-white">
          <Button onClick={onConfirmBooking} disabled={isSubmitting} className="w-full h-12 font-black uppercase text-sm">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming…</> : "I've Paid — Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}