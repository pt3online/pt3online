interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
}

export default function KpiCard({
  title,
  value,
  description,
  icon,
}: KpiCardProps) {
  return (
    <div className="h-full min-h-[190px] rounded-[24px] border border-[#E1E8E6] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.035)]">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">

        {/* Title */}
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium leading-6 text-[#65747F] sm:text-[16px]">
            {title}
          </p>
        </div>

        {/* Font Awesome Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E7EEEC] bg-[#F8FAF9] text-[#60746F]">
          <i
            className={`${icon} text-[16px]`}
            aria-hidden="true"
          />
        </div>

      </div>

      {/* Content */}
      <div className="mt-5">

        <div className="break-words text-[20px] font-bold leading-[1.45] text-[#14242B]">
          {value}
        </div>

        <p className="mt-3 break-words text-[14px] leading-6 text-[#8A94A6]">
          {description}
        </p>

      </div>

    </div>
  );
}