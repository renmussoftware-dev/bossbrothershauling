// ===========================================================================
// BRAND LOGO — crowned shield + BB monogram, drawn from the truck-wrap art.
//
// Two pieces:
//   <BossShield />  the mark on its own (nav, favicons, truck doors)
//   <BossLogo />    the full stacked lockup: BOSS / BROTHERS / — HAULING —
//
// Kept as SVG + HTML text (rather than a raster) so it stays crisp at any
// size, inherits the Cinzel brand face, and costs nothing to load.
// ===========================================================================

/** Crowned shield with the interlocked BB monogram. */
export function BossShield({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 152"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="bbGold" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#FBF0C9" />
          <stop offset="0.34" stopColor="#E5BC55" />
          <stop offset="0.52" stopColor="#B8862A" />
          <stop offset="0.74" stopColor="#F0DA9B" />
          <stop offset="1" stopColor="#C9992E" />
        </linearGradient>
        <linearGradient id="bbField" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1D1D20" />
          <stop offset="1" stopColor="#08080A" />
        </linearGradient>
      </defs>

      {/* crown */}
      <path
        d="M26 37 L20 9 L38 23 L60 5 L82 23 L100 9 L94 37 Z"
        fill="url(#bbGold)"
        stroke="#8F661D"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {[
        [20, 8, 4.5],
        [60, 4, 5],
        [100, 8, 4.5],
        [38, 21, 3.2],
        [82, 21, 3.2],
      ].map(([cx, cy, r]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="url(#bbGold)"
          stroke="#8F661D"
          strokeWidth="1.2"
        />
      ))}

      {/* shield body */}
      <path
        d="M12 38 H108 V84 C108 112 88 134 60 148 C32 134 12 112 12 84 Z"
        fill="url(#bbField)"
        stroke="url(#bbGold)"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      {/* inner engraved rule */}
      <path
        d="M22 47 H98 V83 C98 105 82 123 60 134 C38 123 22 105 22 83 Z"
        fill="none"
        stroke="url(#bbGold)"
        strokeWidth="2"
        opacity="0.85"
      />

      {/* BB monogram */}
      <text
        x="60"
        y="112"
        textAnchor="middle"
        fill="url(#bbGold)"
        fontFamily="var(--font-cinzel), Georgia, 'Times New Roman', serif"
        fontSize="66"
        fontWeight="700"
        letterSpacing="-9"
      >
        BB
      </text>
    </svg>
  );
}

const SIZES = {
  sm: {
    shield: "h-10 w-auto",
    gap: "gap-5",
    boss: "text-lg",
    sub: "text-[0.6rem]",
    dash: "w-2",
    hang: "mr-1.5",
  },
  md: {
    shield: "h-14 w-auto",
    gap: "gap-6",
    boss: "text-2xl",
    sub: "text-[0.7rem]",
    dash: "w-3",
    hang: "mr-1.5",
  },
  lg: {
    shield: "h-24 w-auto",
    gap: "gap-8",
    boss: "text-4xl",
    sub: "text-xs",
    dash: "w-4",
    hang: "mr-2",
  },
} as const;

/**
 * Full brand lockup: shield beside the stacked BOSS / BROTHERS / HAULING type.
 *
 * The wrap flanks HAULING with a dash on each side, but a dash sitting in the
 * line would indent the H past the B of BOSS and BROTHERS. So the leading dash
 * hangs outside the text block (absolute, right-full) — it prints in the gap
 * beside the shield, which the per-size `gap` reserves room for, and the three
 * lines still start on one left edge. The negative right margins cancel the
 * trailing space letter-spacing leaves after each line's last character.
 */
export function BossLogo({
  size = "sm",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={`flex items-center ${s.gap} ${className ?? ""}`}>
      <BossShield className={s.shield} />
      <span className="flex flex-col items-start leading-none">
        <span
          className={`font-brand font-bold uppercase tracking-[0.14em] [margin-right:-0.14em] text-bone ${s.boss}`}
        >
          Boss
        </span>
        <span
          className={`mt-0.5 bg-gold-sheen bg-clip-text font-brand font-semibold uppercase tracking-[0.22em] [margin-right:-0.22em] text-transparent ${s.sub}`}
        >
          Brothers
        </span>
        <span
          className={`relative mt-1 flex items-center gap-1.5 font-brand uppercase text-bone/90 ${s.sub}`}
        >
          <i
            aria-hidden
            className={`absolute right-full h-px bg-gold-500 ${s.dash} ${s.hang}`}
          />
          <span className="tracking-[0.3em] [margin-right:-0.3em]">Hauling</span>
          <i aria-hidden className={`h-px bg-gold-500 ${s.dash}`} />
        </span>
      </span>
    </span>
  );
}
