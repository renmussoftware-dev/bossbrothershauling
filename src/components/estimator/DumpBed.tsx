"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LoadSize } from "@/lib/types";

// ===========================================================================
// SIGNATURE ELEMENT — the dimensional dump bed that fills as you build a load.
//
// Drawn as a layered SVG "cutaway" box (top + side faces give the 3D depth;
// the front face is a see-through gauge showing the load level). The fill rises
// with the load-size selection and junk-item glyphs surface as categories are
// added. Pure SVG + one Framer spring — light enough for mobile ad traffic.
// ===========================================================================

/** Icon keys that can surface above the fill line. */
export type JunkIcon =
  | "household"
  | "yard"
  | "appliances"
  | "construction"
  | "tires"
  | "mattress";

// Front-face interior gauge bounds (matches the box geometry below).
const GAUGE = { x: 70, top: 118, bottom: 288, w: 300 };

const FILL_PCT: Record<LoadSize | "empty", number> = {
  empty: 0.05,
  quarter: 0.28,
  half: 0.52,
  full: 0.92,
};

export function DumpBed({
  loadSize,
  items,
  className,
}: {
  loadSize: LoadSize | null;
  items: JunkIcon[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const pct = FILL_PCT[loadSize ?? "empty"];
  const fillHeight = (GAUGE.bottom - GAUGE.top) * pct;
  const fillY = GAUGE.bottom - fillHeight;

  return (
    <svg
      viewBox="0 0 440 340"
      role="img"
      aria-label={
        loadSize
          ? `Dump bed roughly ${Math.round(pct * 100)} percent full`
          : "Empty dump bed"
      }
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="steelFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2C333F" />
          <stop offset="1" stopColor="#1B212A" />
        </linearGradient>
        <linearGradient id="steelSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#39414E" />
          <stop offset="1" stopColor="#232A34" />
        </linearGradient>
        <linearGradient id="steelTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#454E5C" />
          <stop offset="1" stopColor="#2C333F" />
        </linearGradient>
        <linearGradient id="junkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A828F" />
          <stop offset="1" stopColor="#474E5A" />
        </linearGradient>
        {/* Clip the fill + icons to the front-face interior so nothing spills out */}
        <clipPath id="bedInterior">
          <rect x={GAUGE.x} y={GAUGE.top} width={GAUGE.w} height={GAUGE.bottom - GAUGE.top} />
        </clipPath>
      </defs>

      {/* soft contact shadow under the bed */}
      <ellipse cx="220" cy="312" rx="180" ry="18" fill="#000" opacity="0.35" />

      {/* ---- 3D box faces (draw back-to-front for depth) ---- */}
      {/* left side face */}
      <polygon points="70,110 110,72 110,244 70,288" fill="url(#steelSide)" />
      {/* right side face */}
      <polygon points="370,110 330,72 330,244 370,288" fill="url(#steelSide)" opacity="0.9" />
      {/* top opening face */}
      <polygon points="110,72 330,72 370,110 70,110" fill="url(#steelTop)" />
      {/* inner back wall seen through the opening */}
      <polygon points="110,72 330,72 330,244 110,244" fill="#171C24" />

      {/* ---- fill gauge on the front interior ---- */}
      <g clipPath="url(#bedInterior)">
        <motion.rect
          x={GAUGE.x}
          width={GAUGE.w}
          fill="url(#junkFill)"
          initial={false}
          animate={{ y: fillY, height: fillHeight }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 18 }
          }
        />
        {/* glowing load surface line */}
        <motion.rect
          x={GAUGE.x}
          width={GAUGE.w}
          height={4}
          fill="#F5C518"
          initial={false}
          animate={{ y: fillY - 2, opacity: loadSize ? 1 : 0.3 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18 }}
        />
        {/* junk glyphs surfacing near the top of the load */}
        <JunkGlyphs items={items} surfaceY={fillY} reduce={!!reduce} />
      </g>

      {/* ---- steel frame drawn over everything ---- */}
      <polygon
        points="70,110 370,110 370,288 70,288"
        fill="none"
        stroke="#0E1116"
        strokeWidth="3"
      />
      {/* front rim + hazard stripe */}
      <polygon points="110,72 330,72 370,110 70,110" fill="none" stroke="#0E1116" strokeWidth="3" />
      <rect x="70" y="108" width="300" height="7" fill="#F5C518" />
      <rect x="70" y="108" width="300" height="7" fill="url(#hazStripe)" opacity="0.35" />
      <pattern id="hazStripe" width="16" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="#12151A" />
      </pattern>
    </svg>
  );
}

/** Renders up to a handful of item glyphs bobbing at the load surface. */
function JunkGlyphs({
  items,
  surfaceY,
  reduce,
}: {
  items: JunkIcon[];
  surfaceY: number;
  reduce: boolean;
}) {
  // De-dupe + cap so the pile never gets cluttered.
  const unique = Array.from(new Set(items)).slice(0, 5);
  const slotW = GAUGE.w / (unique.length + 1);

  return (
    <>
      {unique.map((key, i) => {
        const cx = GAUGE.x + slotW * (i + 1);
        const cy = surfaceY - 14;
        return (
          <motion.g
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 16, delay: i * 0.04 }}
          >
            <g transform={`translate(${cx - 12}, ${cy - 12})`}>
              <Glyph kind={key} />
            </g>
          </motion.g>
        );
      })}
    </>
  );
}

/** Minimal 24x24 debris glyphs — extruded look via a dark drop layer. */
function Glyph({ kind }: { kind: JunkIcon }) {
  const s = { stroke: "#12151A", strokeWidth: 1.5, strokeLinejoin: "round" as const };
  switch (kind) {
    case "household": // armchair
      return (
        <g fill="#C9CED6" {...s}>
          <rect x="3" y="9" width="18" height="9" rx="2" />
          <rect x="2" y="6" width="5" height="9" rx="2" />
          <rect x="17" y="6" width="5" height="9" rx="2" />
          <rect x="5" y="17" width="3" height="4" />
          <rect x="16" y="17" width="3" height="4" />
        </g>
      );
    case "yard": // leafy branch
      return (
        <g fill="#8FB56A" {...s}>
          <path d="M12 21 L12 6" stroke="#5C7A3C" strokeWidth="2" fill="none" />
          <path d="M12 8 C7 6 5 9 4 12 C8 12 11 11 12 8Z" />
          <path d="M12 13 C17 11 19 14 20 17 C16 17 13 16 12 13Z" />
        </g>
      );
    case "appliances": // fridge
      return (
        <g fill="#B9C6D2" {...s}>
          <rect x="6" y="3" width="12" height="18" rx="2" />
          <line x1="6" y1="10" x2="18" y2="10" />
          <line x1="9" y1="6" x2="9" y2="8" />
          <line x1="9" y1="12" x2="9" y2="15" />
        </g>
      );
    case "construction": // plank + triangle debris
      return (
        <g fill="#C7A882" {...s}>
          <rect x="2" y="14" width="20" height="4" rx="1" transform="rotate(-8 12 16)" />
          <path d="M13 3 L20 13 L6 13 Z" fill="#9C8460" />
        </g>
      );
    case "tires": // tire
      return (
        <g fill="#2B2F36" stroke="#12151A" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" fill="#565C66" />
        </g>
      );
    case "mattress": // mattress
      return (
        <g fill="#E6E1D4" {...s}>
          <rect x="2" y="8" width="20" height="8" rx="3" />
          <line x1="7" y1="8" x2="7" y2="16" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="17" y1="8" x2="17" y2="16" />
        </g>
      );
  }
}
