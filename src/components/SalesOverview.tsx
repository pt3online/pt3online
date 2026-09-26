"use client";

import { useState } from "react";

import {
  formatBaht,
  type ChannelSummary,
  type MonthlySales,
} from "@/lib/sales";

interface SalesOverviewProps {
  monthlySales: MonthlySales[];
  channels: ChannelSummary[];
}

type ChannelKey =
  | "Phyathai"
  | "Shopee"
  | "BeDee"
  | "HDMall"
  | "LINE"
  | "Lazada";

interface ChannelConfig {
  key: ChannelKey;
  label: string;
  color: string;
  matchNames: string[];
}

interface HoverData {
  channel: string;
  month: string;
  value: number;
  color: string;
  x: number;
  y: number;
}

const CHANNELS: ChannelConfig[] = [
  {
    key: "Phyathai",
    label: "phyathai.com",
    color: "#00826a",
    matchNames: [
      "phyathai.com",
      "Phyathai",
    ],
  },
  {
    key: "Shopee",
    label: "Shopee",
    color: "#ff8043",
    matchNames: ["Shopee"],
  },
  {
    key: "BeDee",
    label: "BeDee",
    color: "#03a9f4",
    matchNames: ["BeDee"],
  },
  {
    key: "HDMall",
    label: "HD Mall",
    color: "#4db6ac",
    matchNames: [
      "HD Mall",
      "HDMall",
    ],
  },
  {
    key: "LINE",
    label: "LINE",
    color: "#42db41",
    matchNames: ["LINE"],
  },
  {
    key: "Lazada",
    label: "Lazada",
    color: "#400c4c",
    matchNames: ["Lazada"],
  },
];

function formatCompact(
  value: number
) {
  if (value >= 1000000) {
    return `${(
      value / 1000000
    ).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${Math.round(
      value / 1000
    )}K`;
  }

  return value.toString();
}

function getChannelColor(
  name: string
) {
  const config =
    CHANNELS.find(
      (channel) =>
        channel.matchNames.some(
          (matchName) =>
            matchName
              .toLowerCase()
              .trim() ===
            name
              .toLowerCase()
              .trim()
        )
    );

  return config?.color || "#94A3B8";
}

