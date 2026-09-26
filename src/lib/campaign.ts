export interface Campaign {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  objective: string;
  owner?: string;
  picture?: string;
}

const CAMPAIGN_API =
  "https://script.google.com/macros/s/AKfycbyjfRrz6U4JRzs7dX_qzk-gbh4Tm614_4QLx5Vqt3T5uAHC_GMDEnxnUOHaWOPlXKJn/exec";


export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const response =
      await fetch(
        CAMPAIGN_API,
        {
          next: {
            revalidate: 60,
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        "Campaign API Error"
      );
    }

    const data =
      await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item) => ({
        id:
          clean(
            item["Campaign ID"]
          ),

        title:
          clean(
            item["Campaign Name"]
          ),

        startDate:
          formatDate(
            item["Start Date"]
          ),

        endDate:
          formatDate(
            item["End Date"]
          ),

        status:
          clean(
            item["Status"]
          ),

        objective:
          clean(
            item["Objective"]
          ),

        owner:
          clean(
            item["Owner"]
          ),

        picture:
          convertDriveImage(
            item["Picture"]
          ),
      }))

      .filter(
        (item) =>
          item.id ||
          item.title
      );

  } catch (error) {
    console.error(
      "Campaign Fetch Error:",
      error
    );

    return [];
  }
}


export function getActiveCampaigns(
  campaigns: Campaign[]
) {
  return campaigns.filter(
    (campaign) =>
      campaign.status
        .trim()
        .toLowerCase()
      === "active"
  );
}


function clean(
  value: unknown
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}


function formatDate(
  value: unknown
) {
  if (!value) {
    return "";
  }

  const text =
    String(value).trim();

  const date =
    new Date(text);

  if (
    !Number.isNaN(
      date.getTime()
    )
  ) {
    return new Intl.DateTimeFormat(
      "th-TH",
      {
        timeZone:
          "Asia/Bangkok",

        day:
          "numeric",

        month:
          "short",

        year:
          "numeric",
      }
    ).format(date);
  }

  return text;
}


function convertDriveImage(
  value: unknown
) {
  const text =
    clean(value);

  if (!text) {
    return "";
  }

  const match =
    text.match(
      /[-\w]{25,}/
    );

  if (!match) {
    return text;
  }

  return (
    "https://drive.google.com/thumbnail?id=" +
    match[0] +
    "&sz=w1600"
  );
}