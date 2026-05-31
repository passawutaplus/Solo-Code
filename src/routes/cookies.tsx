import { createFileRoute, Link } from "@tanstack/react-router";
import { Cookie, ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "นโยบายคุกกี้ — So1o Freelancer" },
      {
        name: "description",
        content:
          "นโยบายคุกกี้ของ So1o Freelancer ประเภทคุกกี้ที่เราใช้ และวิธีจัดการคุกกี้ในเบราว์เซอร์ของคุณ",
      },
      { property: "og:title", content: "นโยบายคุกกี้ — So1o Freelancer" },
      { property: "og:description", content: "ประเภทคุกกี้ที่เราใช้ และวิธีจัดการคุกกี้" },
      { property: "og:url", content: "https://solofreelancer.com/cookies" },
    ],
    links: [{ rel: "canonical", href: "https://solofreelancer.com/cookies" }],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> กลับหน้าหลัก
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Cookie className="h-3.5 w-3.5 text-primary" /> Cookies
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14 flex-1 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">นโยบายคุกกี้</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          อัปเดตล่าสุด:{" "}
          {new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <article className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold">1. คุกกี้คืออะไร</h2>
            <p className="mt-2">
              คุกกี้ (Cookies) คือไฟล์ข้อมูลขนาดเล็กที่เว็บไซต์เก็บไว้ในเบราว์เซอร์ของคุณ
              ใช้ในการจดจำการตั้งค่า การล็อกอิน และช่วยให้ระบบทำงานได้อย่างต่อเนื่อง
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. ประเภทคุกกี้ที่เราใช้</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <span className="font-medium text-foreground">คุกกี้ที่จำเป็น (Strictly Necessary):</span>{" "}
                สำหรับการล็อกอินและการรักษา Session ปิดไม่ได้เพราะระบบจะใช้งานไม่ได้
              </li>
              <li>
                <span className="font-medium text-foreground">คุกกี้การตั้งค่า (Preferences):</span>{" "}
                จดจำธีม (สว่าง/มืด), ภาษา, และมุมมองที่คุณเลือก
              </li>
              <li>
                <span className="font-medium text-foreground">คุกกี้วิเคราะห์ (Analytics):</span>{" "}
                ช่วยให้เราเข้าใจว่าฟีเจอร์ไหนมีคนใช้บ่อยและจุดไหนต้องปรับปรุง (ไม่เก็บข้อมูลส่วนตัว)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. รายการคุกกี้และ Local Storage ในระบบ</h2>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full text-xs">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium">ชื่อ</th>
                    <th className="px-3 py-2 font-medium">ประเภท</th>
                    <th className="px-3 py-2 font-medium">วัตถุประสงค์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-3 py-2 font-mono">sb-*-auth-token</td>
                    <td className="px-3 py-2">จำเป็น</td>
                    <td className="px-3 py-2">รักษา Session ผู้ใช้ล็อกอิน</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">so1o-theme</td>
                    <td className="px-3 py-2">การตั้งค่า</td>
                    <td className="px-3 py-2">จดจำธีมสว่าง/มืด</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">so1o-cookie-consent</td>
                    <td className="px-3 py-2">จำเป็น</td>
                    <td className="px-3 py-2">บันทึกการเลือกยินยอมคุกกี้</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">so1o-*</td>
                    <td className="px-3 py-2">การตั้งค่า</td>
                    <td className="px-3 py-2">บันทึก Draft, มุมมองแท็บ และค่าตั้งต้น Dashboard</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. การจัดการคุกกี้</h2>
            <p className="mt-2">
              คุณสามารถลบหรือบล็อกคุกกี้ได้ในเบราว์เซอร์ (Chrome, Safari, Firefox, Edge)
              แต่หากปิดคุกกี้ที่จำเป็น ระบบล็อกอินอาจใช้งานไม่ได้
            </p>
            <p className="mt-2">
              หากต้องการเปลี่ยนการตั้งค่ายินยอมคุกกี้ของ So1o
              ให้ลบรายการ <code className="font-mono text-xs px-1 bg-muted rounded">so1o-cookie-consent</code>{" "}
              ใน Local Storage แล้วรีโหลดหน้า กล่องยินยอมจะแสดงอีกครั้ง
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. ติดต่อเรา</h2>
            <p className="mt-2">
              สอบถามเพิ่มเติมได้ที่{" "}
              <a href="mailto:hello@solofreelancer.com" className="text-primary hover:underline">
                hello@solofreelancer.com
              </a>
            </p>
          </section>
        </article>

        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground flex gap-3">
          <Link to="/privacy" className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</Link>
          <span className="opacity-40">·</span>
          <Link to="/terms" className="text-primary hover:underline">ข้อกำหนดการใช้งาน</Link>
        </div>
      </main>

      <SiteFooter variant="minimal" />
    </div>
  );
}
