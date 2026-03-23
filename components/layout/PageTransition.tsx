"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={`page-transition ${className}`.trim()}>
      {children}
    </div>
  );
}
