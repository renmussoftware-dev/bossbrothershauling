const SERVICES = [
  {
    title: "Junk removal & cleanouts",
    body: "Furniture, old clutter, garage, estate, and storage unit cleanouts. Pile it where our truck can back up to it and it's gone — we handle all the loading. PCSing or racing a storage deadline? Drive-up units are perfect: open the door and we'll take it from there.",
    glyph: "household" as const,
  },
  {
    title: "Yard debris & cleanup hauling",
    body: "Branches, leaves, storm mess, land-clearing debris. We rake it up and haul it off so your yard's ready to use again.",
    glyph: "yard" as const,
  },
  {
    title: "Appliance & scrap removal",
    body: "Washers, dryers, fridges, grills, metal and scrap. Get it to the driveway or carport and the heavy, awkward part is on us.",
    glyph: "appliances" as const,
  },
  {
    title: "Construction & demo debris",
    body: "Shingles, lumber, drywall, remodel leftovers. Contractor or DIY, we clear the site so you can get back to work.",
    glyph: "construction" as const,
  },
];

export function Services() {
  return (
    <section id="services" className="container-page py-20 sm:py-24">
      <div className="max-w-2xl">
        <p className="label-kicker">What we haul</p>
        <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
          If you can pile it up, we can haul it off.
        </h2>
        <p className="mt-4 text-lg text-concrete">
          One local crew for the stuff you want gone. No dumpster to rent, no
          trailer to borrow, no favors to call in.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <article
            key={s.title}
            className="panel group relative p-6 transition-transform duration-200 hover:-translate-y-1 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <ServiceIcon kind={s.glyph} />
              <div>
                <h3 className="text-2xl">{s.title}</h3>
                <p className="mt-2 text-concrete">{s.body}</p>
              </div>
            </div>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-haz-orange opacity-0 transition-opacity group-hover:opacity-100" />
          </article>
        ))}
      </div>
    </section>
  );
}

/** Chunky extruded service icon in a steel tile. */
function ServiceIcon({
  kind,
}: {
  kind: "household" | "yard" | "appliances" | "construction";
}) {
  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-white/10 bg-asphalt shadow-panel">
      <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
        {kind === "household" && (
          <g fill="#F5C518" stroke="#12151A" strokeWidth="1">
            <rect x="3" y="9" width="18" height="9" rx="2" />
            <rect x="2" y="6" width="5" height="9" rx="2" />
            <rect x="17" y="6" width="5" height="9" rx="2" />
          </g>
        )}
        {kind === "yard" && (
          <g fill="#8FB56A" stroke="#12151A" strokeWidth="1">
            <path d="M12 21 L12 6" stroke="#5C7A3C" strokeWidth="2" fill="none" />
            <path d="M12 8 C7 6 5 9 4 12 C8 12 11 11 12 8Z" />
            <path d="M12 13 C17 11 19 14 20 17 C16 17 13 16 12 13Z" />
          </g>
        )}
        {kind === "appliances" && (
          <g fill="#B9C6D2" stroke="#12151A" strokeWidth="1">
            <rect x="6" y="3" width="12" height="18" rx="2" />
            <line x1="6" y1="10" x2="18" y2="10" />
          </g>
        )}
        {kind === "construction" && (
          <g fill="#F2661F" stroke="#12151A" strokeWidth="1">
            <rect x="2" y="14" width="20" height="4" rx="1" transform="rotate(-8 12 16)" />
            <path d="M13 3 L20 13 L6 13 Z" />
          </g>
        )}
      </svg>
    </div>
  );
}
