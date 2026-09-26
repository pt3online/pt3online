"use client";

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



export default function Sidebar() {


  const pathname = usePathname();



  return (

    <aside

      className="
        fixed
        left-0
        top-0
        z-40

        hidden

        h-screen
        w-[240px]

        bg-[#004C48]

        p-5

        text-white

        md:block
      "

    >


      {/* Logo */}

      <div

        className="
          mb-8
          flex
          items-center
          gap-3
        "

      >


        <div

          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-[#20B9AD]

            text-sm
            font-bold
          "

        >

          PT3

        </div>



        <div>

          <div
            className="
              text-lg
              font-bold
            "
          >
            PT3 Digital
          </div>


          <div
            className="
              text-xs
              text-[#B5D8D5]
            "
          >
            Dashboard
          </div>


        </div>


      </div>





      {/* Menu */}

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

                className={`

                  flex
                  items-center
                  gap-3

                  rounded-xl

                  px-4
                  py-3

                  text-sm

                  transition


                  ${
                    active

                    ? `
                      bg-[#08736B]
                      font-semibold
                      text-white
                    `

                    : `
                      text-[#B8D7D4]
                      hover:bg-[#075F5A]
                    `
                  }


                `}

              >


                <span
                  className="
                    text-base
                  "
                >

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


  );

}