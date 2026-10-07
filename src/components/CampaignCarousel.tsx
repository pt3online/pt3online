"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import CampaignCard from "./CampaignCard";

interface CampaignCarouselProps {
  campaigns: any[];
}

/* =========================================================
   วันที่ปัจจุบันประเทศไทย
   YYYY-MM-DD
========================================================= */

function getBangkokDateKey() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());

  const year =
    parts.find((part) => part.type === "year")?.value || "";

  const month =
    parts.find((part) => part.type === "month")?.value || "";

  const day =
    parts.find((part) => part.type === "day")?.value || "";

  return `${year}-${month}-${day}`;
}

/* =========================================================
   Normalize Date

   รองรับ:
   2026-10-31
   31/10/2026
   31/10/2569
========================================================= */

function normalizeDateKey(value: any): string | null {
  if (!value) return null;

  const raw = String(value).trim();

  /* YYYY-MM-DD */

  const isoMatch = raw.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})/
  );

  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, "0");
    const day = isoMatch[3].padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /* DD/MM/YYYY */

  const dateMatch = raw.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
  );

  if (dateMatch) {
    const day = dateMatch[1].padStart(2, "0");
    const month = dateMatch[2].padStart(2, "0");

    let year = Number(dateMatch[3]);

    if (year > 2400) {
      year -= 543;
    }

    return `${year}-${month}-${day}`;
  }

  return null;
}

/* =========================================================
   Component
========================================================= */

