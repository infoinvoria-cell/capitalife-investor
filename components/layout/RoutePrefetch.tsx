"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const routes = ["/", "/track-record", "/zukunft", "/sicherheit", "/strategie"];

export function RoutePrefetch() {
  const router = useRouter();

  useEffect(() => {
    const prefetchRoutes = () => {
      routes.forEach((route) => router.prefetch(route));
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(prefetchRoutes, { timeout: 1200 });

      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(prefetchRoutes, 150);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return null;
}
