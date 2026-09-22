"use client";

import { useState } from "react";
import { SITE, telHref } from "@/lib/site";
import { BossLogo } from "./Logo";

const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#estimator", label: "Get a quote" },
  { href: "#how", label: "How it works" },
  { href: "#area", label: "Service area" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold-500/20 bg-onyx/85 backdrop-blur">
      <nav className="container-page flex h-20 items-center justify-between">
        <a href="#top" aria-label={`${SITE.name} — home`}>
          <BossLogo size="sm" />
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ash transition hover:text-bone"
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
          <span className="block h-0.5 w-6 bg-bone" />
          <span className="mt-1.5 block h-0.5 w-6 bg-bone" />
          <span className="mt-1.5 block h-0.5 w-6 bg-bone" />
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 bg-onyx md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-ash hover:bg-char-2 hover:text-bone"
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