export default function SalesOverview({
  monthlySales,
  channels,
}: SalesOverviewProps) {
  const [
    hoveredPoint,
    setHoveredPoint,
  ] = useState<HoverData | null>(
    null
  );

  let lastActiveIndex =
    monthlySales.length - 1;

  for (
    let i =
      monthlySales.length - 1;
    i >= 0;
    i--
  ) {
    if (
      monthlySales[i].total > 0
    ) {
      lastActiveIndex = i;
      break;
    }
  }

  const activeMonths =
    monthlySales.length > 0
      ? monthlySales.slice(
          0,
          lastActiveIndex + 1
        )
      : [];

  const allChannelValues =
    activeMonths.flatMap(
      (item) =>
        CHANNELS.map(
          (channel) =>
            Number(
              item[channel.key]
            ) || 0
        )
    );

  const maxMonthly =
    Math.max(
      ...allChannelValues,
      1
    );

  const sortedChannels =
    [...channels].sort(
      (a, b) =>
        b.sales - a.sales
    );

  const maxChannel =
    Math.max(
      ...sortedChannels.map(
        (item) =>
          item.sales
      ),
      1
    );

  const chartWidth = 820;
  const chartHeight = 340;

  const paddingLeft = 65;
  const paddingRight = 30;
  const paddingTop = 28;
  const paddingBottom = 55;

  const innerWidth =
    chartWidth -
    paddingLeft -
    paddingRight;

  const innerHeight =
    chartHeight -
    paddingTop -
    paddingBottom;

  function getX(
    index: number
  ) {
    if (
      activeMonths.length <= 1
    ) {
      return (
        paddingLeft +
        innerWidth / 2
      );
    }

    return (
      paddingLeft +
      (
        index /
        (
          activeMonths.length -
          1
        )
      ) *
      innerWidth
    );
  }

  function getY(
    value: number
  ) {
    return (
      paddingTop +
      innerHeight -
      (
        value /
        maxMonthly
      ) *
      innerHeight
    );
  }

  const tooltipWidth = 170;
  const tooltipHeight = 72;

  let tooltipX = 0;
  let tooltipY = 0;

  if (hoveredPoint) {
    tooltipX =
      hoveredPoint.x -
      tooltipWidth / 2;

    tooltipY =
      hoveredPoint.y -
      tooltipHeight -
      16;

    if (
      tooltipX <
      paddingLeft
    ) {
      tooltipX =
        paddingLeft;
    }

    if (
      tooltipX +
      tooltipWidth >
      chartWidth -
      paddingRight
    ) {
      tooltipX =
        chartWidth -
        paddingRight -
        tooltipWidth;
    }

    if (
      tooltipY < 5
    ) {
      tooltipY =
        hoveredPoint.y +
        18;
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">

      <div className="min-w-0 rounded-2xl border border-[#E3EBE8] bg-white p-4 sm:p-5">

        <div>
          <h3 className="text-[16px] font-bold text-[#14242B]">
            Monthly Sales by Channel
          </h3>

          <p className="mt-1 text-[13px] text-gray-500">
            แนวโน้มยอดขายรายเดือนแยกตามช่องทาง
          </p>
        </div>


        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">

          {CHANNELS.map(
            (channel) => (
              <div
                key={channel.key}
                className="flex items-center gap-2 text-[12px] text-[#53646B]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      channel.color,
                  }}
                />

                {channel.label}
              </div>
            )
          )}

        </div>


        {activeMonths.length === 0 ? (

          <div className="flex h-[320px] items-center justify-center text-sm text-gray-400">
            ยังไม่มีข้อมูลยอดขาย
          </div>

        ) : (

          <div className="mt-4 w-full overflow-x-auto">

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-[320px] min-w-[680px] w-full"
              onMouseLeave={() =>
                setHoveredPoint(null)
              }
            >

              {[0, 1, 2, 3, 4].map(
                (step) => {
                  const y =
                    paddingTop +
                    (
                      step / 4
                    ) *
                    innerHeight;

                  const value =
                    maxMonthly *
                    (
                      1 -
                      step / 4
                    );

                  return (
                    <g key={step}>

                      <line
                        x1={paddingLeft}
                        x2={
                          chartWidth -
                          paddingRight
                        }
                        y1={y}
                        y2={y}
                        stroke="#E8EEEC"
                        strokeWidth="1"
                      />

                      <text
                        x={
                          paddingLeft -
                          12
                        }
                        y={y + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="#94A3B8"
                      >
                        {formatCompact(
                          value
                        )}
                      </text>

                    </g>
                  );
                }
              )}


              {activeMonths.map(
                (
                  item,
                  index
                ) => {
                  const x =
                    getX(index);

                  return (
                    <text
                      key={item.month}
                      x={x}
                      y={
                        chartHeight -
                        18
                      }
                      textAnchor="middle"
                      fontSize="12"
                      fill="#64748B"
                    >
                      {item.month}
                    </text>
                  );
                }
              )}


              {CHANNELS.map(
                (channel) => {

                  const points =
                    activeMonths.map(
                      (
                        item,
                        index
                      ) => {
                        const value =
                          Number(
                            item[
                              channel.key
                            ]
                          ) || 0;

                        return {
                          x:
                            getX(
                              index
                            ),

                          y:
                            getY(
                              value
                            ),

                          value,

                          month:
                            item.month,
                        };
                      }
                    );

                  const linePoints =
                    points
                      .map(
                        (
                          point
                        ) =>
                          `${point.x},${point.y}`
                      )
                      .join(" ");

                  return (
                    <g
                      key={channel.key}
                    >

                      <polyline
                        points={
                          linePoints
                        }
                        fill="none"
                        stroke={
                          channel.color
                        }
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />


                      {points.map(
                        (
                          point,
                          index
                        ) => (
                          <g
                            key={`${channel.key}-${index}`}
                          >

                            <circle
                              cx={point.x}
                              cy={point.y}
                              r={
                                hoveredPoint?.channel ===
                                  channel.label &&
                                hoveredPoint?.month ===
                                  point.month
                                  ? 7
                                  : 5
                              }
                              fill={
                                channel.color
                              }
                              stroke="white"
                              strokeWidth="2"
                            />


                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="13"
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() =>
                                setHoveredPoint({
                                  channel:
                                    channel.label,

                                  month:
                                    point.month,

                                  value:
                                    point.value,

                                  color:
                                    channel.color,

                                  x:
                                    point.x,

                                  y:
                                    point.y,
                                })
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

                <g pointerEvents="none">

                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={
                      tooltipWidth
                    }
                    height={
                      tooltipHeight
                    }
                    rx="10"
                    fill="#14242B"
                    opacity="0.96"
                  />


                  <circle
                    cx={
                      tooltipX + 15
                    }
                    cy={
                      tooltipY + 19
                    }
                    r="5"
                    fill={
                      hoveredPoint.color
                    }
                  />


                  <text
                    x={
                      tooltipX + 27
                    }
                    y={
                      tooltipY + 23
                    }
                    fontSize="12"
                    fontWeight="600"
                    fill="white"
                  >
                    {
                      hoveredPoint.channel
                    }
                  </text>


                  <text
                    x={
                      tooltipX + 15
                    }
                    y={
                      tooltipY + 43
                    }
                    fontSize="11"
                    fill="#B8C7C5"
                  >
                    {
                      hoveredPoint.month
                    }
                  </text>


                  <text
                    x={
                      tooltipX + 15
                    }
                    y={
                      tooltipY + 62
                    }
                    fontSize="14"
                    fontWeight="700"
                    fill="white"
                  >
                    {formatBaht(
                      hoveredPoint.value
                    )}
                  </text>

                </g>

              )}

            </svg>

          </div>

        )}

      </div>


      <div className="rounded-2xl border border-[#E3EBE8] bg-white p-4 sm:p-5">

        <div>

          <h3 className="text-[16px] font-bold text-[#14242B]">
            Revenue by Channel
          </h3>

          <p className="mt-1 text-[13px] text-gray-500">
            ยอดขายรวมแยกตามช่องทาง
          </p>

        </div>


        <div className="mt-6 space-y-5">

          {sortedChannels.map(
            (channel) => {

              const percentage =
                maxChannel > 0
                  ? (
                      channel.sales /
                      maxChannel
                    ) * 100
                  : 0;

              const color =
                getChannelColor(
                  channel.name
                );

              return (
                <div
                  key={
                    channel.name
                  }
                >

                  <div className="mb-2 flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-2">

                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            color,
                        }}
                      />

                      <span className="min-w-0 truncate text-[13px] font-medium text-[#34454C]">
                        {channel.name}
                      </span>

                    </div>


                    <span className="shrink-0 text-[13px] font-semibold text-[#14242B]">
                      {formatBaht(
                        channel.sales
                      )}
                    </span>

                  </div>


                  <div className="h-2.5 overflow-hidden rounded-full bg-[#EDF3F1]">

                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor:
                          color,

                        width:
                          channel.sales >
                          0
                            ? `${Math.max(
                                percentage,
                                2
                              )}%`
                            : "0%",
                      }}
                    />

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

    </div>
  );
}