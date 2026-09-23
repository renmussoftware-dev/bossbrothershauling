import { assertLeadEndpointConfigured } from "./scripts/lead-endpoint-guard.mjs";

/**
 * Next's production-build phase. Compared as a literal rather than imported
 * from "next/constants" — that specifier does not resolve under ESM (it needs
 * the .js extension), and a bad import here would break every build.
 */
const PHASE_PRODUCTION_BUILD = "phase-production-build";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Static export for GitHub Pages (served from /docs on main).
  // `next build` emits a fully static site into ./out — the
  // `npm run deploy:docs` script copies that into ./docs for Pages.
  output: "export",

  // No image optimization server exists on a static host.
  images: { unoptimized: true },
};

export default async function config(phase) {
  // Gate real builds only: `next dev` stays usable without a lead endpoint,
  // so UI work doesn't require the secret-ish .env.local to be present.
  if (phase === PHASE_PRODUCTION_BUILD) {
    await assertLeadEndpointConfigured();
  }
  return nextConfig;
}
