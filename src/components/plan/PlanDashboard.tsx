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

type RawRow = Record<string, unknown>;

type PlanItem = {
  id: string;
  date: string;
  dateObject: Date;
  cluster: string;
  channel: string;
  detail: string;
  status: string;
  link: string;
  images: string[];
  raw: RawRow;
};

type ApiResponse = {
  success?: boolean;
  data?: RawRow[];
  message?: string;
  debug?: string;
};

/* =========================================================
   BASIC HELPERS
========================================================= */

function getValue(
  row: RawRow,
  keys: string[]
): string {
  for (const key of keys) {
    const value = row[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function parseDate(
  value: string
): Date | null {
  if (!value) return null;

  const isoMatch =
    value.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})/
    );

  if (isoMatch) {
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3])
    );
  }

  const slashMatch =
    value.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

  if (slashMatch) {
    let year =
      Number(slashMatch[3]);

    if (year > 2400) {
      year -= 543;
    }

    return new Date(
      year,
      Number(slashMatch[2]) - 1,
      Number(slashMatch[1])
    );
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  return parsed;
}

function normalizeStatus(
  status: string,
  link: string
): string {
  const value =
    status
      .trim()
      .toLowerCase();

  if (
    value.includes("post") ||
    value.includes("โพสต์") ||
    value.includes("posted") ||
    value.includes("complete")
  ) {
    return "Post";
  }

  if (
    value.includes("plan") ||
    value.includes("แพลน") ||
    value.includes("planned")
  ) {
    return "Plan";
  }

  if (!value && link) {
    return "Post";
  }

  if (!value) {
    return "Plan";
  }

  return status;
}

function formatThaiMonth(
  year: number,
  month: number
) {
  return new Intl.DateTimeFormat(
    "th-TH",
    {
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month,
      1
    )
  );
}

function formatThaiDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "th-TH",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function sameDay(
  a: Date,
  b: Date
) {
  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  );
}

function sameMonth(
  date: Date,
  year: number,
  month: number
) {
  return (
    date.getFullYear() ===
      year &&
    date.getMonth() ===
      month
  );
}

/* =========================================================
   GOOGLE DRIVE IMAGE HELPERS
========================================================= */

function getGoogleDriveFileId(
  url: string
): string {
  if (!url) return "";

  const patterns = [
    /\/file\/d\/([^/]+)/i,
    /\/d\/([^/]+)/i,
    /[?&]id=([^&]+)/i,
    /\/uc\?.*?[?&]id=([^&]+)/i,
  ];

  for (const pattern of patterns) {
    const match =
      url.match(pattern);

    if (
      match &&
      match[1]
    ) {
      return decodeURIComponent(
        match[1]
      );
    }
  }

  return "";
}

function convertImageUrl(
  url: string
): string {
  const clean =
    url.trim();

  if (!clean) return "";

  if (
    clean.includes(
      "drive.google.com"
    )
  ) {
    const id =
      getGoogleDriveFileId(
        clean
      );

    if (id) {
      return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
    }
  }

  return clean;
}

function extractUrls(
  value: string
): string[] {
  if (!value) return [];

  const urls =
    value.match(
      /https?:\/\/[^\s,;|]+/gi
    );

  if (!urls) {
    return [];
  }

  return urls
    .map(convertImageUrl)
    .filter(Boolean);
}

