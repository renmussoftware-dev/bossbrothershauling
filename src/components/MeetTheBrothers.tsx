import { SITE, telHref } from "@/lib/site";
import { PHOTOS } from "@/lib/sitePhotos";
import { Photo } from "./Photo";

/**
 * Faces, placed above the estimator on purpose: the page asks for a phone
 * number and photos of someone's garage a moment later, and people hand those
 * over more readily once they've seen who turns up.
 *
 * Copy claims nothing that isn't verifiable — no years in business, no job
 * counts, no names the owners haven't published.
 */
export function MeetTheBrothers() {
  return (
    <section id="brothers" className="relative py-20 sm:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="label-kicker">Who shows up</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
            You get the brothers,
            <br />
            <span className="text-sheen">not a call center.</span>
          </h2>

          <p className="mt-5 max-w-md text-lg text-ash">
            Boss Brothers Hauling is two brothers and one truck. The person who
            looks at your photos and calls you back with a price is the same
            person who pulls into your driveway and does the lifting.
          </p>
          <p className="mt-4 max-w-md text-ash">
            No franchise dispatcher, no rotating crew of strangers, no
            &ldquo;starting at&rdquo; price that changes once we&rsquo;re
            standing in your yard. You&rsquo;ll know the number before we load a
            thing.
          </p>

          <p className="mt-6 font-brand text-xl tracking-wide text-gold-300">
            &ldquo;Boss work. Clean results.&rdquo;
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#estimator" className="btn-primary">
              Get my quote
            </a>
            <a href={telHref} className="btn-secondary">
              Call {SITE.phone}
            </a>
          </div>
        </div>

        {/* Photo cluster: the pair with the rig, plus a tighter second frame. */}
        <div className="grid gap-4">
          <div className="panel overflow-hidden p-2">
            <Photo
              photo={PHOTOS.brothersTruck}
              sizes="(min-width: 1024px) 34rem, calc(100vw - 2.5rem)"
              className="w-full rounded-xl object-cover"
            />
          </div>
          {/* Stacks below sm — side by side at 375px left the photo too small
              to make out two faces, which is the entire point of it. */}
          <div className="grid gap-4 sm:grid-cols-5">
            <div className="panel overflow-hidden p-2 sm:col-span-3">
              <Photo
                photo={PHOTOS.brothersHandshake}
                sizes="(min-width: 1024px) 20rem, (min-width: 640px) 60vw, calc(100vw - 2.5rem)"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            </div>
            <div className="flex flex-col justify-center sm:col-span-2">
              <p className="text-sm text-ash">
                Based in Navarre, working the whole Navarre&ndash;Milton
                corridor and the Gulf Breeze and Pensacola side.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
