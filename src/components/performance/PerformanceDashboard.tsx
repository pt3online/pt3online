"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type FacebookItem = {
  id: string;
  budget: number;
  cluster: string;
  okrCategory: string;
  channel: string;
  title: string;
  publishedAt: string;
  link: string;

  view: number;
  reach: number;

  engagementBase: number;
  reaction: number;
  comment: number;
  share: number;

  click: number;
};

type WebsiteItem = {
  id: string;
  cluster: string;
  okrCategory: string;
  channel: string;
  title: string;
  publishedAt: string;
  link: string;
};

type TiktokItem = {
  id: string;
  cluster: string;
  okrCategory: string;
  channel: string;
  title: string;
  publishedAt: string;
  link: string;

  like: number;
  comment: number;
  share: number;
  view: number;
};

type ApiResponse = {
  success?: boolean;
  updatedAt?: string;

  facebook?: FacebookItem[];
  website?: WebsiteItem[];
  tiktok?: TiktokItem[];

  message?: string;
};

type ContentRecord = {
  source:
    | "Facebook"
    | "Website"
    | "TikTok";

  cluster: string;
  okrCategory: string;
  publishedAt: string;
};

type ChartItem = {
  label: string;
  value: number;
  color?: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const OKR_COLORS: Record<
  string,
  string
> = {
  Disease: "#ef9699",
  Doctor: "#7baee8",
  Lifestyle: "#8dd4c1",
  Promotion: "#f5c56e",
  Other: "#ad98dc",
};

const OKR_ORDER = [
  "Disease",
  "Doctor",
  "Lifestyle",
  "Promotion",
  "Other",
];

/* =========================================================
   HELPERS
========================================================= */

function parseDate(
  value: string
) {
  if (!value) {
    return null;
  }

  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function monthKey(
  value: string
) {
  const date =
    parseDate(value);

  if (!date) {
    return "";
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatThaiMonth(
  value: string
) {
  const [
    yearString,
    monthString,
  ] = value.split("-");

  const year =
    Number(yearString);

  const month =
    Number(monthString);

  if (
    !year ||
    !month
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "th-TH",
    {
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      1
    )
  );
}

function formatTableDate(
  value: string
) {
  const date =
    parseDate(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

function normalizeOkr(
  value: string
) {
  const text =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();

  if (
    text === "disease"
  ) {
    return "Disease";
  }

  if (
    text === "doctor"
  ) {
    return "Doctor";
  }

  if (
    text === "lifestyle"
  ) {
    return "Lifestyle";
  }

  if (
    text ===
    "promotion"
  ) {
    return "Promotion";
  }

  return "Other";
}

function safeNumber(
  value: unknown
) {
  const n =
    Number(value);

  return Number.isFinite(
    n
  )
    ? n
    : 0;
}

function formatNumber(
  value: number
) {
  return Math.round(
    value
  ).toLocaleString(
    "en-US"
  );
}

/*
 * สูตร Engagement ตามที่กำหนด:
 *
 * K + L + M + N
 */

function facebookEngagement(
  row: FacebookItem
) {
  return (
    safeNumber(
      row.engagementBase
    ) +
    safeNumber(
      row.reaction
    ) +
    safeNumber(
      row.comment
    ) +
    safeNumber(
      row.share
    )
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function PerformanceDashboard() {
  const now =
    useMemo(
      () => new Date(),
      []
    );

  const currentMonthKey =
    `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

  const [
    facebook,
    setFacebook,
  ] = useState<
    FacebookItem[]
  >([]);

  const [
    website,
    setWebsite,
  ] = useState<
    WebsiteItem[]
  >([]);

  const [
    tiktok,
    setTiktok,
  ] = useState<
    TiktokItem[]
  >([]);

  const [
    updatedAt,
    setUpdatedAt,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * Filter ด้านบน
   */

  const [
    monthFilter,
    setMonthFilter,
  ] = useState("ALL");

  const [
    clusterFilter,
    setClusterFilter,
  ] = useState("ALL");

  /*
   * Social Media Performance
   * มี Filter เดือนของตัวเอง
   */

  const [
    socialMonth,
    setSocialMonth,
  ] = useState(
    currentMonthKey
  );

  /*
   * Sort View
   */

  const [
    viewSort,
    setViewSort,
  ] = useState<
    "desc" | "asc"
  >("desc");

  /* =========================================================
     LOAD
  ========================================================= */

  const loadData =
    useCallback(
      async (
        background = false
      ) => {
        try {
          if (
            background
          ) {
            setRefreshing(
              true
            );
          } else {
            setLoading(
              true
            );
          }

          setError("");

          const response =
            await fetch(
              `/api/performance?t=${Date.now()}`,
              {
                cache:
                  "no-store",
              }
            );

          const text =
            await response.text();

          let result:
            ApiResponse;

          try {
            result =
              JSON.parse(
                text
              );
          } catch {
            throw new Error(
              "Performance API ส่งข้อมูลที่ไม่ใช่ JSON"
            );
          }

          if (
            !response.ok ||
            result.success ===
              false
          ) {
            throw new Error(
              result.message ||
                `API HTTP ${response.status}`
            );
          }

          const fb =
            Array.isArray(
              result.facebook
            )
              ? result.facebook
              : [];

          const web =
            Array.isArray(
              result.website
            )
              ? result.website
              : [];

          const tik =
            Array.isArray(
              result.tiktok
            )
              ? result.tiktok
              : [];

          setFacebook(
            fb
          );

          setWebsite(
            web
          );

          setTiktok(
            tik
          );

          setUpdatedAt(
            result.updatedAt ||
              ""
          );

          /*
           * Cache ฝั่ง Browser
           * ทำให้เปิด Performance
           * รอบต่อไปเร็วขึ้น
           */

          try {
            sessionStorage.setItem(
              "pt3-performance-cache",
              JSON.stringify({
                facebook:
                  fb,

                website:
                  web,

                tiktok:
                  tik,

                updatedAt:
                  result.updatedAt ||
                  "",
              })
            );
          } catch {
            //
          }
        } catch (err) {
          setError(
            err instanceof
            Error
              ? err.message
              : "โหลดข้อมูล Performance ไม่สำเร็จ"
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    let hasCache =
      false;

    try {
      const cache =
        sessionStorage.getItem(
          "pt3-performance-cache"
        );

      if (cache) {
        const parsed =
          JSON.parse(
            cache
          );

        if (
          Array.isArray(
            parsed.facebook
          ) &&
          Array.isArray(
            parsed.website
          ) &&
          Array.isArray(
            parsed.tiktok
          )
        ) {
          setFacebook(
            parsed.facebook
          );

          setWebsite(
            parsed.website
          );

          setTiktok(
            parsed.tiktok
          );

          setUpdatedAt(
            parsed.updatedAt ||
              ""
          );

          setLoading(
            false
          );

          hasCache =
            true;
        }
      }
    } catch {
      //
    }

    loadData(
      hasCache
    );
  }, [loadData]);

  /* =========================================================
     COMBINED CONTENT
  ========================================================= */

  const combined =
    useMemo<
      ContentRecord[]
    >(() => {
      const fb =
        facebook.map(
          (row) => ({
            source:
              "Facebook" as const,

            cluster:
              row.cluster ||
              "Other",

            okrCategory:
              normalizeOkr(
                row.okrCategory
              ),

            publishedAt:
              row.publishedAt,
          })
        );

      const web =
        website.map(
          (row) => ({
            source:
              "Website" as const,

            cluster:
              row.cluster ||
              "Other",

            okrCategory:
              normalizeOkr(
                row.okrCategory
              ),

            publishedAt:
              row.publishedAt,
          })
        );

      const tik =
        tiktok.map(
          (row) => ({
            source:
              "TikTok" as const,

            cluster:
              row.cluster ||
              "Other",

            okrCategory:
              normalizeOkr(
                row.okrCategory
              ),

            publishedAt:
              row.publishedAt,
          })
        );

      return [
        ...fb,
        ...web,
        ...tik,
      ];
    }, [
      facebook,
      website,
      tiktok,
    ]);

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const monthOptions =
    useMemo(() => {
      return Array.from(
        new Set(
          combined
            .map(
              (row) =>
                monthKey(
                  row.publishedAt
                )
            )
            .filter(Boolean)
        )
      ).sort(
        (a, b) =>
          b.localeCompare(
            a
          )
      );
    }, [combined]);

  const clusterOptions =
    useMemo(() => {
      return Array.from(
        new Set(
          combined
            .map(
              (row) =>
                row.cluster
            )
            .filter(Boolean)
        )
      ).sort((a, b) =>
        a.localeCompare(
          b
        )
      );
    }, [combined]);

  const socialMonthOptions =
    useMemo(() => {
      const values =
        Array.from(
          new Set(
            facebook
              .map(
                (row) =>
                  monthKey(
                    row.publishedAt
                  )
              )
              .filter(Boolean)
          )
        );

      if (
        !values.includes(
          currentMonthKey
        )
      ) {
        values.push(
          currentMonthKey
        );
      }

      return values.sort(
        (a, b) =>
          b.localeCompare(
            a
          )
      );
    }, [
      facebook,
      currentMonthKey,
    ]);

  /* =========================================================
     TOP FILTER
  ========================================================= */

  const filteredCombined =
    useMemo(() => {
      return combined.filter(
        (row) => {
          if (
            monthFilter !==
              "ALL" &&
            monthKey(
              row.publishedAt
            ) !==
              monthFilter
          ) {
            return false;
          }

          if (
            clusterFilter !==
              "ALL" &&
            row.cluster !==
              clusterFilter
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      combined,
      monthFilter,
      clusterFilter,
    ]);

  /* =========================================================
     KPI
  ========================================================= */

  const totalContent =
    filteredCombined.length;

  const facebookCount =
    filteredCombined.filter(
      (row) =>
        row.source ===
        "Facebook"
    ).length;

  const websiteCount =
    filteredCombined.filter(
      (row) =>
        row.source ===
        "Website"
    ).length;

  const tiktokCount =
    filteredCombined.filter(
      (row) =>
        row.source ===
        "TikTok"
    ).length;

  /* =========================================================
     OKR CATEGORY
  ========================================================= */

  const okrData =
    useMemo<
      ChartItem[]
    >(() => {
      return OKR_ORDER.map(
        (category) => {
          const count =
            filteredCombined.filter(
              (row) =>
                row.okrCategory ===
                category
            ).length;

          return {
            label:
              category,

            value:
              count,

            color:
              OKR_COLORS[
                category
              ],
          };
        }
      );
    }, [
      filteredCombined,
    ]);

  /* =========================================================
     CHANNEL
  ========================================================= */

  const channelData =
    useMemo<
      ChartItem[]
    >(() => {
      return [
        {
          label:
            "Facebook",

          value:
            facebookCount,

          color:
            "#2464c6",
        },

        {
          label:
            "Website",

          value:
            websiteCount,

          color:
            "#22a8ae",
        },

        {
          label:
            "TikTok",

          value:
            tiktokCount,

          color:
            "#0d2457",
        },
      ];
    }, [
      facebookCount,
      websiteCount,
      tiktokCount,
    ]);

  /* =========================================================
     CLUSTER TOP 20
  ========================================================= */

  const clusterData =
    useMemo<
      ChartItem[]
    >(() => {
      const map =
        new Map<
          string,
          number
        >();

      filteredCombined.forEach(
        (row) => {
          const cluster =
            row.cluster ||
            "Other";

          map.set(
            cluster,

            (map.get(
              cluster
            ) || 0) + 1
          );
        }
      );

      return Array.from(
        map.entries()
      )
        .map(
          ([
            label,
            value,
          ]) => ({
            label,
            value,
            color:
              "#6b6fe3",
          })
        )
        .sort(
          (a, b) =>
            b.value -
            a.value
        )
        .slice(
          0,
          20
        );
    }, [
      filteredCombined,
    ]);

  /* =========================================================
     MONTHLY TREND

     ใช้ Cluster filter
     แต่ยังแสดงทั้งปี
     เพื่อให้ดู Trend ได้ครบ
  ========================================================= */

  const monthData =
    useMemo<
      ChartItem[]
    >(() => {
      const year =
        2026;

      const base =
        Array.from(
          {
            length: 12,
          },
          (
            _,
            index
          ) => ({
            label:
              [
                "ม.ค.",
                "ก.พ.",
                "มี.ค.",
                "เม.ย.",
                "พ.ค.",
                "มิ.ย.",
                "ก.ค.",
                "ส.ค.",
                "ก.ย.",
                "ต.ค.",
                "พ.ย.",
                "ธ.ค.",
              ][index],

            value: 0,

            color:
              "#0bbd95",
          })
        );

      combined.forEach(
        (row) => {
          if (
            clusterFilter !==
              "ALL" &&
            row.cluster !==
              clusterFilter
          ) {
            return;
          }

          const date =
            parseDate(
              row.publishedAt
            );

          if (
            !date ||
            date.getFullYear() !==
              year
          ) {
            return;
          }

          base[
            date.getMonth()
          ].value += 1;
        }
      );

      return base;
    }, [
      combined,
      clusterFilter,
    ]);

  /* =========================================================
     SOCIAL MEDIA PERFORMANCE

     เฉพาะ FACEBOOK เท่านั้น
  ========================================================= */

  const socialRows =
    useMemo(() => {
      return facebook.filter(
        (row) => {
          if (
            monthKey(
              row.publishedAt
            ) !==
            socialMonth
          ) {
            return false;
          }

          if (
            clusterFilter !==
              "ALL" &&
            row.cluster !==
              clusterFilter
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      facebook,
      socialMonth,
      clusterFilter,
    ]);

  const socialMetrics =
    useMemo(() => {
      return socialRows.reduce(
        (
          result,
          row
        ) => {
          result.view +=
            safeNumber(
              row.view
            );

          result.reach +=
            safeNumber(
              row.reach
            );

          /*
           * Engagement =
           * K + L + M + N
           */

          result.engagement +=
            facebookEngagement(
              row
            );

          result.click +=
            safeNumber(
              row.click
            );

          return result;
        },
        {
          view: 0,
          reach: 0,
          engagement: 0,
          click: 0,
        }
      );
    }, [socialRows]);

  /* =========================================================
     VIEW SORT
  ========================================================= */

  const sortedSocialRows =
    useMemo(() => {
      return [
        ...socialRows,
      ].sort(
        (a, b) => {
          const difference =
            safeNumber(
              a.view
            ) -
            safeNumber(
              b.view
            );

          if (
            difference !==
            0
          ) {
            return viewSort ===
              "asc"
              ? difference
              : -difference;
          }

          return (
            parseDate(
              b.publishedAt
            )?.getTime() ||
            0
          ) -
            (
              parseDate(
                a.publishedAt
              )?.getTime() ||
              0
            );
        }
      );
    }, [
      socialRows,
      viewSort,
    ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading &&
    combined.length ===
      0
  ) {
    return (
      <div className="rounded-[26px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-teal-500" />

          <div>
            <div className="text-lg font-black text-slate-800">
              กำลังโหลด Performance
            </div>

            <div className="mt-1 text-sm text-slate-500">
              กำลังเชื่อมต่อ Facebook, Website และ TikTok...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    error &&
    combined.length ===
      0
  ) {
    return (
      <div className="rounded-[26px] border border-red-200 bg-red-50 p-8">
        <h2 className="text-xl font-black text-red-700">
          โหลดข้อมูลไม่สำเร็จ
        </h2>

        <p className="mt-3 text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            loadData(false)
          }
          className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  const okrTotal =
    okrData.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.value,
      0
    );

  return (
    <div className="space-y-5 pb-12">
      {/* HEADER */}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-[#112342] sm:text-4xl">
            Performance Post Dashboard
          </h1>

          <p className="mt-3 text-base text-slate-500 sm:text-lg">
            สรุป Content Performance แยกตาม Channel, OKR Category และ Cluster
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {updatedAt && (
            <div className="text-sm font-medium text-slate-500">
              อัปเดตล่าสุด:{" "}
              {
                updatedAt
              }
            </div>
          )}

          <button
            type="button"
            disabled={
              refreshing
            }
            onClick={() =>
              loadData(true)
            }
            className="rounded-2xl bg-[#0bbd95] px-7 py-4 text-base font-black text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {refreshing
              ? "กำลังอัปเดต..."
              : "↻ Refresh"}
          </button>
        </div>
      </section>

      {/* FILTER */}

      <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="mb-2 block font-bold text-slate-500">
              เดือน
            </label>

            <select
              value={
                monthFilter
              }
              onChange={(e) =>
                setMonthFilter(
                  e.target.value
                )
              }
              className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="ALL">
                ทุกเดือน
              </option>

              {monthOptions.map(
                (month) => (
                  <option
                    key={
                      month
                    }
                    value={
                      month
                    }
                  >
                    {formatThaiMonth(
                      month
                    )}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-bold text-slate-500">
              ศูนย์ / Cluster
            </label>

            <select
              value={
                clusterFilter
              }
              onChange={(e) =>
                setClusterFilter(
                  e.target.value
                )
              }
              className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="ALL">
                ทุกศูนย์
              </option>

              {clusterOptions.map(
                (cluster) => (
                  <option
                    key={
                      cluster
                    }
                    value={
                      cluster
                    }
                  >
                    {cluster}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setMonthFilter(
                  "ALL"
                );

                setClusterFilter(
                  "ALL"
                );
              }}
              className="h-14 whitespace-nowrap rounded-2xl bg-slate-100 px-7 font-black text-slate-600 transition hover:bg-slate-200"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </section>

      {/* MAIN KPI */}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MainKpi
          title="TOTAL CONTENT"
          value={
            totalContent
          }
          color="text-[#0bbd95]"
        />

        <MainKpi
          title="FACEBOOK"
          value={
            facebookCount
          }
          color="text-[#2464c6]"
        />

        <MainKpi
          title="WEBSITE"
          value={
            websiteCount
          }
          color="text-[#22a8ae]"
        />

        <MainKpi
          title="TIKTOK"
          value={
            tiktokCount
          }
          color="text-[#112342]"
        />
      </section>

      {/* OKR CARDS */}

      <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-2xl font-black text-[#112342]">
          Content by OKR Category
        </h2>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          ข้อมูล OKR Category จาก Facebook, Website และ TikTok
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {okrData.map(
            (item) => {
              const percent =
                okrTotal >
                0
                  ? (item.value /
                      okrTotal) *
                    100
                  : 0;

              return (
                <div
                  key={
                    item.label
                  }
                  className="rounded-2xl p-5 text-center"
                  style={{
                    backgroundColor:
                      `${item.color}20`,
                  }}
                >
                  <div
                    className="font-black"
                    style={{
                      color:
                        item.color,
                    }}
                  >
                    {
                      item.label
                    }
                  </div>

                  <div
                    className="mt-3 text-3xl font-black"
                    style={{
                      color:
                        item.color,
                    }}
                  >
                    {
                      item.value
                    }
                  </div>

                  <div
                    className="mt-2 text-sm font-bold"
                    style={{
                      color:
                        item.color,
                    }}
                  >
                    {percent.toFixed(
                      1
                    )}
                    %
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* CHANNEL + DONUT */}

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Content by Channel"
          subtitle="จำนวน Content แยกตาม Channel"
        >
          <BarChart
            data={
              channelData
            }
            minWidth={
              520
            }
          />
        </ChartCard>

        <ChartCard
          title="OKR Category"
          subtitle="จำนวนและสัดส่วน Content ตาม OKR Category"
        >
          <DonutChart
            data={
              okrData
            }
          />
        </ChartCard>
      </section>

      {/* CLUSTER + MONTH */}

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Content by Cluster"
          subtitle="20 อันดับแรก เรียงตามจำนวน Content จากมากไปน้อย"
        >
          <BarChart
            data={
              clusterData
            }
            minWidth={
              1000
            }
            rotateLabels
          />
        </ChartCard>

        <ChartCard
          title="CONTENT BY MONTH"
          subtitle="จำนวน Post ในแต่ละเดือน"
        >
          <BarChart
            data={
              monthData
            }
            minWidth={
              760
            }
          />
        </ChartCard>
      </section>

      {/* SOCIAL MEDIA PERFORMANCE */}

      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-200 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#112342]">
              Social Media Performance Overview
            </h2>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              แสดงผลรวมรายเดือนและรายละเอียดแต่ละโพสต์จาก Facebook
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-500">
                เลือกเดือน
              </label>

              <select
                value={
                  socialMonth
                }
                onChange={(e) =>
                  setSocialMonth(
                    e.target.value
                  )
                }
                className="h-14 min-w-[230px] rounded-2xl border border-slate-300 bg-white px-4 font-medium text-slate-800 outline-none"
              >
                {socialMonthOptions.map(
                  (month) => (
                    <option
                      key={
                        month
                      }
                      value={
                        month
                      }
                    >
                      {formatThaiMonth(
                        month
                      )}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="pb-3 text-xl font-black text-[#112342]">
              {
                socialRows.length
              }{" "}
              รายการ
            </div>
          </div>
        </div>

        {/* FB KPI */}

        <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
          <SocialMetric
            icon="◉"
            iconBg="#07899c"
            title="ยอดดูรวม (View)"
            value={
              socialMetrics.view
            }
            unit="ครั้ง"
          />

          <SocialMetric
            icon="♟"
            iconBg="#62c9aa"
            title="การเข้าถึงรวม (Reach)"
            value={
              socialMetrics.reach
            }
            unit="คน"
          />

          <SocialMetric
            icon="♥"
            iconBg="#fb5b72"
            title="ความรู้สึก ความคิดเห็น และการแชร์รวม (Engagement)"
            value={
              socialMetrics.engagement
            }
            unit="ครั้ง"
          />

          <SocialMetric
            icon="↖"
            iconBg="#4a95e8"
            title="การคลิกทั้งหมด (Click)"
            value={
              socialMetrics.click
            }
            unit="ครั้ง"
          />
        </div>

        {/* MONTH BAR */}

        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
          <h3 className="text-xl font-black text-[#112342]">
            {formatThaiMonth(
              socialMonth
            )}
          </h3>

          <div className="text-lg font-black text-[#06a8c4]">
            {
              socialRows.length
            }{" "}
            รายการ
          </div>
        </div>

        {/* FACEBOOK TABLE */}

        <div className="overflow-x-auto">
          <table className="min-w-[1150px] w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <TableHead>
                  Channel
                </TableHead>

                <TableHead>
                  Post
                </TableHead>

                <TableHead>
                  วันที่
                </TableHead>

                <th className="px-5 py-5 text-sm font-black text-slate-500">
                  <button
                    type="button"
                    onClick={() =>
                      setViewSort(
                        (
                          current
                        ) =>
                          current ===
                          "desc"
                            ? "asc"
                            : "desc"
                      )
                    }
                    className="flex items-center gap-2 font-black transition hover:text-teal-600"
                  >
                    ยอดดู

                    <span className="text-teal-500">
                      {viewSort ===
                      "desc"
                        ? "↓"
                        : "↑"}
                    </span>
                  </button>
                </th>

                <TableHead>
                  Reach
                </TableHead>

                <TableHead>
                  Engagement
                </TableHead>

                <TableHead>
                  Click
                </TableHead>

                <TableHead>
                  เปิดโพสต์
                </TableHead>
              </tr>
            </thead>

            <tbody>
              {sortedSocialRows.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={
                      8
                    }
                    className="px-5 py-14 text-center text-slate-400"
                  >
                    ไม่พบข้อมูล Facebook ในเดือนที่เลือก
                  </td>
                </tr>
              ) : (
                sortedSocialRows.map(
                  (
                    row,
                    index
                  ) => (
                    <tr
                      key={`${row.id}-${row.publishedAt}-${index}`}
                      className="border-b border-slate-100 align-middle transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-700">
                          {row.channel ||
                            "Facebook"}
                        </span>
                      </td>

                      <td className="max-w-[500px] px-5 py-5">
                        <div
                          className="line-clamp-2 text-sm font-medium leading-6 text-slate-800 sm:text-base"
                          title={
                            row.title
                          }
                        >
                          {
                            row.title
                          }
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 font-medium text-slate-700">
                        {formatTableDate(
                          row.publishedAt
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 font-bold text-slate-700">
                        {formatNumber(
                          row.view
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 font-bold text-slate-700">
                        {formatNumber(
                          row.reach
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 font-bold text-slate-700">
                        {formatNumber(
                          facebookEngagement(
                            row
                          )
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 font-bold text-slate-700">
                        {formatNumber(
                          row.click
                        )}
                      </td>

                      <td className="px-5 py-5">
                        {row.link ? (
                          <a
                            href={
                              row.link
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-xl bg-[#06a8c4] px-5 py-3 text-sm font-black text-white transition hover:opacity-90"
                          >
                            LINK ↗
                          </a>
                        ) : (
                          <span className="text-slate-300">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function MainKpi({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="text-sm font-black uppercase tracking-wide text-slate-500">
        {title}
      </div>

      <div
        className={`mt-5 text-5xl font-black ${color}`}
      >
        {formatNumber(
          value
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-2xl font-black text-[#112342]">
        {title}
      </h2>

      <p className="mt-2 text-sm text-slate-500 sm:text-base">
        {subtitle}
      </p>

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}

function BarChart({
  data,
  minWidth,
  rotateLabels = false,
}: {
  data: ChartItem[];
  minWidth: number;
  rotateLabels?: boolean;
}) {
  const maxValue =
    Math.max(
      1,
      ...data.map(
        (item) =>
          item.value
      )
    );

  return (
    <div className="overflow-x-auto">
      <div
        className="flex h-[390px] items-end gap-4 border-b border-slate-300 px-4 pt-8"
        style={{
          minWidth,
        }}
      >
        {data.map(
          (item) => {
            const height =
              item.value >
              0
                ? Math.max(
                    5,
                    (item.value /
                      maxValue) *
                      82
                  )
                : 0;

            return (
              <div
                key={
                  item.label
                }
                className="flex h-full min-w-[42px] flex-1 flex-col justify-end"
              >
                <div className="flex flex-1 flex-col justify-end">
                  <div className="mb-2 text-center text-xs font-black text-[#112342] sm:text-sm">
                    {item.value >
                      0 &&
                      formatNumber(
                        item.value
                      )}
                  </div>

                  <div
                    className="mx-auto w-[70%] min-w-[28px] max-w-[80px] rounded-t-xl transition-all"
                    style={{
                      height: `${height}%`,
                      backgroundColor:
                        item.color ||
                        "#0bbd95",
                    }}
                  />
                </div>

                <div
                  className={`h-[72px] pt-3 text-xs font-medium text-slate-600 ${
                    rotateLabels
                      ? "flex items-start justify-center"
                      : "text-center"
                  }`}
                >
                  <span
                    className={
                      rotateLabels
                        ? "inline-block origin-center -rotate-45 whitespace-nowrap"
                        : ""
                    }
                    title={
                      item.label
                    }
                  >
                    {
                      item.label
                    }
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function DonutChart({
  data,
}: {
  data: ChartItem[];
}) {
  const total =
    data.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.value,
      0
    );

  let current = 0;

  const parts =
    data.map(
      (item) => {
        const percentage =
          total > 0
            ? (item.value /
                total) *
              100
            : 0;

        const start =
          current;

        const end =
          current +
          percentage;

        current = end;

        return `${
          item.color ||
          "#ccc"
        } ${start}% ${end}%`;
      }
    );

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center">
      <div
        className="relative h-[290px] w-[290px] shrink-0 rounded-full"
        style={{
          background:
            total > 0
              ? `conic-gradient(${parts.join(
                  ","
                )})`
              : "#e2e8f0",
        }}
      >
        <div className="absolute inset-[72px] flex flex-col items-center justify-center rounded-full bg-white">
          <div className="text-3xl font-black text-[#112342]">
            {formatNumber(
              total
            )}
          </div>

          <div className="text-xs font-bold text-slate-400">
            CONTENT
          </div>
        </div>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-[360px]">
        {data.map(
          (item) => {
            const percent =
              total >
              0
                ? (item.value /
                    total) *
                  100
                : 0;

            return (
              <div
                key={
                  item.label
                }
                className="flex items-center gap-3"
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      item.color,
                  }}
                />

                <span className="text-sm font-medium text-slate-700">
                  {
                    item.label
                  }{" "}
                  <strong>
                    {
                      item.value
                    }
                  </strong>{" "}
                  (
                  {percent.toFixed(
                    1
                  )}
                  %)
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function SocialMetric({
  icon,
  iconBg,
  title,
  value,
  unit,
}: {
  icon: string;
  iconBg: string;
  title: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="border-b border-slate-100 p-5 sm:p-7 xl:border-b-0 xl:border-r xl:last:border-r-0">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl font-black text-white shadow-md"
          style={{
            backgroundColor:
              iconBg,
          }}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-xs font-normal leading-5 text-slate-700 sm:text-sm">
            {title}
            </div>

          <div className="mt-2 text-3xl font-black text-[#071e66] sm:text-4xl">
            {formatNumber(
              value
            )}
          </div>

          <div className="text-sm font-medium text-slate-500">
            {unit}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableHead({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-5 py-5 text-sm font-black text-slate-500">
      {children}
    </th>
  );
}