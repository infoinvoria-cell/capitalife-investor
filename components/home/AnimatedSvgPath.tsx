"use client";

import { useEffect, useRef } from "react";

type AnimatedSvgPathProps = {
  d: string;
  stroke: string;
  strokeWidth: number;
  delayMs?: number;
  durationMs?: number;
  opacity?: number;
  variant?: "draw" | "dashReveal";
  dashPattern?: string;
  linecap?: "round" | "butt" | "square";
};

export function AnimatedSvgPath({
  d,
  stroke,
  strokeWidth,
  delayMs = 0,
  durationMs = 900,
  opacity = 1,
  variant = "draw",
  dashPattern = "5 4",
  linecap = "round",
}: AnimatedSvgPathProps) {
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const totalLength = Math.max(path.getTotalLength(), 1);

    if (variant === "dashReveal") {
      path.style.strokeDasharray = dashPattern;
      path.style.strokeDashoffset = "12";
      path.style.opacity = "0.28";

      const animation = path.animate(
        [
          { strokeDashoffset: 12, opacity: 0.28 },
          { strokeDashoffset: 0, opacity },
        ],
        {
          duration: durationMs,
          delay: delayMs,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );

      return () => animation.cancel();
    }

    path.style.strokeDasharray = `${totalLength}`;
    path.style.strokeDashoffset = `${totalLength}`;
    path.style.opacity = "0.42";

    const animation = path.animate(
      [
        { strokeDashoffset: totalLength, opacity: 0.42 },
        { strokeDashoffset: 0, opacity },
      ],
      {
        duration: durationMs,
        delay: delayMs,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );

    return () => animation.cancel();
  }, [d, dashPattern, delayMs, durationMs, opacity, variant]);

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={linecap}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      shapeRendering="geometricPrecision"
    />
  );
}
