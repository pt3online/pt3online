export interface ChannelSummary {
  name: string;
  sales: number;
}

export interface PackageSummary {
  name: string;
  sales: number;
}

export interface MonthlySales {
  month: string;
  total: number;
  BeDee: number;
  Shopee: number;
  Phyathai: number;
  Lazada: number;
  LINE: number;
  HDMall: number;
}

export interface SalesSummary {
  totalSales: number;
  topChannel: ChannelSummary;
  topPackage: PackageSummary;
  channels: ChannelSummary[];
  monthlySales: MonthlySales[];
  year: number;
  updatedAt?: string;
}

interface SalesApiResponse {
  success?: boolean;

  year?: number;

  totalSales?: number;

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

  updatedAt?: string;
}

const SALES_API =
  "https://script.google.com/macros/s/AKfycbyTMbhpFjtTtSY6kAWnL8e6NMDYia8ezJKEJdR0cLU4uMwoo4jjgLMxp5i1f4UHigNeGw/exec";

export async function getSalesOverview(): Promise<SalesSummary> {
  try {
    const response = await fetch(
      SALES_API,
      {
        next: {
          revalidate: 60,
        },
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
      totalSales:
        Number(
          data.totalSales
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
              (channel) => ({
                name:
                  channel.name ||
                  "-",

                sales:
                  Number(
                    channel.sales
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

      year:
        Number(
          data.year
        ) || 2026,

      updatedAt:
        data.updatedAt,
    };

  } catch (error) {
    console.error(
      "Sales Fetch Error:",
      error
    );

    return {
      totalSales: 0,

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

      year: 2026,
    };
  }
}

export function formatBaht(
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