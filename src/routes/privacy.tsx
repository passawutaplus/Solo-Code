import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "นโยบายความเป็นส่วนตัว — So1o Freelancer" },
      {
        name: "description",
        content:
          "นโยบายความเป็นส่วนตัวของ So1o Freelancer วิธีที่เราเก็บ ใช้ และปกป้องข้อมูลส่วนบุคคลของฟรีแลนซ์ไทย",
      },
      { property: "og:title", content: "นโยบายความเป็นส่วนตัว — So1o Freelancer" },
      {
        property: "og:description",
        content: "วิธีที่ So1o Freelancer เก็บและปกป้องข้อมูลส่วนบุคคลของคุณ",
      },
      { property: "og:url", content: "https://solofreelancer.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://solofreelancer.com/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> กลับหน้าหลัก
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Privacy
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          นโยบายความเป็นส่วนตัว
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <article className="prose prose-sm dark:prose-invert mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold">1. ข้อมูลที่เราเก็บ</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>ข้อมูลบัญชี: อีเมล, ชื่อเรียก, รูปโปรไฟล์ (กรณีล็อกอินด้วย Google)</li>
              <li>ข้อมูลงาน: ใบเสนอราคา, ใบบรีฟ, ลูกค้า, รายรับ-รายจ่าย ที่คุณกรอกเอง</li>
              <li>ข้อมูลการใช้งาน: หน้าเข้าชม, ฟีเจอร์ที่ใช้ เพื่อปรับปรุงระบบ</li>
              <li>ข้อมูลอุปกรณ์: ประเภทเบราว์เซอร์, ระบบปฏิบัติการ สำหรับวิเคราะห์ปัญหา</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. วิธีที่เราใช้ข้อมูล</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>ให้บริการระบบจัดการงานฟรีแลนซ์ (Job Tracker, ใบเสนอราคา, Calculator)</li>
              <li>สร้างลิงก์ติดตามงานสำหรับลูกค้าของคุณ (ใช้ UUID Token ที่คาดเดาไม่ได้)</li>
              <li>ปรับปรุงประสบการณ์ใช้งาน วิเคราะห์ฟีเจอร์ที่นิยม</li>
              <li>ติดต่อสื่อสารเรื่องอัปเดตสำคัญและฟีเจอร์ใหม่</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. การเปิดเผยข้อมูล</h2>
            <p className="mt-2">
              เราจะไม่ขาย ให้เช่า หรือเปิดเผยข้อมูลส่วนตัวของคุณแก่บุคคลที่สามเพื่อการตลาด
              ยกเว้นกรณีที่กฎหมายบังคับ หรือเพื่อปกป้องสิทธิ์ของผู้ใช้งานท่านอื่น
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. การจัดเก็บและความปลอดภัย</h2>
            <p className="mt-2">
              ข้อมูลถูกเก็บบน Cloud Database ที่ได้รับการเข้ารหัส มีระบบ Row-Level Security
              ทำให้ผู้ใช้แต่ละคนเข้าถึงได้เฉพาะข้อมูลของตัวเองเท่านั้น
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. สิทธิ์ของคุณ</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>ขอดู แก้ไข หรือลบข้อมูลของคุณได้ตลอดเวลา</li>
              <li>ยกเลิกบัญชีเพื่อให้ระบบลบข้อมูลทั้งหมดของคุณ</li>
              <li>ขอข้อมูลที่จัดเก็บในรูปแบบไฟล์เพื่อนำไปใช้ที่อื่น</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. คุกกี้ (Cookies)</h2>
            <p className="mt-2">
              เราใช้คุกกี้เพียงเท่าที่จำเป็นสำหรับการล็อกอินและจดจำการตั้งค่า (ธีม, ภาษา)
              ไม่มีการใช้คุกกี้สำหรับโฆษณาข้ามเว็บไซต์
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. ติดต่อเรา</h2>
            <p className="mt-2">
              หากมีคำถามเกี่ยวกับนโยบายนี้ ติดต่อได้ที่{" "}
              <a href="mailto:hello@solofreelancer.com" className="text-primary hover:underline">
                hello@solofreelancer.com
              </a>
            </p>
          </section>
        </article>

        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground flex gap-3 flex-wrap">
          ดูเพิ่มเติม:{" "}
          <Link to="/terms" className="text-primary hover:underline">ข้อกำหนดการใช้งาน</Link>
          <span className="opacity-40">·</span>
          <Link to="/cookies" className="text-primary hover:underline">นโยบายคุกกี้</Link>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </div>
  );
}
