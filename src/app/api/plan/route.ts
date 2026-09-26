import { NextResponse } from "next/server";

const PLAN_API =
  "https://script.google.com/macros/s/AKfycbwZuTsSjWUd19cxl7leDAoWV148k0gAH2NCIhsNwG95DqSFgK9IUG-bW89GFifoWqvq/exec";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const url = `${PLAN_API}?t=${Date.now()}`;

    console.log("Fetching Google Apps Script:");
    console.log(url);

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",

      headers: {
        Accept: "application/json,text/plain,*/*",
        "User-Agent": "Mozilla/5.0",
      },
    });

    const text = await response.text();

    console.log(
      "Google Apps Script status:",
      response.status
    );

    console.log(
      "Google Apps Script response:",
      text.substring(0, 500)
    );

    /*
     * Apps Script ตอบ HTTP Error
     */

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          message:
            `Google Apps Script HTTP ${response.status}`,
        },
        {
          status: 502,
        }
      );
    }

    const trimmed = text.trim();

    /*
     * Google ส่ง HTML กลับมา
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
          data: [],
          message:
            "Google Apps Script ส่ง HTML กลับมาแทน JSON กรุณาตรวจสอบการ Deploy Web App และตั้งสิทธิ์เป็น Anyone",
          debug: trimmed.substring(0, 300),
        },
        {
          status: 502,
        }
      );
    }

    /*
     * Parse JSON
     */

    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          data: [],
          message:
            "ข้อมูลจาก Google Apps Script ไม่ใช่ JSON",
          debug: text.substring(0, 300),
        },
        {
          status: 502,
        }
      );
    }

    /*
     * กรณี Apps Script ส่ง Array
     *
     * [
     *   {...},
     *   {...}
     * ]
     */

    if (Array.isArray(parsed)) {
      return NextResponse.json(
        {
          success: true,
          data: parsed,
          count: parsed.length,
        },
        {
          status: 200,

          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    /*
     * กรณี Apps Script ส่ง Object
     *
     * {
     *   success: true,
     *   data: [...]
     * }
     */

    if (
      parsed !== null &&
      typeof parsed === "object"
    ) {
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
    }

    /*
     * รูปแบบไม่ถูกต้อง
     */

    return NextResponse.json(
      {
        success: false,
        data: [],
        message:
          "รูปแบบข้อมูลจาก Google Apps Script ไม่ถูกต้อง",
      },
      {
        status: 502,
      }
    );
  } catch (error) {
    console.error(
      "PLAN API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        data: [],

        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถเชื่อมต่อ Google Apps Script ได้",
      },
      {
        status: 500,
      }
    );
  }
}