function extractImages(
  row: RawRow
): string[] {
  const imageKeys = [
    "image",
    "Image",
    "IMAGE",
    "imageUrl",
    "imageURL",
    "image_url",
    "Image URL",
    "Image Url",
    "image url",
    "imageLink",
    "Image Link",
    "image link",
    "photo",
    "Photo",
    "PHOTO",
    "picture",
    "Picture",
    "thumbnail",
    "Thumbnail",
    "driveImage",
    "DriveImage",
    "Drive Image",
    "Google Drive",
    "google drive",
    "Artwork",
    "artwork",
    "ARTWORK",
    "รูป",
    "รูปภาพ",
    "ภาพ",
    "รูปตัวอย่าง",
    "ภาพตัวอย่าง",
    "ตัวอย่างรูป",
    "ตัวอย่างภาพ",
    "ไฟล์ภาพ",
    "Link Image",
    "link image",
    "Link รูป",
    "ลิงก์รูป",
  ];

  const images: string[] =
    [];

  /*
    หา Column ที่เรารู้จักก่อน
  */
  for (
    const key of imageKeys
  ) {
    const value =
      row[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      images.push(
        ...extractUrls(
          String(value)
        )
      );
    }
  }

  /*
    เผื่อชื่อ Column ไม่ตรง
    แต่มีคำว่า image / รูป / artwork / drive
  */
  for (
    const [
      key,
      value,
    ] of Object.entries(
      row
    )
  ) {
    if (
      value === undefined ||
      value === null
    ) {
      continue;
    }

    const keyLower =
      key.toLowerCase();

    const isImageField =
      keyLower.includes(
        "image"
      ) ||
      keyLower.includes(
        "photo"
      ) ||
      keyLower.includes(
        "picture"
      ) ||
      keyLower.includes(
        "thumbnail"
      ) ||
      keyLower.includes(
        "artwork"
      ) ||
      keyLower.includes(
        "drive"
      ) ||
      key.includes("รูป") ||
      key.includes("ภาพ");

    const isPostLink =
      keyLower.includes(
        "link post"
      ) ||
      keyLower.includes(
        "linkpost"
      );

    if (
      isImageField &&
      !isPostLink
    ) {
      images.push(
        ...extractUrls(
          String(value)
        )
      );
    }
  }

  return Array.from(
    new Set(images)
  );
}

/* =========================================================
   STATUS STYLE
========================================================= */

