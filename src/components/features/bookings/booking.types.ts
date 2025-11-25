// features/booking/booking.types.ts
import * as z from "zod";

export const bookingSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?\d{10,15}$/, "Enter a valid phone number"),
  room_id: z.string().min(1, "Please select a room"),
  date: z.date({ required_error: "Please select a date" }),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

export type AvailabilityResponse = {
  bookings: { id: number; start_time: string; end_time: string }[];
  disabled_slots: string[];
};

export type ChargeInfo = {
  is_existing_customer: boolean;
  charge: number;
  currency: string;
};

export type PendingBooking = {
  email: string;
  phone: string;
  room_id: number;
  date: string;
  start_time: string;
  end_time: string;
  totalCharge: number;
};

export type PaymentIntent = {
  payment_id: number;
  amount: number;
  currency: string;
  upi_id: string;
  upi_name: string;
  qr_code_data_url: string;
  status: string;
};

export function isContiguous(selected: string[]): boolean {
  if (selected.length <= 1) return true;
  const indexes = selected.map((slot) => TIME_SLOTS.indexOf(slot)).sort((a, b) => a - b);
  for (let i = 1; i < indexes.length; i++) {
    if (indexes[i] !== indexes[i - 1] + 1) return false;
  }
  return true;
}
