import type { SalesPackage } from "@/lib/sales-page";

export interface SalesInsightResult {
  selectedChannelLabel: string;
  packages: SalesPackage[];
  top10ByRevenue: SalesPackage[];
  topByQty?: SalesPackage;
  topByRevenue?: SalesPackage;
  recommendedAge: string;
  recommendedSegment: string;
  interests: string[];
  campaignTitle: string;
  campaignDescription: string;
  opportunityTitle: string;
  opportunityDescription: string;
  basisText: string;
}

type InterestRule = {
  label: string;
  keywords: string[];
};

const INTEREST_RULES: InterestRule[] = [
  {
    label: "ตรวจสุขภาพและป้องกันโรค",
    keywords: [
      "ตรวจสุขภาพ",
      "health check",
      "check-up",
      "checkup",
      "screening",
      "gen x",
      "gen y",
      "gen z",
    ],
  },
  {
    label: "วัคซีนและภูมิคุ้มกัน",
    keywords: [
      "วัคซีน",
      "vaccine",
      "influenza",
      "ไข้หวัดใหญ่",
      "hpv",
      "ไข้เลือดออก",
      "dengue",
      "shingles",
      "งูสวัด",
      "pneum",
    ],
  },
  {
    label: "หัวใจและหลอดเลือด",
    keywords: [
      "หัวใจ",
      "echo",
      "est",
      "cac",
      "coronary",
      "calcium",
    ],
  },
  {
    label: "คัดกรองมะเร็ง",
    keywords: [
      "มะเร็ง",
      "cancer",
      "mammogram",
      "เต้านม",
      "ปากมดลูก",
      "hpv",
    ],
  },
  {
    label: "สุขภาพสตรี",
    keywords: [
      "ผู้หญิง",
      "สตรี",
      "เต้านม",
      "มดลูก",
      "รังไข่",
      "ช่องคลอด",
      "obg",
      "pregnan",
    ],
  },
  {
    label: "ทันตกรรม",
    keywords: [
      "ฟัน",
      "ทันต",
      "ขูดหินปูน",
      "dental",
    ],
  },
  {
    label: "เด็กและครอบครัว",
    keywords: [
      "เด็ก",
      "child",
      "pediatric",
      "ครอบครัว",
    ],
  },
  {
    label: "สุขภาพทางเพศและวางแผนครอบครัว",
    keywords: [
      "std",
      "โรคติดต่อทางเพศ",
      "ก่อนมีบุตร",
      "fertility",
      "อสุจิ",
    ],
  },
];

