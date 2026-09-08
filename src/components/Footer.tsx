import { SITE, telHref } from "@/lib/site";
import { BossLogo } from "./Logo";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-gold-500/20 bg-onyx-2">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <BossLogo size="md" />
          <p className="mt-3 max-w-xs text-sm text-ash">
            Family-run junk removal & hauling for {SITE.serviceArea}. We show up,
            we do the lifting, we haul it off.
          </p>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-wider text-gold-300">Get in touch</h4>
          <ul className="mt-3 space-y-2 text-sm text-ash">
            <li>
              <a href={telHref} className="hover:text-bone">
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-bone">
                {SITE.email}
              </a>
            </li>
            <li>{SITE.serviceArea}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-wider text-gold-300">Hours</h4>
          <ul className="mt-3 space-y-2 text-sm text-ash">
            {SITE.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span className="text-bone">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-wider text-gold-300">Follow</h4>
          <ul className="mt-3 space-y-2 text-sm text-ash">
            <li>
              <a href={SITE.social.facebook} className="hover:text-bone" target="_blank" rel="noreferrer">
                Facebook
              </a>
            </li>
            <li>
              <a href={SITE.social.instagram} className="hover:text-bone" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href={SITE.social.google} className="hover:text-bone" target="_blank" rel="noreferrer">
                Google Reviews
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ash/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>Estimates are not final prices — final cost is confirmed by landfill weight.</p>
        </div>
      </div>
    </footer>
  );
}
