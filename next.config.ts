import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["tesseract.js", "@napi-rs/canvas", "pdfjs-dist"],
  // Tesseract starts its OCR worker from a file path built at runtime, and that worker loads the
  // OCR engine (.wasm) the same way, so Vercel's tracing misses them. List them here so they ship.
  // eng.traineddata in the project root is the OCR language model; shipping it avoids a 5MB
  // download from a CDN on every cold start.
  outputFileTracingIncludes: {
    "/api/inngest": [
      "./eng.traineddata",
      "./node_modules/.pnpm/tesseract.js@*/node_modules/**/*",
      "./node_modules/.pnpm/tesseract.js-core@*/node_modules/**/*",
      "./node_modules/.pnpm/bmp-js@*/node_modules/**/*",
      "./node_modules/.pnpm/idb-keyval@*/node_modules/**/*",
      "./node_modules/.pnpm/is-url@*/node_modules/**/*",
      "./node_modules/.pnpm/node-fetch@2*/node_modules/**/*",
      "./node_modules/.pnpm/whatwg-url@*/node_modules/**/*",
      "./node_modules/.pnpm/tr46@*/node_modules/**/*",
      "./node_modules/.pnpm/webidl-conversions@*/node_modules/**/*",
      "./node_modules/.pnpm/regenerator-runtime@*/node_modules/**/*",
      "./node_modules/.pnpm/wasm-feature-detect@*/node_modules/**/*",
      "./node_modules/.pnpm/zlibjs@*/node_modules/**/*",
    ],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
