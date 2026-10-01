// Google Ads conversion events. The base tag (gtag.js) is loaded in
// src/app/layout.tsx; this only reports conversions against it.

const QUOTE_REQUEST_CONVERSION = "AW-18483670133/SBK3CJiL8owdEPXY2e1E";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Report a "Request quote" conversion. No-op if the tag is blocked or absent. */
export function reportQuoteRequestConversion(): void {
  window.gtag?.("event", "conversion", { send_to: QUOTE_REQUEST_CONVERSION });
}
