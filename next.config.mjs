/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/architecture", destination: "/about", permanent: true }];
  },
};

export default nextConfig;
