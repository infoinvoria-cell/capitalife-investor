import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageTransition } from "@/components/layout/PageTransition";
import { RoutePrefetch } from "@/components/layout/RoutePrefetch";
import { ShellViewportController } from "@/components/layout/ShellViewportController";

type AppShellProps = {
  children: ReactNode;
  riskNote?: ReactNode;
  rootClassName?: string;
  contentClassName?: string;
};

export function AppShell({
  children,
  riskNote,
  rootClassName = "",
  contentClassName = ""
}: AppShellProps) {
  return (
    <div className={`app-root ${rootClassName}`.trim()}>
      <div className="app-container">
        <RoutePrefetch />
        <ShellViewportController />
        <div className="relative z-10 h-full">
          <main
            className={`main-content mobile-scroll overflow-y-auto px-4 pt-[max(0.7rem,env(safe-area-inset-top))] ${contentClassName}`.trim()}
          >
            <PageTransition className="space-y-2.5 pb-1">{children}</PageTransition>
          </main>

          {riskNote ? <div className="risk-note px-4">{riskNote}</div> : null}

          <div className="bottom-nav px-4 pt-0.5">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}
