import type { Metadata } from "next";
import { Inter } from "next/font/google"; // optional, depends on if they used Inter
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Coworking Space in Pimple Saudagar, Pune | Managed Offices | The Living Desk",
  description: "Premium coworking & managed office space in Pimple Saudagar, Pimpri Chinchwad, Pune. Private cabins, dedicated desks, meeting rooms. From ₹299/day. Book a free tour!",
  keywords: "coworking space pimple saudagar, coworking space pimpri chinchwad, managed office pune, managed office pimple saudagar, private office pimple saudagar, coworking space pune, office space pimpri chinchwad, shared office pune, hot desk pimple saudagar, dedicated desk pune, meeting rooms pimpri chinchwad, flexible office space pune, startup office pune, office for rent pimple saudagar, coworking near kunal icon road, the living desk pune",
  authors: [{ name: "The Living Desk" }],
  formatDetection: { telephone: false },
  openGraph: {
    title: "Coworking Space in Pimple Saudagar, Pune | The Living Desk",
    description: "Premium coworking & managed office space in Pimple Saudagar, Pimpri Chinchwad. Private cabins, hot desks, meeting rooms. Book a free tour today!",
    url: "https://thelivingdesk.in/",
    siteName: "The Living Desk",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://thelivingdesk.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Living Desk - Coworking Space in Pimple Saudagar, Pune",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coworking Space in Pimple Saudagar, Pune | The Living Desk",
    description: "Premium coworking & managed office space in Pimple Saudagar, Pimpri Chinchwad. Private cabins, hot desks, meeting rooms.",
    images: ["https://thelivingdesk.in/og-image.jpg"],
  },
  verification: {
    google: "_q8cTRFIanOYH7XVG48D6-5Qi1lKg6flfdslj3Ku3Pk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Pimple Saudagar, Pune, Maharashtra" />
        <meta name="geo.position" content="18.5921498;73.7589091" />
        <meta name="ICBM" content="18.5921498, 73.7589091" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
