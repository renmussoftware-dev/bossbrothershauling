import { PHOTOS, type SitePhoto } from "@/lib/sitePhotos";
import { Photo } from "./Photo";

/**
 * Real photographs from real jobs. Captions describe only what is in the
 * frame — nothing here is presented as a before/after pair, because these
 * were not shot as matching angles and implying otherwise reads as a trick.
 */
const SHOTS: SitePhoto[] = [
  PHOTOS.debrisPile,
  PHOTOS.loadedRig,
  PHOTOS.sideYard,
  PHOTOS.truckDriveway,
];

export function RecentWork() {
  return (
    <section id="work" className="relative py-20 sm:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-white/5" />
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="label-kicker">On the job</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
            What a load actually looks like.
          </h2>
          <p className="mt-4 text-lg text-ash">
            Our own photos from our own jobs — no stock pictures of someone
            else&rsquo;s truck.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SHOTS.map((shot) => (
            <li key={shot.base} className="panel overflow-hidden">
              <Photo
                photo={shot}
                sizes="(min-width: 1024px) 17rem, (min-width: 640px) 45vw, calc(100vw - 2.5rem)"
                className="aspect-[4/3] w-full object-cover"
              />
              {shot.caption && (
                <p className="px-5 py-4 text-sm text-ash">{shot.caption}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
