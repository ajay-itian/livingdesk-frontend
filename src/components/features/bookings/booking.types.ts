// components/features/bookings/booking.types.ts
import { z } from "zod";

export const bookingSchema = z.object({
  phone:   z.string().min(10, "Phone number must be at least 10 digits"),
  name:    z.string().min(1, "Name is required"),
  email:   z.string().email("Please enter a valid email address"),
  room_id: z.string().min(1, "Please select a room"),
  date:    z.date({ required_error: "Please select a date" }),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export interface ChargeInfo {
  user_type: "member" | "guest";
  company_id: string | null;
  company_name: string | null;
  monthly_credit_hours: number;
  company_used_hours: number;
  company_remaining_hours: number;
  requested_hours: number;
  free_hours_applied: number;
  paid_hours: number;
  amount: number;
  rate_per_30min: number;
  is_existing_customer: boolean;
  monthly_hours: number;
  charge_per_hour: number;
  tier: string;
  tier_description: string;
  currency: string;
}

export interface PaymentIntent {
  payment_id: string;
  phone: string;
  name: string;
  amount: number;
  currency: string;
  status: string;
  upi_id: string;
  upi_url: string;
  qr_code: string;
}

export interface PendingBooking {
  phone: string;
  name: string;
  email: string;
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

export interface BookingResponse {
  id: string;
  phone: string;
  name: string;
  email: string;
  room_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  pricing: {
    duration_hours: number;
    rate_per_30min: number;
    total_charge: number;
    tier: string;
    tier_description: string;
    currency: string;
  };
}

export const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00",
];

export function isContiguous(slots: string[]): boolean {
  if (slots.length === 0) return true;
  const sorted = [...slots].sort(
    (a, b) => TIME_SLOTS.indexOf(a) - TIME_SLOTS.indexOf(b)
  );
  for (let i = 0; i < sorted.length - 1; i++) {
    if (TIME_SLOTS.indexOf(sorted[i + 1]) - TIME_SLOTS.indexOf(sorted[i]) !== 1)
      return false;
  }
  return true;
}