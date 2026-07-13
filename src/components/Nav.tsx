"use client";

import { useState } from "react";
import { SITE, telHref } from "@/lib/site";

const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#estimator", label: "Get a price" },
  { href: "#how", label: "How it works" },
  { href: "#area", label: "Service area" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-asphalt/80 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <BossMark />
          <span className="font-display text-xl font-bold uppercase tracking-wide text-paper">
            Boss Bros <span className="text-haz-orange">Hauling</span>
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-concrete transition hover:text-paper"
            >
              {l.label}
            </a>
          ))}
          <a href={telHref} className="btn-primary py-2.5 text-sm">
            Call {SITE.phone}
          </a>
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="block h-0.5 w-6 bg-paper" />
          <span className="mt-1.5 block h-0.5 w-6 bg-paper" />
          <span className="mt-1.5 block h-0.5 w-6 bg-paper" />
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 bg-asphalt md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-concrete hover:bg-steel-2 hover:text-paper"
              >
                {l.label}
              </a>
            ))}
            <a href={telHref} className="btn-primary mt-2">
              Call {SITE.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/** Tiny extruded truck mark used as the logo glyph (placeholder for a real logo). */
function BossMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
      <rect x="1" y="1" width="32" height="32" rx="8" fill="#F2661F" />
      <rect x="1" y="1" width="32" height="32" rx="8" fill="url(#g)" opacity="0.25" />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
      </defs>
      {/* dump bed + cab */}
      <path d="M6 20 L18 20 L18 12 L23 12 L27 17 L27 20 L28 20 L28 23 L6 23 Z" fill="#12151A" />
      <circle cx="11" cy="24" r="3" fill="#12151A" stroke="#F5C518" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="3" fill="#12151A" stroke="#F5C518" strokeWidth="1.5" />
    </svg>
  );
}
