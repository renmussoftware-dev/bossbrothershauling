const STEPS = [
  {
    n: 1,
    title: "Submit your load",
    body: "Tell us what you've got and how big the pile is — snap a couple photos while you're at it. Takes about a minute.",
  },
  {
    n: 2,
    title: "Get a price",
    body: "See an honest estimate range on the spot, then we confirm your exact price from photos or on-site before we touch a thing.",
  },
  {
    n: 3,
    title: "We haul it away",
    body: "Have your pile pulled out where the truck can reach it — driveway, curb, or carport. We show up, do all the lifting and loading from there, and haul it off. You're done.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-20 sm:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-white/5" />
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="label-kicker">How it works</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
            Three steps. No surprises.
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="panel relative p-7">
              <span
                aria-hidden
                className="font-display text-6xl font-bold leading-none text-haz-orange/30"
              >
                {String(s.n).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-2xl">{s.title}</h3>
              <p className="mt-2 text-concrete">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
