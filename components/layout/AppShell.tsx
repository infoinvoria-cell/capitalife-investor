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
        <div className="relative z-10 h-full">
          <main className="main-content mobile-scroll h-full overflow-y-auto px-4 pt-[max(0.7rem,env(safe-area-inset-top))]">
            <PageTransition className="space-y-2.5 pb-1">
              {children}
              {riskNote ? <div className="px-0 pb-1.5">{riskNote}</div> : null}
            </PageTransition>
          </main>

          <div className="bottom-nav px-4 pt-0.5">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}
