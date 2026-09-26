"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const menuItems = [
  {
    name: "Overview",
    href: "/",
    icon: "▦",
  },
  {
    name: "Sales",
    href: "/sales",
    icon: "💰",
  },
  {
    name: "Plan Post",
    href: "/plan",
    icon: "📅",
  },
  {
    name: "Performance",
    href: "/performance",
    icon: "📊",
  },
  {
    name: "SEO / ASEO",
    href: "/seo",
    icon: "🔎",
  },
];


export default function MobileMenu() {


  const [open, setOpen] = useState(false);

  const pathname = usePathname();



  return (

    <>


      {/* Mobile Header */}

      <div

        className="
          fixed
          left-0
          top-0
          z-50
          flex
          w-full
          items-center
          justify-between

          bg-[#004C48]

          px-4
          py-3

          text-white

          md:hidden
        "

      >

        <div
          className="
            font-bold
          "
        >
          PT3 Digital
        </div>


        <button

          onClick={() => setOpen(!open)}

          className="
            rounded-lg
            bg-[#08736B]
            px-3
            py-2
            text-xl
          "

        >

          ☰

        </button>


      </div>





      {/* Overlay */}

      {
        open && (

          <div

            onClick={() => setOpen(false)}

            className="
              fixed
              inset-0
              z-40
              bg-black/40
              md:hidden
            "

          />

        )
      }





      {/* Mobile Sidebar */}

      <aside

        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-[240px]

          bg-[#004C48]

          p-5

          text-white

          transition-transform
          duration-300

          md:hidden

          ${
            open
            ? "translate-x-0"
            : "-translate-x-full"
          }

        `}

      >


        <div
          className="
            mb-8
            text-lg
            font-bold
          "
        >
          PT3 Digital
        </div>



        <nav
          className="
            flex
            flex-col
            gap-2
          "
        >

          {
            menuItems.map((item)=>{


              const active =
                pathname === item.href;


              return (

                <Link

                  key={item.href}

                  href={item.href}

                  onClick={() => setOpen(false)}

                  className={`

                    flex
                    items-center
                    gap-3
                    rounded-lg
                    px-4
                    py-3
                    text-sm

                    ${
                      active
                      ? "bg-[#08736B] text-white font-semibold"
                      : "text-[#B8D7D4]"
                    }

                  `}

                >

                  <span>
                    {item.icon}
                  </span>

                  <span>
                    {item.name}
                  </span>


                </Link>

              );

            })
          }


        </nav>


      </aside>


    </>

  );

}