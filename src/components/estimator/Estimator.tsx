"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { leadSchema, type LeadFormValues, timeframeOptions } from "@/lib/schema";
import { submitLead } from "@/lib/submitLead";
import { matchTripZone } from "@/lib/tripZones";
import type { LoadCategory } from "@/lib/types";
import { DumpBed, type JunkIcon } from "./DumpBed";
import { CATEGORY_OPTIONS } from "./loadOptions";

// ===========================================================================
// QUOTE REQUEST — three steps: what you've got → photos of it → how to reach
// you. The site deliberately shows NO dollar figures anywhere: photos come to
// us and one of the brothers calls back with an exact price. Nothing in here
// computes, formats, or displays money.
// ===========================================================================

const STEPS = ["Your load", "Photos", "Contact & pickup"] as const;

const MAX_PHOTOS = 8;
const MAX_PHOTO_MB = 10;

export function Estimator() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoNote, setPhotoNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const prevStep = useRef(0);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "done" | "done-mailto" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    mode: "onTouched",
    defaultValues: {
      categories: [],
      regularTires: 0,
      largeTires: 0,
      mattresses: 0,
      oversized: false,
      otherText: "",
      stagedReady: false,
    },
  });

  // --- Watched values feed the dump-bed visual + the lead payload ---
  const categories = (watch("categories") ?? []) as LoadCategory[];
  const regularTires = Number(watch("regularTires")) || 0;
  const largeTires = Number(watch("largeTires")) || 0;
  const mattresses = Number(watch("mattresses")) || 0;
  const oversized = !!watch("oversized");
  const otherText = watch("otherText") ?? "";
  const address = watch("address") ?? "";

  // Zone lookup from a static zip/city list — no distance API. Used to confirm
  // to the customer that they're in range, and to brief the call-back; the fee
  // it carries is business-side only and never rendered.
  const tripMatch = useMemo(() => matchTripZone(address), [address]);

  const hasSomething =
    categories.length > 0 ||
    regularTires > 0 ||
    largeTires > 0 ||
    mattresses > 0 ||
    oversized ||
    (otherText?.trim().length ?? 0) > 0;

  // Keep the step header in view when the step changes. Step contents differ
  // a lot in height (step 1 is tall, step 2 short), so on mobile the panel
  // shrinking would otherwise leave the viewport past the estimator entirely.
  // html's scroll-padding-top handles the sticky-nav offset.
  useEffect(() => {
    if (prevStep.current === step) return;
    prevStep.current = step;
    const el = controlsRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    // Only scroll when the header is actually out of comfortable view —
    // under the sticky nav, or below the top 40% of the viewport.
    if (top < 72 || top > window.innerHeight * 0.4) {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [step, reduce]);

  // Glyphs that surface in the dump bed
  const bedItems: JunkIcon[] = useMemo(() => {
    const list: JunkIcon[] = categories.map((c) => c as JunkIcon);
    if (regularTires > 0 || largeTires > 0) list.push("tires");
    if (mattresses > 0) list.push("mattress");
    return list;
  }, [categories, regularTires, largeTires, mattresses]);

  // --- Step navigation with per-step gating ---
  async function next() {
    if (step === 0 && !hasSomething) {
      await trigger("categories"); // surfaces the "tell us what you've got" error
      return;
    }
    // Photos (step 1) are encouraged, never required — some people are asking
    // from a desk, nowhere near the pile.
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function toggleCategory(value: LoadCategory) {
    const set = new Set(categories);
    set.has(value) ? set.delete(value) : set.add(value);
    setValue("categories", Array.from(set), { shouldValidate: true });
  }

  // --- Photos ---
  function addPhotos(files: FileList | null) {
    if (!files) return;
    const all = Array.from(files);
    const incoming = all.filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_PHOTO_MB * 1024 * 1024,
    );
    setPhotos((prev) => {
      const merged = [...prev, ...incoming].slice(0, MAX_PHOTOS);
      // Say why a file didn't make it, instead of dropping it silently.
      const notes: string[] = [];
      const rejected = all.length - incoming.length;
      if (rejected > 0) {
        notes.push(
          `${rejected} file${rejected > 1 ? "s" : ""} skipped — photos only, up to ${MAX_PHOTO_MB} MB each.`,
        );
      }
      if (prev.length + incoming.length > MAX_PHOTOS) {
        notes.push(`We keep the first ${MAX_PHOTOS} photos.`);
      }
      setPhotoNote(notes.join(" "));
      return merged;
    });
  }
  function removePhoto(idx: number) {
    setPhotoNote("");
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  // --- Submit ---
  // Static-host submission: posts straight from the browser to the endpoint
  // configured in NEXT_PUBLIC_LEAD_ENDPOINT, or opens a pre-filled email
  // draft if no endpoint is set. See src/lib/submitLead.ts.
  const onSubmit = async (data: LeadFormValues) => {
    setSubmitState("submitting");
    try {
      const parsed = leadSchema.parse(data);
      const outcome = await submitLead({
        lead: parsed,
        tripZone: tripMatch,
        photos,
      });
      setSubmitState(outcome === "sent" ? "done" : "done-mailto");
    } catch {
      setSubmitState("error");
    }
  };

  if (submitState === "done" || submitState === "done-mailto") {
    return (
      <Confirmation
        viaMailto={submitState === "done-mailto"}
        hadPhotos={photos.length > 0}
      />
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
        {/* ---------- Visual / dump bed side ---------- */}
        <div className="relative border-b border-white/5 bg-onyx-2/60 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <p className="label-kicker">Your load</p>
          <DumpBed items={bedItems} className="mx-auto mt-4 w-full max-w-md" />
          <WhatHappensNext photoCount={photos.length} />
        </div>

        {/* ---------- Controls side ---------- */}
        <div ref={controlsRef} className="p-6 sm:p-8">
          <StepHeader step={step} />

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                {/* ===== STEP 0 — LOAD BUILDER ===== */}
                {step === 0 && (
                  <fieldset className="space-y-5">
                    <legend className="font-display text-2xl text-bone">
                      What&rsquo;s in your load?
                    </legend>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {CATEGORY_OPTIONS.map((opt) => {
                        const active = categories.includes(opt.value);
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => toggleCategory(opt.value)}
                            aria-pressed={active}
                            className={`rounded-xl border p-4 text-left transition ${
                              active
                                ? "border-gold-500 bg-gold-500/10"
                                : "border-white/10 bg-char-2/40 hover:border-white/25"
                            }`}
                          >
                            <span className="block font-display text-lg text-bone">
                              {opt.label}
                            </span>
                            <span className="mt-1 block text-sm text-ash">
                              {opt.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Tires */}
                    <div className="rounded-xl border border-white/10 bg-char-2/40 p-4">
                      <p className="font-display text-lg text-bone">Tires?</p>
                      <div className="mt-3 grid gap-4 sm:grid-cols-2">
                        <QtyField
                          label="Regular (car / truck)"
                          {...register("regularTires")}
                          value={regularTires}
                          onStep={(d) =>
                            setValue(
                              "regularTires",
                              Math.max(0, regularTires + d),
                            )
                          }
                        />
                        <QtyField
                          label="Large (semi / racing)"
                          {...register("largeTires")}
                          value={largeTires}
                          onStep={(d) =>
                            setValue("largeTires", Math.max(0, largeTires + d))
                          }
                        />
                      </div>
                    </div>

                    {/* Mattress + oversized (special handling) */}
                    <div className="rounded-xl border border-white/10 bg-char-2/40 p-4 space-y-3">
                      <QtyField
                        label="Mattresses (special handling)"
                        {...register("mattresses")}
                        value={mattresses}
                        onStep={(d) =>
                          setValue("mattresses", Math.max(0, mattresses + d))
                        }
                      />
                      <label className="flex items-center gap-3 text-sm text-ash">
                        <input
                          type="checkbox"
                          {...register("oversized")}
                          className="h-5 w-5 accent-gold-500"
                        />
                        I&rsquo;ve got an oversized / hard-to-handle item
                        (hot tub, piano, big appliance)
                      </label>
                    </div>

                    {/* Something else */}
                    <div>
                      <label
                        htmlFor="otherText"
                        className="mb-1 block text-sm font-medium text-ash"
                      >
                        Something else, or not sure? Tell us what you&rsquo;ve got.
                      </label>
                      <textarea
                        id="otherText"
                        rows={2}
                        {...register("otherText")}
                        placeholder="e.g. old shed, a pile of fencing, storage unit cleanout…"
                        className={inputCls}
                      />
                    </div>

                    {errors.categories && (
                      <p className="text-sm text-alert">
                        {errors.categories.message}
                      </p>
                    )}
                  </fieldset>
                )}

                {/* ===== STEP 1 — PHOTOS ===== */}
                {step === 1 && (
                  <div className="space-y-5">
                    <h3 className="font-display text-2xl text-bone">
                      Show us the pile
                    </h3>
                    <p className="text-sm text-ash">
                      A couple of quick pictures tell us more than any form can.
                      We look at them, then call you with an exact price — no
                      guessing, no surprise charges on pickup day.
                    </p>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        addPhotos(e.dataTransfer.files);
                      }}
                      className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
                        dragging
                          ? "border-gold-500 bg-gold-500/10"
                          : "border-gold-300/40 bg-gold-300/5"
                      }`}
                    >
                      <CameraGlyph />
                      <p className="mt-3 font-display text-lg text-bone">
                        Add photos of what you need gone
                      </p>
                      <p className="mt-1 text-sm text-ash">
                        Up to {MAX_PHOTOS} photos, {MAX_PHOTO_MB} MB each. Drag
                        them here, or use the button — on a phone you can shoot
                        one right now.
                      </p>
                      <label className="btn-primary mt-4 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            addPhotos(e.target.files);
                            e.target.value = ""; // let the same file re-add
                          }}
                        />
                        {photos.length > 0 ? "Add more photos" : "Choose photos"}
                      </label>

                      {photos.length > 0 && (
                        <ul className="mt-5 flex flex-wrap justify-center gap-2">
                          {photos.map((f, i) => (
                            <li key={`${f.name}-${i}`}>
                              <PhotoThumb
                                file={f}
                                onRemove={() => removePhoto(i)}
                              />
                            </li>
                          ))}
                        </ul>
                      )}

                      {photos.length > 0 && (
                        <p className="mt-3 text-sm text-gold-300" role="status">
                          {photos.length} photo{photos.length > 1 ? "s" : ""}{" "}
                          ready to send
                        </p>
                      )}
                      {photoNote && (
                        <p className="mt-2 text-sm text-alert" role="status">
                          {photoNote}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-char-2/40 p-4">
                      <p className="font-display text-lg text-bone">
                        What helps us most
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm text-ash">
                        {[
                          "One wide shot with the whole pile in frame.",
                          "A close-up of anything heavy or awkward — appliances, a hot tub, a piano.",
                          "The spot the truck would back into, if it's tight.",
                        ].map((tip) => (
                          <li key={tip} className="flex gap-2">
                            <span aria-hidden className="text-gold-300">
                              •
                            </span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-sm text-ash">
                      No photos handy? Skip this step — we&rsquo;ll ask a few
                      questions when we call you back.
                    </p>
                  </div>
                )}

                {/* ===== STEP 2 — CONTACT + SUBMIT ===== */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-display text-2xl text-bone">
                      Where are we hauling from?
                    </h3>

                    <Field label="Name" error={errors.name?.message}>
                      <input
                        {...register("name")}
                        className={inputCls}
                        autoComplete="name"
                        placeholder="First & last name"
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Phone" error={errors.phone?.message}>
                        <input
                          {...register("phone")}
                          className={inputCls}
                          type="tel"
                          autoComplete="tel"
                          placeholder="(850) 281-5184"
                        />
                      </Field>
                      <Field label="Email" error={errors.email?.message}>
                        <input
                          {...register("email")}
                          className={inputCls}
                          type="email"
                          autoComplete="email"
                          placeholder="you@email.com"
                        />
                      </Field>
                    </div>

                    <Field
                      label="Pickup address"
                      error={errors.address?.message}
                    >
                      <input
                        {...register("address")}
                        className={inputCls}
                        autoComplete="street-address"
                        placeholder="Street, city (Milton, Pace, Navarre…)"
                      />
                      {tripMatch && (
                        <span
                          className="mt-1.5 flex items-center gap-1.5 text-sm text-gold-300"
                          role="status"
                        >
                          <span aria-hidden>✓</span> {tripMatch.place} — in our
                          service area.
                        </span>
                      )}
                    </Field>

                    <Field
                      label="When do you need it gone?"
                      error={errors.timeframe?.message}
                    >
                      <select
                        {...register("timeframe")}
                        className={inputCls}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Choose a timeframe…
                        </option>
                        {timeframeOptions.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <div className="rounded-xl border border-white/10 bg-char-2/40 p-4 text-sm">
                      {photos.length > 0 ? (
                        <p className="text-ash">
                          <span className="font-display text-base text-gold-300">
                            {photos.length} photo{photos.length > 1 ? "s" : ""}
                          </span>{" "}
                          will be sent with your request.
                        </p>
                      ) : (
                        <p className="text-ash">
                          No photos attached yet.{" "}
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-gold-300 underline underline-offset-2"
                          >
                            Add a couple
                          </button>{" "}
                          — it&rsquo;s the fastest way to an accurate quote.
                        </p>
                      )}
                    </div>

                    {/* Staging policy acknowledgment — required to submit */}
                    <div className="rounded-xl border border-white/10 bg-char-2/40 p-4">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          {...register("stagedReady")}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-gold-500"
                        />
                        <span className="text-sm text-bone">
                          I&rsquo;ll have everything pulled out and piled where
                          the truck can reach it — driveway, curb, or carport —
                          by pickup time.
                        </span>
                      </label>
                      <p className="mt-2 pl-8 text-xs text-ash">
                        For safety and insurance reasons our crew loads from
                        your pile — we can&rsquo;t dig items out of garages,
                        attics, or rooms inside the house.
                      </p>
                      {errors.stagedReady && (
                        <p className="mt-2 pl-8 text-sm text-alert">
                          {errors.stagedReady.message}
                        </p>
                      )}
                    </div>

                    {submitState === "error" && (
                      <p className="text-sm text-alert">
                        Something went wrong sending that. Give us a call and
                        we&rsquo;ll sort it out.
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ---------- Step controls ---------- */}
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button type="button" onClick={back} className="btn-ghost">
                  ← Back
                </button>
              ) : (
                <span />
              )}

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className="btn-primary">
                  {step === 1 && photos.length === 0 ? "Skip for now" : "Continue"}
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitState === "submitting"}
                >
                  {submitState === "submitting"
                    ? "Sending…"
                    : "Send my request"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

const inputCls =
  "w-full rounded-xl border border-white/10 bg-onyx px-4 py-3 text-bone placeholder:text-ash/50 focus:border-gold-300 focus:outline-none";

function StepHeader({ step }: { step: number }) {
  return (
    <div>
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-sm ${
                i <= step
                  ? "bg-gold-500 text-onyx"
                  : "bg-char-2 text-ash"
              }`}
            >
              {i + 1}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={`h-0.5 flex-1 rounded ${
                  i < step ? "bg-gold-500" : "bg-char-2"
                }`}
              />
            )}
          </li>
        ))}
      </ol>
      <p className="mt-3 label-kicker">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>
    </div>
  );
}

