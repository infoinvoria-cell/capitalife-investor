"use client";

import Image from "next/image";
import {
  Building2,
  Check,
  Landmark,
  ShieldBan,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

import { Card } from "@/components/ui/Card";

type TrustItem = {
  title: string;
  icon: ReactNode;
  logo?: string;
  subtitle?: string;
  flag?: string;
  footnote?: string;
  pill?: string;
};

const trustItems: TrustItem[] = [
  {
    title: "Regulierter Broker",
    icon: <Building2 className="h-3.5 w-3.5 text-[#ECDBA6]" strokeWidth={1.8} />,
    logo: "/assets/logos/roboforex.png"
  },
  {
    title: "Globale Liquiditätsanbieter",
    icon: <Landmark className="h-3.5 w-3.5 text-[#ECDBA6]" strokeWidth={1.8} />,
    subtitle: "Tier-1 Providers",
    flag: "\u{1F1FA}\u{1F1F8}"
  },
  {
    title: "Kein Zugriff auf Investorengelder",
    icon: <ShieldBan className="h-3.5 w-3.5 text-[#ECDBA6]" strokeWidth={1.8} />,
    subtitle: "Europäische Banken",
    flag: "\u{1F1EA}\u{1F1FA}"
  },
  {
    title: "Track Record\nverifiziert",
    icon: (
      <span className="relative flex h-3.5 w-3.5 items-center justify-center">
        <ShieldCheck className="h-3.5 w-3.5 text-[#ECDBA6]" strokeWidth={1.8} />
        <TrendingUp
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 text-[#ECDBA6]"
          strokeWidth={1.9}
        />
      </span>
    ),
    subtitle: "Per Drittpartei",
    pill: "Verified"
  }
];

const AUTO_SPEED_PX_PER_SECOND = 26;
const RESUME_DELAY_MS = 3000;

function wrapOffset(value: number, width: number) {
  if (width <= 0) {
    return value;
  }

  let next = value;

  while (next > 0) {
    next -= width;
  }

  while (next <= -width) {
    next += width;
  }

  return next;
}

export function TrustGrid() {
  const loop = [...trustItems, ...trustItems];
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const singleWidthRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const pauseUntilRef = useRef(0);
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);

  const applyTransform = () => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  };

  const pauseAuto = () => {
    pauseUntilRef.current = performance.now() + RESUME_DELAY_MS;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const measure = () => {
      singleWidthRef.current = track.scrollWidth / 2;
      offsetRef.current = wrapOffset(offsetRef.current, singleWidthRef.current);
      applyTransform();
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current == null) {
        lastTimestampRef.current = timestamp;
      }

      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      if (!isDraggingRef.current && timestamp >= pauseUntilRef.current && singleWidthRef.current > 0) {
        offsetRef.current = wrapOffset(
          offsetRef.current - AUTO_SPEED_PX_PER_SECOND * delta,
          singleWidthRef.current
        );
        applyTransform();
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      resizeObserver.disconnect();
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current != null) {
      return;
    }

    activePointerIdRef.current = event.pointerId;
    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    pauseAuto();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragStartXRef.current;
    offsetRef.current = wrapOffset(dragStartOffsetRef.current + deltaX, singleWidthRef.current);
    applyTransform();
  };

  const endDrag = (event?: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    if (event && activePointerIdRef.current === event.pointerId) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {}
    }

    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    lastTimestampRef.current = null;
    pauseAuto();
  };

  return (
    <section>
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="marquee-mask -mx-3 cursor-grab overflow-hidden px-3 active:cursor-grabbing"
        style={{ touchAction: "pan-y pinch-zoom", userSelect: "none" }}
      >
        <div
          ref={trackRef}
          className="flex w-max items-stretch gap-2 will-change-transform"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {loop.map((item, index) => (
            <Card
              key={`${item.title}-${index}`}
              className="flex h-[120px] w-[136px] flex-col items-center justify-between rounded-[18px] p-2.5 text-center"
            >
              <div className="relative z-10 flex h-[58px] flex-col items-center gap-[6px]">
                <div className="flex h-7 w-7 items-center justify-center rounded-[11px] border border-white/10 bg-white/[0.02]">
                  {item.icon}
                </div>

                <h3 className="flex h-[30px] items-center justify-center whitespace-pre-line text-[11px] font-medium leading-[1.12] tracking-[-0.02em] text-white">
                  {item.title}
                </h3>
              </div>

              {item.logo ? (
                <div className="relative z-10 flex min-h-[44px] flex-col items-center justify-start pt-1">
                  <Image
                    src={item.logo}
                    alt="RoboForex"
                    width={92}
                    height={28}
                    className="h-[28px] w-auto object-contain opacity-95"
                  />
                </div>
              ) : (
                <div className="relative z-10 flex min-h-[44px] flex-col items-center">
                  <p className="whitespace-pre-line text-[11px] font-semibold leading-[1.15] text-[rgba(255,255,255,0.6)]">
                    {item.subtitle}
                  </p>
                  {item.pill ? (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[rgba(255,215,120,0.14)] bg-[linear-gradient(180deg,rgba(255,215,120,0.12),rgba(255,215,120,0.04))] px-2 py-0.5 text-[8px] font-semibold tracking-[0.04em] text-[#ECDBA6]">
                      <Check className="h-2.5 w-2.5" strokeWidth={2.2} />
                      {item.pill}
                    </span>
                  ) : null}
                  {item.footnote ? (
                    <p className="mt-1 text-[8px] leading-[1.15] text-[rgba(255,255,255,0.42)]">
                      {item.footnote}
                    </p>
                  ) : null}
                  {item.flag ? (
                    <span className="mt-1.5 block text-[16px] leading-none">{item.flag}</span>
                  ) : null}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
