import type { Metadata } from "next";
import Booking from "@/components/features/bookings/Booking";

export const metadata: Metadata = {
  title: "Book a Tour | Coworking Space Pimple Saudagar | The Living Desk",
  description: "Schedule a free tour of The Living Desk coworking space in Pimple Saudagar, Pune. Explore hot desks, private cabins, and managed offices. Book instantly online.",
  alternates: { canonical: "https://www.thelivingdesk.in/booking" },
  openGraph: {
    title: "Book a Tour | The Living Desk Pune",
    description: "Schedule your free tour at The Living Desk, Pimple Saudagar, Pune.",
    url: "https://www.thelivingdesk.in/booking",
    siteName: "The Living Desk",
    images: [{ url: "https://www.thelivingdesk.in/og-image.jpg" }],
    type: "website",
  },
};

export default function BookingPage() {
  return <Booking />;
}
