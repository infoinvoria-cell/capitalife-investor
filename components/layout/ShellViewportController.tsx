"use client";

import { useEffect } from "react";

export function ShellViewportController() {
  useEffect(() => {
    const root = document.documentElement;
    const nav = document.querySelector<HTMLElement>(".bottom-nav");

    if (!nav) {
      return;
    }

    const updateViewport = () => {
      const navHeight = nav.offsetHeight;
      root.style.setProperty("--bottom-nav-height", `${navHeight}px`);
      root.style.setProperty("--bottom-nav-offset", `${navHeight + 16}px`);
    };

    const frame = window.requestAnimationFrame(updateViewport);
    window.addEventListener("load", updateViewport);
    window.addEventListener("resize", updateViewport);

    const resizeObserver = new ResizeObserver(updateViewport);
    resizeObserver.observe(nav);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("load", updateViewport);
      window.removeEventListener("resize", updateViewport);
      resizeObserver.disconnect();
    };
  }, []);

  return null;
}