/** Replaces the old live-estimate readout: how the quote actually happens. */
function WhatHappensNext({ photoCount }: { photoCount: number }) {
  const steps = [
    "Send us your list and a few photos.",
    "One of the brothers looks them over.",
    "We call you with an exact price — before we haul anything.",
  ];
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-onyx/70 p-4">
      <p className="label-kicker">What happens next</p>
      <ol className="mt-3 space-y-2.5">
        {steps.map((label, i) => (
          <li key={label} className="flex gap-3 text-sm text-ash">
            <span
              aria-hidden
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-char-2 font-display text-xs text-gold-300"
            >
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <p className="mt-3 border-t border-white/5 pt-3 text-xs text-ash/80">
        {photoCount > 0
          ? `${photoCount} photo${photoCount > 1 ? "s" : ""} attached — that's what we quote from.`
          : "No online guesses and no surprise charges: your price comes from a real person, on a real call."}
      </p>
    </div>
  );
}

/** Camera mark for the photo drop zone. */
function CameraGlyph() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      className="mx-auto"
      aria-hidden
      fill="none"
      stroke="#D4A537"
      strokeWidth="1.4"
      strokeLinejoin="round"
    >
      <path d="M3 8.5h3.2l1.4-2.2h8.8l1.4 2.2H21v10H3z" />
      <circle cx="12" cy="13.2" r="3.6" />
    </svg>
  );
}

