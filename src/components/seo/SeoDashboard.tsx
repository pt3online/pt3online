"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type SeoItem = {
  id: string;

  keySearch: string;
  cluster: string;
  topic: string;
  doctor: string;
  link: string;

  googlePageResult: number | string;
  googleRanking: number | string;
  aio: number | string;
  statusQA: number | string;

  dateCheck: string;

  isSeo: boolean;
  isAseo: boolean;
  isQA: boolean;
};

type ApiResponse = {
  success?: boolean;

  updatedAt?: string;
  note?: string;

  count?: number;

  data?: SeoItem[];

  message?: string;
};

type SearchType =
  | "ALL"
  | "SEO"
  | "ASEO"
  | "QA";

type ClusterChartItem = {
  cluster: string;
  seo: number;
  aseo: number;
  total: number;
};

/* =========================================================
   CONSTANTS
========================================================= */

const ITEMS_PER_PAGE = 20;

/*
 * Badge "อัปเดตล่าสุด"
 * แสดงเฉพาะ 10 อันดับแรก
 * ของหน้าแรก
 */
const LATEST_BADGE_COUNT = 10;

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number) {
  return value.toLocaleString(
    "en-US"
  );
}

function percentage(
  value: number,
  total: number
) {
  if (total <= 0) {
    return "0.00";
  }

  return (
    (value / total) *
    100
  ).toFixed(2);
}

function parseDateValue(
  value: string
) {
  if (!value) {
    return 0;
  }

  const iso =
    value.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})/
    );

  if (iso) {
    return new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3])
    ).getTime();
  }

  const slash =
    value.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
    );

  if (slash) {
    let year =
      Number(
        slash[3]
      );

    if (year > 2400) {
      year -= 543;
    }

    return new Date(
      year,
      Number(slash[2]) - 1,
      Number(slash[1])
    ).getTime();
  }

  const parsed =
    new Date(value);

  const time =
    parsed.getTime();

  return Number.isNaN(time)
    ? 0
    : time;
}

