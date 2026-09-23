// ---------------------------------------------------------------------------
// LEAD CAPTURE GUARD
//
// Why this exists: `submitLead.ts` reads NEXT_PUBLIC_LEAD_ENDPOINT, and Next
// inlines NEXT_PUBLIC_* values at BUILD time. The endpoint lives only in
// `.env.local`, which is gitignored. A build run anywhere that file is absent
// leaves `process.env.NEXT_PUBLIC_LEAD_ENDPOINT` as a runtime lookup resolving
// to `undefined` — and submitLead then SILENTLY falls back to a mailto draft.
//
// That shipped once (Sept 2026) and no lead reached Formspree until it was
// caught by hand. Nothing in the build complained. These two checks make that
// failure impossible to ship quietly:
//
//   assertLeadEndpointConfigured()  — input:  is the endpoint set and sane?
//   assertEndpointInBundle()        — output: did it actually get inlined?
//
// The second matters because the first only proves the value existed; the bug
// that actually bit was about what landed in the emitted JavaScript.
// ---------------------------------------------------------------------------
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const ENV_KEY = "NEXT_PUBLIC_LEAD_ENDPOINT";
export const OPT_OUT = "ALLOW_MISSING_LEAD_ENDPOINT";

/**
 * Load .env files the same way Next does, so this works regardless of whether
 * the caller runs before or after Next's own env loading.
 */
export async function loadEnv(dir = process.cwd()) {
  const mod = await import("@next/env");
  // @next/env is CommonJS: under ESM the named export is undefined and the
  // real function hangs off `default`. Reaching for only one shape silently
  // yields `undefined` here, which would make this guard report "not set" on
  // a perfectly good build — a false alarm on every single build.
  const loadEnvConfig = mod.loadEnvConfig ?? mod.default?.loadEnvConfig;
  if (typeof loadEnvConfig !== "function") {
    throw new Error(
      "lead-endpoint-guard: could not resolve loadEnvConfig from @next/env. " +
        "Next may have changed its export shape — fix this rather than " +
        "skipping the check, or the guard will pass builds it should fail.",
    );
  }
  loadEnvConfig(dir, false, { info() {}, error() {} });
  return process.env[ENV_KEY];
}

/** Human-readable reason the value is unusable, or null if it's fine. */
export function validateEndpoint(raw) {
  if (raw === undefined || raw === null) return "is not set";
  const value = String(raw).trim();
  if (value === "") return "is set but empty";
  let url;
  try {
    url = new URL(value);
  } catch {
    return `is not a valid URL (got ${JSON.stringify(value)})`;
  }
  if (url.protocol !== "https:") {
    return `must be https (got ${url.protocol.replace(":", "")}) — the site is ` +
      `served over https, so a non-https POST is blocked as mixed content`;
  }
  return null;
}

function banner(lines) {
  const width = Math.max(...lines.map((l) => l.length));
  const rule = "=".repeat(Math.min(width, 78));
  return ["", rule, ...lines, rule, ""].join("\n");
}

/**
 * Fail the build when lead capture would silently degrade to mailto.
 * Set ALLOW_MISSING_LEAD_ENDPOINT=1 to build deliberately without it.
 */
export async function assertLeadEndpointConfigured({ dir = process.cwd() } = {}) {
  const raw = await loadEnv(dir);
  const problem = validateEndpoint(raw);
  if (!problem) return String(raw).trim();

  if (process.env[OPT_OUT]) {
    console.warn(
      banner([
        `WARNING: ${ENV_KEY} ${problem}.`,
        "",
        `${OPT_OUT} is set, so the build continues.`,
        "The quote form will open the visitor's email app instead of",
        "posting a lead. Nothing will reach Formspree.",
      ]),
    );
    return null;
  }

  throw new Error(
    banner([
      `Build stopped: ${ENV_KEY} ${problem}.`,
      "",
      "Without it every quote submission silently falls back to a mailto",
      "draft and NO lead reaches Formspree. This has shipped before.",
      "",
      "Fix: put the endpoint in .env.local at the repo root —",
      "",
      `  ${ENV_KEY}=https://formspree.io/f/YOUR_FORM_ID`,
      "",
      "(.env.local is gitignored, so it must exist on whichever machine",
      "runs the build. See .env.example.)",
      "",
      `To build without lead capture on purpose, set ${OPT_OUT}=1.`,
    ]),
  );
}

/** Every .js file under a directory, recursively. */
function jsFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...jsFiles(full));
    else if (entry.endsWith(".js")) out.push(full);
  }
  return out;
}

/**
 * Verify the endpoint literal actually made it into the emitted JavaScript.
 * This is the check that would have caught the original bug: the value was
 * present in the source but absent from the build.
 */
export function assertEndpointInBundle(buildDir, endpoint) {
  if (!endpoint) return { checked: 0, found: false, skipped: true };

  const files = jsFiles(join(buildDir, "_next"));
  const hit = files.find((f) => readFileSync(f, "utf8").includes(endpoint));
  if (hit) return { checked: files.length, found: true, file: hit };

  throw new Error(
    banner([
      "Publish stopped: the lead endpoint is NOT in the built JavaScript.",
      "",
      `Searched ${files.length} emitted .js files under ${join(buildDir, "_next")}`,
      `for: ${endpoint}`,
      "",
      "That means Next did not inline it and lead capture is dead in this",
      "build — submissions would fall back to a mailto draft.",
      "",
      `Most likely .env.local was missing when \`next build\` ran. Restore it`,
      "and rebuild before publishing.",
    ]),
  );
}
