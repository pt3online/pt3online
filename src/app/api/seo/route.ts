import { NextResponse } from "next/server";

const SEO_API =
  "https://script.google.com/macros/s/AKfycbxOP3RRhKnVrJKeq7izq195RmSp-DSn4frJDXYcT0qOBaDA9cUWl81O5yH-0gSqKnmp/exec";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {
        controller.abort();
      }, 30000);

    const url =
      `${SEO_API}?t=${Date.now()}`;

    console.log(
      "Fetching SEO Apps Script:",
      url
    );

    const response =
      await fetch(url, {
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
      });

    clearTimeout(timeout);

    const text =
      await response.text();

    console.log(
      "SEO Apps Script status:",
      response.status
    );

    console.log(
      "SEO Apps Script response:",
      text.substring(0, 500)
    );

    /*
     * HTTP Error
     */

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,

          updatedAt: "",
          note: "",
          count: 0,
          data: [],

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

          updatedAt: "",
          note: "",
          count: 0,
          data: [],

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

          updatedAt: "",
          note: "",
          count: 0,
          data: [],

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

          updatedAt: "",
          note: "",
          count: 0,
          data: [],

          message:
            "รูปแบบข้อมูลจาก SEO Apps Script ไม่ถูกต้อง",
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
      "SEO API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        updatedAt: "",
        note: "",
        count: 0,
        data: [],

        message:
          error instanceof Error
            ? error.name === "AbortError"
              ? "Google Sheet ใช้เวลาตอบกลับนานเกิน 30 วินาที"
              : error.message
            : "ไม่สามารถเชื่อมต่อ SEO API ได้",
      },
      {
        status: 500,
      }
    );
  }
}