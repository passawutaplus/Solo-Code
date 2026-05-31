import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { LegalPageLayout, LegalSectionBlock } from "@/components/legal/LegalPageLayout";
import { LEGAL, PRIVACY_SECTIONS } from "@/lib/legalMeta";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "นโยบายความเป็นส่วนตัว (PDPA) — So1o Freelancer" },
      {
        name: "description",
        content:
          "นโยบายความเป็นส่วนตัวตาม PDPA ของ So1o Freelancer — วิธีเก็บ ใช้ เปิดเผย และปกป้องข้อมูลส่วนบุคคลของฟรีแลนซ์ไทย",
      },
      { property: "og:title", content: "นโยบายความเป็นส่วนตัว (PDPA) — So1o Freelancer" },
      {
        property: "og:description",
        content: "วิธีที่ So1o Freelancer เก็บและปกป้องข้อมูลส่วนบุคคลตาม PDPA",
      },
      { property: "og:url", content: "https://solofreelancer.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://solofreelancer.com/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPageLayout
      title="นโยบายความเป็นส่วนตัว"
      subtitle="ปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)"
      icon={ShieldCheck}
      iconLabel="Privacy / PDPA"
      sections={PRIVACY_SECTIONS}
    >
      <LegalSectionBlock id="intro" title="1. บทนำ">
        <p>
          {LEGAL.siteName} ({LEGAL.siteUrl}) ให้บริการแพลตฟอร์มช่วยฟรีแลนซ์ไทยบริหารงาน ลูกค้า
          ใบเสนอราคา การเงิน และภาษี เอกสารฉบับนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้ เปิดเผย
          และปกป้องข้อมูลส่วนบุคคลของคุณ
        </p>
        <p>
          การใช้งานเว็บไซต์หรือสมัครบัญชี ถือว่าคุณได้อ่านและเข้าใจนโยบายนี้
          หากไม่ยอมรับ กรุณาหยุดใช้บริการ
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="controller" title="2. ผู้ควบคุมข้อมูลส่วนบุคคล">
        <p>
          <strong>ผู้ควบคุมข้อมูล:</strong> {LEGAL.controllerName}
          <br />
          <strong>ติดต่อ:</strong>{" "}
          <a href={`mailto:${LEGAL.contactEmail}`} className="text-primary hover:underline">
            {LEGAL.contactEmail}
          </a>
          <br />
          <strong>เว็บไซต์:</strong> {LEGAL.siteUrl}
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="data-collected" title="3. ข้อมูลส่วนบุคคลที่เราเก็บ">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>ข้อมูลบัญชี:</strong> อีเมล, ชื่อเรียก, รูปโปรไฟล์, สายงานฟรีแลนซ์
            (กรณีล็อกอินด้วย Google/Apple หรือสมัครด้วยอีเมล)
          </li>
          <li>
            <strong>ข้อมูลธุรกิจ:</strong> ชื่อแบรนด์, เลขประจำตัวผู้เสียภาษี, ที่อยู่, เบอร์โทร,
            ข้อมูลธนาคาร, ลูกค้า, ใบเสนอราคา, ใบบรีฟ, รายรับ-รายจ่าย, ใบหัก ณ ที่จ่าย (50 ทวิ)
          </li>
          <li>
            <strong>ข้อมูลการใช้งาน:</strong> หน้าที่เข้าชม, ฟีเจอร์ที่ใช้, เวลาใช้งานล่าสุด,
            ประเภทอุปกรณ์/เบราว์เซอร์ (เมื่อคุณยินยอมคุกกี้วิเคราะห์)
          </li>
          <li>
            <strong>ข้อมูลจาก AI:</strong> ข้อความที่ส่งให้ AI Mentor, ไฟล์รูป/PDF ที่อัปโหลดเพื่อสแกน 50 ทวิ
          </li>
          <li>
            <strong>ข้อมูลการชำระเงิน:</strong> สถานะการสมัครแผน Pro/In House ผ่าน Stripe
            (เราไม่เก็บเลขบัตรเครดิตโดยตรง)
          </li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="purposes" title="4. วัตถุประสงค์และฐานทางกฎหมาย">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">วัตถุประสงค์</th>
                <th className="px-3 py-2 font-medium">ฐานทางกฎหมาย (PDPA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-3 py-2">ให้บริการระบบและบัญชีผู้ใช้</td>
                <td className="px-3 py-2">สัญญา / ประโยชน์โดยชอบด้วยกฎหมาย</td>
              </tr>
              <tr>
                <td className="px-3 py-2">จัดเก็บข้อมูลงานและลูกค้าที่คุณกรอก</td>
                <td className="px-3 py-2">สัญญา / การดำเนินการตามคำขอของเจ้าของข้อมูล</td>
              </tr>
              <tr>
                <td className="px-3 py-2">วิเคราะห์และปรับปรุงฟีเจอร์</td>
                <td className="px-3 py-2">ความยินยอม (คุกกี้วิเคราะห์)</td>
              </tr>
              <tr>
                <td className="px-3 py-2">สแกนเอกสาร 50 ทวิ ด้วย AI</td>
                <td className="px-3 py-2">ความยินยอม / สัญญา</td>
              </tr>
              <tr>
                <td className="px-3 py-2">แจ้งข่าวสารและอัปเดตสำคัญ</td>
                <td className="px-3 py-2">ประโยชน์โดยชอบด้วยกฎหมาย / ความยินยอม</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSectionBlock>

      <LegalSectionBlock id="third-parties" title="5. การเปิดเผยต่อบุคคลที่สาม">
        <p>เราใช้ผู้ให้บริการที่เชื่อถือได้เพื่อให้ระบบทำงาน โดยแชร์เฉพาะข้อมูลที่จำเป็น:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Supabase</strong> — ฐานข้อมูล, Authentication, Storage ไฟล์ (สหรัฐอเมริกา/สหภาพยุโรป)
          </li>
          <li>
            <strong>Google / Apple OAuth</strong> — ล็อกอินด้วยบัญชีโซเชียล (ได้รับเฉพาะข้อมูลที่คุณอนุญาต)
          </li>
          <li>
            <strong>Google Gemini</strong> — ประมวลผล AI สำหรับสแกน 50 ทวิ และ AI Mentor
          </li>
          <li>
            <strong>Stripe</strong> — ชำระเงินแผน Pro/In House
          </li>
          <li>
            <strong>Google Fonts</strong> — แสดงฟอนต์ (อาจมีการส่ง IP ไปยัง Google CDN)
          </li>
        </ul>
        <p>
          เรา<strong>ไม่ขาย</strong>ข้อมูลส่วนบุคคลของคุณให้บุคคลที่สามเพื่อการตลาด
          ยกเว้นกรณีที่กฎหมายบังคับ หรือเพื่อปกป้องสิทธิ์และความปลอดภัยของผู้ใช้
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="transfer" title="6. การโอนข้อมูลไปต่างประเทศ">
        <p>
          ผู้ให้บริการบางรายอาจเก็บข้อมูลบนเซิร์ฟเวอร์ต่างประเทศ
          เราเลือกผู้ให้บริการที่มีมาตรการคุ้มครองข้อมูลที่เหมาะสม
          และจำกัดการส่งข้อมูลเท่าที่จำเป็นต่อการให้บริการ
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="retention" title="7. ระยะเวลเก็บรักษา">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>ข้อมูลบัญชีและงาน: ตลอดระยะเวลาที่บัญชียังใช้งาน</li>
          <li>หลังยกเลิกบัญชี: ลบหรือทำให้ไม่สามารถระบุตัวตนได้ภายใน 30–90 วัน (ยกเว้นที่กฎหมายกำหนด)</li>
          <li>ไฟล์ 50 ทวิ: เก็บใน Storage ของคุณจนกว่าจะลบเอง</li>
          <li>Log การใช้งาน: เก็บตามความจำเป็นเพื่อวิเคราะห์และความปลอดภัย ไม่เกิน 24 เดือน</li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="security" title="8. ความปลอดภัย">
        <p>
          ข้อมูลถูกเก็บบน Cloud Database ที่เข้ารหัสในการส่ง (HTTPS/TLS)
          มี Row-Level Security ทำให้ผู้ใช้แต่ละคนเข้าถึงได้เฉพาะข้อมูลของตนเอง
          การสแกน 50 ทวิใช้ path ที่ผูกกับ user ID และไม่เปิด URL สาธารณะ
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="rights" title="9. สิทธิของเจ้าของข้อมูล (PDPA)">
        <p>คุณมีสิทธิตาม PDPA ดังนี้:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>ขอเข้าถึงและขอสำเนาข้อมูลส่วนบุคคล</li>
          <li>ขอแก้ไขข้อมูลให้ถูกต้อง</li>
          <li>ขอลบหรือทำลายข้อมูล (รวมถึงยกเลิกบัญชี)</li>
          <li>ขอระงับการใช้ข้อมูล</li>
          <li>ขอให้ส่งหรือโอนข้อมูล (Data Portability) ในรูปแบบที่อ่านได้</li>
          <li>คัดค้านการประมวลผลในบางกรณี</li>
          <li>ถอนความยินยอมเมื่อใดก็ได้ (ไม่กระทบการประมวลผลก่อนหน้า)</li>
        </ul>
        <p>
          ใช้สิทธิได้โดยติดต่อ{" "}
          <a href={`mailto:${LEGAL.contactEmail}`} className="text-primary hover:underline">
            {LEGAL.contactEmail}
          </a>{" "}
          เราจะตอบภายใน 30 วัน (หรือตามที่กฎหมายกำหนด)
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="cookies" title="10. คุกกี้และเทคโนโลยีที่คล้ายกัน">
        <p>
          เราใช้คุกกี้ Local Storage และ Session Storage เพื่อให้ระบบทำงาน
          จดจำการตั้งค่า และวิเคราะห์การใช้งาน (เมื่อคุณยินยอม)
          รายละเอียดครบถ้วนอยู่ใน{" "}
          <Link to="/cookies" className="text-primary hover:underline">
            นโยบายคุกกี้
          </Link>
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="ai" title="11. การใช้ปัญญาประดิษฐ์ (AI)">
        <p>
          ฟีเจอร์ AI Mentor และสแกน 50 ทวิ ส่งข้อมูลไปประมวลผลที่ Google Gemini
          เราไม่ใช้ข้อมูลของคุณเพื่อฝึกโมเดล AI สาธารณะ
          ผลลัพธ์จาก AI เป็นเพียงการช่วยกรอกข้อมูล — คุณต้องตรวจสอบความถูกต้องก่อนใช้งานทางภาษี/กฎหมาย
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="minors" title="12. ผู้เยาว์">
        <p>
          บริการนี้มุ่งเป้าผู้ใช้ที่มีอายุ 18 ปีขึ้นไป
          หากทราบว่ามีการเก็บข้อมูลผู้เยาว์โดยไม่ได้รับความยินยอมจากผู้ปกครอง
          กรุณาแจ้งเราเพื่อลบข้อมูล
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="changes" title="13. การเปลี่ยนแปลงนโยบาย">
        <p>
          เราอาจปรับปรุงนโยบายนี้เป็นระยะ โดยแสดงวันที่อัปเดตด้านบน
          การใช้งานต่อหลังการเปลี่ยนแปลงถือเป็นการยอมรับฉบับใหม่
          หากมีการเปลี่ยนแปลงสำคัญ เราจะแจ้งทางอีเมลหรือประกาศในระบบ
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="contact" title="14. ติดต่อเรา">
        <p>
          หากมีคำถาม ข้อร้องเรียน หรือต้องการใช้สิทธิตาม PDPA ติดต่อ:
          <br />
          <a href={`mailto:${LEGAL.contactEmail}`} className="text-primary hover:underline">
            {LEGAL.contactEmail}
          </a>
        </p>
      </LegalSectionBlock>
    </LegalPageLayout>
  );
}
