// pages/Booking.tsx
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE, fetchWithApiKey } from "@/lib/api";

import { BookingForm } from "@/components/features/bookings/BookingForm"
import { SummaryCard } from "@/components/features/bookings/SummaryCard";
import { TimeSlotGrid } from "@/components/features/bookings/TimeSlotGrid";
import { PaymentDialog } from "@/components/features/bookings/PaymentDialog";

import {
  bookingSchema,
  type BookingFormData,
  type ChargeInfo,
  type PaymentIntent,
  type PendingBooking,
  type AvailabilityResponse,
  type BookingResponse,
  TIME_SLOTS,
  isContiguous,
} from "@/components/features/bookings/booking.types";

// Helper function to add 30 minutes to a time slot
function addThirtyMinutes(timeSlot: string): string {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  date.setMinutes(date.getMinutes() + 30);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function Booking() {
  const { toast } = useToast();

  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [chargeInfo, setChargeInfo] = useState<ChargeInfo | null>(null);
  const [checkingCharge, setCheckingCharge] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      email: "",
      phone: "+91",
      room_id: "",
      date: undefined as unknown as Date,
    },
  });

  const watchedRoomId = useWatch({ control: form.control, name: "room_id" });
  const watchedDate = useWatch({ control: form.control, name: "date" });
  const watchedEmail = useWatch({ control: form.control, name: "email" });

  const selectedRoomId = useMemo(() => (watchedRoomId ? parseInt(watchedRoomId, 10) : undefined), [watchedRoomId]);
  const selectedDateStr = useMemo(() => (watchedDate ? format(watchedDate as Date, "yyyy-MM-dd") : undefined), [watchedDate]);

  // Load rooms on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchWithApiKey(`${API_BASE}/rooms`);
        if (!res.ok) throw new Error("Failed to load rooms");
        const data = await res.json();
        if (mounted) setRooms(data);
      } catch (err: any) {
        toast({ title: "Error", description: err?.message || "Failed to load rooms", variant: "destructive" });
      }
    })();
    return () => { mounted = false; };
  }, [toast]);

  // Check charge info when email changes
  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    const checkCharge = async () => {
      const emailValid = watchedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedEmail);
      if (!emailValid) {
        setChargeInfo(null);
        return;
      }
      timeoutId = setTimeout(async () => {
        setCheckingCharge(true);
        try {
          const url = new URL(`${API_BASE}/bookings/check-charge`);
          url.searchParams.set("email", watchedEmail);
          const res = await fetchWithApiKey(url.toString());
          if (!res.ok) throw new Error("Failed to check charge");
          const data: ChargeInfo = await res.json();
          if (!cancelled) setChargeInfo(data);
        } catch (err: any) {
          if (!cancelled) {
            console.error("Charge check error:", err);
            setChargeInfo(null);
          }
        } finally {
          if (!cancelled) setCheckingCharge(false);
        }
      }, 500);
    };

    checkCharge();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [watchedEmail]);

  // Fetch availability when room or date changes
  useEffect(() => {
    let cancelled = false;

    const fetchAvailability = async () => {
      if (!selectedRoomId || !selectedDateStr) {
        setDisabledSlots([]);
        setSelectedTimeSlots([]);
        return;
      }

      setSelectedTimeSlots([]);
      setLoadingAvailability(true);

      try {
        const url = new URL(`${API_BASE}/bookings/availability`);
        url.searchParams.set("room_id", String(selectedRoomId));
        url.searchParams.set("date", selectedDateStr);
        const res = await fetchWithApiKey(url.toString());
        if (!res.ok) throw new Error("Failed to load availability");
        const data: AvailabilityResponse = await res.json();
        if (cancelled) return;
        setDisabledSlots(data.disabled_slots || []);
      } catch (err: any) {
        if (!cancelled) {
          toast({ title: "Error", description: err?.message || "Failed to load availability", variant: "destructive" });
          setDisabledSlots([]);
        }
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    };

    fetchAvailability();
    return () => { cancelled = true; };
  }, [selectedRoomId, selectedDateStr, toast]);

  // Calculate total charge based on selected slots and charge info
  const calculateTotalCharge = () => {
    if (selectedTimeSlots.length === 0) return null;

    const durationHours = selectedTimeSlots.length * 0.5;

    // If no charge info yet (email not entered), returns valid duration but 0 price
    if (!chargeInfo) {
      return {
        durationHours,
        totalCharge: 0,
        breakdown: undefined
      };
    }

    let totalCharge = 0;
    let freeHours = 0;
    let billableHours = 0;

    if (chargeInfo.is_existing_customer) {
      const FREE_LIMIT = 10;
      const PAID_RATE = 300;
      const usedHours = chargeInfo.monthly_hours;

      // Calculate how many free hours remain BEFORE this booking
      const remainingFree = Math.max(0, FREE_LIMIT - usedHours);

      // Determine how much of THIS booking is free vs paid
      freeHours = Math.min(durationHours, remainingFree);
      billableHours = Math.max(0, durationHours - freeHours);

      totalCharge = Math.round(billableHours * PAID_RATE);

      return {
        durationHours,
        totalCharge,
        breakdown: { freeHours, billableHours }
      };
    } else {
      // New Customer: Simple rate multiplication
      totalCharge = Math.round(durationHours * chargeInfo.charge_per_hour);
      return {
        durationHours,
        totalCharge,
        breakdown: { freeHours: 0, billableHours: durationHours }
      };
    }
  };

  const chargeCalc = useMemo(() => calculateTotalCharge(), [chargeInfo, selectedTimeSlots]);

  const onSubmit = async (data: BookingFormData) => {
    if (selectedTimeSlots.length === 0) {
      toast({ title: "Error", description: "Please select at least one time slot", variant: "destructive" });
      return;
    }
    if (!isContiguous(selectedTimeSlots)) {
      toast({ title: "Error", description: "Please select contiguous time slots (no gaps).", variant: "destructive" });
      return;
    }
    if (selectedTimeSlots.some((s) => disabledSlots.includes(s))) {
      toast({ title: "Error", description: "Your selection overlaps an existing booking.", variant: "destructive" });
      return;
    }

    const start_time = selectedTimeSlots[0];
    const lastSlot = selectedTimeSlots[selectedTimeSlots.length - 1];
    const end_time = addThirtyMinutes(lastSlot);

    if (!chargeInfo || !chargeCalc) return;

    const bookingData: PendingBooking = {
      email: data.email,
      phone: data.phone,
      room_id: parseInt(data.room_id, 10),
      date: format(data.date, "yyyy-MM-dd"),
      start_time,
      end_time,
      totalCharge: chargeCalc.totalCharge,
    };

    // Free booking logic
    if (chargeCalc.totalCharge === 0) {
      setIsSubmitting(true);
      try {
        const booking = await createBookingInDatabase(bookingData);

        let toastMessage = `Booking ID: ${booking.id} - Free booking! Check WhatsApp for confirmation`;
        if (booking.zoho_sync?.success) {
          toastMessage += " (CRM synced ✓)";
        } else if (booking.zoho_sync?.error) {
          console.warn("Zoho sync warning:", booking.zoho_sync.error);
        }

        toast({
          title: "Booking Successful! 🎉",
          description: toastMessage,
        });
        resetForm();
      } catch (error: any) {
        console.error("Booking error:", error);
        toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Paid booking - show payment dialog
      setPendingBooking(bookingData);
      setShowPaymentDialog(true);
      await createPaymentIntent(bookingData);
    }
  };

  const handleCopyUpiId = () => {
    if (!paymentIntent) return;
    navigator.clipboard.writeText(paymentIntent.upi_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "UPI ID copied to clipboard" });
  };

  const confirmBookingAfterPayment = async () => {
    if (!pendingBooking) return;
    setIsSubmitting(true);
    try {
      // 1. Mark payment complete (Best effort)
      if (paymentIntent && pendingBooking.totalCharge > 0) {
        try {
          await fetchWithApiKey(`${API_BASE}/payments/${paymentIntent.payment_id}/complete`, {
            method: "PATCH",
          });
        } catch (e) {
          console.warn("Could not mark payment as complete in DB, proceeding to booking anyway.", e);
        }
      }

      // 2. Create the booking
      const booking = await createBookingInDatabase(pendingBooking);

      let toastMessage = `Booking ID: ${booking.id}. Confirmation sent to WhatsApp.`;
      if (booking.zoho_sync?.success) {
        toastMessage += " (CRM synced ✓)";
      }

      toast({
        title: "Booking Confirmed! 🎉",
        description: toastMessage,
      });
      setShowPaymentDialog(false);
      resetForm();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Could not finalize booking. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectedTimeSlots([]);
    setChargeInfo(null);
    setPendingBooking(null);
    setPaymentIntent(null);
    setDisabledSlots([]);

    // Refresh availability if room/date still selected (though form reset clears them)
    if (selectedRoomId && selectedDateStr) {
      // Logic to refresh if needed
    }
  };

  async function createPaymentIntent(bookingData: PendingBooking) {
    setLoadingPayment(true);
    try {
      const response = await fetchWithApiKey(`${API_BASE}/payments/create-intent`, {
        method: "POST",
        body: JSON.stringify({
          email: bookingData.email,
          amount: Math.round(bookingData.totalCharge),
          booking_data: {
            phone: bookingData.phone,
            room_id: bookingData.room_id,
            date: bookingData.date,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data: PaymentIntent = await response.json();
      setPaymentIntent(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to generate payment QR code",
        variant: "destructive",
      });
      setShowPaymentDialog(false);
    } finally {
      setLoadingPayment(false);
    }
  }

  // ✅ UPDATED: Robust Error Handling for FastAPI
  async function createBookingInDatabase(bookingData: PendingBooking): Promise<BookingResponse> {
    const response = await fetchWithApiKey(`${API_BASE}/bookings`, {
      method: "POST",
      body: JSON.stringify({
        email: bookingData.email,
        phone: bookingData.phone,
        room_id: bookingData.room_id,
        date: bookingData.date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
      }),
    });

    if (!response.ok) {
      let message = "Failed to create booking";
      try {
        const errorData = await response.json();

        // FastAPI Error Handling Logic
        if (typeof errorData.detail === 'string') {
          // Standard HTTP Exception (e.g. 409 Conflict, 500 Server Error)
          message = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Validation Error (422) - Extract first error message
          const firstError = errorData.detail[0];
          message = firstError?.msg || "Invalid booking data";
          if (firstError?.loc) {
            message += ` (${firstError.loc.join('.')})`;
          }
        } else if (errorData.message) {
          // Fallback for other frameworks
          message = errorData.message;
        }
      } catch (e) {
        console.error("Could not parse error response", e);
      }
      throw new Error(message);
    }

    return await response.json();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book a Conference Room</h1>
            <p className="text-lg text-muted-foreground">Reserve your space for meetings and collaboration</p>
          </div>

          <div className="bg-card rounded-2xl shadow-soft border border-border p-6 md:p-8 animate-scale-in">
            <Form {...form}>
              <BookingForm
                form={form}
                rooms={rooms}
                checkingCharge={checkingCharge}
                setSelectedTimeSlots={setSelectedTimeSlots}
                selectedTimeSlots={selectedTimeSlots}
                disabledSlots={disabledSlots}
                loadingAvailability={loadingAvailability}
              />

              <TimeSlotGrid
                timeSlots={TIME_SLOTS}
                disabledSlots={disabledSlots}
                selectedTimeSlots={selectedTimeSlots}
                loadingAvailability={loadingAvailability}
                onToggle={(slot) => {
                  if (disabledSlots.includes(slot) || loadingAvailability) return;
                  setSelectedTimeSlots((prev) => {
                    const next = prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot];
                    return next.sort((a, b) => TIME_SLOTS.indexOf(a) - TIME_SLOTS.indexOf(b));
                  });
                }}
              />

              <SummaryCard chargeInfo={chargeInfo} chargeCalc={chargeCalc} selectedTimeSlots={selectedTimeSlots} />

              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        loadingPayment={loadingPayment}
        paymentIntent={paymentIntent}
        pendingBooking={pendingBooking}
        copied={copied}
        onCopyUpiId={handleCopyUpiId}
        onConfirmBooking={confirmBookingAfterPayment}
        isSubmitting={isSubmitting}
      />

      <Footer />
    </div>
  );
}