// number field with +/- steppers; forwards RHF's register props to the input
function QtyField({
  label,
  value,
  onStep,
  ...register
}: {
  label: string;
  value: number;
  onStep: (delta: number) => void;
} & React.ComponentPropsWithoutRef<"input">) {
  return (
    <div>
      <span className="mb-1 block text-sm text-ash">{label}</span>
      <div className="flex items-stretch overflow-hidden rounded-lg border border-white/10">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onStep(-1)}
          className="grid w-11 place-items-center bg-char-2 text-lg text-bone hover:bg-char"
        >
          −
        </button>
        <input
          {...register}
          inputMode="numeric"
          className="w-full min-w-0 bg-onyx px-2 text-center tabular-nums text-bone focus:outline-none"
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onStep(1)}
          className="grid w-11 place-items-center bg-char-2 text-lg text-bone hover:bg-char"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ash">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-alert">{error}</span>}
    </label>
  );
}

function PhotoThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && <img src={url} alt={file.name} className="h-full w-full object-cover" />}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute right-0 top-0 grid h-5 w-5 place-items-center bg-onyx/80 text-xs text-bone"
      >
        ✕
      </button>
    </div>
  );
}

function Confirmation({
  viaMailto,
  hadPhotos,
}: {
  viaMailto: boolean;
  hadPhotos: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // The confirmation is far shorter than the form it replaces — re-anchor the
  // viewport so the user actually sees it instead of whatever slid up.
  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, [reduce]);

  return (
    <div ref={ref} className="panel p-8 text-center sm:p-12">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold-500 text-3xl text-onyx">
        ✓
      </div>
      <h3 className="mt-5 font-display text-3xl text-bone">
        {viaMailto
          ? "Almost there — hit send on that email."
          : "Got it — you’re on the board."}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-ash">
        {viaMailto ? (
          <>
            Your email app just opened with your request filled in.
            {hadPhotos && (
              <> Don&rsquo;t forget to attach your photos before sending —
              they&rsquo;re what we quote from.</>
            )}{" "}
            Once it&rsquo;s sent, one of the brothers will call you with your
            price and a pickup window.
          </>
        ) : (
          <>
            One of the brothers will look at what you sent and call you with
            your price and a pickup window — usually within a few hours, same
            day for morning requests. Keep an eye on your phone.
          </>
        )}
      </p>
      <p className="mx-auto mt-6 max-w-sm text-xs text-ash/80">
        You&rsquo;ll hear the price from us directly, and you can say no — there
        is nothing to pay and nothing to sign until you agree to it.
      </p>
      <p className="mx-auto mt-2 max-w-sm text-xs text-ash/80">
        Before we arrive, have everything pulled out and piled where the truck
        can reach it — driveway, curb, or carport.
      </p>
    </div>
  );
}
