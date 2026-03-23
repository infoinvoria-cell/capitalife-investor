"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function RiskDisclosure() {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setExpanded((value) => !value)}
      className="flex w-full items-start justify-between gap-3 rounded-[14px] border border-white/5 bg-white/[0.02] px-3 py-2 text-left text-[11px] leading-[1.4] text-[rgba(255,255,255,0.85)] transition hover:bg-white/[0.03]"
      aria-expanded={expanded}
    >
      <span
        className={
          expanded
            ? "block flex-1"
            : "block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
        }
      >
        Keine Anlageberatung. Kapitalanlagen sind mit Risiken verbunden.
        {expanded ? (
          <>
            <br />
            {
              "Vergangene Performance ist kein Indikator fuer zukuenftige Ergebnisse. Alle Angaben ohne Gewaehr."
            }
          </>
        ) : null}
      </span>
      {expanded ? (
        <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-[rgba(255,255,255,0.85)]" />
      ) : (
        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[rgba(255,255,255,0.85)]" />
      )}
    </button>
  );
}
