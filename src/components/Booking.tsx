import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Calendar as CalendarIcon,
  IndianRupee,
  User,
  UserCheck,
  CheckCircle2,
  QrCode,
  Loader2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE = "http://localhost:8000";

const bookingSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?\d{10,15}$/, "Enter a valid phone number"),
  room_id: z.string().min(1, "Please select a room"),
  date: z.date({ required_error: "Please select a date" }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

type Room = { id: number; name: string };

type AvailabilityResponse = {
  bookings: { id: number; start_time: string; end_time: string }[];
  disabled_slots: string[];
};

type ChargeInfo = {
  is_existing_customer: boolean;
  charge: number;
  currency: string;
};

type PendingBooking = {
  email: string;
  phone: string;
  room_id: number;
  date: string;
  start_time: string;
  end_time: string;
  totalCharge: number;
};

type PaymentIntent = {
  payment_id: number;
  amount: number;
  currency: string;
  upi_id: string;
  upi_name: string;
  qr_code_data_url: string;
  status: string;
};

function isContiguous(selected: string[]): boolean {
  if (selected.length <= 1) return true;
  const indexes = selected.map((slot) => TIME_SLOTS.indexOf(slot)).sort((a, b) => a - b);
  for (let i = 1; i < indexes.length; i++) {
    if (indexes[i] !== indexes[i - 1] + 1) return false;
  }
  return true;
}

export default function Booking() {
  const { toast } = useToast();
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [chargeInfo, setChargeInfo] = useState<ChargeInfo | null>(null);
  const [checkingCharge, setCheckingCharge] = useState(false);

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/rooms`);
        if (!res.ok) throw new Error("Failed to load rooms");
        const data: Room[] = await res.json();
        if (mounted) setRooms(data);
      } catch (err: any) {
        toast({ title: "Error", description: err?.message || "Failed to load rooms", variant: "destructive" });
      }
    })();
    return () => { mounted = false; };
  }, [toast]);

  const selectedRoomId = useMemo(() => (watchedRoomId ? parseInt(watchedRoomId, 10) : undefined), [watchedRoomId]);
  const selectedDateStr = useMemo(() => (watchedDate ? format(watchedDate as Date, "yyyy-MM-dd") : undefined), [watchedDate]);

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
          const url = new URL(`${API_BASE}/api/bookings/check-charge`);
          url.searchParams.set("email", watchedEmail);
          const res = await fetch(url.toString());
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

  useEffect(() => {
    let cancelled = false;

    const fetchAvailability = async () => {
      if (!selectedRoomId || !selectedDateStr) {
        setDisabledSlots([]);
        return;
      }
      setLoadingAvailability(true);
      try {
        const url = new URL(`${API_BASE}/api/bookings/availability`);
        url.searchParams.set("room_id", String(selectedRoomId));
        url.searchParams.set("date", selectedDateStr);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to load availability");
        const data: AvailabilityResponse = await res.json();
        if (cancelled) return;
        setDisabledSlots(data.disabled_slots || []);
        setSelectedTimeSlots((prev) => prev.filter((s) => !data.disabled_slots.includes(s)));
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

  const toggleTimeSlot = (slot: string) => {
    if (disabledSlots.includes(slot) || loadingAvailability) return;
    setSelectedTimeSlots((prev) => {
      const next = prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot];
      return next.sort((a, b) => TIME_SLOTS.indexOf(a) - TIME_SLOTS.indexOf(b));
    });
  };

  const calculateTotalCharge = () => {
    if (!chargeInfo || selectedTimeSlots.length === 0) return null;
    const durationHours = selectedTimeSlots.length * 0.5;
    const totalCharge = chargeInfo.charge; // flat charge
    return { durationHours, totalCharge };
  };

  const createBookingInDatabase = async (bookingData: PendingBooking) => {
    const response = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        message = errorData?.message || errorData?.detail?.message || message;
      } catch {}
      throw new Error(message);
    }

    return await response.json();
  };

  const createPaymentIntent = async (bookingData: PendingBooking) => {
    setLoadingPayment(true);
    try {
      const response = await fetch(`${API_BASE}/api/payments/create-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  };

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
    const end_time = selectedTimeSlots[selectedTimeSlots.length - 1];
    const chargeCalc = calculateTotalCharge();

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

    if (chargeInfo.is_existing_customer || chargeCalc.totalCharge === 0) {
      setIsSubmitting(true);
      try {
        const booking = await createBookingInDatabase(bookingData);
        toast({
          title: "Booking Successful!",
          description: `Booking ID: ${booking.id} - Free booking! Check your email for confirmation.`,
        });
        resetForm();
      } catch (error: any) {
        console.error("Booking error:", error);
        toast({ title: "Error", description: error?.message || "Failed to create booking. Please try again.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    } else {
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

  // Updated: mark payment intent completed before creating booking (new customer paid)
  const confirmBookingAfterPayment = async () => {
    if (!pendingBooking) return;
    setIsSubmitting(true);
    try {
      if (paymentIntent && pendingBooking.totalCharge > 0) {
        const res = await fetch(`${API_BASE}/api/payments/${paymentIntent.payment_id}/complete`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          let msg = "Failed to mark payment as completed";
          try {
            const err = await res.json();
            msg = err?.message || msg;
          } catch {}
          throw new Error(msg);
        }
      }

      const booking = await createBookingInDatabase(pendingBooking);
      toast({
        title: "Booking Confirmed!",
        description: `Booking ID: ${booking.id}. You'll receive an email shortly.`,
      });
      setShowPaymentDialog(false);
      resetForm();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Could not confirm booking",
        description: error?.message || "Please try again or contact support.",
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

    if (selectedRoomId && selectedDateStr) {
      (async () => {
        try {
          const url = new URL(`${API_BASE}/api/bookings/availability`);
          url.searchParams.set("room_id", String(selectedRoomId));
          url.searchParams.set("date", selectedDateStr);
          const res = await fetch(url.toString());
          if (res.ok) {
            const data: AvailabilityResponse = await res.json();
            setDisabledSlots(data.disabled_slots || []);
          }
        } catch {}
      })();
    }
  };

  const chargeCalc = useMemo(() => calculateTotalCharge(), [chargeInfo, selectedTimeSlots]);

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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} className="transition-none" />
                      </FormControl>
                      <FormMessage />
                      {checkingCharge && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Checking customer status...
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 1234567890" {...field} className="transition-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="room_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Room</FormLabel>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v);
                          setSelectedTimeSlots([]);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="transition-none">
                            <SelectValue placeholder={rooms.length ? "Choose a room" : "Loading rooms..."} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={String(room.id)}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Select Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn("w-full pl-3 text-left font-normal transition-none", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(d) => { field.onChange(d); setSelectedTimeSlots([]); }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Select Time Slots (30-minute intervals)</Label>
                    {loadingAvailability && (
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isDisabled = disabledSlots.includes(slot);
                      const isSelected = selectedTimeSlots.includes(slot);
                      return (
                        <Button
                          key={slot}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => toggleTimeSlot(slot)}
                          className={cn(
                            "text-sm transition-none",
                            isSelected && "shadow-elegant",
                            isDisabled && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={isDisabled || loadingAvailability}
                          title={isDisabled ? "Already booked" : undefined}
                        >
                          {slot}
                        </Button>
                      );
                    })}
                  </div>

                  {selectedTimeSlots.length > 0 && (
                    <div className="bg-accent/10 rounded-lg p-3 border border-accent/20 animate-fade-in">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        Selected: {selectedTimeSlots[0]} - {selectedTimeSlots[selectedTimeSlots.length - 1]}
                      </p>
                    </div>
                  )}

                  {!isContiguous(selectedTimeSlots) && selectedTimeSlots.length > 0 && (
                    <Alert variant="destructive" className="animate-fade-in">
                      <AlertDescription>Selection must be contiguous (no gaps between slots)</AlertDescription>
                    </Alert>
                  )}
                </div>

                {chargeInfo && selectedTimeSlots.length > 0 && chargeCalc && (
                  <div className="border-2 rounded-2xl p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-soft animate-fade-in">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      {chargeInfo.is_existing_customer ? (
                        <>
                          <UserCheck className="h-5 w-5 text-success" />
                          <span>Welcome Back - Existing Customer</span>
                        </>
                      ) : (
                        <>
                          <User className="h-5 w-5 text-primary" />
                          <span>New Customer</span>
                        </>
                      )}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Duration:</span>
                        <span className="font-semibold">
                          {chargeCalc.durationHours} hour{chargeCalc.durationHours !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Flat charge:</span>
                        <span className="font-semibold">
                          {(chargeInfo.is_existing_customer || chargeInfo.charge === 0) ? (
                            <span className="text-success flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              FREE
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4" />
                              {chargeInfo.charge}
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="bg-card rounded-lg p-4 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total Charge:</span>
                          <span className="flex items-center gap-1">
                            {(chargeInfo.is_existing_customer || chargeCalc.totalCharge === 0) ? (
                              <span className="text-success text-3xl font-bold">FREE</span>
                            ) : (
                              <>
                                <IndianRupee className="h-6 w-6" />
                                <span className="text-3xl font-bold price-total">
                                  {chargeCalc.totalCharge}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary transition-none shadow-elegant"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (chargeInfo?.is_existing_customer || (chargeCalc?.totalCharge ?? 0) === 0) ? (
                    "Confirm Booking (Free)"
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <QrCode className="h-6 w-6 text-primary" />
              Complete Payment via UPI
            </DialogTitle>
            <DialogDescription>
              Scan the QR code or pay using UPI ID. After paying, click Confirm booking to finalize.
            </DialogDescription>
          </DialogHeader>

          {loadingPayment ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                <QrCode className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">Generating payment QR code...</p>
            </div>
          ) : paymentIntent ? (
            <div className="space-y-5 py-2">
              <div className="bg-gradient-primary rounded-xl p-6 text-center shadow-elegant animate-scale-in">
                <p className="text-sm text-primary-foreground/80 mb-2">Amount to Pay</p>
                <p className="text-4xl md:text-5xl font-bold text-primary-foreground flex items-center justify-center gap-2">
                  <IndianRupee className="h-7 w-7 md:h-8 md:w-8" />
                  {pendingBooking?.totalCharge}
                </p>
              </div>

              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs ml-1 text-amber-800">
                  Important: In-app payment verification is disabled. Please complete payment and then confirm your booking.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col items-center space-y-4 animate-fade-in">
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-elegant border-2 border-primary/20">
                  <img
                    src={paymentIntent.qr_code_data_url}
                    alt="UPI Payment QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">Scan with any UPI app</p>
                  <p className="text-xs text-muted-foreground">GPay • PhonePe • Paytm • Other UPI apps</p>
                </div>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 py-1 text-muted-foreground rounded-full border border-border">
                    Or pay manually using UPI ID
                  </span>
                </div>
              </div>

              <div className="space-y-3 animate-fade-in">
                <Label className="text-sm font-semibold">UPI ID</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={paymentIntent.upi_id}
                      readOnly
                      className="font-mono text-sm p-2 transition-none"
                    />
                  </div>
                  <Button type="button" onClick={handleCopyUpiId} className="transition-none">
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="transition-none">
                    Cancel
                  </Button>
                  <Button onClick={confirmBookingAfterPayment} disabled={isSubmitting} className="transition-none">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      "Confirm booking"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
