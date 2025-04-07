"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * PostHog Provider Component
 *
 * This component initializes PostHog analytics and wraps the application to enable tracking.
 * It handles:
 * - PostHog initialization with project key and configuration
 * - Manual page view tracking
 * - Page leave tracking
 * - Automatic event capturing
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog with project configuration
    // api_host: The endpoint for sending analytics data
    // ui_host: The URL for the PostHog dashboard
    // capture_pageview: Disabled because we handle pageviews manually
    // capture_pageleave: Enabled to track when users leave the page
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      ui_host: "https://eu.posthog.com",
      capture_pageview: false, // We capture pageviews manually
      capture_pageleave: true, // Enable pageleave capture
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

/**
 * PostHog Page View Component
 *
 * Handles manual page view tracking in PostHog.
 * Captures the current URL including search parameters and sends it as a pageview event.
 */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      // Construct the full URL including search parameters
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += "?" + search;
      }
      // Send pageview event to PostHog with the current URL
      posthog.capture("$pageview", { $current_url: url });
      
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

/**
 * Suspended PostHog Page View Component
 *
 * Wraps the PostHogPageView component in a Suspense boundary to handle
 * any potential loading states during page view tracking.
 */
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
