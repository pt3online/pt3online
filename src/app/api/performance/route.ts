import { NextResponse } from "next/server";

const PERFORMANCE_API =
  "https://script.google.com/macros/s/AKfycbzy2Qks1UtfNF20poGUj0omCQRDRbvMzA9LzcDCsjXKblfI0OB-QJdQLEK0S2_QjrVC/exec";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000);

    const url =
      `${PERFORMANCE_API}?t=${Date.now()}`;

    console.log(
      "Fetching Performance Apps Script:",
      url
    );

    const response = await fetch(
      url,
      {
        method: "GET",

        cache: "no-store",

        redirect: "follow",

        signal:
          controller.signal,

        headers: {
          Accept:
            "application/json,text/plain,*/*",

          "User-Agent":
            "Mozilla/5.0",
        },
      }
    );

    clearTimeout(timeout);

    const text =
      await response.text();

    console.log(
      "Performance Apps Script status:",
      response.status
    );

    console.log(
      "Performance Apps Script response:",
      text.substring(0, 500)
    );

    /*
     * HTTP Error
     */

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,

          facebook: [],
          website: [],
          tiktok: [],

          message:
            `Google Apps Script HTTP ${response.status}`,

          debug:
            text.substring(0, 300),
        },
        {
          status: 502,
        }
      );
    }

    const trimmed =
      text.trim();

    /*
     * Google ส่ง HTML
     * เช่น Login / Permission / Error
     */

    if (
      trimmed.startsWith("<!DOCTYPE") ||
      trimmed.startsWith("<html") ||
      trimmed.startsWith("<")
    ) {
      return NextResponse.json(
        {
          success: false,

          facebook: [],
          website: [],
          tiktok: [],

          message:
            "Google Apps Script ส่ง HTML กลับมาแทน JSON กรุณาตรวจสอบ Web App Deployment และสิทธิ์ Anyone",

          debug:
            trimmed.substring(0, 300),
        },
        {
          status: 502,
        }
      );
    }

    /*
     * Parse JSON
     */

    let parsed;

    try {
      parsed =
        JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,

          facebook: [],
          website: [],
          tiktok: [],

          message:
            "ข้อมูลจาก Google Apps Script ไม่ใช่ JSON",

          debug:
            text.substring(0, 300),
        },
        {
          status: 502,
        }
      );
    }

    /*
     * ตรวจรูปแบบข้อมูล
     */

    if (
      parsed === null ||
      typeof parsed !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,

          facebook: [],
          website: [],
          tiktok: [],

          message:
            "รูปแบบข้อมูลจาก Performance Apps Script ไม่ถูกต้อง",
        },
        {
          status: 502,
        }
      );
    }

    /*
     * ส่งข้อมูลกลับ Dashboard
     */

    return NextResponse.json(
      parsed,
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "PERFORMANCE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        facebook: [],
        website: [],
        tiktok: [],

        message:
          error instanceof Error
            ? error.name ===
              "AbortError"
              ? "Google Sheet ใช้เวลาตอบกลับนานเกิน 30 วินาที"
              : error.message
            : "ไม่สามารถเชื่อมต่อ Performance API ได้",
      },
      {
        status: 500,
      }
    );
  }
}