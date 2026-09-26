interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function SectionCard({
  title,
  subtitle,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-[#DDE7E4] bg-white p-4 shadow-sm sm:p-5 lg:p-6">

      <div className="mb-5">

        <h2 className="text-[18px] font-bold leading-[1.5] text-[#14242B] sm:text-[19px] lg:text-[20px]">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-[13px] leading-[1.6] text-[#69777F] sm:text-[14px]">
            {subtitle}
          </p>
        )}

      </div>

      <div>
        {children}
      </div>

    </section>
  );
}