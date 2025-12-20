// components/features/bookings/booking.types.ts
import { z } from "zod";

export const bookingSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  room_id: z.string().min(1, "Please select a room"),
  date: z.date({
    required_error: "Please select a date",
  }),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export interface ChargeInfo {
  charge: number;
  is_existing_customer: boolean;
}

export interface PaymentIntent {
  payment_id: string;  // Changed from number to string (UUID)
  email: string;
  amount: number;
  currency: string;
  status: string;
  upi_id: string;
  upi_url: string;
  qr_code: string;  // Base64 data URL
  created_at: string;
}

export interface PendingBooking {
  email: string;
  phone: string;
  room_id: number;
  date: string;
  start_time: string;
  end_time: string;
  totalCharge: number;
}

export interface AvailabilityResponse {
  room_id: number;
  date: string;
  disabled_slots: string[];
}

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00"
];

export function isContiguous(slots: string[]): boolean {
  if (slots.length === 0) return true;
  const indices = slots.map((s) => TIME_SLOTS.indexOf(s)).sort((a, b) => a - b);
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) return false;
  }
  return true;
}