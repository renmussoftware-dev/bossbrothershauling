"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { leadSchema, type LeadFormValues, timeframeOptions } from "@/lib/schema";
import { calculateEstimate, formatEstimateRange } from "@/lib/pricing";
import { submitLead } from "@/lib/submitLead";
import type { EstimateInput, LoadCategory } from "@/lib/types";
import { DumpBed, type JunkIcon } from "./DumpBed";
import { CATEGORY_OPTIONS, LOAD_SIZE_OPTIONS } from "./loadOptions";

const STEPS = ["Your load", "Load size", "Your estimate", "Book it"] as const;

const MAX_PHOTOS = 8;
const MAX_PHOTO_MB = 10;

export function Estimator() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
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
    },
  });

  // --- Watched values feed the live estimate + the dump-bed visual ---
  const categories = (watch("categories") ?? []) as LoadCategory[];
  const regularTires = Number(watch("regularTires")) || 0;
  const largeTires = Number(watch("largeTires")) || 0;
  const mattresses = Number(watch("mattresses")) || 0;
  const oversized = !!watch("oversized");
  const otherText = watch("otherText") ?? "";
  const loadSize = watch("loadSize");

  const hasSomething =
    categories.length > 0 ||
    regularTires > 0 ||
    largeTires > 0 ||
    mattresses > 0 ||
    oversized ||
    (otherText?.trim().length ?? 0) > 0;

  // Glyphs that surface in the dump bed
  const bedItems: JunkIcon[] = useMemo(() => {
    const list: JunkIcon[] = categories.map((c) => c as JunkIcon);
    if (regularTires > 0 || largeTires > 0) list.push("tires");
    if (mattresses > 0) list.push("mattress");
    return list;
  }, [categories, regularTires, largeTires, mattresses]);

  // Live estimate (only meaningful once a load size is picked)
  const estimate = useMemo(() => {
    if (!loadSize) return null;
    const input: EstimateInput = {
      categories,
      regularTires,
      largeTires,
      mattresses,
      oversized,
      loadSize,
    };
    return calculateEstimate(input);
  }, [categories, regularTires, largeTires, mattresses, oversized, loadSize]);

  // --- Step navigation with per-step gating ---
  async function next() {
    if (step === 0 && !hasSomething) {
      await trigger("categories"); // surfaces the "add at least one item" error
      return;
    }
    if (step === 1 && !loadSize) return;
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
    const incoming = Array.from(files).filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_PHOTO_MB * 1024 * 1024,
    );
    setPhotos((prev) => [...prev, ...incoming].slice(0, MAX_PHOTOS));
  }
  function removePhoto(idx: number) {
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
        estimateLow: estimate?.low ?? null,
        estimateHigh: estimate?.high ?? null,
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
        estimate={estimate}
        viaMailto={submitState === "done-mailto"}
        hadPhotos={photos.length > 0}
      />
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
        {/* ---------- Visual / dump bed side ---------- */}
        <div className="relative border-b border-white/5 bg-asphalt-2/60 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <p className="label-kicker">Build your load</p>
          <DumpBed
            loadSize={loadSize ?? null}
            items={bedItems}
            className="mx-auto mt-4 w-full max-w-md"
          />
          <LiveEstimate estimate={estimate} loadSize={loadSize} />
        </div>

        {/* ---------- Controls side ---------- */}
        <div className="p-6 sm:p-8">
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
                    <legend className="font-display text-2xl text-paper">
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
                                ? "border-haz-orange bg-haz-orange/10"
                                : "border-white/10 bg-steel-2/40 hover:border-white/25"
                            }`}
                          >
                            <span className="block font-display text-lg text-paper">
                              {opt.label}
                            </span>
                            <span className="mt-1 block text-sm text-concrete">
                              {opt.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Tires */}
                    <div className="rounded-xl border border-white/10 bg-steel-2/40 p-4">
                      <p className="font-display text-lg text-paper">Tires?</p>
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
                    <div className="rounded-xl border border-white/10 bg-steel-2/40 p-4 space-y-3">
                      <QtyField
                        label="Mattresses (special handling)"
                        {...register("mattresses")}
                        value={mattresses}
                        onStep={(d) =>
                          setValue("mattresses", Math.max(0, mattresses + d))
                        }
                      />
                      <label className="flex items-center gap-3 text-sm text-concrete">
                        <input
                          type="checkbox"
                          {...register("oversized")}
                          className="h-5 w-5 accent-haz-orange"
                        />
                        I&rsquo;ve got an oversized / hard-to-handle item
                        (hot tub, piano, big appliance)
                      </label>
                    </div>

                    {/* Something else */}
                    <div>
                      <label
                        htmlFor="otherText"
                        className="mb-1 block text-sm font-medium text-concrete"
                      >
                        Something else, or not sure? Tell us what you&rsquo;ve got.
                      </label>
                      <textarea
                        id="otherText"
                        rows={2}
                        {...register("otherText")}
                        placeholder="e.g. old shed, a pile of fencing, garage cleanout…"
                        className={inputCls}
                      />
                    </div>

                    {errors.categories && (
                      <p className="text-sm text-haz-orange">
                        {errors.categories.message}
                      </p>
                    )}
                  </fieldset>
                )}

                {/* ===== STEP 1 — LOAD SIZE ===== */}
                {step === 1 && (
                  <fieldset className="space-y-4">
                    <legend className="font-display text-2xl text-paper">
                      How big is the pile?
                    </legend>
                    <p className="text-sm text-concrete">
                      Pick the closest fit — watch the bed fill up. We confirm the
                      exact size on-site.
                    </p>
                    <div className="grid gap-3">
                      {LOAD_SIZE_OPTIONS.map((opt) => {
                        const active = loadSize === opt.value;
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() =>
                              setValue("loadSize", opt.value, {
                                shouldValidate: true,
                              })
                            }
                            aria-pressed={active}
                            className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                              active
                                ? "border-haz-orange bg-haz-orange/10"
                                : "border-white/10 bg-steel-2/40 hover:border-white/25"
                            }`}
                          >
                            <span>
                              <span className="block font-display text-lg text-paper">
                                {opt.label}
                              </span>
                              <span className="mt-1 block text-sm text-concrete">
                                {opt.blurb}
                              </span>
                            </span>
                            <span
                              aria-hidden
                              className={`ml-3 h-5 w-5 shrink-0 rounded-full border-2 ${
                                active
                                  ? "border-haz-orange bg-haz-orange"
                                  : "border-white/30"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                {/* ===== STEP 2 — ESTIMATE REVEAL ===== */}
                {step === 2 && estimate && (
                  <div className="space-y-5">
                    <h3 className="font-display text-2xl text-paper">
                      Your estimate
                    </h3>
                    <div className="rounded-2xl border border-haz-yellow/40 bg-asphalt-2 p-6 text-center">
                      <p className="label-kicker">Estimated range</p>
                      <p className="mt-2 font-display text-5xl font-bold tabular-nums text-haz-yellow">
                        {formatEstimateRange(estimate)}
                      </p>
                      <p className="mt-1 text-sm text-concrete">
                        for a {estimate.loadSizeLabel.toLowerCase()}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-steel-2/40 p-4 text-sm text-concrete">
                      <p className="font-semibold text-paper">
                        Why a range, not one number?
                      </p>
                      <p className="mt-1">
                        Your final price comes from the actual weight of your load
                        at the landfill scale — it can&rsquo;t be guessed exactly
                        from a form. We lock in your price on-site, or from photos
                        you send, before we haul a thing.
                      </p>
                      {estimate.hasSpecialHandling && (
                        <p className="mt-2 text-haz-yellow">
                          Heads up: mattresses and oversized items carry a
                          special-handling fee at the dump — that&rsquo;s baked
                          into this range.
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-concrete/80">
                      This is an estimate, not a final or guaranteed price.
                    </p>
                  </div>
                )}

                {/* ===== STEP 3 — CONTACT + SUBMIT ===== */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-display text-2xl text-paper">
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
                          placeholder="(850) 737-0360"
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

                    {/* Photo upload — optional but strongly encouraged */}
                    <div className="rounded-xl border border-dashed border-haz-yellow/40 bg-haz-yellow/5 p-4">
                      <p className="font-display text-lg text-paper">
                        Add photos{" "}
                        <span className="text-sm font-normal text-haz-yellow">
                          (optional, but the #1 way to lock in an accurate price)
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-concrete">
                        A couple of quick pics of the pile tells us way more than
                        any form can.
                      </p>
                      <label className="btn-secondary mt-3 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={(e) => addPhotos(e.target.files)}
                        />
                        Choose photos
                      </label>
                      {photos.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {photos.map((f, i) => (
                            <li key={i}>
                              <PhotoThumb
                                file={f}
                                onRemove={() => removePhoto(i)}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {estimate && (
                      <div className="rounded-xl bg-steel-2/50 p-3 text-center text-sm text-concrete">
                        Your estimate:{" "}
                        <span className="font-display text-base text-haz-yellow">
                          {formatEstimateRange(estimate)}
                        </span>{" "}
                        · {estimate.loadSizeLabel}
                      </div>
                    )}

                    {submitState === "error" && (
                      <p className="text-sm text-haz-orange">
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
                <button
                  type="button"
                  onClick={next}
                  className="btn-primary"
                  disabled={step === 1 && !loadSize}
                >
                  {step === 2 ? "Looks good — book it" : "Continue"}
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitState === "submitting"}
                >
                  {submitState === "submitting" ? "Sending…" : "Get my quote"}
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
  "w-full rounded-xl border border-white/10 bg-asphalt px-4 py-3 text-paper placeholder:text-concrete/50 focus:border-haz-yellow focus:outline-none";

function StepHeader({ step }: { step: number }) {
  return (
    <div>
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-sm ${
                i <= step
                  ? "bg-haz-orange text-asphalt"
                  : "bg-steel-2 text-concrete"
              }`}
            >
              {i + 1}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={`h-0.5 flex-1 rounded ${
                  i < step ? "bg-haz-orange" : "bg-steel-2"
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

function LiveEstimate({
  estimate,
  loadSize,
}: {
  estimate: ReturnType<typeof calculateEstimate> | null;
  loadSize: string | undefined;
}) {
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-asphalt/70 p-4 text-center">
      {estimate ? (
        <>
          <p className="label-kicker">Live estimate</p>
          <p className="font-display text-3xl font-bold tabular-nums text-haz-yellow">
            {formatEstimateRange(estimate)}
          </p>
          <p className="text-xs text-concrete">
            Estimate only — final price confirmed on-site.
          </p>
        </>
      ) : (
        <p className="text-sm text-concrete">
          {loadSize
            ? "Calculating…"
            : "Pick a load size to see your estimate."}
        </p>
      )}
    </div>
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
      <span className="mb-1 block text-sm text-concrete">{label}</span>
      <div className="flex items-stretch overflow-hidden rounded-lg border border-white/10">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onStep(-1)}
          className="grid w-11 place-items-center bg-steel-2 text-lg text-paper hover:bg-steel"
        >
          −
        </button>
        <input
          {...register}
          inputMode="numeric"
          className="w-full min-w-0 bg-asphalt px-2 text-center tabular-nums text-paper focus:outline-none"
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onStep(1)}
          className="grid w-11 place-items-center bg-steel-2 text-lg text-paper hover:bg-steel"
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
      <span className="mb-1 block text-sm font-medium text-concrete">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-haz-orange">{error}</span>}
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
        className="absolute right-0 top-0 grid h-5 w-5 place-items-center bg-asphalt/80 text-xs text-paper"
      >
        ✕
      </button>
    </div>
  );
}

function Confirmation({
  estimate,
  viaMailto,
  hadPhotos,
}: {
  estimate: ReturnType<typeof calculateEstimate> | null;
  viaMailto: boolean;
  hadPhotos: boolean;
}) {
  return (
    <div className="panel p-8 text-center sm:p-12">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-haz-orange text-3xl text-asphalt">
        ✓
      </div>
      <h3 className="mt-5 font-display text-3xl text-paper">
        {viaMailto
          ? "Almost there — hit send on that email."
          : "Got it — you’re on the board."}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-concrete">
        {viaMailto ? (
          <>
            Your email app just opened with your quote request filled in.
            {hadPhotos && (
              <> Don&rsquo;t forget to attach your photos before sending —
              they&rsquo;re the fastest way to a firm price.</>
            )}{" "}
            Once it&rsquo;s sent, one of the brothers will get back to you with a
            confirmed price and pickup window.
          </>
        ) : (
          <>
            One of the brothers will confirm your price and pickup window within
            a few hours (same day for morning requests). Keep an eye on your
            phone.
          </>
        )}
      </p>
      {estimate && (
        <p className="mt-5 inline-block rounded-xl bg-steel-2/60 px-5 py-3">
          <span className="label-kicker">Your estimate</span>
          <br />
          <span className="font-display text-2xl text-haz-yellow">
            {formatEstimateRange(estimate)}
          </span>
        </p>
      )}
      <p className="mx-auto mt-6 max-w-sm text-xs text-concrete/80">
        Reminder: this is an estimate. Your exact price is confirmed from the
        landfill weight before we haul anything.
      </p>
    </div>
  );
}
