import SalesDashboard from "@/components/sales/SalesDashboard";

import {
  getSalesPageData,
} from "@/lib/sales-page";


export const revalidate = 60;


export default async function SalesPage() {

  const data =
    await getSalesPageData();


  return (
    <SalesDashboard
      data={data}
    />
  );
}