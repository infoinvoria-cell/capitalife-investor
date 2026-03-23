import Image from "next/image";

export function TopBar() {
  return (
    <div className="flex justify-center pb-1 pt-0.5">
      <Image
        src="/assets/brand/CAPITALIFE_Logo.png"
        alt="Capital Life"
        width={164}
        height={26}
        className="h-auto w-full max-w-[164px] object-contain"
        priority
      />
    </div>
  );
}
