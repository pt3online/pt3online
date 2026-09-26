"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import type {
  SalesChannel,
  SalesMonth,
  SalesPageData,
} from "@/lib/sales-page";


interface SalesDashboardProps {
  data: SalesPageData;
}


interface HoverPoint {
  channel: string;
  month: string;
  sales: number;
  color: string;
  x: number;
  y: number;
}


const CHANNEL_COLORS: Record<string, string> = {
  "phyathai.com": "#00826a",
  Shopee: "#ff8043",
  BeDee: "#03a9f4",
  "HD Mall": "#4db6ac",
  LINE: "#42db41",
  Lazada: "#400c4c",
};


const CHANNEL_ORDER = [
  "phyathai.com",
  "Shopee",
  "BeDee",
  "HD Mall",
  "LINE",
  "Lazada",
];


const MONTH_LABELS: Record<string, string> = {
  Jan: "ม.ค.",
  Feb: "ก.พ.",
  Mar: "มี.ค.",
  Apr: "เม.ย.",
  May: "พ.ค.",
  Jun: "มิ.ย.",
  Jul: "ก.ค.",
  Aug: "ส.ค.",
  Sep: "ก.ย.",
  Oct: "ต.ค.",
  Nov: "พ.ย.",
  Dec: "ธ.ค.",
};


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
        maximumFractionDigits: 0,
      }
    )
  );
}


function formatCompact(
  value: number
) {
  const number =
    Number(value) || 0;

  if (
    number >= 1000000
  ) {
    return `${(
      number /
      1000000
    ).toFixed(2)}M`;
  }

  if (
    number >= 1000
  ) {
    return `${Math.round(
      number / 1000
    )}K`;
  }

  return number.toLocaleString(
    "th-TH"
  );
}


function channelColor(
  name: string
) {
  return (
    CHANNEL_COLORS[
      name
    ] ||
    "#94A3B8"
  );
}


function sameChannel(
  first: string,
  second: string
) {
  return (
    first
      .trim()
      .toLowerCase() ===
    second
      .trim()
      .toLowerCase()
  );
}


function getMonthlyValue(
  item: SalesMonth,
  channel: string
) {
  switch (
    channel
  ) {

    case "phyathai.com":
      return item.Phyathai;

    case "Shopee":
      return item.Shopee;

    case "BeDee":
      return item.BeDee;

    case "HD Mall":
      return item.HDMall;

    case "LINE":
      return item.LINE;

    case "Lazada":
      return item.Lazada;

    default:
      return 0;
  }
}


