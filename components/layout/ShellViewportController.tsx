"use client";

import { useEffect } from "react";

export function ShellViewportController() {
  useEffect(() => {
    const root = document.documentElement;
    const nav = document.querySelector<HTMLElement>(".bottom-nav");
    const riskNote = document.querySelector<HTMLElement>(".risk-note");

    if (!nav) {
      return;
    }

    const updateViewport = () => {
      const navHeight = nav.offsetHeight;
      const riskHeight = riskNote?.offsetHeight ?? 0;
      root.style.setProperty("--bottom-nav-height", `${navHeight}px`);
      root.style.setProperty("--risk-note-height", `${riskHeight}px`);
      root.style.setProperty("--bottom-nav-offset", `${navHeight + 16}px`);
      root.style.setProperty("--overlay-stack-offset", `${navHeight + riskHeight + 24}px`);
    };

    const frame = window.requestAnimationFrame(updateViewport);
    window.addEventListener("load", updateViewport);
    window.addEventListener("resize", updateViewport);

    const resizeObserver = new ResizeObserver(updateViewport);
    resizeObserver.observe(nav);
    if (riskNote) {
      resizeObserver.observe(riskNote);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("load", updateViewport);
      window.removeEventListener("resize", updateViewport);
      resizeObserver.disconnect();
    };
  }, []);

  return null;
}
