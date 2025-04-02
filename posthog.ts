"use strict"

import { PostHog } from "posthog-node";

/**
 * PostHog Client Configuration
 * 
 * Creates a server-side PostHog client instance for server-side analytics.
 * This client is used for:
 * - Server-side event tracking
 * - Feature flag evaluation
 * - User identification
 * 
 * Configuration options:
 * - host: The PostHog server endpoint (EU region)
 * - flushAt: Number of events to queue before sending (1 = immediate)
 * - flushInterval: Time in milliseconds to wait before sending events (0 = immediate)
 */
export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: "https://eu.i.posthog.com",
    flushAt: 1, // Send events immediately
    flushInterval: 0, // Don't wait to send events
  });
  return posthogClient;
}
