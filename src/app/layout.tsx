import type { Metadata, Viewport } from "next";
import { Cinzel, Oswald, Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

// Self-hosted via next/font — no external requests at runtime, no layout shift.
// Cinzel carries the engraved-serif feel of the truck-wrap wordmark.
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Junk Removal & Hauling in ${SITE.serviceArea}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Same-day junk removal, hauling & storage unit cleanouts across Santa Rosa County, FL — Milton, Pace, Navarre & Gulf Breeze. Send us photos of what you need gone and we'll call you with a free quote.",
  keywords: [
    "junk removal",
    "hauling",
    "storage unit cleanout",
    "PCS cleanout",
    "Santa Rosa County",
    "Milton FL",
    "Navarre FL",
    "Pace FL",
    "Gulf Breeze",
    "appliance removal",
    "yard debris",
    "construction debris",
  ],
  openGraph: {
    title: `${SITE.name} — Junk Removal & Hauling`,
    description:
      "Send photos of what you need gone — we'll call you with a free quote and haul it away.",
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    images: ["/logo.svg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${oswald.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