function formatLastUpdate(
  value: string
) {
  if (!value) {
    return "-";
  }

  return value.replace(
    /^Last update\s*:\s*/i,
    ""
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function SeoDashboard() {
  const [
    rows,
    setRows,
  ] =
    useState<SeoItem[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    updatedAt,
    setUpdatedAt,
  ] =
    useState("");

  const [
    note,
    setNote,
  ] =
    useState("");

  /* =========================================================
     FILTER
  ========================================================= */

  const [
    clusterFilter,
    setClusterFilter,
  ] =
    useState("ALL");

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<SearchType>(
      "ALL"
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    tableSearch,
    setTableSearch,
  ] =
    useState("");

  /* =========================================================
     PAGINATION
  ========================================================= */

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(1);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData =
    useCallback(
      async (
        background = false
      ) => {
        try {
          if (background) {
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
              `/api/seo?t=${Date.now()}`,
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
              "SEO API ส่งข้อมูลที่ไม่ใช่ JSON"
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

          const newRows =
            Array.isArray(
              result.data
            )
              ? result.data
              : [];

          setRows(
            newRows
          );

          setUpdatedAt(
            result.updatedAt ||
              ""
          );

          setNote(
            result.note ||
              ""
          );

          try {
            sessionStorage.setItem(
              "pt3-seo-cache",
              JSON.stringify({
                data:
                  newRows,

                updatedAt:
                  result.updatedAt ||
                  "",

                note:
                  result.note ||
                  "",
              })
            );
          } catch {
            //
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "โหลดข้อมูล SEO / ASEO ไม่สำเร็จ"
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
          "pt3-seo-cache"
        );

      if (cache) {
        const parsed =
          JSON.parse(
            cache
          );

        if (
          Array.isArray(
            parsed.data
          )
        ) {
          setRows(
            parsed.data
          );

          setUpdatedAt(
            parsed.updatedAt ||
              ""
          );

          setNote(
            parsed.note ||
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
     CLUSTER OPTIONS
  ========================================================= */

  const clusterOptions =
    useMemo(() => {
      return Array.from(
        new Set(
          rows
            .map(
              (row) =>
                row.cluster
            )
            .filter(Boolean)
        )
      ).sort(
        (a, b) =>
          a.localeCompare(
            b
          )
      );
    }, [rows]);

  /* =========================================================
     MAIN FILTER
  ========================================================= */

  const filteredRows =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return rows.filter(
        (row) => {
          if (
            clusterFilter !==
              "ALL" &&
            row.cluster !==
              clusterFilter
          ) {
            return false;
          }

          if (
            typeFilter ===
              "SEO" &&
            !row.isSeo
          ) {
            return false;
          }

          if (
            typeFilter ===
              "ASEO" &&
            !row.isAseo
          ) {
            return false;
          }

          if (
            typeFilter ===
              "QA" &&
            !row.isQA
          ) {
            return false;
          }

          if (keyword) {
            const haystack =
              [
                row.keySearch,
                row.topic,
              ]
                .join(" ")
                .toLowerCase();

            if (
              !haystack.includes(
                keyword
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      rows,
      clusterFilter,
      typeFilter,
      search,
    ]);

  /* =========================================================
     KPI
  ========================================================= */

  const totalContent =
    filteredRows.length;

  const seoCount =
    filteredRows.filter(
      (row) =>
        row.isSeo
    ).length;

  const aseoCount =
    filteredRows.filter(
      (row) =>
        row.isAseo
    ).length;

  const qaCount =
    filteredRows.filter(
      (row) =>
        row.isQA
    ).length;

  /* =========================================================
     CLUSTER CHART
  ========================================================= */

  const clusterChart =
    useMemo<
      ClusterChartItem[]
    >(() => {
      const map =
        new Map<
          string,
          {
            seo: number;
            aseo: number;
          }
        >();

      filteredRows.forEach(
        (row) => {
          const cluster =
            row.cluster ||
            "Other";

          if (
            !map.has(
              cluster
            )
          ) {
            map.set(
              cluster,
              {
                seo: 0,
                aseo: 0,
              }
            );
          }

          const value =
            map.get(
              cluster
            )!;

          if (
            row.isSeo
          ) {
            value.seo += 1;
          }

          if (
            row.isAseo
          ) {
            value.aseo +=
              1;
          }
        }
      );

      return Array.from(
        map.entries()
      )
        .map(
          ([
            cluster,
            value,
          ]) => ({
            cluster,

            seo:
              value.seo,

            aseo:
              value.aseo,

            total:
              value.seo +
              value.aseo,
          })
        )
        .filter(
          (item) =>
            item.total >
            0
        )
        .sort(
          (a, b) =>
            b.total -
            a.total
        )
        .slice(
          0,
          20
        );
    }, [
      filteredRows,
    ]);

  /* =========================================================
     SEO TABLE

     ตารางด้านล่าง
     แสดงเฉพาะที่ติด SEO
  ========================================================= */

  const tableRows =
    useMemo(() => {
      const keyword =
        tableSearch
          .trim()
          .toLowerCase();

      const result =
        filteredRows.filter(
          (row) => {
            /*
             * เฉพาะ SEO
             */

            if (!row.isSeo) {
              return false;
            }

            if (!keyword) {
              return true;
            }

            const haystack =
              [
                row.keySearch,
                row.topic,
                row.cluster,
                row.doctor,
              ]
                .join(" ")
                .toLowerCase();

            return haystack.includes(
              keyword
            );
          }
        );

      /*
       * DateCheck ล่าสุดก่อน
       */

      return [
        ...result,
      ].sort(
        (a, b) => {
          const dateDiff =
            parseDateValue(
              b.dateCheck
            ) -
            parseDateValue(
              a.dateCheck
            );

          if (
            dateDiff !==
            0
          ) {
            return dateDiff;
          }

          return (
            a.keySearch ||
            a.topic
          ).localeCompare(
            b.keySearch ||
              b.topic,
            "th"
          );
        }
      );
    }, [
      filteredRows,
      tableSearch,
    ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        tableRows.length /
          ITEMS_PER_PAGE
      )
    );

  const paginatedRows =
    useMemo(() => {
      const start =
        (currentPage -
          1) *
        ITEMS_PER_PAGE;

      return tableRows.slice(
        start,
        start +
          ITEMS_PER_PAGE
      );
    }, [
      tableRows,
      currentPage,
    ]);

  /*
   * Filter/Search เปลี่ยน
   * กลับหน้าแรก
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    clusterFilter,
    typeFilter,
    search,
    tableSearch,
  ]);

  /*
   * ป้องกันหน้าเกิน
   */

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* =========================================================
     PAGE NUMBERS
  ========================================================= */

  const pageNumbers =
    useMemo(() => {
      const pages:
        number[] = [];

      const start =
        Math.max(
          1,
          currentPage - 2
        );

      const end =
        Math.min(
          totalPages,
          currentPage + 2
        );

      for (
        let page = start;
        page <= end;
        page++
      ) {
        pages.push(
          page
        );
      }

      return pages;
    }, [
      currentPage,
      totalPages,
    ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading &&
    rows.length === 0
  ) {
    return (
      <div className="rounded-[26px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-500" />

          <div>
            <div className="text-lg font-bold text-slate-800">
              กำลังโหลด SEO / ASEO
            </div>

            <div className="mt-1 text-sm text-slate-500">
              กำลังเชื่อมต่อ Data_SEO Rank...
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error &&
    rows.length === 0
  ) {
    return (
      <div className="rounded-[26px] border border-red-200 bg-red-50 p-8">
        <div className="text-xl font-bold text-red-700">
          โหลดข้อมูลไม่สำเร็จ
        </div>

        <div className="mt-3 text-red-600">
          {error}
        </div>

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
     TABLE COUNT
  ========================================================= */

  const tableCountLabel =
    `${formatNumber(
      tableRows.length
    )} SEO`;

  const firstItem =
    tableRows.length > 0
      ? (currentPage -
          1) *
          ITEMS_PER_PAGE +
        1
      : 0;

  const lastItem =
    Math.min(
      currentPage *
        ITEMS_PER_PAGE,
      tableRows.length
    );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}

      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#15233f] sm:text-4xl">
            Content SEO / ASEO Dashboard
          </h1>

          {updatedAt && (
            <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-slate-600">
              Last update :{" "}
              {formatLastUpdate(
                updatedAt
              )}
            </div>
          )}

          {note && (
            <div className="text-sm font-medium text-slate-500">
              {note}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={
            refreshing
          }
          onClick={() =>
            loadData(true)
          }
          className="self-start rounded-2xl border border-blue-200 bg-white px-6 py-3 font-bold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50 xl:self-auto"
        >
          {refreshing
            ? "กำลังอัปเดต..."
            : "↻ Refresh"}
        </button>
      </section>

      {/* FILTER */}

      <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr]">
          <FilterBox
            label="Cluster"
          >
            <select
              value={
                clusterFilter
              }
              onChange={(e) =>
                setClusterFilter(
                  e.target.value
                )
              }
              className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-700 outline-none transition focus:border-blue-400"
            >
              <option value="ALL">
                All Cluster
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
          </FilterBox>

          <FilterBox
            label="ประเภทผลการค้นหา"
          >
            <select
              value={
                typeFilter
              }
              onChange={(e) =>
                setTypeFilter(
                  e.target
                    .value as SearchType
                )
              }
              className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-700 outline-none transition focus:border-blue-400"
            >
              <option value="ALL">
                ทั้งหมด
              </option>

              <option value="SEO">
                SEO
              </option>

              <option value="ASEO">
                ASEO
              </option>

              <option value="QA">
                Q&A
              </option>
            </select>
          </FilterBox>

          <FilterBox
            label="ค้นหา Keyword / Topic"
          >
            <div className="relative">
              <input
                value={
                  search
                }
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="ค้นหา Keyword หรือ Topic..."
                className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-12 text-base text-slate-700 outline-none transition focus:border-blue-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch(
                      ""
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              )}
            </div>
          </FilterBox>
        </div>
      </section>

      {/* KPI */}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="TOTAL CONTENT"
          value={
            totalContent
          }
          accent="#1f73ff"
          valueColor="text-[#15233f]"
          description="เนื้อหาทั้งหมด"
        />

        <KpiCard
          title="SEO"
          value={
            seoCount
          }
          accent="#67c7b6"
          valueColor="text-[#15233f]"
          description={`${percentage(
            seoCount,
            totalContent
          )}% ของทั้งหมด`}
          descriptionColor="text-[#67c7b6]"
        />

        <KpiCard
          title="ASEO"
          value={
            aseoCount
          }
          accent="#ffab7f"
          valueColor="text-[#15233f]"
          description={`${percentage(
            aseoCount,
            totalContent
          )}% ของทั้งหมด`}
          descriptionColor="text-[#ff9d6e]"
        />

        <KpiCard
          title="STATUS Q&A"
          value={
            qaCount
          }
          accent="#733de7"
          valueColor="text-[#15233f]"
          description={`${percentage(
            qaCount,
            totalContent
          )}% ของทั้งหมด`}
          descriptionColor="text-[#733de7]"
        />
      </section>

      {/* CLUSTER CHART */}

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-2xl font-extrabold text-[#15233f]">
            Top 20 SEO / ASEO by Cluster
          </h2>

          <div className="text-sm font-medium text-slate-400">
            20 Cluster ที่มี SEO + ASEO สูงสุด
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-7 text-base font-medium text-slate-700">
          <ChartLegend
            color="#70c6b7"
            label="SEO"
          />

          <ChartLegend
            color="#fda778"
            label="ASEO"
          />
        </div>

        <div className="mt-5">
          <ClusterChart
            data={
              clusterChart
            }
          />
        </div>
      </section>

      {/* TABLE */}

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="p-5 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#15233f]">
                Key Search / Search Intent
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                แสดงเฉพาะ Keyword ที่ติด SEO
              </p>
            </div>

            <div className="w-full lg:max-w-[540px]">
              <div className="mb-3 text-right text-sm font-semibold text-slate-400">
                {tableCountLabel}
              </div>

              <input
                value={
                  tableSearch
                }
                onChange={(e) =>
                  setTableSearch(
                    e.target.value
                  )
                }
                placeholder="ค้นหา Key Search / Search Intent..."
                className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-base outline-none transition focus:border-blue-400"
              />
            </div>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-600">
            หมายเหตุ : เนื่องจากมีการปรับ Path บางลิงก์อาจเปิดไม่ได้ชั่วคราว แต่บทความยังอยู่ในระบบ และอยู่ระหว่างปรับแก้ลิงก์
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left">
                <TableHead>
                  Key Search / Search Intent
                </TableHead>

                <TableHead>
                  Cluster
                </TableHead>

                <TableHead>
                  Topic
                </TableHead>

                <TableHead>
                  Link
                </TableHead>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-14 text-center text-slate-400"
                  >
                    ไม่พบข้อมูล SEO ตามตัวกรอง
                  </td>
                </tr>
              ) : (
                paginatedRows.map(
                  (
                    row,
                    index
                  ) => {
                    /*
                     * Badge "อัปเดตล่าสุด"
                     *
                     * แสดงเฉพาะ:
                     * - หน้า 1
                     * - 10 รายการแรก
                     * - มี DateCheck
                     */

                    const showLatestBadge =
                      currentPage ===
                        1 &&
                      index <
                        LATEST_BADGE_COUNT &&
                      Boolean(
                        row.dateCheck
                      );

                    return (
                      <tr
                        key={
                          row.id
                        }
                        className="border-b border-slate-100 align-middle transition hover:bg-slate-50"
                      >
                        {/* KEY SEARCH */}

                        <td className="px-6 py-6">
                          <div className="font-bold text-slate-800">
                            {row.keySearch ||
                              "(ไม่มี Key Search)"}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge
                              text="SEO"
                              className="bg-emerald-50 text-emerald-600"
                            />

                            {row.isAseo && (
                              <Badge
                                text="ASEO"
                                className="bg-orange-50 text-orange-500"
                              />
                            )}

                            {row.isQA && (
                              <Badge
                                text="Q&A"
                                className="bg-purple-50 text-purple-600"
                              />
                            )}

                            {showLatestBadge && (
                              <>
                                <span className="text-slate-300">
                                  |
                                </span>

                                <Badge
                                  text="อัปเดตล่าสุด"
                                  className="bg-blue-50 text-blue-600"
                                />
                              </>
                            )}
                          </div>
                        </td>

                        {/* CLUSTER */}

                        <td className="px-6 py-6">
                          <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
                            {row.cluster ||
                              "-"}
                          </span>
                        </td>

                        {/* TOPIC */}

                        <td className="max-w-[600px] px-6 py-6">
                          <div className="line-clamp-3 text-base font-medium leading-7 text-slate-800">
                            {row.topic ||
                              "-"}
                          </div>

                          {row.doctor && (
                            <div className="mt-2 text-sm text-slate-400">
                              {
                                row.doctor
                              }
                            </div>
                          )}
                        </td>

                        {/* LINK */}

                        <td className="px-6 py-6">
                          {row.link ? (
                            <a
                              href={
                                row.link
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex whitespace-nowrap rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
                            >
                              เปิดบทความ ↗
                            </a>
                          ) : (
                            <span className="text-slate-300">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        {tableRows.length >
          0 && (
          <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="text-sm font-medium text-slate-500">
              แสดง{" "}
              <strong className="text-slate-700">
                {firstItem}
              </strong>
              {" - "}
              <strong className="text-slate-700">
                {lastItem}
              </strong>
              {" จาก "}
              <strong className="text-slate-700">
                {formatNumber(
                  tableRows.length
                )}
              </strong>{" "}
              รายการ
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* FIRST */}

              {currentPage >
                3 && (
                <>
                  <PageButton
                    active={
                      currentPage ===
                      1
                    }
                    onClick={() =>
                      setCurrentPage(
                        1
                      )
                    }
                  >
                    1
                  </PageButton>

                  {currentPage >
                    4 && (
                    <span className="px-1 text-slate-400">
                      ...
                    </span>
                  )}
                </>
              )}

              {/* PREVIOUS */}

              <button
                type="button"
                disabled={
                  currentPage ===
                  1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹ ก่อนหน้า
              </button>

              {/* PAGE NUMBER */}

              {pageNumbers.map(
                (page) => (
                  <PageButton
                    key={
                      page
                    }
                    active={
                      currentPage ===
                      page
                    }
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                  >
                    {
                      page
                    }
                  </PageButton>
                )
              )}

              {/* NEXT */}

              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ถัดไป ›
              </button>

              {/* LAST */}

              {currentPage <
                totalPages -
                  2 && (
                <>
                  {currentPage <
                    totalPages -
                      3 && (
                    <span className="px-1 text-slate-400">
                      ...
                    </span>
                  )}

                  <PageButton
                    active={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        totalPages
                      )
                    }
                  >
                    {
                      totalPages
                    }
                  </PageButton>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   PAGE BUTTON
========================================================= */

function PageButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   FILTER
========================================================= */

function FilterBox({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-500">
        {label}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   KPI
========================================================= */

function KpiCard({
  title,
  value,
  accent,
  valueColor,
  description,
  descriptionColor = "text-slate-400",
}: {
  title: string;
  value: number;
  accent: string;
  valueColor: string;
  description: string;
  descriptionColor?: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-7 shadow-sm"
      style={{
        borderTop:
          `6px solid ${accent}`,
      }}
    >
      <div
        className="text-lg font-bold"
        style={{
          color:
            accent,
        }}
      >
        {title}
      </div>

      <div
        className={`mt-4 text-5xl font-extrabold ${valueColor}`}
      >
        {formatNumber(
          value
        )}
      </div>

      <div
        className={`mt-4 text-sm font-semibold ${descriptionColor}`}
      >
        {description}
      </div>
    </div>
  );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      {text}
    </span>
  );
}

/* =========================================================
   TABLE HEAD
========================================================= */

function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-6 py-5 text-sm font-bold text-slate-500">
      {children}
    </th>
  );
}

/* =========================================================
   CHART LEGEND
========================================================= */

function ChartLegend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-5 w-10 rounded-md"
        style={{
          backgroundColor:
            color,
        }}
      />

      <span>
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   CLUSTER CHART
========================================================= */

function ClusterChart({
  data,
}: {
  data: ClusterChartItem[];
}) {
  const maxTotal =
    Math.max(
      1,
      ...data.map(
        (item) =>
          item.total
      )
    );

  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-[1250px] px-2">
        {/* GRID */}

        <div className="pointer-events-none absolute inset-x-2 top-0 h-[410px]">
          {[
            0,
            25,
            50,
            75,
            100,
          ].map(
            (position) => (
              <div
                key={
                  position
                }
                className="absolute left-0 right-0 border-t border-slate-200"
                style={{
                  bottom:
                    `${position}%`,
                }}
              />
            )
          )}
        </div>

        {/* BAR */}

        <div className="relative flex h-[470px] items-end gap-4 px-4">
          {data.map(
            (item) => {
              const totalHeight =
                Math.max(
                  4,
                  (item.total /
                    maxTotal) *
                    84
                );

              const seoRatio =
                item.total >
                0
                  ? item.seo /
                    item.total
                  : 0;

              const aseoRatio =
                item.total >
                0
                  ? item.aseo /
                    item.total
                  : 0;

              return (
                <div
                  key={
                    item.cluster
                  }
                  className="flex h-full min-w-[48px] flex-1 flex-col justify-end"
                >
                  <div className="flex flex-1 items-end justify-center">
                    <div
                      className="flex w-[68%] min-w-[38px] max-w-[64px] flex-col justify-end overflow-hidden rounded-t-[14px] shadow-[0_4px_10px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      style={{
                        height:
                          `${totalHeight}%`,
                      }}
                    >
                      {/* ASEO */}

                      {item.aseo >
                        0 && (
                        <div
                          className="flex items-center justify-center bg-[#fda778] text-xs font-bold text-[#29405a]"
                          style={{
                            height:
                              `${aseoRatio * 100}%`,

                            minHeight:
                              "23px",
                          }}
                        >
                          {
                            item.aseo
                          }
                        </div>
                      )}

                      {/* SEO */}

                      {item.seo >
                        0 && (
                        <div
                          className={`flex items-center justify-center bg-[#70c6b7] text-xs font-bold text-[#29405a] ${
                            item.aseo ===
                            0
                              ? "rounded-t-[14px]"
                              : ""
                          }`}
                          style={{
                            height:
                              `${seoRatio * 100}%`,

                            minHeight:
                              "27px",
                          }}
                        >
                          {
                            item.seo
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-[54px] pt-3 text-center text-xs font-medium text-slate-600">
                    {
                      item.cluster
                    }
                  </div>
                </div>
              );
            }
          )}

          {data.length ===
            0 && (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              ไม่มีข้อมูล SEO / ASEO ตามตัวกรอง
            </div>
          )}
        </div>
      </div>
    </div>
  );
}