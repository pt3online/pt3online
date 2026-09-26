export interface PlanItem {
  id: number;
  date: string;
  dateDisplay?: string;
  cluster: string;
  channel: string;
  detail: string;
  status: string;
  link: string;
  image: string;
}

export interface PlanPageData {
  items: PlanItem[];
  updatedAt?: string;
}

interface PlanApiResponse {
  success?: boolean;
  count?: number;

  data?: Array<{
    id?: number;
    date?: string;
    dateDisplay?: string;
    cluster?: string;
    channel?: string;
    detail?: string;
    status?: string;
    link?: string;
    image?: string;
  }>;

  updatedAt?: string;
  message?: string;
}

const PLAN_API =
  "https://script.google.com/macros/s/AKfycbwZuTsSjWUd19cxl7leDAoWV148k0gAH2NCIhsNwG95DqSFgK9IUG-bW89GFifoWqvq/exec";


export async function getPlanPageData(): Promise<PlanPageData> {
  try {

    /*
      เพิ่ม timestamp เพื่อให้กด refresh แล้ว
      ได้ข้อมูลล่าสุดจริงทุกครั้ง
    */

    const url =
      `${PLAN_API}?t=${Date.now()}`;


    const response =
      await fetch(
        url,
        {
          cache: "no-store",
          redirect: "follow",
        }
      );


    if (!response.ok) {
      throw new Error(
        `Plan API Error: ${response.status}`
      );
    }


    const result: PlanApiResponse =
      await response.json();


    if (
      result.success !== true
    ) {
      throw new Error(
        result.message ||
        "Plan API returned success false"
      );
    }


    const items: PlanItem[] =
      Array.isArray(
        result.data
      )
        ? result.data
            .map(
              (
                item,
                index
              ) => {

                return {
                  id:
                    Number(
                      item.id
                    ) ||
                    index + 1,

                  date:
                    String(
                      item.date ||
                      ""
                    ).trim(),

                  dateDisplay:
                    String(
                      item.dateDisplay ||
                      ""
                    ).trim(),

                  cluster:
                    String(
                      item.cluster ||
                      ""
                    ).trim(),

                  channel:
                    String(
                      item.channel ||
                      ""
                    ).trim(),

                  detail:
                    String(
                      item.detail ||
                      ""
                    ).trim(),

                  status:
                    String(
                      item.status ||
                      ""
                    ).trim(),

                  link:
                    String(
                      item.link ||
                      ""
                    ).trim(),

                  image:
                    String(
                      item.image ||
                      ""
                    ).trim(),
                };
              }
            )
            .filter(
              (item) =>
                item.date &&
                item.detail
            )
        : [];


    console.log(
      "PLAN API ITEMS:",
      items.length
    );


    return {
      items,

      updatedAt:
        result.updatedAt,
    };

  } catch (error) {

    console.error(
      "Plan Page Fetch Error:",
      error
    );


    return {
      items: [],
    };

  }
}