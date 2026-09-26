import { Suspense } from "react";

import SalesDashboard from "@/components/sales/SalesDashboard";

import {
  getSalesPageData,
} from "@/lib/sales-page";

export const revalidate = 300;

async function SalesContent() {
  const data =
    await getSalesPageData();

  return (
    <SalesDashboard
      data={data}
    />
  );
}

function SalesLoading() {
  return (
    <div className="flex min-h-[65vh] w-full items-center justify-center">
      <div className="text-center">

        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#0f9f8f]" />

        <h2 className="mt-5 text-xl font-bold text-[#14242B]">
          กำลังโหลดข้อมูลยอดขาย
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          กำลังประมวลผลข้อมูล Sales Dashboard
        </p>

        <p className="mt-1 text-sm text-slate-400">
          โปรดรอสักครู่...
        </p>

      </div>
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense
      fallback={
        <SalesLoading />
      }
    >
      <SalesContent />
    </Suspense>
  );
}