"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const AUTO_SPEED_PX_PER_SECOND = 24;

const partnerItems = [
  { type: "image" as const, src: "/assets/logos/copyfx.png", alt: "CopyFX", width: 72, height: 18, className: "h-[15px] w-auto" },
  { type: "image" as const, src: "/assets/logos/darwin.png", alt: "Darwinex", width: 86, height: 18, className: "h-[16px] w-auto" },
  { type: "image" as const, src: "/assets/logos/myfxbook.png", alt: "Myfxbook", width: 84, height: 18, className: "h-[15px] w-auto" },
  { type: "text" as const, label: "HugoForex" },
];

export function TrackRecordPartnerStrip() {
  const loop = [...partnerItems, ...partnerItems];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const widthRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const applyTransform = () => {
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    const measure = () => {
      widthRef.current = track.scrollWidth / 2;
      if (widthRef.current > 0) {
        offsetRef.current %= widthRef.current;
        applyTransform();
      }
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

      if (widthRef.current > 0) {
        offsetRef.current = (offsetRef.current + AUTO_SPEED_PX_PER_SECOND * delta) % widthRef.current;
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

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[rgba(236,219,166,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015)),linear-gradient(135deg,rgba(255,228,148,0.08),rgba(8,8,10,0))] px-[2px] py-[2px] shadow-[0_18px_38px_rgba(0,0,0,0.34),0_0_22px_rgba(236,219,166,0.06)] backdrop-blur-[18px]">
      <div className="flex h-[48px] items-center gap-2 rounded-[20px] px-2">
        <div className="flex h-full shrink-0 items-center pl-1 pr-2">
          <Image
            src="/assets/brand/CAPITALIFE_Logo.png"
            alt="Capitalife"
            width={126}
            height={24}
            className="h-[22px] w-auto object-contain opacity-100 brightness-110"
          />
        </div>

        <div className="marquee-mask -mx-[2px] h-full min-w-0 flex-1 overflow-hidden px-[2px]">
          <div
            ref={trackRef}
            className="flex h-full w-max items-center gap-1.5 will-change-transform"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            {loop.map((item, index) => (
              <div
                key={`${item.type === "image" ? item.alt : item.label}-${index}`}
                className="group flex h-[24px] min-w-[72px] items-center justify-center rounded-full border border-white/10 bg-white/[0.02] px-3 transition duration-300"
              >
                {item.type === "image" ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    className={`${item.className} object-contain opacity-[0.78] grayscale-[0.05] transition duration-300 group-hover:opacity-100 group-hover:grayscale-0`}
                  />
                ) : (
                  <span className="text-[10px] font-semibold tracking-[0.06em] text-[rgba(255,255,255,0.82)]">
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
