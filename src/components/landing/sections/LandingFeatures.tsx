import {
  ListChecks,
  Briefcase,
  Users,
  Truck,
  FileText,
  Coins,
  Receipt,
  MessageSquare,
  CalendarDays,
} from "lucide-react";

const FEATURES = [
  { icon: ListChecks, title: "Job Tracker", desc: "ติดตามทุกขั้นตอนของงาน ตั้งแต่รับบรีฟ ส่งร่าง แก้ไข จนถึงปิดงาน" },
  { icon: Briefcase, title: "Subscriber Tracker", desc: "บริหาร Subscription ติดตามค่าใช้จ่ายและแจ้งเตือนครบกำหนด" },
  { icon: Users, title: "Clients CRM", desc: "ประวัติลูกค้าและรายละเอียดงานในที่เดียว" },
  { icon: Truck, title: "Suppliers Hub", desc: "รวม PDF ตัวอย่างงานและลิงก์อ้างอิงจาก supplier" },
  { icon: FileText, title: "Quotations & Invoices", desc: "ใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ — ส่ง PDF ให้ลูกค้า" },
  { icon: Coins, title: "รายได้", desc: "ซิงค์จากใบเสนอราคา กราฟรายเดือน ส่งออก CSV" },
  { icon: Receipt, title: "ภาษี & 50 ทวิ", desc: "ประมาณการภาษี ลดหย่อน ใบ 50 ทวิ Tax Sandbox" },
  { icon: MessageSquare, title: "Feedback Hub", desc: "จัดการ feedback เป็นรอบ ลดความสับสน" },
  { icon: CalendarDays, title: "Content Planner", desc: "วางแผนโพสต์โซเชียลอย่างมีระบบ" },
];

export function LandingFeatures() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">ฟีเจอร์ครบทุกมุมการทำงาน</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          ออกแบบมาเพื่อฟรีแลนซ์ไทย ตั้งแต่รับงาน บริหาร เก็บเงิน ยื่นภาษี
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-card/70 backdrop-blur p-5 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
