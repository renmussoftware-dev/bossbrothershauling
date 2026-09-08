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
  sm: { shield: "h-10 w-auto", boss: "text-lg", sub: "text-[0.6rem]", rule: "w-4" },
  md: { shield: "h-14 w-auto", boss: "text-2xl", sub: "text-[0.7rem]", rule: "w-6" },
  lg: { shield: "h-24 w-auto", boss: "text-4xl", sub: "text-xs", rule: "w-10" },
} as const;

/** Full brand lockup: shield beside the stacked BOSS / BROTHERS / HAULING type. */
export function BossLogo({
  size = "sm",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={`flex items-center gap-3 ${className ?? ""}`}>
      <BossShield className={s.shield} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-brand font-bold uppercase tracking-[0.14em] text-bone ${s.boss}`}
        >
          Boss
        </span>
        <span
          className={`mt-0.5 bg-gold-sheen bg-clip-text font-brand font-semibold uppercase tracking-[0.22em] text-transparent ${s.sub}`}
        >
          Brothers
        </span>
        <span
          className={`mt-1 flex items-center gap-1.5 font-brand uppercase tracking-[0.3em] text-bone/90 ${s.sub}`}
        >
          <i aria-hidden className={`h-px bg-gold-500 ${s.rule}`} />
          Hauling
          <i aria-hidden className={`h-px bg-gold-500 ${s.rule}`} />
        </span>
      </span>
    </span>
  );
}
