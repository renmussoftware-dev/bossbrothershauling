// ===========================================================================
// BRAND LOGO — the owners' crowned shield + the BOSS/BROTHERS/HAULING type.
//
// Two pieces:
//   <BossShield />  the mark on its own (nav, footer, truck doors)
//   <BossLogo />    the full stacked lockup: BOSS / BROTHERS / — HAULING —
//
// The shield is the supplied artwork as a PNG; the wordmark stays live text
// in Cinzel so it scales, reflows and stays selectable. If a vector of the
// shield (AI/EPS/SVG) ever turns up, swap the <img> for it — nothing else
// here needs to change.
// ===========================================================================

/**
 * The crowned shield, straight from the owners' logo file.
 *
 * This is the real artwork (public/logo-mark.png, downscaled from the 3000px
 * master in brand/logo/) rather than a redraw — the gradients, the engraved
 * bevel and the overlapped BB are not things to reproduce by hand in SVG.
 */
export function BossShield({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      width={233}
      height={320}
      className={className}
    />
  );
}

const SIZES = {
  sm: {
    shield: "h-12 w-auto",
    gap: "gap-5",
    boss: "text-lg",
    sub: "text-[0.6rem]",
    dash: "w-2",
    hang: "mr-1.5",
  },
  md: {
    shield: "h-16 w-auto",
    gap: "gap-6",
    boss: "text-2xl",
    sub: "text-[0.7rem]",
    dash: "w-3",
    hang: "mr-1.5",
  },
  lg: {
    shield: "h-28 w-auto",
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
