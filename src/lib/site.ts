// ---------------------------------------------------------------------------
// Central place for business details that appear across the site.
// >>> REPLACE THE PLACEHOLDER VALUES BELOW WITH REAL BUSINESS INFO BEFORE LAUNCH.
// Phone/email can also be overridden at deploy time via NEXT_PUBLIC_* env vars.
// ---------------------------------------------------------------------------

export const SITE = {
  name: "Boss Bros Hauling",
  domain: "bossbrothershauling.com",
  url: "https://bossbrothershauling.com",
  tagline: "Junk gone same day.",

  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "(850) 737-0360",
  // PLACEHOLDER — swap for the real inbox.
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@bossbrothershauling.com",

  serviceArea: "Santa Rosa County, FL",
  towns: ["Milton", "Pace", "Navarre", "Gulf Breeze", "Bagdad", "Holley"],

  hours: [
    { day: "Mon–Fri", time: "7:00 AM – 6:00 PM" },
    { day: "Saturday", time: "8:00 AM – 4:00 PM" },
    { day: "Sunday", time: "By appointment" },
  ],

  // PLACEHOLDER social links — update or remove.
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    google: "https://www.google.com/maps",
  },
} as const;

/** Digits-only phone for tel: links. */
export const telHref = `tel:${SITE.phone.replace(/[^\d+]/g, "")}`;
