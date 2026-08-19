"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { SITE, telHref } from "@/lib/site";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // As the hero scrolls away, a chunk of junk drops off the back of the
  // trailer — a small kinetic moment without pretending the trailer dumps.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const dropRaw = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const drop = useSpring(dropRaw, { stiffness: 80, damping: 20 });

  return (
    <section
      id="top"
      ref={ref}
      className="relative overflow-hidden"
    >
      {/* layered depth: asphalt band + hazard rule */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-asphalt-2 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-haz-stripe opacity-20" />
      </div>

      <div className="container-page grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <div>
          <p className="label-kicker">Santa Rosa County, FL</p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-[0.95] text-paper sm:text-6xl lg:text-7xl">
            Junk gone
            <br />
            <span className="text-haz-orange">same day.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-concrete">
            Two brothers, one truck, zero runaround. Build your load, get a real
            price in under a minute, and we&rsquo;ll haul it off — furniture,
            yard debris, appliances, storage units, or a whole cleanout.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#estimator" className="btn-primary">
              Get my price
            </a>
            <a href={telHref} className="btn-secondary">
              Call {SITE.phone}
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-concrete">
            <li className="flex items-center gap-2">
              <Dot /> Upfront estimate range
            </li>
            <li className="flex items-center gap-2">
              <Dot /> Same-day &amp; next-day pickup
            </li>
            <li className="flex items-center gap-2">
              <Dot /> We do the lifting
            </li>
          </ul>
        </div>

        {/* Dimensional truck + trailer */}
        <div className="relative mx-auto w-full max-w-xl">
          <HeroTruck drop={reduce ? undefined : drop} />
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="inline-block h-2 w-2 rounded-full bg-haz-yellow" />;
}

/**
 * Stylized low-poly pickup truck pulling a utility trailer — the actual rig.
 * A chunk of "junk" drops off the back of the trailer on scroll (drop) — a
 * lightweight 3D-feel moment, no 3D library required.
 */
function HeroTruck({ drop }: { drop?: ReturnType<typeof useSpring> }) {
  return (
    <svg
      viewBox="0 0 520 360"
      role="img"
      aria-label="Boss Bros pickup truck pulling a loaded utility trailer"
    >
      <defs>
        {/* white work-truck paint with a shaded underside */}
        <linearGradient id="cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F8FA" />
          <stop offset="1" stopColor="#C3CAD3" />
        </linearGradient>
        <linearGradient id="bed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A424F" />
          <stop offset="1" stopColor="#232A34" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="260" cy="330" rx="230" ry="20" fill="#000" opacity="0.35" />

      {/* falling junk off the trailer's back edge (only when animated) */}
      {drop && (
        <motion.g style={{ y: drop }} opacity={0.9}>
          <rect x="40" y="242" width="24" height="18" rx="3" fill="#7A828F" />
          <circle cx="30" cy="262" r="11" fill="#2B2F36" stroke="#12151A" strokeWidth="2" />
          <rect x="56" y="228" width="18" height="11" rx="2" fill="#C7A882" transform="rotate(-12 65 233)" />
        </motion.g>
      )}

      {/* ---------- utility trailer ---------- */}
      {/* deck */}
      <rect x="60" y="240" width="220" height="14" rx="3" fill="#171C24" />
      {/* side rail */}
      <rect x="62" y="206" width="212" height="7" rx="2" fill="url(#bed)" />
      {/* rail posts */}
      {[70, 118, 166, 214, 262].map((x) => (
        <rect key={x} x={x} y="210" width="7" height="32" fill="#2C333F" />
      ))}
      {/* piled junk on the trailer, peeking over the rail */}
      <path
        d="M68,210 Q95,172 125,200 Q150,168 185,196 Q215,170 250,198 L272,210 L272,240 L68,240 Z"
        fill="#6B7280"
      />
      {/* hazard stripe on trailer rear */}
      <rect x="60" y="228" width="10" height="26" fill="#F5C518" opacity="0.85" />
      {/* tongue + coupler to the truck */}
      <rect x="278" y="244" width="46" height="7" rx="3" fill="#171C24" />
      <circle cx="322" cy="248" r="5" fill="#2C333F" stroke="#0E1116" strokeWidth="2" />

      {/* ---------- pickup truck (white work truck) ---------- */}
      {/* bed */}
      <path d="M316 250 L316 204 L410 204 L410 250 Z" fill="url(#cab)" />
      <rect x="316" y="200" width="94" height="8" rx="2" fill="#DDE2E8" />
      {/* cab: body + roofline */}
      <path d="M410 250 L410 204 L418 204 L430 172 L472 172 L484 204 L502 210 L502 250 Z" fill="url(#cab)" />
      {/* window */}
      <path d="M434 178 L468 178 L477 202 L426 202 Z" fill="#8FB6CC" opacity="0.9" />
      {/* bed/cab seam, body line + headlight */}
      <rect x="409" y="204" width="2" height="46" fill="#9AA3AE" opacity="0.7" />
      <rect x="410" y="226" width="92" height="4" fill="#9AA3AE" />
      <rect x="497" y="216" width="6" height="9" rx="2" fill="#F5C518" />

      {/* wheels — trailer axle, truck rear + front */}
      <Wheel cx={168} cy={286} />
      <Wheel cx={355} cy={286} />
      <Wheel cx={462} cy={286} />
    </svg>
  );
}

function Wheel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="26" fill="#12151A" />
      <circle cx={cx} cy={cy} r="26" fill="none" stroke="#F5C518" strokeWidth="2" opacity="0.5" />
      <circle cx={cx} cy={cy} r="10" fill="#565C66" />
    </g>
  );
}
