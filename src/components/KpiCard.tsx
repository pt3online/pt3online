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
    <div className="h-full min-h-[190px] rounded-[24px] border border-[#D9E3E0] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium leading-6 text-[#5F6F86] sm:text-[16px]">
            {title}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF6F3] text-[22px]">
          {icon}
        </div>

      </div>

      <div className="mt-5">

        <div className="break-words text-[18px] font-bold leading-[1.45] text-[#14242B]">
          {value}
        </div>

        <p className="mt-3 break-words text-[14px] leading-6 text-[#8A94A6]">
          {description}
        </p>

      </div>

    </div>
  );
}