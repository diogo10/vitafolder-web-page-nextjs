import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shared Notes was intentionally sunset (see PR #14): redirect stale
  // /notes bookmarks/crawlers to home instead of serving a silent 404.
  async redirects() {
    return [
      { source: "/notes", destination: "/", permanent: true },
      { source: "/notes/:path*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
