import { Noto_Sans_Thai } from "next/font/google";
import SeoDashboard from "@/components/seo/SeoDashboard";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SeoPage() {
  return (
    <main className={notoSansThai.className}>
      <SeoDashboard />
    </main>
  );
}