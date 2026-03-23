type SectionTitleProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function SectionTitle({ eyebrow, title, subtitle }: SectionTitleProps) {
  return (
    <div className="space-y-1 px-0.5">
      <p className="bg-[linear-gradient(90deg,#F7E9BF_0%,#ECDBA6_45%,#D9B84C_100%)] bg-clip-text text-[9px] font-semibold uppercase tracking-[0.22em] text-transparent">
        {eyebrow}
      </p>
      <h2 className="text-[13px] font-semibold leading-[1.12] tracking-[-0.025em] text-white">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-[32ch] text-[10px] leading-[1.3] text-[rgba(255,255,255,0.52)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
