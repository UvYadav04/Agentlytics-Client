/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emits a minimal, self-contained `.next/standalone` server (only the
  // production node_modules a request actually needs, traced via webpack)
  // instead of requiring the full node_modules tree at runtime - see
  // Dockerfile's `runner` stage, which copies just that output rather than
  // `npm install`-ing again or shipping devDependencies into the image.
  output: "standalone",
};

export default nextConfig;
