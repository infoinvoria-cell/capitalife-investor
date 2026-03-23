import type { HTMLAttributes } from "react";

type PillProps = HTMLAttributes<HTMLSpanElement>;

export function Pill({ className = "", ...props }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[rgba(236,219,166,0.18)] bg-white/[0.04] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#ECDBA6] ${className}`.trim()}
      {...props}
    />
  );
}