export default function CampaignCarousel({
  campaigns,
}: CampaignCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [today, setToday] = useState(
    getBangkokDateKey()
  );

  const [screenWidth, setScreenWidth] =
    useState(0);

  const [
    canScrollLeft,
    setCanScrollLeft,
  ] = useState(false);

  const [
    canScrollRight,
    setCanScrollRight,
  ] = useState(false);

  /* =======================================================
     วันที่ปัจจุบัน

     เช็กทุก 1 นาที
  ======================================================= */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setToday(getBangkokDateKey());
    }, 60 * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /* =======================================================
     ตรวจขนาดหน้าจอ
  ======================================================= */

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    updateScreenWidth();

    window.addEventListener(
      "resize",
      updateScreenWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateScreenWidth
      );
    };
  }, []);

  /* =======================================================
     Filter Active Campaign

     - Status = Active
     - End Date ยังไม่หมดอายุ
  ======================================================= */

  const activeCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const status = String(
        campaign.status || ""
      )
        .trim()
        .toLowerCase();

      if (status !== "active") {
        return false;
      }

      const endDate = normalizeDateKey(
        campaign.endDate
      );

      /*
        ถ้าไม่มี End Date
        ให้แสดง
      */

      if (!endDate) {
        return true;
      }

      /*
        วันหมดอายุยังแสดงอยู่

        เช่น
        End Date = 2026-10-31

        วันที่ 31 = ยังแสดง
        วันที่ 1 พ.ย. = หาย
      */

      return endDate >= today;
    });
  }, [campaigns, today]);

  /* =======================================================
     Responsive

     Mobile  = 1
     Tablet  = 3
     PC      = 4
  ======================================================= */

  const visibleCount = useMemo(() => {
    if (screenWidth >= 1280) {
      return 4;
    }

    if (screenWidth >= 768) {
      return 3;
    }

    return 1;
  }, [screenWidth]);

  /* =======================================================
     Gap

     Mobile = 20px
     Tablet / PC = 24px
  ======================================================= */

  const gap = screenWidth >= 768 ? 24 : 20;

  /* =======================================================
     ความกว้าง Card

     คำนวณด้วย JS
     ไม่ใช้การหารใน CSS
  ======================================================= */

  const cardWidth = useMemo(() => {
    const percentage =
      100 / visibleCount;

    const gapOffset =
      (gap * (visibleCount - 1)) /
      visibleCount;

    return `calc(${percentage}% - ${gapOffset}px)`;
  }, [visibleCount, gap]);

  /* =======================================================
     ตรวจว่าเลื่อนได้ทางไหนบ้าง
  ======================================================= */

  const updateScrollState =
    useCallback(() => {
      const container = scrollRef.current;

      if (!container) return;

      const {
        scrollLeft,
        scrollWidth,
        clientWidth,
      } = container;

      const maxScroll =
        scrollWidth - clientWidth;

      setCanScrollLeft(
        scrollLeft > 3
      );

      setCanScrollRight(
        scrollLeft < maxScroll - 3
      );
    }, []);

  /* =======================================================
     Campaign / Responsive เปลี่ยน

     เช็ก Scroll ใหม่

     สำคัญ:
     ไม่มี scrollTo ที่อิง currentIndex แล้ว
     จึงไม่เด้งกลับ
  ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const container = scrollRef.current;

      if (!container) return;

      /*
        ถ้า Resize แล้วตำแหน่งเกินขอบ
        Browser จะ Clamp ให้
      */

      const maxScroll =
        Math.max(
          0,
          container.scrollWidth -
            container.clientWidth
        );

      if (
        container.scrollLeft >
        maxScroll
      ) {
        container.scrollLeft =
          maxScroll;
      }

      updateScrollState();
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    activeCampaigns.length,
    visibleCount,
    updateScrollState,
  ]);

  /* =======================================================
     ฟังก์ชันเลื่อน
  ======================================================= */

  const scrollCampaign = (
    direction: "left" | "right"
  ) => {
    const container = scrollRef.current;

    if (!container) return;

    const firstCard =
      container.querySelector(
        "[data-campaign-card]"
      ) as HTMLElement | null;

    if (!firstCard) return;

    /*
      ใช้ความกว้างจริงของ Card
    */

    const realCardWidth =
      firstCard.getBoundingClientRect()
        .width;

    const distance =
      realCardWidth + gap;

    container.scrollBy({
      left:
        direction === "right"
          ? distance
          : -distance,

      behavior: "smooth",
    });
  };

  /* =======================================================
     ไม่มี Campaign
  ======================================================= */

  if (!activeCampaigns.length) {
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

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="relative w-full">
      {/* ===================================================
          Previous
      =================================================== */}

      {canScrollLeft && (
        <button
          type="button"
          aria-label="Previous campaign"
          onClick={() =>
            scrollCampaign("left")
          }
          className="
            absolute
            left-2
            top-1/2
            z-30

            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center

            rounded-full
            border
            border-gray-200

            bg-white/95

            text-2xl
            font-light
            text-gray-700

            shadow-lg

            backdrop-blur-sm

            transition
            duration-200

            hover:scale-105
            hover:bg-white

            md:h-12
            md:w-12
            md:text-3xl
          "
        >
          ‹
        </button>
      )}

      {/* ===================================================
          Track
      =================================================== */}

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="
          flex
          w-full

          snap-x
          snap-mandatory

          overflow-x-auto
          overflow-y-hidden

          scroll-smooth

          touch-pan-x

          overscroll-x-contain

          pb-2

          [scrollbar-width:none]

          [&::-webkit-scrollbar]:hidden
        "
        style={{
          gap: `${gap}px`,
          WebkitOverflowScrolling:
            "touch",
        }}
      >
        {activeCampaigns.map(
          (campaign, index) => (
            <div
              key={
                campaign.id ||
                campaign.campaignId ||
                index
              }
              data-campaign-card
              className="
                flex-none
                shrink-0
                snap-start
              "
              style={{
                width: cardWidth,
              }}
            >
              <CampaignCard
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
            </div>
          )
        )}
      </div>

      {/* ===================================================
          Next
      =================================================== */}

      {canScrollRight && (
        <button
          type="button"
          aria-label="Next campaign"
          onClick={() =>
            scrollCampaign("right")
          }
          className="
            absolute
            right-2
            top-1/2
            z-30

            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center

            rounded-full
            border
            border-gray-200

            bg-white/95

            text-2xl
            font-light
            text-gray-700

            shadow-lg

            backdrop-blur-sm

            transition
            duration-200

            hover:scale-105
            hover:bg-white

            md:h-12
            md:w-12
            md:text-3xl
          "
        >
          ›
        </button>
      )}
    </div>
  );
}