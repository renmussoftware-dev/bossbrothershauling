import { Estimator } from "./estimator/Estimator";

export function EstimatorSection() {
  return (
    <section id="estimator" className="relative py-20 sm:py-24">
      {/* diagonal char band behind the tool for depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -inset-x-20 top-1/4 h-[60%] -rotate-3 bg-onyx-2/70" />
      </div>

      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-kicker">Free quote</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
            Show us the pile. We&rsquo;ll call with your price.
          </h2>
          <p className="mt-4 text-lg text-ash">
            Tell us what you&rsquo;ve got, send a few photos, and one of the
            brothers will call you back with an exact price. No online
            guesswork, and nothing to pay until you say yes.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <Estimator />
        </div>
      </div>
    </section>
  );
}