function getCardStyle(
  status: string
) {
  const lower =
    status.toLowerCase();

  if (
    lower.includes("post")
  ) {
    return {
      background:
        "#e5f8f4",
      border:
        "#05bd95",
      badge:
        "bg-emerald-100 text-emerald-700",
    };
  }

  if (
    lower.includes("plan")
  ) {
    return {
      background:
        "#fff5df",
      border:
        "#f59e0b",
      badge:
        "bg-amber-100 text-amber-700",
    };
  }

  return {
    background:
      "#edf1f5",
    border:
      "#94a3b8",
    badge:
      "bg-slate-100 text-slate-600",
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PlanDashboard() {
  const today =
    useMemo(
      () => new Date(),
      []
    );

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(
    today.getFullYear()
  );

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    today.getMonth()
  );

  const [
    rows,
    setRows,
  ] = useState<RawRow[]>([]);

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

  const [
    clusterFilter,
    setClusterFilter,
  ] = useState("ALL");

  const [
    channelFilter,
    setChannelFilter,
  ] = useState("ALL");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    expandedDays,
    setExpandedDays,
  ] = useState<
    Record<string, boolean>
  >({});

  const [
    selectedItem,
    setSelectedItem,
  ] =
    useState<PlanItem | null>(
      null
    );

  /* =========================================================
     MODAL ESC + BODY SCROLL
  ========================================================= */

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setSelectedItem(
          null
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedItem]);

  /* =========================================================
     LOAD API
  ========================================================= */

  const loadData =
    useCallback(
      async (
        background = false
      ) => {
        try {
          if (background) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await fetch(
              `/api/plan?t=${Date.now()}`,
              {
                cache:
                  "no-store",
              }
            );

          const text =
            await response.text();

          let result:
            | ApiResponse
            | RawRow[];

          try {
            result =
              JSON.parse(text);
          } catch {
            throw new Error(
              "API ส่งข้อมูลที่ไม่ใช่ JSON"
            );
          }

          if (!response.ok) {
            const message =
              !Array.isArray(
                result
              )
                ? result.message
                : "";

            throw new Error(
              message ||
                `API HTTP ${response.status}`
            );
          }

          let newRows:
            RawRow[] = [];

          if (
            Array.isArray(result)
          ) {
            newRows =
              result;
          } else if (
            Array.isArray(
              result.data
            )
          ) {
            newRows =
              result.data;
          }

          setRows(newRows);

          try {
            sessionStorage.setItem(
              "pt3-plan-cache",
              JSON.stringify(
                newRows
              )
            );
          } catch {
            //
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "โหลดข้อมูลไม่สำเร็จ"
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    let hasCache =
      false;

    try {
      const cached =
        sessionStorage.getItem(
          "pt3-plan-cache"
        );

      if (cached) {
        const parsed =
          JSON.parse(cached);

        if (
          Array.isArray(parsed)
        ) {
          setRows(parsed);
          setLoading(false);
          hasCache = true;
        }
      }
    } catch {
      //
    }

    loadData(hasCache);
  }, [loadData]);

  /* =========================================================
     NORMALIZE DATA
  ========================================================= */

  const items =
    useMemo<PlanItem[]>(() => {
      return rows
        .map(
          (
            row,
            index
          ) => {
            const dateValue =
              getValue(row, [
                "date",
                "Date",
                "DATE",
                "วันที่",
                "datePost",
                "DatePost",
              ]);

            const dateObject =
              parseDate(
                dateValue
              );

            if (!dateObject) {
              return null;
            }

            const link =
              getValue(row, [
                "link",
                "Link",
                "linkPost",
                "LinkPost",
                "link post",
                "Link post",
                "LINK POST",
                "URL",
                "url",
              ]);

            const rawStatus =
              getValue(row, [
                "status",
                "Status",
                "STATUS",
                "สถานะ",
              ]);

            return {
              id:
                getValue(
                  row,
                  [
                    "id",
                    "ID",
                  ]
                ) ||
                String(index),

              date:
                dateValue,

              dateObject,

              cluster:
                getValue(
                  row,
                  [
                    "cluster",
                    "Cluster",
                    "CENTER",
                    "Center",
                    "center",
                    "ศูนย์",
                  ]
                ) ||
                "Other",

              channel:
                getValue(
                  row,
                  [
                    "channel",
                    "Channel",
                    "CHANNEL",
                    "ช่องทาง",
                  ]
                ) ||
                "Other",

              detail:
                getValue(
                  row,
                  [
                    "detail",
                    "Detail",
                    "DETAIL",
                    "content",
                    "Content",
                    "topic",
                    "Topic",
                    "หัวข้อ",
                    "ชื่องาน",
                  ]
                ) ||
                "(ไม่มีชื่อ)",

              status:
                normalizeStatus(
                  rawStatus,
                  link
                ),

              link,

              images:
                extractImages(
                  row
                ),

              raw: row,
            };
          }
        )
        .filter(
          (
            item
          ): item is PlanItem =>
            item !== null
        );
    }, [rows]);

  /* =========================================================
     OPTIONS
  ========================================================= */

  const clusterOptions =
    useMemo(() => {
      return Array.from(
        new Set(
          items
            .map(
              (item) =>
                item.cluster
            )
            .filter(Boolean)
        )
      ).sort();
    }, [items]);

  const channelOptions =
    useMemo(() => {
      return Array.from(
        new Set(
          items
            .map(
              (item) =>
                item.channel
            )
            .filter(Boolean)
        )
      ).sort();
    }, [items]);

  const statusOptions =
    useMemo(() => {
      return Array.from(
        new Set(
          items
            .map(
              (item) =>
                item.status
            )
            .filter(Boolean)
        )
      ).sort();
    }, [items]);

  const monthOptions =
    useMemo(() => {
      const values =
        new Map<
          string,
          {
            year: number;
            month: number;
          }
        >();

      items.forEach(
        (item) => {
          const year =
            item.dateObject.getFullYear();

          const month =
            item.dateObject.getMonth();

          values.set(
            `${year}-${month}`,
            {
              year,
              month,
            }
          );
        }
      );

      values.set(
        `${today.getFullYear()}-${today.getMonth()}`,
        {
          year:
            today.getFullYear(),
          month:
            today.getMonth(),
        }
      );

      return Array.from(
        values.values()
      ).sort(
        (a, b) =>
          b.year - a.year ||
          b.month - a.month
      );
    }, [items, today]);

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const monthItems =
    useMemo(() => {
      return items.filter(
        (item) =>
          sameMonth(
            item.dateObject,
            selectedYear,
            selectedMonth
          )
      );
    }, [
      items,
      selectedYear,
      selectedMonth,
    ]);

  const filteredItems =
    useMemo(() => {
      return monthItems.filter(
        (item) => {
          if (
            clusterFilter !==
              "ALL" &&
            item.cluster !==
              clusterFilter
          ) {
            return false;
          }

          if (
            channelFilter !==
              "ALL" &&
            item.channel !==
              channelFilter
          ) {
            return false;
          }

          if (
            statusFilter !==
              "ALL" &&
            item.status !==
              statusFilter
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      monthItems,
      clusterFilter,
      channelFilter,
      statusFilter,
    ]);

  /* =========================================================
     KPI
  ========================================================= */

  const totalCount =
    filteredItems.length;

  const planCount =
    filteredItems.filter(
      (item) =>
        item.status
          .toLowerCase()
          .includes("plan")
    ).length;

  const postCount =
    filteredItems.filter(
      (item) =>
        item.status
          .toLowerCase()
          .includes("post")
    ).length;

  const linkCount =
    filteredItems.filter(
      (item) =>
        Boolean(item.link)
    ).length;

  /* =========================================================
     CALENDAR
  ========================================================= */

  const calendarDays =
    useMemo(() => {
      const first =
        new Date(
          selectedYear,
          selectedMonth,
          1
        );

      const last =
        new Date(
          selectedYear,
          selectedMonth + 1,
          0
        );

      const startDay =
        first.getDay();

      const totalDays =
        last.getDate();

      const previousLastDay =
        new Date(
          selectedYear,
          selectedMonth,
          0
        ).getDate();

      const cells: {
        date: Date;
        currentMonth: boolean;
      }[] = [];

      for (
        let i =
          startDay - 1;
        i >= 0;
        i--
      ) {
        cells.push({
          date: new Date(
            selectedYear,
            selectedMonth - 1,
            previousLastDay -
              i
          ),
          currentMonth:
            false,
        });
      }

      for (
        let day = 1;
        day <= totalDays;
        day++
      ) {
        cells.push({
          date: new Date(
            selectedYear,
            selectedMonth,
            day
          ),
          currentMonth:
            true,
        });
      }

      while (
        cells.length % 7 !==
        0
      ) {
        const lastCell =
          cells[
            cells.length -
              1
          ].date;

        cells.push({
          date: new Date(
            lastCell.getFullYear(),
            lastCell.getMonth(),
            lastCell.getDate() +
              1
          ),
          currentMonth:
            false,
        });
      }

      if (
        cells.length <
        42
      ) {
        while (
          cells.length <
          42
        ) {
          const lastCell =
            cells[
              cells.length -
                1
            ].date;

          cells.push({
            date: new Date(
              lastCell.getFullYear(),
              lastCell.getMonth(),
              lastCell.getDate() +
                1
            ),
            currentMonth:
              false,
          });
        }
      }

      return cells;
    }, [
      selectedYear,
      selectedMonth,
    ]);

  const itemsByDay =
    useMemo(() => {
      const map =
        new Map<
          string,
          PlanItem[]
        >();

      filteredItems.forEach(
        (item) => {
          const key =
            `${item.dateObject.getFullYear()}-${item.dateObject.getMonth()}-${item.dateObject.getDate()}`;

          if (
            !map.has(key)
          ) {
            map.set(
              key,
              []
            );
          }

          map
            .get(key)!
            .push(item);
        }
      );

      return map;
    }, [filteredItems]);

  /* =========================================================
     ACTIONS
  ========================================================= */

  function previousMonth() {
    const date =
      new Date(
        selectedYear,
        selectedMonth - 1,
        1
      );

    setSelectedYear(
      date.getFullYear()
    );

    setSelectedMonth(
      date.getMonth()
    );

    setExpandedDays({});
  }

  function nextMonth() {
    const date =
      new Date(
        selectedYear,
        selectedMonth + 1,
        1
      );

    setSelectedYear(
      date.getFullYear()
    );

    setSelectedMonth(
      date.getMonth()
    );

    setExpandedDays({});
  }

  function resetFilters() {
    setSelectedYear(
      today.getFullYear()
    );

    setSelectedMonth(
      today.getMonth()
    );

    setClusterFilter(
      "ALL"
    );

    setChannelFilter(
      "ALL"
    );

    setStatusFilter(
      "ALL"
    );

    setExpandedDays({});
  }

  function selectMonth(
    value: string
  ) {
    const [
      yearValue,
      monthValue,
    ] =
      value
        .split("-")
        .map(Number);

    setSelectedYear(
      yearValue
    );

    setSelectedMonth(
      monthValue
    );

    setExpandedDays({});
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading &&
    rows.length === 0
  ) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white px-8 py-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-teal-600" />

          <div>
            <div className="text-lg font-bold text-slate-800">
              กำลังโหลดข้อมูล
            </div>

            <div className="mt-1 text-base text-slate-500">
              กำลังเชื่อมต่อ Google Sheet...
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
      <div className="rounded-[24px] border border-red-200 bg-red-50 p-8">
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
          className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  const weekdays = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
  ];

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <div className="space-y-5 pb-10">
        {/* FILTER */}

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block font-bold text-slate-500">
                เดือน
              </label>

              <select
                value={`${selectedYear}-${selectedMonth}`}
                onChange={(e) =>
                  selectMonth(
                    e.target.value
                  )
                }
                className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg font-medium text-slate-800 outline-none focus:border-teal-500"
              >
                {monthOptions.map(
                  (option) => (
                    <option
                      key={`${option.year}-${option.month}`}
                      value={`${option.year}-${option.month}`}
                    >
                      {formatThaiMonth(
                        option.year,
                        option.month
                      )}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-500">
                ศูนย์
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
                className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg font-medium text-slate-800 outline-none focus:border-teal-500"
              >
                <option value="ALL">
                  ทุกศูนย์
                </option>

                {clusterOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-500">
                Channel
              </label>

              <select
                value={
                  channelFilter
                }
                onChange={(e) =>
                  setChannelFilter(
                    e.target.value
                  )
                }
                className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg font-medium text-slate-800 outline-none focus:border-teal-500"
              >
                <option value="ALL">
                  ทุก Channel
                </option>

                {channelOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-500">
                Status
              </label>

              <select
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg font-medium text-slate-800 outline-none focus:border-teal-500"
              >
                <option value="ALL">
                  ทุก Status
                </option>

                {statusOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="h-14 whitespace-nowrap rounded-2xl bg-slate-100 px-6 text-base font-bold text-slate-600 transition hover:bg-slate-200"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </section>

        {/* KPI */}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiBox
            title="MEDIA ทั้งหมด"
            value={
              totalCount
            }
            valueClass="text-emerald-500"
          />

          <KpiBox
            title="PLAN"
            value={
              planCount
            }
            valueClass="text-amber-500"
          />

          <KpiBox
            title="POST"
            value={
              postCount
            }
            valueClass="text-emerald-500"
          />

          <KpiBox
            title="มี LINK POST"
            value={
              linkCount
            }
            valueClass="text-blue-600"
          />
        </section>

        {/* LEGEND */}

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-6 font-bold text-slate-500">
            <Legend
              color="#f59e0b"
              label="Plan"
            />

            <Legend
              color="#05bd95"
              label="Post"
            />

            <Legend
              color="#94a3b8"
              label="Other"
            />
          </div>

          <button
            type="button"
            disabled={
              refreshing
            }
            onClick={() =>
              loadData(true)
            }
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {refreshing
              ? "กำลังอัปเดต..."
              : "↻ Refresh"}
          </button>
        </section>

        {/* MONTH */}

        <section className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <div className="flex items-center justify-center gap-5 sm:gap-20">
            <button
              type="button"
              onClick={
                previousMonth
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-3xl font-bold text-teal-600 hover:bg-teal-100 sm:h-14 sm:w-14"
            >
              ‹
            </button>

            <h2 className="min-w-0 flex-1 text-center text-xl font-black text-slate-800 sm:flex-none sm:min-w-[260px] sm:text-3xl">
              {formatThaiMonth(
                selectedYear,
                selectedMonth
              )}
            </h2>

            <button
              type="button"
              onClick={
                nextMonth
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-3xl font-bold text-teal-600 hover:bg-teal-100 sm:h-14 sm:w-14"
            >
              ›
            </button>
          </div>
        </section>

        {/* CALENDAR */}

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
                {weekdays.map(
                  (
                    weekday,
                    index
                  ) => (
                    <div
                      key={
                        weekday
                      }
                      className={`px-3 py-5 text-center text-base font-bold ${
                        index ===
                        0
                          ? "text-red-500"
                          : "text-slate-500"
                      }`}
                    >
                      {
                        weekday
                      }
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map(
                  (
                    cell,
                    index
                  ) => {
                    const key =
                      `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;

                    const dayItems =
                      itemsByDay.get(
                        key
                      ) || [];

                    const expanded =
                      Boolean(
                        expandedDays[
                          key
                        ]
                      );

                    const visibleCount =
                      expanded
                        ? dayItems.length
                        : 3;

                    const visibleItems =
                      dayItems.slice(
                        0,
                        visibleCount
                      );

                    const hiddenCount =
                      dayItems.length -
                      visibleItems.length;

                    const isToday =
                      sameDay(
                        cell.date,
                        today
                      );

                    const column =
                      index % 7;

                    return (
                      <div
                        key={
                          key
                        }
                        className={`min-h-[260px] border-b border-r border-slate-200 p-3 ${
                          !cell.currentMonth
                            ? "bg-slate-50"
                            : "bg-white"
                        } ${
                          isToday
                            ? "ring-2 ring-inset ring-emerald-200"
                            : ""
                        } ${
                          column ===
                          6
                            ? "border-r-0"
                            : ""
                        }`}
                      >
                        <div
                          className={`mb-3 text-lg font-black ${
                            cell.currentMonth
                              ? column ===
                                0
                                ? "text-red-500"
                                : "text-slate-700"
                              : "text-slate-300"
                          }`}
                        >
                          {cell.date.getDate()}
                        </div>

                        <div className="space-y-2">
                          {visibleItems.map(
                            (
                              item
                            ) => {
                              const style =
                                getCardStyle(
                                  item.status
                                );

                              return (
                                <div
                                  key={
                                    item.id
                                  }
                                  role="button"
                                  tabIndex={
                                    0
                                  }
                                  onClick={() =>
                                    setSelectedItem(
                                      item
                                    )
                                  }
                                  onKeyDown={(event) => {
                                    if (
                                      event.key ===
                                        "Enter" ||
                                      event.key ===
                                        " "
                                    ) {
                                      setSelectedItem(
                                        item
                                      );
                                    }
                                  }}
                                  className="cursor-pointer rounded-xl px-3 py-2 text-left transition hover:-translate-y-[1px] hover:shadow-md"
                                  style={{
                                    backgroundColor:
                                      style.background,
                                    borderLeft:
                                      `5px solid ${style.border}`,
                                  }}
                                >
                                  <div
                                    className="line-clamp-2 text-sm font-extrabold leading-snug text-slate-700"
                                    title={
                                      item.detail
                                    }
                                  >
                                    {
                                      item.detail
                                    }
                                  </div>

                                  <div className="mt-1 flex flex-wrap items-center gap-1 text-xs font-medium text-slate-500">
                                    <span>
                                      {
                                        item.cluster
                                      }
                                    </span>

                                    <span>
                                      •
                                    </span>

                                    <span>
                                      {
                                        item.channel
                                      }
                                    </span>

                                    {item.link && (
                                      <>
                                        <span>
                                          ↗
                                        </span>

                                        <a
                                          href={
                                            item.link
                                          }
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) =>
                                            e.stopPropagation()
                                          }
                                          className="font-bold text-blue-600 hover:underline"
                                        >
                                          Link
                                        </a>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}

                          {hiddenCount >
                            0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedDays(
                                  (
                                    current
                                  ) => ({
                                    ...current,
                                    [key]:
                                      true,
                                  })
                                )
                              }
                              className="w-full rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-200"
                            >
                              +
                              {
                                hiddenCount
                              }{" "}
                              รายการ
                            </button>
                          )}

                          {expanded &&
                            dayItems.length >
                              3 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedDays(
                                    (
                                      current
                                    ) => ({
                                      ...current,
                                      [key]:
                                        false,
                                    })
                                  )
                                }
                                className="w-full rounded-lg px-3 py-1 text-center text-xs font-bold text-slate-400 hover:text-slate-600"
                              >
                                ย่อรายการ
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* DETAIL POPUP */}

      {selectedItem && (
        <PlanDetailModal
          item={
            selectedItem
          }
          onClose={() =>
            setSelectedItem(
              null
            )
          }
        />
      )}
    </>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function PlanDetailModal({
  item,
  onClose,
}: {
  item: PlanItem;
  onClose: () => void;
}) {
  const style =
    getCardStyle(
      item.status
    );

  const ignoredKeys =
    new Set(
      [
        "id",
        "date",
        "datedisplay",
        "cluster",
        "channel",
        "detail",
        "status",
        "link",
        "linkpost",
        "link post",
        "image",
        "imageurl",
        "image url",
        "photo",
        "picture",
        "thumbnail",
        "artwork",
        "รูป",
        "รูปภาพ",
        "ภาพ",
      ].map((key) =>
        key.toLowerCase()
      )
    );

  const extraFields =
    Object.entries(
      item.raw
    ).filter(
      ([key, value]) => {
        const normalizedKey =
          key
            .trim()
            .toLowerCase();

        if (
          ignoredKeys.has(
            normalizedKey
          )
        ) {
          return false;
        }

        if (
          value === null ||
          value ===
            undefined ||
          String(value).trim() ===
            ""
        ) {
          return false;
        }

        if (
          normalizedKey.includes(
            "image"
          ) ||
          normalizedKey.includes(
            "photo"
          ) ||
          normalizedKey.includes(
            "picture"
          ) ||
          normalizedKey.includes(
            "artwork"
          ) ||
          key.includes("รูป") ||
          key.includes("ภาพ")
        ) {
          return false;
        }

        return true;
      }
    );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={
        onClose
      }
    >
      <div
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-5xl sm:rounded-[28px]"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        {/* Modal header */}

        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
              >
                {
                  item.status
                }
              </span>

              <span className="text-sm font-medium text-slate-500">
                {formatThaiDate(
                  item.dateObject
                )}
              </span>
            </div>

            <h2 className="text-xl font-black leading-snug text-slate-800 sm:text-2xl">
              {item.detail}
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl font-medium text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            aria-label="ปิด"
          >
            ×
          </button>
        </div>

        {/* Modal body */}

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-5 sm:p-7">
            {/* Metadata */}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoBox
                label="วันที่"
                value={formatThaiDate(
                  item.dateObject
                )}
              />

              <InfoBox
                label="ศูนย์"
                value={
                  item.cluster
                }
              />

              <InfoBox
                label="Channel"
                value={
                  item.channel
                }
              />

              <InfoBox
                label="Status"
                value={
                  item.status
                }
              />
            </div>

            {/* Full detail */}

            <section>
              <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                รายละเอียด
              </h3>

              <div
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base font-medium leading-7 text-slate-700 sm:p-5 sm:text-lg"
                style={{
                  whiteSpace:
                    "pre-wrap",
                  wordBreak:
                    "break-word",
                }}
              >
                {item.detail}
              </div>
            </section>

            {/* Images */}

            {item.images.length >
              0 && (
              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">
                    รูปภาพตัวอย่าง
                  </h3>

                  <span className="text-xs font-semibold text-slate-400">
                    {
                      item.images
                        .length
                    }{" "}
                    รูป
                  </span>
                </div>

                <div
                  className={`grid gap-4 ${
                    item.images
                      .length >
                    1
                      ? "md:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {item.images.map(
                    (
                      image,
                      index
                    ) => (
                      <div
                        key={`${image}-${index}`}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                      >
                        <img
                          src={
                            image
                          }
                          alt={`ตัวอย่าง Artwork ${index + 1}`}
                          className="max-h-[600px] min-h-[220px] w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Extra fields */}

            {extraFields.length >
              0 && (
              <section>
                <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                  ข้อมูลเพิ่มเติม
                </h3>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  {extraFields.map(
                    (
                      [
                        key,
                        value,
                      ],
                      index
                    ) => (
                      <div
                        key={
                          key
                        }
                        className={`grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4 ${
                          index >
                          0
                            ? "border-t border-slate-100"
                            : ""
                        }`}
                      >
                        <div className="text-sm font-bold text-slate-500">
                          {key}
                        </div>

                        <div className="break-words text-sm font-medium text-slate-700 sm:text-base">
                          {String(
                            value
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Link Post */}

            {item.link && (
              <section className="pb-3">
                <a
                  href={
                    item.link
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-center text-base font-bold text-white transition hover:bg-blue-700 sm:w-auto sm:min-w-[220px]"
                >
                  เปิดโพสต์ ↗
                </a>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 break-words text-base font-bold text-slate-700">
        {value || "-"}
      </div>
    </div>
  );
}

/* =========================================================
   KPI
========================================================= */

function KpiBox({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: number;
  valueClass: string;
}) {
  return (
    <div className="relative min-h-[170px] overflow-hidden rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="absolute -right-8 -top-9 h-28 w-28 rounded-full bg-emerald-50" />

      <div className="relative">
        <div className="text-lg font-extrabold uppercase tracking-wide text-slate-500">
          {title}
        </div>

        <div
          className={`mt-5 text-5xl font-black ${valueClass}`}
        >
          {value.toLocaleString(
            "th-TH"
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-4 w-4 rounded-full"
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