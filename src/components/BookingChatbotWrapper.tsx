"use client";

import dynamic from "next/dynamic";

const BookingChatbot = dynamic(() => import("./BookingChatbot"), { ssr: false });

export default function BookingChatbotWrapper() {
  return <BookingChatbot />;
}
