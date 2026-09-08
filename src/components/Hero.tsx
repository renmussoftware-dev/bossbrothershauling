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
      {/* layered depth: onyx band + gold rule */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-onyx-2 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gold-stripe opacity-20" />
      </div>

      <div className="container-page grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <div>
          <p className="label-kicker">Santa Rosa County, FL</p>
          <h1 className="mt-3 font-brand text-5xl font-bold leading-[1.02] text-bone sm:text-6xl lg:text-7xl">
            Junk gone
            <br />
            <span className="text-sheen">same day.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-ash">
            Two brothers, one truck, zero runaround. Send us a couple photos of
            what you need gone and we&rsquo;ll call you with an exact price —
            furniture, yard debris, appliances, storage units, or a whole
            cleanout.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#estimator" className="btn-primary">
              Get my quote
            </a>
            <a href={telHref} className="btn-secondary">
              Call {SITE.phone}
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ash">
            <li className="flex items-center gap-2">
              <Dot /> Free quote from your photos
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
  return <span className="inline-block h-2 w-2 rounded-full bg-gold-300" />;
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
      aria-label="Boss Brothers Hauling pickup truck pulling a loaded utility trailer"
    >
      <defs>
        {/* black wrap with a shaded underside */}
        <linearGradient id="wrap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B2B30" />
          <stop offset="0.55" stopColor="#151517" />
          <stop offset="1" stopColor="#0A0A0B" />
        </linearGradient>
        <linearGradient id="bed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#232327" />
          <stop offset="1" stopColor="#101012" />
        </linearGradient>
        <linearGradient id="goldTrim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBF0C9" />
          <stop offset="0.45" stopColor="#D4A537" />
          <stop offset="1" stopColor="#8F661D" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="260" cy="330" rx="230" ry="20" fill="#000" opacity="0.45" />

      {/* falling junk off the trailer's back edge (only when animated) */}
      {drop && (
        <motion.g style={{ y: drop }} opacity={0.9}>
          <rect x="40" y="242" width="24" height="18" rx="3" fill="#6F6C66" />
          <circle cx="30" cy="262" r="11" fill="#1E1E21" stroke="#0B0B0C" strokeWidth="2" />
          <rect x="56" y="228" width="18" height="11" rx="2" fill="#C7A882" transform="rotate(-12 65 233)" />
        </motion.g>
      )}

      {/* ---------- utility trailer ---------- */}
      {/* deck */}
      <rect x="60" y="240" width="220" height="14" rx="3" fill="#0F0F11" />
      {/* side rail, gold-capped like the wrap */}
      <rect x="62" y="206" width="212" height="7" rx="2" fill="url(#bed)" />
      <rect x="62" y="204" width="212" height="2" rx="1" fill="url(#goldTrim)" opacity="0.8" />
      {/* rail posts */}
      {[70, 118, 166, 214, 262].map((x) => (
        <rect key={x} x={x} y="210" width="7" height="32" fill="#232327" />
      ))}
      {/* piled junk on the trailer, peeking over the rail */}
      <path
        d="M68,210 Q95,172 125,200 Q150,168 185,196 Q215,170 250,198 L272,210 L272,240 L68,240 Z"
        fill="#5E5B56"
      />
      {/* gold rear marker on the trailer */}
      <rect x="60" y="228" width="10" height="26" fill="url(#goldTrim)" />
      {/* tongue + coupler to the truck */}
      <rect x="278" y="244" width="46" height="7" rx="3" fill="#0F0F11" />
      <circle cx="322" cy="248" r="5" fill="#232327" stroke="#050506" strokeWidth="2" />

      {/* ---------- pickup truck (black wrap, gold graphics) ---------- */}
      {/* bed */}
      <path
        d="M316 250 L316 204 L410 204 L410 250 Z"
        fill="url(#wrap)"
        stroke="#4A4A52"
        strokeWidth="1.5"
      />
      <rect x="316" y="200" width="94" height="8" rx="2" fill="#3A3A42" />
      {/* cab: body + roofline */}
      <path
        d="M410 250 L410 204 L418 204 L430 172 L472 172 L484 204 L502 210 L502 250 Z"
        fill="url(#wrap)"
        stroke="#4A4A52"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* window */}
      <path d="M434 178 L468 178 L477 202 L426 202 Z" fill="#3A4A55" opacity="0.85" />
      {/* gold swoosh running the length of the wrap */}
      <path
        d="M318 240 L404 232 L416 216 L500 214"
        fill="none"
        stroke="url(#goldTrim)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M318 246 L402 239 L414 224 L500 222"
        fill="none"
        stroke="url(#goldTrim)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* bed/cab seam + headlight */}
      <rect x="409" y="204" width="2" height="46" fill="#3A3A40" opacity="0.8" />
      <rect x="497" y="216" width="6" height="9" rx="2" fill="#FBF0C9" />
      {/* shield emblem on the door, as it sits on the real truck */}
      <g transform="translate(340 206) scale(0.26)">
        <path
          d="M26 37 L20 9 L38 23 L60 5 L82 23 L100 9 L94 37 Z"
          fill="url(#goldTrim)"
        />
        <path
          d="M12 38 H108 V84 C108 112 88 134 60 148 C32 134 12 112 12 84 Z"
          fill="#0A0A0B"
          stroke="url(#goldTrim)"
          strokeWidth="9"
          strokeLinejoin="round"
        />
        <text
          x="60"
          y="112"
          textAnchor="middle"
          fill="url(#goldTrim)"
          fontFamily="var(--font-cinzel), Georgia, serif"
          fontSize="66"
          fontWeight="700"
          letterSpacing="-9"
        >
          BB
        </text>
      </g>

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
      <circle cx={cx} cy={cy} r="26" fill="#0B0B0C" />
      <circle cx={cx} cy={cy} r="26" fill="none" stroke="url(#goldTrim)" strokeWidth="2" opacity="0.75" />
      <circle cx={cx} cy={cy} r="10" fill="#4E4E56" />
      <circle cx={cx} cy={cy} r="10" fill="none" stroke="url(#goldTrim)" strokeWidth="1.5" />
    </g>
  );
}
