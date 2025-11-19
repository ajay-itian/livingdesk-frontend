import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  email: string;
  phone: string;
  room: string;
  date: string;
  timeSlots: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone, room, date, timeSlots }: BookingEmailRequest = await req.json();

    console.log("Sending booking confirmation email to:", email);

    // Send booking details to The Living Desk
    const adminEmail = await resend.emails.send({
      from: "The Living Desk <onboarding@resend.dev>",
      to: ["thelivingdesk@gmail.com"],
      replyTo: email,
      subject: `New Conference Room Booking Request`,
      html: `
        <h2>New Conference Room Booking</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Room:</strong> ${room}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time Slots:</strong> ${timeSlots}</p>
      `,
    });

    // Send confirmation to customer
    const customerEmail = await resend.emails.send({
      from: "The Living Desk <onboarding@resend.dev>",
      to: [email],
      subject: `Booking Request Received - The Living Desk`,
      html: `
        <h2>Thank you for your booking request!</h2>
        <p>We have received your conference room booking request with the following details:</p>
        <p><strong>Room:</strong> ${room}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time Slots:</strong> ${timeSlots}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <br>
        <p>We will confirm your booking shortly and send you a confirmation email.</p>
        <p>If you have any questions, please contact us at thelivingdesk@gmail.com or call +91 70660 02650.</p>
        <br>
        <p>Best regards,<br>The Living Desk Team</p>
      `,
    });

    console.log("Booking emails sent successfully");

    return new Response(
      JSON.stringify({ adminEmail, customerEmail }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
