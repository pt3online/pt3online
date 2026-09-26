"use client";

import CampaignCard from "./CampaignCard";

interface CampaignCarouselProps {
  campaigns: any[];
}

export default function CampaignCarousel({
  campaigns,
}: CampaignCarouselProps) {
  if (!campaigns.length) {
    return (
      <div
        className="
          flex
          min-h-[180px]
          items-center
          justify-center
          rounded-2xl
          border
          border-dashed
          border-gray-200
          bg-gray-50
          text-sm
          text-gray-400
        "
      >
        No Active Campaign
      </div>
    );
  }

  /*
    เลือกจำนวน Column
    ตามจำนวน Campaign จริง
  */

  let gridClass = "";

  if (campaigns.length === 1) {
    gridClass =
      "grid-cols-1 max-w-[680px]";
  } else if (campaigns.length === 2) {
    gridClass =
      "grid-cols-1 sm:grid-cols-2";
  } else if (campaigns.length === 3) {
    gridClass =
      "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
  } else {
    gridClass =
      "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4";
  }

  return (
    <div
      className={`
        grid
        gap-5
        xl:gap-6
        ${gridClass}
      `}
    >
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          image={campaign.picture}
          title={campaign.title}
          status={campaign.status}
          period={
            campaign.startDate &&
            campaign.endDate
              ? `${campaign.startDate} - ${campaign.endDate}`
              : campaign.startDate ||
                campaign.endDate ||
                ""
          }
        />
      ))}
    </div>
  );
}