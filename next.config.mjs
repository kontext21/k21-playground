/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const POSTHOG_HOST =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
    const POSTHOG_ASSETS_HOST =
      process.env.NEXT_PUBLIC_POSTHOG_ASSETS_HOST ||
      "https://eu-assets.i.posthog.com";

    return [
      {
        source: "/ingest/static/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: `${POSTHOG_HOST}/:path*",
      },
      {
        source: "/ingest/decide",
        destination: `${POSTHOG_HOST}/decide",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
