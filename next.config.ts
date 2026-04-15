import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native / worker-heavy modules that webpack should NOT bundle
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
};

export default nextConfig;
