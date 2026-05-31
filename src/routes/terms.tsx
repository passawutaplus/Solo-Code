import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { LegalPageLayout, LegalSectionBlock } from "@/components/legal/LegalPageLayout";
import { LEGAL, PRICING, TERMS_SECTIONS } from "@/lib/legalMeta";
import { isEarlyAccessMode } from "@/lib/publicAccess";

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
    <LegalPageLayout
      title="ข้อกำหนดการใช้งาน"
      subtitle="เงื่อนไขการใช้บริการ So1o Freelancer"
      icon={FileText}
      iconLabel="Terms"
      sections={TERMS_SECTIONS}
    >
      <LegalSectionBlock id="accept" title="1. การยอมรับข้อกำหนด">
        <p>
          การเข้าใช้งาน {LEGAL.siteName} ถือว่าคุณได้อ่านและยอมรับข้อกำหนดเหล่านี้
          รวมถึง{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            นโยบายความเป็นส่วนตัว (PDPA)
          </Link>{" "}
          และ{" "}
          <Link to="/cookies" className="text-primary hover:underline">
            นโยบายคุกกี้
          </Link>
          หากไม่ยอมรับ กรุณาหยุดใช้งานทันที
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="service" title="2. ลักษณะการให้บริการ">
        <p>
          {LEGAL.siteName} เป็นแพลตฟอร์มช่วยฟรีแลนซ์จัดการงาน ใบเสนอราคา ลูกค้า การเงิน ภาษี
          และฟีเจอร์ AI อยู่ในระยะ Early Access อาจมีการเปลี่ยนแปลง ปรับปรุง หรือระงับฟีเจอร์
          โดยไม่ต้องแจ้งล่วงหน้า
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="account" title="3. บัญชีผู้ใช้">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>คุณเป็นผู้รับผิดชอบรหัสผ่านและการเข้าถึงบัญชีของตนเอง</li>
          <li>ห้ามใช้บัญชีของผู้อื่น หรือสร้างบัญชีปลอม</li>
          <li>ข้อมูลที่กรอกต้องเป็นข้อมูลจริงและไม่ละเมิดสิทธิ์ผู้อื่น</li>
          <li>คุณรับผิดชอบข้อมูลลูกค้าและเอกสารที่กรอก/อัปโหลดในระบบ</li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="prohibited" title="4. การใช้งานที่ห้าม">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>ห้ามใช้ระบบเพื่อกระทำผิดกฎหมาย ฉ้อโกง หรือหลอกลวงลูกค้า</li>
          <li>ห้าม Reverse Engineer, ทำซ้ำ หรือลอกเลียนระบบ</li>
          <li>ห้ามอัปโหลดเนื้อหาที่ละเมิดลิขสิทธิ์หรือข้อมูลส่วนบุคคลโดยไม่มีสิทธิ</li>
          <li>ห้าม Spam หรือใช้ระบบส่งข้อความรบกวนผู้อื่น</li>
          <li>ห้ามพยายามเข้าถึงข้อมูลของผู้ใช้อื่นโดยไม่ได้รับอนุญาต</li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="content" title="5. กรรมสิทธิ์ในเนื้อหา">
        <p>
          เนื้อหาที่คุณกรอก (ใบเสนอราคา, บรีฟ, ลูกค้า, เอกสารภาษี ฯลฯ) เป็นกรรมสิทธิ์ของคุณ
          เราเก็บไว้เพื่อให้บริการเท่านั้น โลโก้ ดีไซน์ UI และซอร์สโค้ดของ So1o เป็นของเรา
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="ai-tax" title="6. AI, ภาษี และเอกสาร 50 ทวิ">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            ฟีเจอร์ AI Mentor และสแกน 50 ทวิ ให้ผลลัพธ์เพื่อ<strong>ช่วยกรอกข้อมูล</strong>
            ไม่ใช่คำแนะนำทางกฎหมายหรือภาษี
          </li>
          <li>
            ตัวเลขจากเครื่องคิดราคา (Price Calculator) เป็นเพียงการประมาณการเบื้องต้น
            คุณต้องตรวจสอบก่อนใช้ต่อรองหรือยื่นภาษี
          </li>
          <li>
            คุณรับผิดชอบความถูกต้องของข้อมูลในใบเสนอราคา ใบหัก ณ ที่จ่าย และเอกสารที่ส่งให้ลูกค้า/สรรพากร
          </li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="subscription" title="7. แผนราคาและการชำระเงิน">
        <p>
          แผน Free, Solo Pro (฿{PRICING.proMonthly}/เดือน หรือ ฿{PRICING.proYearly}/ปี)
          และ In-House (฿{PRICING.inhouseMonthlyPerSeat}/ที่นั่ง/เดือน) อาจมีการเปลี่ยนแปลงราคาและฟีเจอร์
          การชำระเงินผ่าน Stripe ตามเงื่อนไขของ Stripe
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>แผน Free จำกัด Job Tracker {PRICING.freeMonthlyJobs} งาน/เดือน (Pro ไม่จำกัด)</li>
          <li>การสมัครแผนเสียเงินสามารถยกเลิกได้ใน Dashboard → ตั้งค่า → จัดการการชำระเงิน</li>
          <li>
            รายละเอียดการคืนเงิน:{" "}
            <Link to="/refund" className="text-primary hover:underline">นโยบายคืนเงิน</Link>
          </li>
        </ul>
      </LegalSectionBlock>

      {isEarlyAccessMode() && (
      <LegalSectionBlock id="beta" title="8. Early Access / Beta">
        <p>
          ในช่วง Early Access สิทธิ์การใช้งานอาจมีจำกัด
          เราขอสงวนสิทธิ์ระงับบัญชี Free ที่ไม่มีความเคลื่อนไหวเกิน 7 วัน (ตามที่แจ้งตอนสมัคร)
          เพื่อจัดสรรทรัพยากร — ไม่ใช้กับผู้ใช้แผน Pro/In-House ที่ชำระเงินแล้ว
        </p>
      </LegalSectionBlock>
      )}

      <LegalSectionBlock id="liability" title="9. ข้อจำกัดความรับผิด">
        <p>
          ระบบให้บริการ &quot;ตามสภาพ&quot; (as-is) เราพยายามดูแลให้ใช้งานได้ต่อเนื่อง
          แต่ไม่รับประกันความเสียหายจากการสูญหายของข้อมูล การหยุดให้บริการชั่วคราว
          หรือการตัดสินใจทางธุรกิจ/ภาษีที่อาศัยข้อมูลในระบบ
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="termination" title="10. การยกเลิกบัญชี">
        <p>
          คุณยกเลิกบัญชีได้ตลอดเวลา เราขอสงวนสิทธิ์ระงับหรือลบบัญชีที่ละเมิดข้อกำหนดเหล่านี้
          โดยไม่ต้องชดเชยใดๆ ข้อมูลจะถูกลบตาม{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="changes" title="11. การเปลี่ยนแปลงข้อกำหนด">
        <p>
          เราอาจปรับปรุงข้อกำหนดนี้เป็นระยะ การใช้งานต่อหลังการเปลี่ยนแปลงถือเป็นการยอมรับฉบับใหม่
          วันที่อัปเดตแสดงด้านบนของหน้านี้
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="law" title="12. กฎหมายที่ใช้บังคับ">
        <p>
          ข้อกำหนดนี้อยู่ภายใต้กฎหมาย{LEGAL.jurisdiction}
          กรณีพิพาทให้ใช้ศาลในประเทศไทยเป็นผู้ตัดสิน
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="contact" title="13. ติดต่อเรา">
        <p>
          สอบถามเพิ่มเติมได้ที่{" "}
          <a href={`mailto:${LEGAL.contactEmail}`} className="text-primary hover:underline">
            {LEGAL.contactEmail}
          </a>
        </p>
      </LegalSectionBlock>
    </LegalPageLayout>
  );
}
