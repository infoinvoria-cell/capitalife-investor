type SectionTitleProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function SectionTitle({ eyebrow, title, subtitle }: SectionTitleProps) {
  return (
    <div className="space-y-0.5 px-0.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#ECDBA6]">
        {eyebrow}
      </p>
      <h2 className="text-[13px] font-medium leading-[1.15] tracking-[-0.02em] text-white">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-[32ch] text-[10px] leading-[1.25] text-[rgba(255,255,255,0.54)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