function normalizeChannel(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function sameChannel(
  first: string,
  second: string
) {
  return (
    normalizeChannel(first) ===
    normalizeChannel(second)
  );
}

function displayChannel(
  selectedChannel: string
) {
  return selectedChannel === "all"
    ? "ทุกช่องทาง"
    : selectedChannel;
}

function compactText(
  value: string
) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalPackageKey(
  value: string
) {
  return compactText(value)
    .toLowerCase()
    .replace(
      /^\[?e[-\s]?coupon\]?\s*/i,
      ""
    )
    .replace(
      /\bphyathai\s*3\b/gi,
      ""
    )
    .replace(
      /\bpt3\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

/*
  ======================================
  PACKAGES BY SELECTED CHANNEL
  ======================================

  - กด Channel → Filter Channel
  - กด ทุกช่องทาง → รวม Package ชื่อเดียวกัน
  - รวม Qty
  - รวม Sales
  - เรียงยอดขายมาก → น้อย
*/

export function getPackagesForSelection(
  packages: SalesPackage[],
  selectedChannel: string
): SalesPackage[] {
  const source =
    selectedChannel === "all"
      ? packages
      : packages.filter((item) =>
          sameChannel(
            item.channel,
            selectedChannel
          )
        );

  const grouped = new Map<
    string,
    {
      name: string;
      channel: string;
      qty: number;
      sales: number;
    }
  >();

  source.forEach((item) => {
    const key =
      canonicalPackageKey(
        item.name
      ) ||
      compactText(
        item.name
      );

    if (!grouped.has(key)) {
      grouped.set(key, {
        name:
          compactText(
            item.name
          ),

        channel:
          selectedChannel === "all"
            ? "ทุกช่องทาง"
            : selectedChannel,

        qty: 0,
        sales: 0,
      });
    }

    const target =
      grouped.get(key)!;

    target.qty +=
      Number(
        item.qty
      ) || 0;

    target.sales +=
      Number(
        item.sales
      ) || 0;
  });

  return Array.from(
    grouped.values()
  ).sort((a, b) => {
    if (
      b.sales !==
      a.sales
    ) {
      return (
        b.sales -
        a.sales
      );
    }

    return (
      b.qty -
      a.qty
    );
  });
}

/*
  ======================================
  AGE RECOMMENDATION
  ======================================
*/

function detectAgeRange(
  packages: SalesPackage[]
) {
  const ageScores =
    new Map<
      string,
      number
    >();

  packages
    .slice(0, 20)
    .forEach((item) => {
      const text =
        item.name;

      const weight =
        Math.max(
          1,
          Number(
            item.qty
          ) || 0
        );

      const rangeMatches = [
        ...text.matchAll(
          /(\d{2})\s*[-–]\s*(\d{2})\s*ปี/g
        ),
      ];

      rangeMatches.forEach(
        (match) => {
          const label =
            `${match[1]}–${match[2]} ปี`;

          ageScores.set(
            label,
            (
              ageScores.get(
                label
              ) || 0
            ) + weight
          );
        }
      );

      const plusMatch =
        text.match(
          /(\d{2})\s*ปี\s*ขึ้นไป/
        );

      if (plusMatch) {
        const label =
          `${plusMatch[1]} ปีขึ้นไป`;

        ageScores.set(
          label,
          (
            ageScores.get(
              label
            ) || 0
          ) + weight
        );
      }
    });

  const ranked =
    Array.from(
      ageScores.entries()
    ).sort(
      (a, b) =>
        b[1] - a[1]
    );

  return (
    ranked[0]?.[0] ||
    "30–55 ปี"
  );
}

/*
  ======================================
  INTEREST ANALYSIS
  ======================================
*/

function detectInterests(
  packages: SalesPackage[]
) {
  if (
    packages.length === 0
  ) {
    return [
      "ยังไม่มีข้อมูลเพียงพอ",
    ];
  }

  const maxSales =
    Math.max(
      ...packages.map(
        (item) =>
          Number(
            item.sales
          ) || 0
      ),
      1
    );

  const maxQty =
    Math.max(
      ...packages.map(
        (item) =>
          Number(
            item.qty
          ) || 0
      ),
      1
    );

  const scores =
    new Map<
      string,
      number
    >();

  packages
    .slice(0, 20)
    .forEach((item) => {
      const text =
        item.name.toLowerCase();

      const normalizedSales =
        (
          Number(
            item.sales
          ) || 0
        ) / maxSales;

      const normalizedQty =
        (
          Number(
            item.qty
          ) || 0
        ) / maxQty;

      const weight =
        normalizedSales *
          0.6 +
        normalizedQty *
          0.4;

      INTEREST_RULES.forEach(
        (rule) => {
          if (
            rule.keywords.some(
              (keyword) =>
                text.includes(
                  keyword
                )
            )
          ) {
            scores.set(
              rule.label,
              (
                scores.get(
                  rule.label
                ) || 0
              ) + weight
            );
          }
        }
      );
    });

  const ranked =
    Array.from(
      scores.entries()
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .map(
        ([label]) =>
          label
      )
      .slice(
        0,
        3
      );

  return ranked.length > 0
    ? ranked
    : [
        "แพ็กเกจสุขภาพทั่วไป",
      ];
}

/*
  ======================================
  MARKETING RECOMMENDATION
  ======================================
*/

function getChannelRecommendation(
  selectedChannel: string,
  primaryInterest: string,
  topByQty?: SalesPackage,
  topByRevenue?: SalesPackage
) {
  const channel =
    displayChannel(
      selectedChannel
    );

  const byChannel: Record<
    string,
    {
      segment: string;
      campaignTitle: string;
      campaignDescription: string;
    }
  > = {
    all: {
      segment:
        "วัยทำงานและครอบครัวที่สนใจดูแลสุขภาพเชิงป้องกัน",

      campaignTitle:
        "Cross-channel Hero Package",

      campaignDescription:
        `ใช้แพ็กเกจเด่นในกลุ่ม ${primaryInterest} เป็น Hero Product แล้วปรับข้อเสนอให้เหมาะกับแต่ละช่องทาง`,
    },

    "phyathai.com": {
      segment:
        "ผู้ที่ค้นหาข้อมูลสุขภาพและต้องการรายละเอียดก่อนตัดสินใจ",

      campaignTitle:
        "Search + Content Conversion",

      campaignDescription:
        `ทำ Content/Search Intent รอบ ${primaryInterest} แล้ว Retarget ไปยังแพ็กเกจที่มีโอกาสปิดการขายสูง`,
    },

    Shopee: {
      segment:
        "ผู้ซื้อออนไลน์ที่ตอบสนองต่อราคา โปรโมชัน และช่วงแคมเปญ",

      campaignTitle:
        "Payday / Mega Campaign",

      campaignDescription:
        `ใช้โปรโมชันแบบมีช่วงเวลาและ Voucher กับแพ็กเกจกลุ่ม ${primaryInterest} เพื่อเร่ง Conversion`,
    },

    BeDee: {
      segment:
        "ผู้ใช้งานดิจิทัลที่คุ้นเคยกับบริการสุขภาพออนไลน์",

      campaignTitle:
        "App-exclusive + Cross-sell",

      campaignDescription:
        `ทำข้อเสนอเฉพาะช่องทางและ Cross-sell จากบริการออนไลน์ไปยังแพ็กเกจกลุ่ม ${primaryInterest}`,
    },

    "HD Mall": {
      segment:
        "ผู้ค้นหาบริการสุขภาพที่เปรียบเทียบราคาและรายละเอียดก่อนซื้อ",

      campaignTitle:
        "Search Intent + Price-led Conversion",

      campaignDescription:
        `เน้นแพ็กเกจกลุ่ม ${primaryInterest} ที่ราคาเข้าใจง่าย พร้อมจุดเด่นบริการและ Call to Action ที่ชัดเจน`,
    },

    LINE: {
      segment:
        "ฐานลูกค้าเดิมและผู้ติดตามที่เหมาะกับ CRM และการซื้อซ้ำ",

      campaignTitle:
        "CRM Broadcast + Retarget",

      campaignDescription:
        `จัด Broadcast แยกกลุ่มความสนใจ ${primaryInterest} และทำ Reminder / Follow-up เพื่อเพิ่มการซื้อซ้ำ`,
    },

    Lazada: {
      segment:
        "ผู้ซื้อออนไลน์ที่ตอบสนองต่อ Voucher และแคมเปญ Marketplace",

      campaignTitle:
        "Mega Campaign + Voucher",

      campaignDescription:
        `ใช้ Voucher และ Campaign Date กับแพ็กเกจกลุ่ม ${primaryInterest} พร้อมดันสินค้าที่ตัดสินใจซื้อได้ง่าย`,
    },
  };

  const recommendation =
    byChannel[
      selectedChannel
    ] ||
    byChannel.all;

  const sameLeader =
    topByQty &&
    topByRevenue &&
    canonicalPackageKey(
      topByQty.name
    ) ===
      canonicalPackageKey(
        topByRevenue.name
      );

  if (sameLeader) {
    return {
      ...recommendation,

      opportunityTitle:
        "Scale Hero Package",

      opportunityDescription:
        `แพ็กเกจเดียวกันนำทั้งจำนวนและรายได้ใน ${channel} ควรเพิ่ม Exposure และทดลอง Bundle / Upsell เพื่อขยายมูลค่าต่อคำสั่งซื้อ`,
    };
  }

  return {
    ...recommendation,

    opportunityTitle:
      "Entry Product → Value Upsell",

    opportunityDescription:
      topByQty &&
      topByRevenue
        ? `ใช้ “${topByQty.name}” เป็นแพ็กเกจดึงจำนวน แล้วเชื่อมต่อไปยัง “${topByRevenue.name}” เพื่อเพิ่มรายได้ต่อผู้ซื้อ`
        : "ใช้แพ็กเกจที่สร้างจำนวนเป็น Entry Product แล้วออกแบบ Upsell ไปยังบริการมูลค่าสูงกว่า",
  };
}

/*
  ======================================
  FINAL INSIGHT
  ======================================
*/

export function buildSalesInsight(
  packages: SalesPackage[],
  selectedChannel: string
): SalesInsightResult {
  const selectedPackages =
    getPackagesForSelection(
      packages,
      selectedChannel
    );

  /*
    ยอดขายสูงสุด
  */

  const topByRevenue =
    [
      ...selectedPackages,
    ].sort(
      (a, b) =>
        b.sales -
          a.sales ||
        b.qty -
          a.qty
    )[0];

  /*
    จำนวนขายสูงสุด
  */

  const topByQty =
    [
      ...selectedPackages,
    ].sort(
      (a, b) =>
        b.qty -
          a.qty ||
        b.sales -
          a.sales
    )[0];

  /*
    Top 10 Revenue
  */

  const top10ByRevenue =
    [
      ...selectedPackages,
    ]
      .sort(
        (a, b) =>
          b.sales -
            a.sales ||
          b.qty -
            a.qty
      )
      .slice(
        0,
        10
      );

  const interests =
    detectInterests(
      top10ByRevenue
    );

  const recommendedAge =
    detectAgeRange(
      top10ByRevenue
    );

  const recommendation =
    getChannelRecommendation(
      selectedChannel,
      interests[0],
      topByQty,
      topByRevenue
    );

  return {
    selectedChannelLabel:
      displayChannel(
        selectedChannel
      ),

    packages:
      selectedPackages,

    top10ByRevenue,

    topByQty,

    topByRevenue,

    recommendedAge,

    recommendedSegment:
      recommendation.segment,

    interests,

    campaignTitle:
      recommendation
        .campaignTitle,

    campaignDescription:
      recommendation
        .campaignDescription,

    opportunityTitle:
      recommendation
        .opportunityTitle,

    opportunityDescription:
      recommendation
        .opportunityDescription,

    basisText:
      "Top 10 Packages · Qty · Sales · Selected Channel",
  };
}