export default function SalesDashboard({
  data,
}: SalesDashboardProps) {

  const router =
    useRouter();


  const [
    isRefreshing,
    startRefresh,
  ] =
    useTransition();


  const [
    selectedChannel,
    setSelectedChannel,
  ] =
    useState(
      "all"
    );


  const [
    hoveredPoint,
    setHoveredPoint,
  ] =
    useState<HoverPoint | null>(
      null
    );


  /*
    =================================
    CHANNEL ORDER
    =================================
  */

  const orderedChannels =
    useMemo(
      () => {

        return [
          ...data.channels,
        ].sort(
          (
            a,
            b
          ) => {

            const ai =
              CHANNEL_ORDER.indexOf(
                a.name
              );

            const bi =
              CHANNEL_ORDER.indexOf(
                b.name
              );

            return (
              (
                ai === -1
                  ? 999
                  : ai
              ) -
              (
                bi === -1
                  ? 999
                  : bi
              )
            );
          }
        );

      },
      [
        data.channels,
      ]
    );


  /*
    =================================
    SELECTED CHANNEL
    =================================
  */

  const currentChannel:
    SalesChannel | undefined =
    selectedChannel ===
    "all"
      ? undefined
      : orderedChannels.find(
          (item) =>
            sameChannel(
              item.name,
              selectedChannel
            )
        );


  const selectedSales =
    currentChannel
      ? currentChannel.sales
      : data.totalSales;


  const selectedOrders =
    currentChannel
      ? currentChannel.orders
      : data.totalOrders;


  const selectedAverage =
    selectedOrders > 0
      ? selectedSales /
        selectedOrders
      : 0;


  /*
    =================================
    MONTHLY DATA
    =================================
  */

  let lastMonthIndex = -1;


  for (
    let i =
      data.monthlySales.length -
      1;
    i >= 0;
    i--
  ) {

    if (
      data.monthlySales[i]
        .total > 0
    ) {

      lastMonthIndex =
        i;

      break;

    }

  }


  const chartData =
    lastMonthIndex >= 0
      ? data.monthlySales.slice(
          0,
          lastMonthIndex + 1
        )
      : [];


  /*
    =================================
    CHART
    =================================
  */

  const chartWidth =
    920;

  const chartHeight =
    320;

  const left =
    55;

  const right =
    20;

  const top =
    25;

  const bottom =
    45;


  const innerWidth =
    chartWidth -
    left -
    right;

  const innerHeight =
    chartHeight -
    top -
    bottom;


  const allMonthlyValues =
    chartData.flatMap(
      (month) =>
        CHANNEL_ORDER.map(
          (channel) =>
            getMonthlyValue(
              month,
              channel
            )
        )
    );


  const maxMonthly =
    Math.max(
      ...allMonthlyValues,
      1
    );


  function pointX(
    index: number
  ) {

    if (
      chartData.length <=
      1
    ) {
      return (
        left +
        innerWidth / 2
      );
    }

    return (
      left +
      (
        index /
        (
          chartData.length -
          1
        )
      ) *
      innerWidth
    );
  }


  function pointY(
    value: number
  ) {

    return (
      top +
      innerHeight -
      (
        value /
        maxMonthly
      ) *
      innerHeight
    );
  }


  /*
    =================================
    DONUT
    =================================
  */

  const donutChannels =
    selectedChannel ===
    "all"
      ? orderedChannels
      : orderedChannels.filter(
          (item) =>
            sameChannel(
              item.name,
              selectedChannel
            )
        );


  const donutTotal =
    donutChannels.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.sales,
      0
    );


  let donutStart = 0;


  const donutStops =
    donutChannels
      .filter(
        (item) =>
          item.sales > 0
      )
      .map(
        (item) => {

          const percent =
            donutTotal > 0
              ? (
                  item.sales /
                  donutTotal
                ) *
                100
              : 0;

          const end =
            donutStart +
            percent;

          const text =
            `${channelColor(
              item.name
            )} ` +
            `${donutStart}% ` +
            `${end}%`;

          donutStart =
            end;

          return text;
        }
      );


  /*
    =================================
    TOP PACKAGES
    =================================
  */

  const filteredPackages =
    selectedChannel ===
    "all"
      ? data.topPackages
      : data.topPackages.filter(
          (item) =>
            sameChannel(
              item.channel,
              selectedChannel
            )
        );


  const visiblePackages =
    filteredPackages.slice(
      0,
      8
    );


  const bestPackage =
    filteredPackages[0];


  /*
    =================================
    INSIGHT
    =================================
  */

  const strongestChannel =
    [...orderedChannels]
      .sort(
        (
          a,
          b
        ) =>
          b.sales -
          a.sales
      )[0];


  const noDataChannels =
    orderedChannels
      .filter(
        (item) =>
          item.sales <= 0
      )
      .map(
        (item) =>
          item.name
      );


  /*
    =================================
    REFRESH
    =================================
  */

  function refreshData() {

    startRefresh(
      () => {
        router.refresh();
      }
    );

  }


  return (
    <div
      className="
        space-y-4
      "
    >

      {/* =========================
          HEADER
      ========================== */}

      <div
        className="
          flex
          flex-col
          gap-4

          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >

        <div>

          <h1
            className="
              text-[24px]
              font-bold
              leading-tight
              text-[#13242A]

              sm:text-[28px]
            "
          >
            ภาพรวมยอดขายออนไลน์
          </h1>


          <p
            className="
              mt-1
              text-[13px]
              text-[#7B888D]
            "
          >
            ติดตามผลการขายจากช่องทางในมุมมองเดียว
          </p>


          {data.updatedAt && (

            <p
              className="
                mt-1
                text-[11px]
                text-[#98A4A8]
              "
            >
              อัปเดตล่าสุด {data.updatedAt}
            </p>

          )}

        </div>


        {/* REFRESH BUTTON */}

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <button
            type="button"
            onClick={
              refreshData
            }
            disabled={
              isRefreshing
            }
            className="
              rounded-xl
              border
              border-[#DDE7E4]
              bg-white
              px-4
              py-2.5
              text-[13px]
              font-medium
              text-[#33464C]
              transition

              hover:bg-[#F7FAF9]

              disabled:opacity-60
            "
          >
            ↻{" "}
            {isRefreshing
              ? "กำลังรีเฟรช"
              : "รีเฟรชข้อมูล"}
          </button>

        </div>

      </div>


      {/* =========================
          KPI
      ========================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-3

          xl:grid-cols-4
        "
      >

        <SalesKpi
          title="ยอดขายรวม"
          value={
            formatBaht(
              selectedSales
            )
          }
          description={
            selectedChannel ===
            "all"
              ? "จากช่องทางที่มีข้อมูล"
              : selectedChannel
          }
          accent="#DBE8FF"
        />


        <SalesKpi
          title="จำนวนคำสั่งซื้อ"
          value={
            selectedOrders.toLocaleString(
              "th-TH"
            )
          }
          description="รวมทุกรายการ"
          accent="#DDF7F0"
        />


        <SalesKpi
          title="ยอดขายเฉลี่ย / รายการ"
          value={
            formatBaht(
              selectedAverage
            )
          }
          description="คำนวณอัตโนมัติ"
          accent="#FFEBD9"
        />


        <SalesKpi
          title="ช่องทางที่มีข้อมูล"
          value={`${data.activeChannels} / ${data.totalChannels}`}
          description={`จาก ${data.totalChannels} ช่องทาง`}
          accent="#E9E3FF"
        />

      </div>


      {/* =========================
          CHANNEL FILTER
      ========================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-2

          md:grid-cols-3
          xl:grid-cols-7
        "
      >

        <ChannelButton
          title="ทุกช่องทาง"
          sales={
            data.totalSales
          }
          percent={100}
          color="#00826a"
          active={
            selectedChannel ===
            "all"
          }
          onClick={() =>
            setSelectedChannel(
              "all"
            )
          }
        />


        {orderedChannels.map(
          (channel) => {

            const share =
              data.totalSales >
              0
                ? (
                    channel.sales /
                    data.totalSales
                  ) *
                  100
                : 0;

            return (

              <ChannelButton
                key={
                  channel.name
                }
                title={
                  channel.name
                }
                sales={
                  channel.sales
                }
                percent={
                  share
                }
                color={
                  channelColor(
                    channel.name
                  )
                }
                active={
                  selectedChannel ===
                  channel.name
                }
                onClick={() =>
                  setSelectedChannel(
                    channel.name
                  )
                }
              />

            );

          }
        )}

      </div>


      {/* =========================
          GRAPH + DONUT
      ========================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-3

          xl:grid-cols-[2.2fr_1fr]
        "
      >

        {/* SALES TREND */}

        <section
          className="
            min-w-0
            rounded-2xl
            border
            border-[#DBE5E2]
            bg-white
            p-4

            sm:p-5
          "
        >

          <div
            className="
              flex
              flex-col
              gap-3

              lg:flex-row
              lg:items-start
              lg:justify-between
            "
          >

            <div>

              <h2
                className="
                  text-[16px]
                  font-bold
                  text-[#192C32]
                "
              >
                แนวโน้มยอดขาย
              </h2>


              <p
                className="
                  mt-1
                  text-[12px]
                  text-[#879398]
                "
              >
                ยอดขายรายเดือนแยกทุกช่องทาง
              </p>

            </div>


            <div
              className="
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-2
              "
            >

              {CHANNEL_ORDER.map(
                (channel) => (

                  <div
                    key={
                      channel
                    }
                    className="
                      flex
                      items-center
                      gap-1.5
                      text-[10px]
                      text-[#65767B]
                    "
                  >

                    <span
                      className="
                        h-2
                        w-2
                        rounded-full
                      "
                      style={{
                        backgroundColor:
                          channelColor(
                            channel
                          ),
                      }}
                    />

                    {channel}

                  </div>

                )
              )}

            </div>

          </div>


          {chartData.length === 0 ? (

            <div
              className="
                flex
                h-[300px]
                items-center
                justify-center
                text-sm
                text-gray-400
              "
            >
              ไม่มีข้อมูลยอดขาย
            </div>

          ) : (

            <div
              className="
                mt-4
                overflow-x-auto
              "
            >

              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="
                  h-[320px]
                  min-w-[680px]
                  w-full
                "
                onMouseLeave={() =>
                  setHoveredPoint(
                    null
                  )
                }
              >

                {[0, 1, 2, 3, 4].map(
                  (
                    step
                  ) => {

                    const y =
                      top +
                      (
                        step /
                        4
                      ) *
                      innerHeight;

                    const value =
                      maxMonthly *
                      (
                        1 -
                        step /
                        4
                      );

                    return (

                      <g
                        key={
                          step
                        }
                      >

                        <line
                          x1={
                            left
                          }
                          x2={
                            chartWidth -
                            right
                          }
                          y1={y}
                          y2={y}
                          stroke="#EDF2F1"
                        />


                        <text
                          x={
                            left -
                            8
                          }
                          y={
                            y + 4
                          }
                          textAnchor="end"
                          fontSize="10"
                          fill="#91A0A5"
                        >
                          {formatCompact(
                            value
                          )}
                        </text>

                      </g>

                    );

                  }
                )}


                {chartData.map(
                  (
                    month,
                    index
                  ) => (

                    <text
                      key={
                        month.month
                      }
                      x={
                        pointX(
                          index
                        )
                      }
                      y={
                        chartHeight -
                        13
                      }
                      textAnchor="middle"
                      fontSize="10"
                      fill="#849397"
                    >
                      {
                        MONTH_LABELS[
                          month.month
                        ] ||
                        month.month
                      }
                    </text>

                  )
                )}


                {CHANNEL_ORDER.map(
                  (
                    channel
                  ) => {

                    const color =
                      channelColor(
                        channel
                      );


                    const channelPoints =
                      chartData.map(
                        (
                          month,
                          index
                        ) => {

                          const value =
                            getMonthlyValue(
                              month,
                              channel
                            );

                          return {
                            month:
                              MONTH_LABELS[
                                month.month
                              ] ||
                              month.month,

                            sales:
                              value,

                            x:
                              pointX(
                                index
                              ),

                            y:
                              pointY(
                                value
                              ),
                          };
                        }
                      );


                    const linePoints =
                      channelPoints
                        .map(
                          (
                            point
                          ) =>
                            `${point.x},${point.y}`
                        )
                        .join(
                          " "
                        );


                    const isSelected =
                      selectedChannel ===
                        "all" ||
                      sameChannel(
                        selectedChannel,
                        channel
                      );


                    return (

                      <g
                        key={
                          channel
                        }
                        opacity={
                          isSelected
                            ? 1
                            : 0.35
                        }
                      >

                        <polyline
                          points={
                            linePoints
                          }
                          fill="none"
                          stroke={
                            color
                          }
                          strokeWidth={
                            selectedChannel !==
                              "all" &&
                            sameChannel(
                              selectedChannel,
                              channel
                            )
                              ? 4
                              : 2.5
                          }
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />


                        {channelPoints.map(
                          (
                            point,
                            index
                          ) => (

                            <g
                              key={`${channel}-${index}`}
                            >

                              <circle
                                cx={
                                  point.x
                                }
                                cy={
                                  point.y
                                }
                                r={
                                  hoveredPoint?.channel ===
                                    channel &&
                                  hoveredPoint?.month ===
                                    point.month
                                    ? 6
                                    : 4
                                }
                                fill={
                                  color
                                }
                                stroke="white"
                                strokeWidth="2"
                              />


                              <circle
                                cx={
                                  point.x
                                }
                                cy={
                                  point.y
                                }
                                r="12"
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() =>
                                  setHoveredPoint(
                                    {
                                      channel,

                                      month:
                                        point.month,

                                      sales:
                                        point.sales,

                                      color,

                                      x:
                                        point.x,

                                      y:
                                        point.y,
                                    }
                                  )
                                }
                              />

                            </g>

                          )
                        )}

                      </g>

                    );

                  }
                )}


                {hoveredPoint && (

                  <g
                    pointerEvents="none"
                  >

                    <rect
                      x={
                        Math.min(
                          Math.max(
                            hoveredPoint.x -
                            78,
                            5
                          ),
                          chartWidth -
                          166
                        )
                      }
                      y={
                        Math.max(
                          hoveredPoint.y -
                          80,
                          8
                        )
                      }
                      width="156"
                      height="66"
                      rx="9"
                      fill="#152A31"
                    />


                    <circle
                      cx={
                        Math.min(
                          Math.max(
                            hoveredPoint.x -
                            63,
                            20
                          ),
                          chartWidth -
                          151
                        )
                      }
                      cy={
                        Math.max(
                          hoveredPoint.y -
                          61,
                          27
                        )
                      }
                      r="4"
                      fill={
                        hoveredPoint.color
                      }
                    />


                    <text
                      x={
                        Math.min(
                          Math.max(
                            hoveredPoint.x -
                            53,
                            30
                          ),
                          chartWidth -
                          141
                        )
                      }
                      y={
                        Math.max(
                          hoveredPoint.y -
                          57,
                          31
                        )
                      }
                      fontSize="11"
                      fontWeight="600"
                      fill="white"
                    >
                      {
                        hoveredPoint.channel
                      }
                    </text>


                    <text
                      x={
                        Math.min(
                          Math.max(
                            hoveredPoint.x -
                            63,
                            20
                          ),
                          chartWidth -
                          151
                        )
                      }
                      y={
                        Math.max(
                          hoveredPoint.y -
                          39,
                          49
                        )
                      }
                      fontSize="10"
                      fill="#BFD0D0"
                    >
                      {
                        hoveredPoint.month
                      }
                    </text>


                    <text
                      x={
                        Math.min(
                          Math.max(
                            hoveredPoint.x -
                            63,
                            20
                          ),
                          chartWidth -
                          151
                        )
                      }
                      y={
                        Math.max(
                          hoveredPoint.y -
                          20,
                          68
                        )
                      }
                      fontSize="13"
                      fontWeight="700"
                      fill="white"
                    >
                      {formatBaht(
                        hoveredPoint.sales
                      )}
                    </text>

                  </g>

                )}

              </svg>

            </div>

          )}

        </section>


        {/* DONUT */}

        <section
          className="
            rounded-2xl
            border
            border-[#DBE5E2]
            bg-white
            p-4

            sm:p-5
          "
        >

          <h2
            className="
              text-[16px]
              font-bold
              text-[#192C32]
            "
          >
            สัดส่วนยอดขาย
          </h2>


          <p
            className="
              mt-1
              text-[12px]
              text-[#879398]
            "
          >
            แยกตามช่องทาง
          </p>


          <div
            className="
              mt-4
              flex
              justify-center
            "
          >

            <div
              className="
                flex
                h-[150px]
                w-[150px]
                items-center
                justify-center
                rounded-full
              "
              style={{
                background:
                  donutStops.length
                    ? `conic-gradient(${donutStops.join(
                        ","
                      )})`
                    : "#EDF2F1",
              }}
            >

              <div
                className="
                  flex
                  h-[96px]
                  w-[96px]
                  flex-col
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                "
              >

                <strong
                  className="
                    text-[16px]
                    text-[#15282F]
                  "
                >
                  {formatCompact(
                    donutTotal
                  )}
                </strong>


                <span
                  className="
                    mt-1
                    text-[10px]
                    text-[#8B989D]
                  "
                >
                  ยอดขายรวม
                </span>

              </div>

            </div>

          </div>


          <div
            className="
              mt-5
              space-y-3
            "
          >

            {donutChannels.map(
              (channel) => {

                const percent =
                  donutTotal > 0
                    ? (
                        channel.sales /
                        donutTotal
                      ) *
                      100
                    : 0;

                return (

                  <div
                    key={
                      channel.name
                    }
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        text-[12px]
                      "
                    >

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-2
                        "
                      >

                        <span
                          className="
                            h-2
                            w-2
                            shrink-0
                            rounded-full
                          "
                          style={{
                            backgroundColor:
                              channelColor(
                                channel.name
                              ),
                          }}
                        />


                        <span
                          className="
                            truncate
                            text-[#405159]
                          "
                        >
                          {
                            channel.name
                          }
                        </span>

                      </div>


                      <strong
                        className="
                          text-[#1A2C33]
                        "
                      >
                        {channel.sales > 0
                          ? `${percent.toFixed(
                              1
                            )}%`
                          : "—"}
                      </strong>

                    </div>


                    <div
                      className="
                        mt-1
                        h-1
                        overflow-hidden
                        rounded-full
                        bg-[#EDF2F1]
                      "
                    >

                      <div
                        className="
                          h-full
                          rounded-full
                        "
                        style={{
                          width:
                            `${percent}%`,

                          backgroundColor:
                            channelColor(
                              channel.name
                            ),
                        }}
                      />

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </section>

      </div>


      {/* =========================
          TABLE + INSIGHT
      ========================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-3

          xl:grid-cols-[2fr_1fr]
        "
      >

        {/* TOP PACKAGES */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-[#DBE5E2]
            bg-white
          "
        >

          <div
            className="
              px-4
              pb-3
              pt-4

              sm:px-5
            "
          >

            <h2
              className="
                text-[16px]
                font-bold
                text-[#192C32]
              "
            >
              แพ็กเกจยอดขายสูง
            </h2>


            <p
              className="
                mt-1
                text-[12px]
                text-[#879398]
              "
            >
              เรียงตามยอดขายจาก Google Sheet
            </p>

          </div>


          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                min-w-[680px]
              "
            >

              <thead>

                <tr
                  className="
                    border-y
                    border-[#EEF2F1]
                    bg-[#FBFCFC]
                  "
                >

                  <th
                    className="
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-medium
                      text-[#77868B]
                    "
                  >
                    รายการ
                  </th>


                  <th
                    className="
                      px-4
                      py-3
                      text-left
                      text-[11px]
                      font-medium
                      text-[#77868B]
                    "
                  >
                    ช่องทาง
                  </th>


                  <th
                    className="
                      px-4
                      py-3
                      text-right
                      text-[11px]
                      font-medium
                      text-[#77868B]
                    "
                  >
                    จำนวน
                  </th>


                  <th
                    className="
                      px-5
                      py-3
                      text-right
                      text-[11px]
                      font-medium
                      text-[#77868B]
                    "
                  >
                    ยอดขาย
                  </th>

                </tr>

              </thead>


              <tbody>

                {visiblePackages.length > 0 ? (

                  visiblePackages.map(
                    (
                      item
                    ) => (

                      <tr
                        key={`${item.name}-${item.channel}`}
                        className="
                          border-b
                          border-[#F0F3F2]
                        "
                      >

                        <td
                          className="
                            max-w-[460px]
                            px-5
                            py-3
                            text-[12px]
                            text-[#263A40]
                          "
                        >
                          <div
                            className="
                              line-clamp-2
                            "
                          >
                            {
                              item.name
                            }
                          </div>
                        </td>


                        <td
                          className="
                            px-4
                            py-3
                          "
                        >

                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              bg-[#F3F6F5]
                              px-2.5
                              py-1
                              text-[11px]
                              text-[#526268]
                            "
                          >

                            <span
                              className="
                                h-1.5
                                w-1.5
                                rounded-full
                              "
                              style={{
                                backgroundColor:
                                  channelColor(
                                    item.channel
                                  ),
                              }}
                            />

                            {
                              item.channel
                            }

                          </span>

                        </td>


                        <td
                          className="
                            px-4
                            py-3
                            text-right
                            text-[12px]
                            text-[#46575D]
                          "
                        >
                          {
                            item.qty
                          }
                        </td>


                        <td
                          className="
                            px-5
                            py-3
                            text-right
                            text-[12px]
                            font-bold
                            text-[#15272E]
                          "
                        >
                          {formatBaht(
                            item.sales
                          )}
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={4}
                      className="
                        px-5
                        py-12
                        text-center
                        text-sm
                        text-gray-400
                      "
                    >
                      ยังไม่มีข้อมูลแพ็กเกจ
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* SALES INSIGHT */}

        <section
          className="
            rounded-2xl
            bg-gradient-to-br
            from-[#087F74]
            to-[#008E80]
            p-5
            text-white
          "
        >

          <div>

            <h2
              className="
                text-[17px]
                font-bold
              "
            >
              Sales Insight
            </h2>


            <p
              className="
                mt-1
                text-[12px]
                text-white/75
              "
            >
              สรุปจากข้อมูลล่าสุด
            </p>

          </div>


          <div
            className="
              mt-5
              space-y-4
            "
          >

            <InsightRow
              icon="↗"
              title={
                selectedChannel ===
                "all"
                  ? `${
                      strongestChannel?.name ||
                      "-"
                    } มียอดขายสูงสุด`
                  : `${selectedChannel} ยอดขาย`
              }
              description={
                selectedChannel ===
                "all"
                  ? `${formatBaht(
                      strongestChannel?.sales ||
                      0
                    )} จากข้อมูลปี ${data.year}`
                  : `${formatBaht(
                      selectedSales
                    )} จาก ${selectedOrders.toLocaleString(
                      "th-TH"
                    )} รายการ`
              }
            />


            <InsightRow
              icon="◎"
              title="แพ็กเกจยอดขายสูงสุด"
              description={
                bestPackage
                  ? `${bestPackage.name} · ${formatBaht(
                      bestPackage.sales
                    )}`
                  : "ยังไม่มีข้อมูล"
              }
            />


            <InsightRow
              icon="!"
              title="ช่องทางที่ยังไม่มีข้อมูล"
              description={
                noDataChannels.length
                  ? noDataChannels.join(
                      ", "
                    )
                  : "มีข้อมูลครบทุกช่องทาง"
              }
            />

          </div>

        </section>

      </div>

    </div>
  );
}


function SalesKpi({
  title,
  value,
  description,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  accent: string;
}) {

  return (
    <div
      className="
        relative
        min-h-[105px]
        overflow-hidden
        rounded-2xl
        border
        border-[#DDE7E4]
        bg-white
        p-4
      "
    >

      <div
        className="
          absolute
          -right-5
          -top-5
          h-16
          w-16
          rounded-full
        "
        style={{
          backgroundColor:
            accent,
        }}
      />


      <p
        className="
          relative
          text-[11px]
          font-medium
          text-[#7C8B90]
        "
      >
        {title}
      </p>


      <div
        className="
          relative
          mt-2
          text-[20px]
          font-bold
          leading-none
          text-[#14272E]
        "
      >
        {value}
      </div>


      <p
        className="
          relative
          mt-2
          text-[10px]
          text-[#8B989D]
        "
      >
        {description}
      </p>

    </div>
  );
}


function ChannelButton({
  title,
  sales,
  percent,
  color,
  active,
  onClick,
}: {
  title: string;
  sales: number;
  percent: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        min-h-[68px]
        rounded-xl
        border
        bg-white
        p-3
        text-left
        transition

        ${
          active
            ? "border-[#008F83] shadow-[0_0_0_1px_#008F83]"
            : "border-[#E1E8E6] hover:border-[#9BCBC5]"
        }
      `}
    >

      <div
        className="
          flex
          items-center
          justify-between
          gap-2
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >

          <span
            className="
              h-2
              w-2
              shrink-0
              rounded-full
            "
            style={{
              backgroundColor:
                color,
            }}
          />


          <span
            className="
              truncate
              text-[11px]
              font-bold
              text-[#273A40]
            "
          >
            {title}
          </span>

        </div>


        <span
          className="
            shrink-0
            text-[9px]
            text-[#8C989D]
          "
        >
          {sales > 0
            ? `${percent.toFixed(
                1
              )}%`
            : "—"}
        </span>

      </div>


      <div
        className="
          mt-2
          text-[13px]
          font-bold
          text-[#15272D]
        "
      >
        {sales > 0
          ? formatCompact(
              sales
            )
          : "ไม่มีข้อมูล"}
      </div>

    </button>
  );
}


function InsightRow({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
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
          text-[13px]
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
            text-[12px]
            font-bold
          "
        >
          {title}
        </div>


        <p
          className="
            mt-0.5
            line-clamp-2
            text-[10px]
            leading-4
            text-white/75
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}