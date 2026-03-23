"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, LineChart, ShieldCheck, Sparkles, Target } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/track-record", label: "Performance", icon: LineChart },
  { href: "/zukunft", label: "Zukunft", icon: Sparkles },
  { href: "/sicherheit", label: "Sicherheit", icon: ShieldCheck },
  { href: "/strategie", label: "Strategie", icon: Target }
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    navItems.forEach(({ href }) => router.prefetch(href));
  }, [router]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleNavigate = (href: string) => {
    if (pathname === href) {
      return;
    }

    setPendingHref(href);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  return (
    <nav className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-1 backdrop-blur-[12px]">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const isPending = pendingHref === href;

          return (
            <button
              key={href}
              type="button"
              onClick={() => handleNavigate(href)}
              onMouseEnter={() => router.prefetch(href)}
              onFocus={() => router.prefetch(href)}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[40px] flex-col items-center justify-center gap-0.5 rounded-full px-1 text-center text-[9px] font-semibold transition-all duration-[350ms] ease-[ease] hover:scale-[1.04] active:scale-[0.98] ${
                isActive
                  ? "bg-[linear-gradient(180deg,rgba(236,219,166,0.96),rgba(217,184,76,0.92))] text-[#040404] shadow-[0_0_22px_rgba(255,215,120,0.18)]"
                  : "text-[rgba(255,255,255,0.54)] hover:bg-white/[0.03] hover:text-white"
              } ${isPending ? "opacity-80" : ""}`}
              style={{ touchAction: "manipulation" }}
            >
              <Icon className="h-[12px] w-[12px]" strokeWidth={1.9} />
              <span className="leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
