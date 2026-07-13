import { Estimator } from "./estimator/Estimator";

export function EstimatorSection() {
  return (
    <section id="estimator" className="relative py-20 sm:py-24">
      {/* diagonal steel band behind the tool for depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -inset-x-20 top-1/4 h-[60%] -rotate-3 bg-asphalt-2/70" />
      </div>

      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-kicker">Instant estimate</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
            Build your load. See your price.
          </h2>
          <p className="mt-4 text-lg text-concrete">
            Pick what you&rsquo;ve got, choose how big the pile is, and watch the
            bed fill up. You&rsquo;ll get an honest estimate range in seconds — no
            phone tag required.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <Estimator />
        </div>
      </div>
    </section>
  );
}
