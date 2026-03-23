import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageTransition } from "@/components/layout/PageTransition";
import { RoutePrefetch } from "@/components/layout/RoutePrefetch";

type AppShellProps = {
  children: ReactNode;
  riskNote?: ReactNode;
};

export function AppShell({ children, riskNote }: AppShellProps) {
  return (
    <div className="app-root">
      <div className="app-container">
        <RoutePrefetch />
        <div className="relative z-10 flex h-full flex-col">
          <main className="mobile-scroll flex-1 overflow-y-auto px-4 pb-2 pt-[max(0.7rem,env(safe-area-inset-top))]">
            <PageTransition className="space-y-2.5 pb-1">{children}</PageTransition>
          </main>

          {riskNote ? <div className="flex-shrink-0 px-4 pb-1.5">{riskNote}</div> : null}

          <div className="flex-shrink-0 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-0.5">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}
