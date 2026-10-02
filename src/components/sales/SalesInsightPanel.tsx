"use client";

import { useMemo } from "react";

import type {
  SalesPackage,
} from "@/lib/sales-page";

import {
  buildSalesInsight,
} from "@/lib/sales-insight";


interface SalesInsightPanelProps {
  selectedChannel: string;
  packages: SalesPackage[];
}


function formatBaht(
  value: number
) {
  return (
    "฿" +
    Number(
      value || 0
    ).toLocaleString(
      "th-TH",
      {
        maximumFractionDigits:
          0,
      }
    )
  );
}


function formatQty(
  value: number
) {
  return Number(
    value || 0
  ).toLocaleString(
    "th-TH"
  );
}


export default function SalesInsightPanel({
  selectedChannel,
  packages,
}: SalesInsightPanelProps) {

  const insight =
    useMemo(
      () =>
        buildSalesInsight(
          packages,
          selectedChannel
        ),
      [
        packages,
        selectedChannel,
      ]
    );


  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        bg-gradient-to-br
        from-[#087F74]
        to-[#008E80]
        text-white
      "
    >

      <div className="p-5">

        {/* =========================
            HEADER
        ========================== */}

        <div
          className="
            flex
            flex-wrap
            items-start
            justify-between
            gap-3
          "
        >

          <div>

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >

              <h2
                className="
                  text-[17px]
                  font-bold
                "
              >
                AI Marketing Insight
              </h2>


              <span
                className="
                  rounded-full
                  bg-white/15
                  px-2
                  py-1
                  text-[9px]
                  font-medium
                  text-white/85
                "
              >
                Smart Rule v1
              </span>

            </div>


            <p
              className="
                mt-1
                text-[12px]
                text-white/75
              "
            >
              วิเคราะห์ตาม{" "}
              {
                insight
                  .selectedChannelLabel
              }
            </p>

          </div>


          <div
            className="
              rounded-full
              bg-white/10
              px-3
              py-1.5
              text-[10px]
              font-medium
              text-white/80
            "
          >
            {
              insight
                .selectedChannelLabel
            }
          </div>

        </div>


        {/* =========================
            MAIN METRICS
        ========================== */}

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3

            sm:grid-cols-2

            xl:grid-cols-1

            2xl:grid-cols-2
          "
        >

          {/* BEST SELLER BY QTY */}

          <MetricCard
            eyebrow="
              แพ็กเกจที่ขายดีที่สุด
            "
            value={
              insight.topByQty
                ? `${formatQty(
                    insight
                      .topByQty
                      .qty
                  )} รายการ`
                : "—"
            }
            name={
              insight
                .topByQty
                ?.name ||
              "ยังไม่มีข้อมูล"
            }
            detail={
              insight.topByQty
                ? `ยอดขาย ${formatBaht(
                    insight
                      .topByQty
                      .sales
                  )}`
                : ""
            }
          />


          {/* HIGHEST REVENUE */}

          <MetricCard
            eyebrow="
              แพ็กเกจที่มียอดขายสูงสุด
            "
            value={
              insight
                .topByRevenue
                ? formatBaht(
                    insight
                      .topByRevenue
                      .sales
                  )
                : "—"
            }
            name={
              insight
                .topByRevenue
                ?.name ||
              "ยังไม่มีข้อมูล"
            }
            detail={
              insight
                .topByRevenue
                ? `${formatQty(
                    insight
                      .topByRevenue
                      .qty
                  )} รายการ`
                : ""
            }
          />

        </div>


        {/* =========================
            MARKETING INSIGHT
        ========================== */}

        <div
          className="
            mt-5
            space-y-4
          "
        >

          <InsightSection
            icon="01"
            title="
              Recommended Audience
            "
            headline={
              insight
                .recommendedAge
            }
            description={
              insight
                .recommendedSegment
            }
          />


          <InsightSection
            icon="02"
            title="
              Top Customer Interest
            "
            headline={
              insight
                .interests
                .join(" · ")
            }
            description="
              สรุปจากหมวดของแพ็กเกจที่สร้างยอดขายและจำนวนสูงในช่องทางที่เลือก
            "
          />


          <InsightSection
            icon="03"
            title="
              Campaign Recommendation
            "
            headline={
              insight
                .campaignTitle
            }
            description={
              insight
                .campaignDescription
            }
          />


          <InsightSection
            icon="04"
            title="
              Growth Opportunity
            "
            headline={
              insight
                .opportunityTitle
            }
            description={
              insight
                .opportunityDescription
            }
          />

        </div>

      </div>


      {/* =========================
          FOOTER
      ========================== */}

      <div
        className="
          border-t
          border-white/10
          bg-black/5
          px-5
          py-3
          text-[9px]
          leading-4
          text-white/60
        "
      >

        Based on:{" "}
        {
          insight
            .basisText
        }

        {" · "}

        Recommended Audience
        เป็นคำแนะนำจากรูปแบบแพ็กเกจ
        ไม่ใช่ข้อมูลอายุลูกค้าจริง

      </div>

    </section>
  );
}


/*
  =================================
  METRIC CARD
  =================================
*/

function MetricCard({
  eyebrow,
  value,
  name,
  detail,
}: {
  eyebrow: string;
  value: string;
  name: string;
  detail: string;
}) {

  return (
    <div
      className="
        rounded-xl
        border
        border-white/10
        bg-white/10
        p-4
      "
    >

      <p
        className="
          text-[10px]
          font-medium
          text-white/70
        "
      >
        {eyebrow}
      </p>


      <div
        className="
          mt-2
          text-[22px]
          font-bold
          leading-none
          text-white
        "
      >
        {value}
      </div>


      <p
        className="
          mt-3
          line-clamp-2
          text-[11px]
          font-semibold
          leading-4
          text-white/95
        "
      >
        {name}
      </p>


      {detail ? (
        <p
          className="
            mt-1
            text-[10px]
            text-white/65
          "
        >
          {detail}
        </p>
      ) : null}

    </div>
  );
}


/*
  =================================
  INSIGHT SECTION
  =================================
*/

function InsightSection({
  icon,
  title,
  headline,
  description,
}: {
  icon: string;
  title: string;
  headline: string;
  description: string;
}) {

  return (
    <div
      className="
        flex
        gap-3
      "
    >

      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-white/15
          text-[9px]
          font-bold
          tracking-wide
        "
      >
        {icon}
      </div>


      <div
        className="
          min-w-0
        "
      >

        <div
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-[0.08em]
            text-white/60
          "
        >
          {title}
        </div>


        <div
          className="
            mt-0.5
            text-[12px]
            font-bold
            leading-5
            text-white
          "
        >
          {headline}
        </div>


        <p
          className="
            mt-0.5
            text-[10px]
            leading-4
            text-white/70
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}