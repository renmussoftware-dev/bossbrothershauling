/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Static export for GitHub Pages (served from /docs on main).
  // `next build` emits a fully static site into ./out — the
  // `npm run deploy:docs` script copies that into ./docs for Pages.
  output: "export",

  // No image optimization server exists on a static host.
  images: { unoptimized: true },
};

export default nextConfig;
