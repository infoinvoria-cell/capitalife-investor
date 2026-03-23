"use client";

import { useEffect } from "react";

export function HomeScrollManager() {
  useEffect(() => {
    const content = document.querySelector<HTMLElement>(".home-content");

    if (!content) {
      return;
    }

    const checkScroll = () => {
      const shouldScroll = content.scrollHeight > content.clientHeight + 1;
      content.style.overflowY = shouldScroll ? "auto" : "hidden";
    };

    const runCheck = () => window.requestAnimationFrame(checkScroll);

    runCheck();
    window.addEventListener("load", runCheck);
    window.addEventListener("resize", runCheck);

    const resizeObserver = new ResizeObserver(runCheck);
    resizeObserver.observe(content);

    return () => {
      window.removeEventListener("load", runCheck);
      window.removeEventListener("resize", runCheck);
      resizeObserver.disconnect();
    };
  }, []);

  return null;
}
