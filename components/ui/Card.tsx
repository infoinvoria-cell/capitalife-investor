import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`glass-card relative rounded-[28px] ${className}`.trim()}
      {...props}
    />
  );
}
