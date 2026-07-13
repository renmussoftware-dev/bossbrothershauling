import { SITE, telHref } from "@/lib/site";

export function ServiceArea() {
  return (
    <section id="area" className="container-page py-20 sm:py-24">
      <div className="panel grid gap-8 overflow-hidden p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="label-kicker">Where we work</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
            Proudly hauling across Santa Rosa County.
          </h2>
          <p className="mt-4 text-lg text-concrete">
            We&rsquo;re local — based right here and on the road every day across{" "}
            {SITE.serviceArea}. If you&rsquo;re in or around these towns,
            we&rsquo;ve got you.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {SITE.towns.map((town) => (
              <li
                key={town}
                className="rounded-full border border-white/10 bg-steel-2/50 px-4 py-1.5 text-sm text-paper"
              >
                {town}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-concrete">
            Military family? We&rsquo;re minutes from NAS Whiting Field and work
            with PCSing families all the time — storage unit cleanouts, move-out
            hauls, and beat-the-deadline pickups are our bread and butter.
          </p>

          <p className="mt-6 text-sm text-concrete">
            Not sure if you&rsquo;re in range?{" "}
            <a href={telHref} className="text-haz-yellow underline-offset-2 hover:underline">
              Give us a call
            </a>{" "}
            — if we can get a truck to you, we&rsquo;ll haul it.
          </p>
        </div>

        {/* Stylized county map marker cluster (placeholder for a real map embed) */}
        <div className="relative">
          <div className="panel aspect-[4/3] w-full bg-asphalt-2 p-4">
            <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Service area map of Santa Rosa County">
              {/* rough county outline */}
              <path
                d="M60 40 L340 50 L350 120 L320 250 L120 260 L70 180 Z"
                fill="#1B212A"
                stroke="#3A424F"
                strokeWidth="2"
              />
              {/* roads */}
              <path d="M60 120 L350 130" stroke="#2C333F" strokeWidth="3" />
              <path d="M200 45 L210 258" stroke="#2C333F" strokeWidth="3" />
              {/* town pins */}
              {[
                [150, 90, "Milton"],
                [230, 110, "Pace"],
                [190, 210, "Navarre"],
                [280, 200, "Gulf Breeze"],
              ].map(([x, y, name]) => (
                <g key={name as string}>
                  <circle cx={x as number} cy={y as number} r="6" fill="#F2661F" />
                  <circle cx={x as number} cy={y as number} r="11" fill="none" stroke="#F5C518" strokeWidth="1.5" opacity="0.6" />
                  <text
                    x={(x as number) + 14}
                    y={(y as number) + 4}
                    fill="#AEB6C2"
                    fontSize="13"
                    fontFamily="var(--font-inter)"
                  >
                    {name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          {/* NOTE: swap this SVG for a real embedded map (Google Maps / Mapbox) before launch. */}
        </div>
      </div>
    </section>
  );
}
