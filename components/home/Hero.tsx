import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";

import { TrustGrid } from "@/components/home/TrustGrid";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

export function Hero() {
  return (
    <Card className="overflow-hidden p-3">
      <div className="space-y-[8px]">
        <div className="flex items-start justify-between gap-3">
          <Pill className="gap-1.5 px-2.5 py-1.5 text-[10px]">
            <Image
              src="/assets/brand/CAPITALIFE_ICON.png"
              alt="Capitalife"
              width={14}
              height={14}
              className="h-[13px] w-[13px] object-contain"
            />
            Investor App
          </Pill>
          <Link href="/sicherheit" className="section-arrow" aria-label="Zur Sicherheit">
            <Shield className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>

        <div className="space-y-[8px]">
          <h1 className="whitespace-nowrap text-[18px] font-semibold leading-none tracking-[-0.02em] text-white">
            {"Willkommen bei "}
            <span className="italic tracking-[0.025em] text-[#ECDBA6]">Capitalife</span>
          </h1>
          <p className="text-[10px] leading-[1.35] text-[rgba(255,255,255,0.64)]">
            <span className="block whitespace-nowrap">
              Systematisches Multi-Strategie Investment.
            </span>
            <span className="block whitespace-nowrap">
              {"Institutionelle Struktur & transparente Performance."}
            </span>
          </p>
        </div>

        <TrustGrid />
      </div>
    </Card>
  );
}
