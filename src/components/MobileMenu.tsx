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
      <header
        className="
          fixed
          left-0
          top-0
          z-[60]
          flex
          h-16
          w-full
          items-center
          justify-between
          border-b
          border-white/10
          bg-[#004C48]
          px-4
          text-white
          shadow-sm
          md:hidden
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-white/10
              text-sm
              font-bold
            "
          >
            PT3
          </div>

          <div>
            <div className="text-sm font-semibold leading-tight">
              PT3 Digital
            </div>

            <div className="mt-0.5 text-[11px] text-white/60">
              Marketing Dashboard
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="เปิดเมนู"
          onClick={() => setOpen(true)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-[#08736B]
            text-xl
            transition
            active:scale-95
          "
        >
          ☰
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-[70]
            bg-black/40
            backdrop-blur-[1px]
            md:hidden
          "
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-[80]
          h-screen
          w-[280px]
          max-w-[85vw]
          bg-[#004C48]
          text-white
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          md:hidden

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Sidebar Header */}
        <div
          className="
            flex
            h-16
            items-center
            justify-between
            border-b
            border-white/10
            px-5
          "
        >
          <div>
            <div className="text-base font-semibold">
              PT3 Digital
            </div>

            <div className="mt-0.5 text-[11px] text-white/60">
              Marketing Dashboard
            </div>
          </div>

          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={() => setOpen(false)}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-white/10
              text-lg
            "
          >
            ×
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-1.5 px-3 py-5">
          {menuItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  flex
                  min-h-[48px]
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  transition

                  ${
                    active
                      ? "bg-[#08736B] font-semibold text-white"
                      : "text-[#B8D7D4] hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <span
                  className="
                    flex
                    w-6
                    shrink-0
                    items-center
                    justify-center
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
          })}
        </nav>
      </aside>
    </>
  );
}