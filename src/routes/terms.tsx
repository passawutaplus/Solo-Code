import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "ข้อกำหนดการใช้งาน — So1o Freelancer" },
      {
        name: "description",
        content:
          "ข้อกำหนดและเงื่อนไขการใช้งาน So1o Freelancer แพลตฟอร์มจัดการงานสำหรับฟรีแลนซ์ไทย",
      },
      { property: "og:title", content: "ข้อกำหนดการใช้งาน — So1o Freelancer" },
      {
        property: "og:description",
        content: "ข้อกำหนดและเงื่อนไขการใช้งาน So1o Freelancer",
      },
      { property: "og:url", content: "https://solofreelancer.com/terms" },
    ],
    links: [{ rel: "canonical", href: "https://solofreelancer.com/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
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
            <FileText className="h-3.5 w-3.5 text-primary" /> Terms
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          ข้อกำหนดการใช้งาน
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <article className="prose prose-sm dark:prose-invert mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold">1. การยอมรับข้อกำหนด</h2>
            <p className="mt-2">
              การเข้าใช้งาน So1o Freelancer ถือว่าคุณได้อ่านและยอมรับข้อกำหนดเหล่านี้แล้ว
              หากไม่ยอมรับ กรุณาหยุดใช้งานทันที
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. ลักษณะการให้บริการ</h2>
            <p className="mt-2">
              So1o Freelancer เป็นแพลตฟอร์มช่วยฟรีแลนซ์จัดการงาน ใบเสนอราคา ลูกค้า และการเงิน
              อยู่ในระยะ Early Access อาจมีการเปลี่ยนแปลงฟีเจอร์โดยไม่ต้องแจ้งล่วงหน้า
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. บัญชีผู้ใช้</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>คุณเป็นผู้รับผิดชอบรหัสผ่านและการเข้าถึงบัญชีของตนเอง</li>
              <li>ห้ามใช้บัญชีของผู้อื่น หรือสร้างบัญชีปลอม</li>
              <li>ข้อมูลที่กรอกต้องเป็นข้อมูลจริงและไม่ละเมิดผู้อื่น</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. การใช้งานที่ห้าม</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>ห้ามใช้ระบบเพื่อกระทำผิดกฎหมาย ฉ้อโกง หรือหลอกลวงลูกค้า</li>
              <li>ห้าม Reverse Engineer, ทำซ้ำ หรือลอกเลียนระบบ</li>
              <li>ห้ามอัปโหลดเนื้อหาที่ละเมิดลิขสิทธิ์ผู้อื่น</li>
              <li>ห้าม Spam หรือใช้ระบบส่งข้อความรบกวนผู้อื่น</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. กรรมสิทธิ์ในเนื้อหา</h2>
            <p className="mt-2">
              เนื้อหาที่คุณกรอก (ใบเสนอราคา, บรีฟ, ลูกค้า, ฯลฯ) เป็นกรรมสิทธิ์ของคุณ
              เราเก็บไว้เพื่อให้บริการเท่านั้น โลโก้ ดีไซน์ และซอร์สโค้ดของ So1o เป็นของเรา
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. ข้อจำกัดความรับผิด</h2>
            <p className="mt-2">
              ระบบให้บริการ "ตามสภาพ" (as-is) เราพยายามดูแลให้ใช้งานได้ต่อเนื่อง
              แต่ไม่รับประกันความเสียหายจากการสูญหายของข้อมูล หรือการตัดสินใจทางธุรกิจที่อาศัยข้อมูลในระบบ
              ตัวเลขจากเครื่องคิดราคาเป็นเพียงคำแนะนำเบื้องต้น
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. การยกเลิกบัญชี</h2>
            <p className="mt-2">
              คุณยกเลิกบัญชีได้ตลอดเวลา เราขอสงวนสิทธิ์ระงับบัญชีที่ละเมิดข้อกำหนดเหล่านี้
              โดยไม่ต้องคืนเงินหรือชดเชยใดๆ
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. การเปลี่ยนแปลงข้อกำหนด</h2>
            <p className="mt-2">
              เราอาจปรับปรุงข้อกำหนดนี้เป็นระยะ การใช้งานต่อหลังการเปลี่ยนแปลงถือเป็นการยอมรับฉบับใหม่
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. กฎหมายที่ใช้บังคับ</h2>
            <p className="mt-2">
              ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย กรณีพิพาทให้ใช้ศาลในประเทศไทยเป็นผู้ตัดสิน
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">10. ติดต่อเรา</h2>
            <p className="mt-2">
              สอบถามเพิ่มเติมได้ที่{" "}
              <a href="mailto:hello@solofreelancer.com" className="text-primary hover:underline">
                hello@solofreelancer.com
              </a>
            </p>
          </section>
        </article>

        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground flex gap-3 flex-wrap">
          ดูเพิ่มเติม:{" "}
          <Link to="/privacy" className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</Link>
          <span className="opacity-40">·</span>
          <Link to="/cookies" className="text-primary hover:underline">นโยบายคุกกี้</Link>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </div>
  );
}
