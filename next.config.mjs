/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // PostHog Configuration
    // These environment variables define the endpoints for PostHog analytics
    // If not set, they default to the EU region endpoints
    const POSTHOG_HOST =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
    const POSTHOG_ASSETS_HOST =
      process.env.NEXT_PUBLIC_POSTHOG_ASSETS_HOST ||
      "https://eu-assets.i.posthog.com";

    // Configure URL rewrites for PostHog analytics
    // This allows PostHog to work behind firewalls and ad blockers
    return [
      {
        // Rewrite static assets (JS, CSS, images) to PostHog's CDN
        source: "/ingest/static/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
      },
      {
        // Rewrite analytics events to PostHog's ingestion endpoint
        source: "/ingest/:path*",
        destination: `${POSTHOG_HOST}/:path*`,
      },
      {
        // Rewrite feature flag decisions to PostHog's decide endpoint
        source: "/ingest/decide",
        destination: `${POSTHOG_HOST}/decide`,
      },
    ];
  },
  // Required for PostHog's API endpoints that use trailing slashes
  // This ensures consistent URL handling for analytics requests
  skipTrailingSlashRedirect: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4|webm)$/,
      use: {
        loader: "file-loader",
        options: {
          publicPath: "/_next/static/videos/",
          outputPath: "static/videos/",
        },
      },
    });
    return config;
  },
};

export default nextConfig;
