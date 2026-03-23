import Image from "next/image";

import { partnerLogos } from "@/data/mock";

export function PartnerMarquee() {
  const loop = [...partnerLogos, ...partnerLogos];

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
          <div className="logo-marquee-track flex h-full w-max items-center gap-0.5">
            {loop.map((logo, index) => (
              <div
                key={`${logo.alt}-${index}`}
                className="group flex h-[22px] min-w-[60px] items-center justify-center px-0 transition duration-300"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={78}
                  height={18}
                  className="h-[16px] w-auto object-contain opacity-56 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
