import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";

import "./globals.css";

import DashboardLayout from "@/components/DashboardLayout";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PT3 Digital Dashboard",
  description: "PT3 Digital Marketing Intelligence Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${notoSansThai.className} min-h-screen antialiased`}
      >
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}