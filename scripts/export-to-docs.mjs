// ---------------------------------------------------------------------------
// Copies the static export (./out) into ./docs for GitHub Pages.
//
// Usage:  npm run deploy:docs   (runs `next build` first — see package.json)
//
// GitHub Pages is configured to serve from /docs on the main branch, matching
// the other Renmus Software sites. Commit the refreshed /docs after running.
// ---------------------------------------------------------------------------
import { cpSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
const docs = join(root, "docs");

if (!existsSync(out)) {
  console.error("No ./out folder found — run `next build` first (npm run deploy:docs does both).");
  process.exit(1);
}

// Fresh copy so deleted pages/assets don't linger in /docs.
rmSync(docs, { recursive: true, force: true });
cpSync(out, docs, { recursive: true });

// Belt-and-suspenders: Pages needs these even if the copy ever misses dotfiles.
writeFileSync(join(docs, ".nojekyll"), "");
writeFileSync(join(docs, "CNAME"), "bossbrothershauling.com");

console.log("✓ Copied ./out → ./docs (CNAME + .nojekyll in place). Commit /docs to publish.");
