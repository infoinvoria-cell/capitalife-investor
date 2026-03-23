"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { partnerLogos } from "@/data/mock";

const AUTO_SPEED_PX_PER_SECOND = 24;

type PartnerMarqueeItem =
  | { type?: "image"; src: string; alt: string }
  | { type: "text"; label: string };

type PartnerMarqueeProps = {
  items?: PartnerMarqueeItem[];
};

function isTextMarqueeItem(item: PartnerMarqueeItem): item is Extract<PartnerMarqueeItem, { type: "text" }> {
  return "type" in item && item.type === "text";
}

export function PartnerMarquee({ items }: PartnerMarqueeProps) {
  const resolvedItems = items ?? partnerLogos;
  const loop = [...resolvedItems, ...resolvedItems];
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
    <section>
      <div className="flex h-[42px] items-center gap-2 rounded-[14px] border border-[rgba(255,215,120,0.08)] bg-[linear-gradient(90deg,rgba(255,215,120,0.04),rgba(255,215,120,0.01))] px-[2px]">
        <div className="flex h-full shrink-0 items-center pl-2 pr-1">
          <Image
            src="/assets/brand/CAPITALIFE_Logo.png"
            alt="Capital Life"
            width={116}
            height={22}
            className="h-[20px] w-auto object-contain opacity-95 brightness-110"
          />
        </div>

        <div className="marquee-mask -mx-[2px] h-full min-w-0 flex-1 overflow-hidden px-[2px]">
          <div
            ref={trackRef}
            className="flex h-full w-max items-center gap-0.5 will-change-transform"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            {loop.map((item, index) => {
              const itemKey = isTextMarqueeItem(item) ? item.label : item.alt;

              return (
                <div
                  key={`${itemKey}-${index}`}
                  className="group flex h-[22px] min-w-[60px] items-center justify-center px-0 transition duration-300"
                >
                  {isTextMarqueeItem(item) ? (
                    <span className="text-[10px] font-semibold tracking-[0.06em] text-[rgba(255,255,255,0.68)] transition duration-300 group-hover:text-white">
                      {item.label}
                    </span>
                  ) : (
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={78}
                      height={18}
                      className="h-[16px] w-auto object-contain opacity-[0.68] grayscale-[0.1] transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
