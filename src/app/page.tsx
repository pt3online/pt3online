import KpiCard from "@/components/KpiCard";
import SectionCard from "@/components/SectionCard";
import InsightCard from "@/components/InsightCard";
import CampaignCarousel from "@/components/CampaignCarousel";
import SalesOverview from "@/components/SalesOverview";

import {
  getCampaigns,
  getActiveCampaigns,
} from "@/lib/campaign";

import {
  getSalesOverview,
  formatBaht,
} from "@/lib/sales";

export const revalidate = 60;

export default async function Home() {
  const [campaigns, sales] =
    await Promise.all([
      getCampaigns(),
      getSalesOverview(),
    ]);

  const activeCampaigns =
    getActiveCampaigns(campaigns);

  return (
    <div className="space-y-6 lg:space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-[#14242B] sm:text-3xl">
          ภาพรวม Digital Marketing
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          PT3 Digital Dashboard | Overview
        </p>
      </div>


      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">

        <KpiCard
          title="ยอดขายออนไลน์"
          value={formatBaht(
            sales.totalSales
          )}
          description="จากทุกช่องทาง"
          icon="💰"
        />

        <KpiCard
          title="ช่องทางรายได้สูงที่สุด"
          value={sales.topChannel.name}
          description={formatBaht(
            sales.topChannel.sales
          )}
          icon="🏆"
        />

        <KpiCard
          title="แพ็กเกจยอดขายสูง"
          value={sales.topPackage.name}
          description={formatBaht(
            sales.topPackage.sales
          )}
          icon="📦"
        />

        <KpiCard
          title="Campaign Active"
          value={activeCampaigns.length.toString()}
          description="Active Campaign"
          icon="🚀"
        />

      </div>


      <SectionCard
        title="Sales Overview"
        subtitle="Sales Trend / Channel Performance"
      >
        <SalesOverview
          monthlySales={sales.monthlySales}
          channels={sales.channels}
        />
      </SectionCard>


      <SectionCard
        title="Campaign Active"
        subtitle="Campaign ที่กำลังดำเนินการ"
      >
        <CampaignCarousel
          campaigns={activeCampaigns}
        />
      </SectionCard>


      <InsightCard
        title="Digital Insight"
        description="ภาพรวม Performance และ Insight สำคัญจาก Digital Marketing"
      />

    </div>
  );
}