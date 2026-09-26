export interface SalesChannel {
  name: string;
  sales: number;
  orders: number;
}

export interface SalesMonth {
  month: string;
  total: number;
  BeDee: number;
  Shopee: number;
  Phyathai: number;
  Lazada: number;
  LINE: number;
  HDMall: number;
}

export interface SalesPackage {
  name: string;
  channel: string;
  qty: number;
  sales: number;
}

export interface SalesPageData {
  year: number;

  totalSales: number;

  totalOrders: number;

  averageOrderValue: number;

  activeChannels: number;

  totalChannels: number;

  topChannel: {
    name: string;
    sales: number;
  };

  topPackage: {
    name: string;
    sales: number;
  };

  channels: SalesChannel[];

  monthlySales: SalesMonth[];

  topPackages: SalesPackage[];

  updatedAt?: string;
}

interface SalesApiResponse {
  success?: boolean;

  year?: number;

  totalSales?: number;

  totalOrders?: number;

  averageOrderValue?: number;

  activeChannels?: number;

  totalChannels?: number;

  topChannel?: {
    name?: string;
    sales?: number;
  };

  topPackage?: {
    name?: string;
    sales?: number;
  };

  channels?: Array<{
    name?: string;
    sales?: number;
    orders?: number;
  }>;

  monthlySales?: Array<{
    month?: string;
    total?: number;
    BeDee?: number;
    Shopee?: number;
    Phyathai?: number;
    Lazada?: number;
    LINE?: number;
    HDMall?: number;
  }>;

  topPackages?: Array<{
    name?: string;
    channel?: string;
    qty?: number;
    sales?: number;
  }>;

  updatedAt?: string;
}

const SALES_API =
  "https://script.google.com/macros/s/AKfycbyTMbhpFjtTtSY6kAWnL8e6NMDYia8ezJKEJdR0cLU4uMwoo4jjgLMxp5i1f4UHigNeGw/exec";

export async function getSalesPageData(): Promise<SalesPageData> {
  try {
    const response = await fetch(
      SALES_API,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Sales API Error"
      );
    }

    const data: SalesApiResponse =
      await response.json();

    return {
      year:
        Number(
          data.year
        ) || 2026,

      totalSales:
        Number(
          data.totalSales
        ) || 0,

      totalOrders:
        Number(
          data.totalOrders
        ) || 0,

      averageOrderValue:
        Number(
          data.averageOrderValue
        ) || 0,

      activeChannels:
        Number(
          data.activeChannels
        ) || 0,

      totalChannels:
        Number(
          data.totalChannels
        ) || 0,

      topChannel: {
        name:
          data.topChannel?.name ||
          "-",

        sales:
          Number(
            data.topChannel?.sales
          ) || 0,
      },

      topPackage: {
        name:
          data.topPackage?.name ||
          "-",

        sales:
          Number(
            data.topPackage?.sales
          ) || 0,
      },

      channels:
        Array.isArray(
          data.channels
        )
          ? data.channels.map(
              (item) => ({
                name:
                  item.name || "-",

                sales:
                  Number(
                    item.sales
                  ) || 0,

                orders:
                  Number(
                    item.orders
                  ) || 0,
              })
            )
          : [],

      monthlySales:
        Array.isArray(
          data.monthlySales
        )
          ? data.monthlySales.map(
              (item) => ({
                month:
                  item.month || "",

                total:
                  Number(
                    item.total
                  ) || 0,

                BeDee:
                  Number(
                    item.BeDee
                  ) || 0,

                Shopee:
                  Number(
                    item.Shopee
                  ) || 0,

                Phyathai:
                  Number(
                    item.Phyathai
                  ) || 0,

                Lazada:
                  Number(
                    item.Lazada
                  ) || 0,

                LINE:
                  Number(
                    item.LINE
                  ) || 0,

                HDMall:
                  Number(
                    item.HDMall
                  ) || 0,
              })
            )
          : [],

      topPackages:
        Array.isArray(
          data.topPackages
        )
          ? data.topPackages.map(
              (item) => ({
                name:
                  item.name || "-",

                channel:
                  item.channel || "-",

                qty:
                  Number(
                    item.qty
                  ) || 0,

                sales:
                  Number(
                    item.sales
                  ) || 0,
              })
            )
          : [],

      updatedAt:
        data.updatedAt,
    };

  } catch (error) {
    console.error(
      "Sales Page Fetch Error:",
      error
    );

    return {
      year: 2026,

      totalSales: 0,

      totalOrders: 0,

      averageOrderValue: 0,

      activeChannels: 0,

      totalChannels: 0,

      topChannel: {
        name: "-",
        sales: 0,
      },

      topPackage: {
        name: "-",
        sales: 0,
      },

      channels: [],

      monthlySales: [],

      topPackages: [],
    };
  }
}