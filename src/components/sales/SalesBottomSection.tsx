"use client";

import {
  useMemo,
} from "react";

import SalesInsightPanel
  from "@/components/sales/SalesInsightPanel";

import type {
  SalesPackage,
} from "@/lib/sales-page";

import {
  getPackagesForSelection,
} from "@/lib/sales-insight";


interface SalesBottomSectionProps {
  selectedChannel: string;
  packages: SalesPackage[];
}


/*
  =================================
  CHANNEL COLORS
  =================================
*/

const CHANNEL_COLORS:
  Record<
    string,
    string
  > = {

  "phyathai.com":
    "#00826a",

  Shopee:
    "#ff8043",

  BeDee:
    "#03a9f4",

  "HD Mall":
    "#4db6ac",

  LINE:
    "#42db41",

  Lazada:
    "#400c4c",

  "ทุกช่องทาง":
    "#00826a",
};


function channelColor(
  name: string
) {
  return (
    CHANNEL_COLORS[
      name
    ] ||
    "#94A3B8"
  );
}


/*
  =================================
  BAHT FORMAT
  =================================
*/

function formatBaht(
  value: number
) {
  return (
    "฿" +
    Number(
      value || 0
    ).toLocaleString(
      "th-TH",
      {
        maximumFractionDigits:
          0,
      }
    )
  );
}


/*
  =================================
  MAIN COMPONENT
  =================================
*/

export default function SalesBottomSection({
  selectedChannel,
  packages,
}: SalesBottomSectionProps) {

  /*
    ===============================
    FILTER PACKAGE
    ===============================
  */

  const selectedPackages =
    useMemo(
      () =>
        getPackagesForSelection(
          packages,
          selectedChannel
        ),
      [
        packages,
        selectedChannel,
      ]
    );


  /*
    ===============================
    TOP 15
    ===============================
  */

  const visiblePackages =
    useMemo(
      () =>
        selectedPackages
          .slice(
            0,
            15
          ),
      [
        selectedPackages,
      ]
    );


  return (
    <div
      className="
        grid
        grid-cols-1
        gap-3

        xl:grid-cols-[2fr_1fr]

        xl:items-stretch
      "
    >

      {/* =========================
          TOP 15 PACKAGE
      ========================== */}

      <section
        className="
          h-full
          overflow-hidden
          rounded-2xl
          border
          border-[#DBE5E2]
          bg-white
        "
      >

        {/* HEADER */}

        <div
          className="
            px-4
            pb-3
            pt-4

            sm:px-5
          "
        >

          <h2
            className="
              text-[16px]
              font-bold
              text-[#192C32]
            "
          >
            Top 15 แพ็กเกจยอดขายสูง
          </h2>


          <p
            className="
              mt-1
              text-[12px]
              text-[#879398]
            "
          >

            {
              selectedChannel ===
              "all"

                ? "15 อันดับแพ็กเกจที่สร้างยอดขายสูงสุดจากทุกช่องทาง"

                : `15 อันดับแพ็กเกจที่สร้างยอดขายสูงสุด · ${selectedChannel}`
            }

          </p>

        </div>


        {/* TABLE */}

        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              w-full
              min-w-[680px]
            "
          >

            <thead>

              <tr
                className="
                  border-y
                  border-[#EEF2F1]
                  bg-[#FBFCFC]
                "
              >

                <th
                  className="
                    px-5
                    py-3
                    text-left
                    text-[11px]
                    font-medium
                    text-[#77868B]
                  "
                >
                  รายการ
                </th>


                <th
                  className="
                    px-4
                    py-3
                    text-left
                    text-[11px]
                    font-medium
                    text-[#77868B]
                  "
                >
                  ช่องทาง
                </th>


                <th
                  className="
                    px-4
                    py-3
                    text-right
                    text-[11px]
                    font-medium
                    text-[#77868B]
                  "
                >
                  จำนวน
                </th>


                <th
                  className="
                    px-5
                    py-3
                    text-right
                    text-[11px]
                    font-medium
                    text-[#77868B]
                  "
                >
                  ยอดขาย
                </th>

              </tr>

            </thead>


            <tbody>

              {
                visiblePackages
                  .length > 0
              ? (

                visiblePackages.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={
                        `${item.name}-${item.channel}-${index}`
                      }
                      className="
                        border-b
                        border-[#F0F3F2]
                        transition
                        hover:bg-[#FBFCFC]
                      "
                    >

                      <td
                        className="
                          max-w-[500px]
                          px-5
                          py-3
                          text-[12px]
                          leading-5
                          text-[#263A40]
                        "
                      >

                        <div
                          className="
                            line-clamp-2
                          "
                        >
                          {
                            item.name
                          }
                        </div>

                      </td>


                      <td
                        className="
                          px-4
                          py-3
                        "
                      >

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            whitespace-nowrap
                            rounded-full
                            bg-[#F3F6F5]
                            px-2.5
                            py-1
                            text-[11px]
                            text-[#526268]
                          "
                        >

                          <span
                            className="
                              h-1.5
                              w-1.5
                              shrink-0
                              rounded-full
                            "
                            style={{
                              backgroundColor:
                                channelColor(
                                  item.channel
                                ),
                            }}
                          />

                          {
                            item.channel
                          }

                        </span>

                      </td>


                      <td
                        className="
                          px-4
                          py-3
                          text-right
                          text-[12px]
                          text-[#46575D]
                        "
                      >

                        {
                          Number(
                            item.qty ||
                            0
                          ).toLocaleString(
                            "th-TH"
                          )
                        }

                      </td>


                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-3
                          text-right
                          text-[12px]
                          font-bold
                          text-[#15272E]
                        "
                      >

                        {
                          formatBaht(
                            item.sales
                          )
                        }

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan={
                      4
                    }
                    className="
                      px-5
                      py-12
                      text-center
                      text-sm
                      text-gray-400
                    "
                  >
                    ยังไม่มีข้อมูลแพ็กเกจ
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        {
          selectedPackages
            .length > 15
        && (

          <div
            className="
              border-t
              border-[#EEF2F1]
              bg-[#FBFCFC]
              px-5
              py-3
              text-[10px]
              text-[#879398]
            "
          >

            แสดง 15 อันดับแรก
            จากทั้งหมด{" "}

            <strong
              className="
                font-semibold
                text-[#526268]
              "
            >
              {
                selectedPackages
                  .length
                  .toLocaleString(
                    "th-TH"
                  )
              }
            </strong>

            {" "}
            แพ็กเกจ

          </div>

        )}

      </section>


      {/* AI MARKETING INSIGHT */}

      <SalesInsightPanel
        selectedChannel={
          selectedChannel
        }
        packages={
          packages
        }
      />

    </div>
  );
}