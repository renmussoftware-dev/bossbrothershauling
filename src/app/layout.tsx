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
  alternates: { canonical: "/" },
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
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-icon-180.png", sizes: "180x180" },
  },
};

// Google Ads tag. Kept as plain <script> tags in <head> (not next/script) so it
// lands in the static HTML of every exported page.
const GOOGLE_TAG_ID = "AW-18483670133";

// LocalBusiness structured data — ties the site to the Google Business Profile
// (same name, phone and service area) so Google can match the two.
const LOCAL_BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE.url}/#business`,
  name: SITE.name,
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  image: `${SITE.url}/og.png`,
  logo: `${SITE.url}/logo-mark.png`,
  description: `Junk removal, hauling and storage unit cleanouts in ${SITE.serviceArea}.`,
  areaServed: [
    { "@type": "AdministrativeArea", name: SITE.serviceArea },
    ...SITE.towns.map((town) => ({ "@type": "City", name: `${town}, FL` })),
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "16:00",
    },
  ],
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
      <head>
        {/* Google tag (gtag.js) */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${GOOGLE_TAG_ID}');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSON_LD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
