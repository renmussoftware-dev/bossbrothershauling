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

  // As the hero scrolls away, the dump bed tips up — the "gate opens" moment.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const tiltRaw = useTransform(scrollYProgress, [0, 1], [0, -26]);
  const tilt = useSpring(tiltRaw, { stiffness: 80, damping: 20 });
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
            yard debris, appliances, or a whole cleanout.
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

        {/* Dimensional dump truck */}
        <div className="relative mx-auto w-full max-w-xl">
          <HeroTruck
            tilt={reduce ? undefined : tilt}
            drop={reduce ? undefined : drop}
          />
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="inline-block h-2 w-2 rounded-full bg-haz-yellow" />;
}

/**
 * Stylized low-poly dump truck. The bed group rotates on scroll (tilt) and a
 * chunk of "junk" drops out the back (drop) — a lightweight 3D-feel moment,
 * no 3D library required.
 */
function HeroTruck({
  tilt,
  drop,
}: {
  tilt?: ReturnType<typeof useSpring>;
  drop?: ReturnType<typeof useSpring>;
}) {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Boss Bros dump truck">
      <defs>
        <linearGradient id="cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2661F" />
          <stop offset="1" stopColor="#C24810" />
        </linearGradient>
        <linearGradient id="bed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A424F" />
          <stop offset="1" stopColor="#232A34" />
        </linearGradient>
        <linearGradient id="bedTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A5464" />
          <stop offset="1" stopColor="#2C333F" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="260" cy="330" rx="220" ry="20" fill="#000" opacity="0.35" />

      {/* falling junk (only when animated) */}
      {drop && (
        <motion.g style={{ y: drop }} opacity={0.9}>
          <rect x="400" y="250" width="26" height="20" rx="3" fill="#7A828F" />
          <circle cx="446" cy="266" r="12" fill="#2B2F36" stroke="#12151A" strokeWidth="2" />
          <rect x="430" y="238" width="20" height="12" rx="2" fill="#C7A882" transform="rotate(12 440 244)" />
        </motion.g>
      )}

      {/* chassis */}
      <rect x="70" y="250" width="360" height="26" rx="6" fill="#171C24" />

      {/* dump bed — tilts on scroll, hinged at its rear-bottom corner.
          transformBox:fill-box makes transform-origin relative to the group's
          own bounding box, so rotation is consistent across browsers. */}
      <motion.g
        style={
          tilt
            ? { rotate: tilt, transformBox: "fill-box", transformOrigin: "95% 100%" }
            : undefined
        }
      >
        {/* bed body */}
        <polygon points="150,250 150,150 400,150 420,250" fill="url(#bed)" />
        {/* bed top rail */}
        <polygon points="150,150 170,138 420,138 400,150" fill="url(#bedTop)" />
        {/* piled junk peeking over the rail */}
        <path
          d="M175,150 Q200,120 235,145 Q260,118 300,142 Q340,120 380,146 L400,150 Z"
          fill="#6B7280"
        />
        {/* hazard stripe on the tailgate */}
        <rect x="150" y="235" width="270" height="10" fill="#F5C518" opacity="0.8" />
      </motion.g>

      {/* cab */}
      <path d="M430 250 L430 175 L470 175 L500 220 L500 250 Z" fill="url(#cab)" />
      <path d="M440 200 L468 200 L486 222 L440 222 Z" fill="#BFE3F2" opacity="0.85" />
      {/* headlight */}
      <rect x="496" y="230" width="6" height="10" rx="2" fill="#F5C518" />

      {/* wheels */}
      <Wheel cx={150} cy={286} />
      <Wheel cx={230} cy={286} />
      <Wheel cx={455} cy={286} />
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
